"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import { GenericEditableImage } from "@/components/tenant/GenericEditableImage";
import { shouldSkipNextImageOptimization } from "@/lib/image-source";

interface ContactContent {
  title?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface Props {
  content: Record<string, unknown>;
  variant: string;
  isAdmin: boolean;
  tenantSlug?: string;
  sectionId: number;
}

type Status = "idle" | "sending" | "success" | "error";

function resolveNavHref(href: string, siteMode: string, tenantSlug?: string, isAdmin = false) {
  if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return href;
  const base = tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "";
  return base + (href.startsWith("/") ? href : `/${href}`);
}

export function ContactSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  if (variant === "signal-01-contact") return <ContactSignal01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "proof-01-contact") return <ContactProof01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "artist-01-contact") return <ContactArtist01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "contact-bakery-01") return <ContactBakery01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "eshop-05-prefooter") return <ContactEshop05Prefooter content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "eshop-02-contact") {
    return <ContactEshop02 content={content} sectionId={sectionId} />;
  }
  if (variant === "eshop-03-contact") {
    return <ContactEshop03 content={content} sectionId={sectionId} />;
  }
  if (variant === "eshop-04-contact") {
    return <ContactEshop04 content={content} sectionId={sectionId} />;
  }
  if (variant === "contact-photo-01") {
    return <ContactPhoto01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "eshop-06-contact") {
    return <ContactEshop06 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "contact-floors-01") {
    return <ContactFloors01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "harmonie-01-contact") {
    return <ContactHarmonie01 content={content} sectionId={sectionId} />;
  }
  if (variant === "tawan-01-contact") {
    return <ContactTawan01 content={content} sectionId={sectionId} />;
  }
  if (variant === "contact-massage-01") {
    return <ContactMassage01 content={content} sectionId={sectionId} />;
  }
  if (variant === "hair-04-contact") {
    return <ContactHair04 content={content} sectionId={sectionId} />;
  }
  if (variant === "contact-beauty-01") {
    return <ContactBeauty01 content={content} sectionId={sectionId} />;
  }
  if (variant === "contact-hair-02-location") {
    return <ContactHair02Location content={content} sectionId={sectionId} />;
  }
  if (variant === "tattoo-01-contact") {
    return <ContactTattoo01 content={content} sectionId={sectionId} />;
  }
  if (variant === "tattoo-02-contact") {
    return <ContactTattoo02 content={content} sectionId={sectionId} />;
  }
  if (variant === "tattoo-03-contact") {
    return <ContactTattoo03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "nails-02-contact") {
    return <ContactNails02 content={content} sectionId={sectionId} />;
  }
  if (variant === "nails-03-contact") {
    return <ContactNails03 content={content} sectionId={sectionId} />;
  }
  if (variant === "clinic-02-contact") {
    return <ContactClinic02 content={content} sectionId={sectionId} />;
  }
  if (variant === "clinic-03-contact") {
    return <ContactClinic03 content={content} sectionId={sectionId} />;
  }
  if (variant === "restaurant-01-contact") {
    return <ContactRestaurant01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "restaurant-02-contact") {
    return <ContactRestaurant02 content={content} sectionId={sectionId} />;
  }
  if (variant === "restaurant-03-contact") {
    return <ContactRestaurant03 content={content} sectionId={sectionId} />;
  }
  if (variant === "cafe-02-contact") {
    return <ContactCafe02 content={content} sectionId={sectionId} />;
  }
  if (variant === "cafe-03-contact") {
    return <ContactCafe03 content={content} sectionId={sectionId} />;
  }
  if (variant === "reality-01-contact")    return <ContactReality01 content={content} sectionId={sectionId} />;
  if (variant === "reality-05-contact")    return <ContactReality05 content={content} sectionId={sectionId} />;
  if (variant === "reality-02-contact")    return <ContactReality02 content={content} sectionId={sectionId} />;
  if (variant === "reality-04-contact")    return <ContactReality04 content={content} sectionId={sectionId} />;
  if (variant === "reality-06-contact")    return <ContactReality06 content={content} sectionId={sectionId} isAdmin={isAdmin} tenantSlug={tenantSlug} />;
  if (variant === "cafe-04-contact") {
    return <ContactCafe04 content={content} sectionId={sectionId} />;
  }
  if (variant === "contact-fitness-01") {
    return <ContactFitness01 content={content} sectionId={sectionId} />;
  }
  if (variant === "contact-fitness-02") {
    return <ContactFitness02 content={content} sectionId={sectionId} />;
  }
  if (variant === "contact-fyzio-01") {
    return <ContactFyzio01 content={content} sectionId={sectionId} />;
  }
  if (variant === "contact-fyzio-02") {
    return <ContactFyzio02 content={content} sectionId={sectionId} />;
  }
  if (variant === "autoservis-01-contact") return <ContactAutoservis01 content={content} sectionId={sectionId} />;
  if (variant === "autoservis-02-contact") return <ContactAutoservis02 content={content} sectionId={sectionId} />;
  if (variant === "autoservis-03-contact") return <ContactAutoservis03 content={content} sectionId={sectionId} />;
  if (variant === "dental-01-contact")     return <ContactDental01 content={content} sectionId={sectionId} />;
  if (variant === "ortho-01-contact")      return <ContactOrtho01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "ortho-02-contact")      return <ContactOrtho02 content={content} sectionId={sectionId} />;
  if (variant === "lawyer-01-contact")     return <ContactLawyer01 content={content} sectionId={sectionId} />;
  if (variant === "stavba-03-contact")     return <ContactStavba03 content={content} sectionId={sectionId} />;
  if (variant === "stavba-02-contact")     return <ContactStavba02 content={content} sectionId={sectionId} />;
  if (variant === "rekonstrukce-01-contact") return <ContactRekonstrukce01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "stavba-01-contact")     return <ContactStavba01 content={content} sectionId={sectionId} />;
  if (variant === "legal-02-contact")      return <ContactLegal02 content={content} sectionId={sectionId} />;
  if (variant === "elektro-01-contact")    return <ContactElektro01 content={content} sectionId={sectionId} isAdmin={isAdmin} tenantSlug={tenantSlug} />;
  if (variant === "instala-01-contact")   return <ContactInstala01 content={content} sectionId={sectionId} />;
  if (variant === "instala-02-contact")   return <ContactInstala02 content={content} sectionId={sectionId} />;
  if (variant === "florist-01-contact")   return <ContactFlorist01 content={content} sectionId={sectionId} />;
  if (variant === "catering-01-contact")  return <ContactCatering01 content={content} sectionId={sectionId} />;
  if (variant === "sweet-01-locations")   return <LocationsSweet01 content={content} sectionId={sectionId} />;
  if (variant === "autoskola-01-contact") return <ContactAutoskola01 content={content} sectionId={sectionId} />;
  if (variant === "edu-01-contact")       return <ContactEdu01 content={content} sectionId={sectionId} />;
  if (variant === "kids-01-contact")      return <ContactKids01 content={content} sectionId={sectionId} />;
  if (variant === "vet-01-contact")       return <ContactVet01  content={content} sectionId={sectionId} />;
  if (variant === "pethotel-01-contact")  return <ContactPethotel01 content={content} sectionId={sectionId} />;
  if (variant === "grooming-01-contact")  return <ContactGrooming01 content={content} sectionId={sectionId} />;
  if (variant === "ucetni-01-contact")    return <ContactUcetni01 content={content} sectionId={sectionId} />;
  if (variant === "ucetni-02-contact")    return <ContactUcetni02 content={content} sectionId={sectionId} />;
  if (variant === "ucetni-03-contact")    return <ContactUcetni03 content={content} sectionId={sectionId} />;
  if (variant === "ucetni-04-contact")    return <ContactUcetni04 content={content} sectionId={sectionId} />;
  if (variant === "solar-02-contact")     return <ContactSolar02 content={content} sectionId={sectionId} />;
  if (variant === "klempir-01-contact")   return <ContactKlempir01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} />;
  if (variant === "garden-01-contact")    return <ContactGarden01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "garden-02-contact")    return <ContactGarden02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "clean-02-contact")     return <ContactClean02  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "hotel-01-contact")     return <ContactHotel01  content={content} sectionId={sectionId} isAdmin={isAdmin} />;
  if (variant === "arbo-01-contact")      return <ContactArbo01   content={content} sectionId={sectionId} />;
  if (variant === "malir-02-contact")     return <ContactMalir02  content={content} sectionId={sectionId} isAdmin={isAdmin} />;
  if (variant === "malir-01-contact")     return <ContactMalir01  content={content} sectionId={sectionId} isAdmin={isAdmin} />;
  if (variant === "dj-01-contact")        return <ContactDj01      content={content} sectionId={sectionId} />;
  if (variant === "restaurant-04-contact") return <ContactRestaurant04 content={content} sectionId={sectionId} />;
  if (variant === "barber-dark")           return <ContactBarberDark content={content} sectionId={sectionId} />;
  if (variant === "barber-04-contact")    return <ContactBarber04 content={content} sectionId={sectionId} />;
  if (variant === "contact-peak-cut")     return <ContactPeakCut content={content} sectionId={sectionId} />;
  if (variant === "arch-01-contact")      return <ContactArch01   content={content} sectionId={sectionId} />;
  if (variant === "nails-01-contact")     return <ContactNails01  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  return <ContactSectionForm content={content} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
}

// ── nails-01-contact ─────────────────────────────────────────────────────────
// Kyoto Wabi-Sabi Beauty · white bg s cream card · 2-col: info + Reservio panel
// Adresa · phone · email · hodiny s dotted-leader · Reservio online CTA
// ─────────────────────────────────────────────────────────────────────────────
function ContactNails01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const BURGUNDY = "#79142b";
  const CREAM    = "#f4f1e9";
  const SERIF    = "Georgia, 'Times New Roman', serif";
  const SANS     = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  const eyebrow    = String(content.eyebrow    ?? "STUDIO · KONTAKT");
  const title      = String(content.title      ?? "Najdete nás v srdci Prahy");
  const address    = String(content.address    ?? "Vinohradská 26, 110 00 Praha 1");
  const addressNote= String(content.addressNote?? "Přízemí · 2 minuty od metra Muzeum");
  const phone      = String(content.phone      ?? "+420 777 123 456");
  const email      = String(content.email      ?? "studio@noirnails.cz");
  const mapText    = String(content.mapText    ?? "Otevřít v mapách");
  const mapHref    = String(content.mapHref    ?? "https://maps.google.com/?q=Vinohradsk%C3%A1+26+Praha");
  const hours      = (content.hours as Array<{ days: string; time: string }>) ?? [
    { days: "Pondělí – Pátek", time: "9:00 — 19:00" },
    { days: "Sobota – Neděle", time: "10:00 — 18:00" },
  ];
  const bookTitle  = String(content.bookTitle  ?? "Rezervace online");
  const bookNote   = String(content.bookNote   ?? "Přes Reservio si vyberete termín, službu i pracovnici — potvrzení dorazí do minuty.");
  const bookCta    = String(content.bookCta    ?? "Rezervovat termín");
  const bookHref   = String(content.bookHref   ?? "https://reservio.com/");
  const socialsIg  = String(content.socialsIg  ?? "https://instagram.com/demo");
  const socialsFb  = String(content.socialsFb  ?? "https://facebook.com/demo");

  void tenantSlug; void isAdmin;

  return (
    <section
      data-template="nails-01"
      data-section-type="contact"
      data-variant="nails-01-contact"
      className="n01-contact"
      style={{
        backgroundColor: "#ffffff",
        padding: "clamp(80px, 12vh, 140px) clamp(24px, 6vw, 80px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 90% 5%, rgba(121,20,43,0.03), transparent 55%), radial-gradient(ellipse at 5% 95%, rgba(121,20,43,0.03), transparent 55%)",
      }} />

      <div style={{ maxWidth: 1240, margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(48px, 6vh, 76px)" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 20,
            fontFamily: SANS, fontSize: "0.7rem", fontWeight: 300,
            letterSpacing: "0.36em", textTransform: "uppercase", color: BURGUNDY,
          }}>
            <span aria-hidden="true" style={{ width: 60, height: 1, background: BURGUNDY, opacity: 0.5 }} />
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            <span aria-hidden="true" style={{ width: 60, height: 1, background: BURGUNDY, opacity: 0.5 }} />
          </div>
          <h2 style={{
            fontFamily: SERIF, fontStyle: "italic",
            fontSize: "clamp(32px, 3.8vw, 54px)",
            fontWeight: 400, color: BURGUNDY, lineHeight: 1.1,
            margin: 0, letterSpacing: "-0.005em",
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>

        {/* 2-col — info left · Reservio card right */}
        <div className="n01-contact-grid" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "clamp(40px, 5vw, 72px)",
        }}>
          {/* Info left */}
          <div>
            {/* Address block */}
            <div style={{ marginBottom: 44 }}>
              <div style={{
                fontFamily: SANS, fontSize: "0.66rem", fontWeight: 300,
                letterSpacing: "0.32em", textTransform: "uppercase",
                color: BURGUNDY, opacity: 0.65, marginBottom: 12,
              }}>Adresa</div>
              <div style={{
                fontFamily: SERIF, fontSize: "1.4rem", fontWeight: 400,
                color: BURGUNDY, lineHeight: 1.4, marginBottom: 6,
              }}>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </div>
              <div style={{
                fontFamily: SERIF, fontStyle: "italic",
                fontSize: "0.98rem", color: BURGUNDY, opacity: 0.7, marginBottom: 14,
              }}>
                <GenericEditableText sectionId={sectionId} field="addressNote" value={addressNote} tag="span" />
              </div>
              <a href={mapHref} target="_blank" rel="noopener noreferrer" className="n01-contact-map" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontFamily: SANS, fontSize: "0.72rem", fontWeight: 400,
                letterSpacing: "0.28em", textTransform: "uppercase",
                color: BURGUNDY, textDecoration: "none",
              }}>
                <GenericEditableText sectionId={sectionId} field="mapText" value={mapText} tag="span" />
                <span aria-hidden="true" className="n01-contact-map-arrow">→</span>
              </a>
            </div>

            {/* Contact block */}
            <div style={{ marginBottom: 44 }}>
              <div style={{
                fontFamily: SANS, fontSize: "0.66rem", fontWeight: 300,
                letterSpacing: "0.32em", textTransform: "uppercase",
                color: BURGUNDY, opacity: 0.65, marginBottom: 14,
              }}>Kontakt</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="n01-contact-line" style={{
                  fontFamily: SERIF, fontSize: "1.1rem", color: BURGUNDY,
                  textDecoration: "none", opacity: 0.9,
                }}>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
                <a href={`mailto:${email}`} className="n01-contact-line" style={{
                  fontFamily: SERIF, fontStyle: "italic",
                  fontSize: "1.05rem", color: BURGUNDY,
                  textDecoration: "none", opacity: 0.9,
                }}>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              </div>
            </div>

            {/* Hours */}
            <div>
              <div style={{
                fontFamily: SANS, fontSize: "0.66rem", fontWeight: 300,
                letterSpacing: "0.32em", textTransform: "uppercase",
                color: BURGUNDY, opacity: 0.65, marginBottom: 14,
              }}>Otevřeno</div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {hours.map((h, i) => (
                  <li key={`n01-ch-${i}`} style={{
                    display: "flex", alignItems: "baseline", gap: 10,
                    fontFamily: SANS, fontSize: "0.94rem", color: BURGUNDY,
                  }}>
                    <span style={{
                      fontFamily: SERIF, fontStyle: "italic",
                      fontSize: "1.02rem", opacity: 0.85, flexShrink: 0,
                    }}>{h.days}</span>
                    <span aria-hidden="true" style={{
                      flex: 1, height: 0,
                      borderBottom: `1px dotted rgba(121,20,43,0.35)`,
                      transform: "translateY(-4px)",
                    }} />
                    <span style={{ opacity: 0.9, flexShrink: 0 }}>
                      <GenericEditableText sectionId={sectionId} field={`hours.${i}.time`} value={h.time} tag="span" />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Reservio card right — cream s corner brackets */}
          <div style={{ position: "relative" }}>
            <div className="n01-contact-card" style={{
              position: "relative",
              backgroundColor: CREAM,
              padding: "clamp(36px, 5vw, 56px)",
            }}>
              <span aria-hidden="true" className="n01-about-frame n01-about-frame-tl" />
              <span aria-hidden="true" className="n01-about-frame n01-about-frame-tr" />
              <span aria-hidden="true" className="n01-about-frame n01-about-frame-bl" />
              <span aria-hidden="true" className="n01-about-frame n01-about-frame-br" />

              <div style={{
                fontFamily: SANS, fontSize: "0.66rem", fontWeight: 300,
                letterSpacing: "0.36em", textTransform: "uppercase",
                color: BURGUNDY, opacity: 0.65, marginBottom: 18,
              }}>Reservio · online 24/7</div>

              <h3 style={{
                fontFamily: SERIF, fontStyle: "italic",
                fontSize: "clamp(28px, 3vw, 40px)",
                fontWeight: 400, color: BURGUNDY,
                lineHeight: 1.15, margin: "0 0 20px",
              }}>
                <GenericEditableText sectionId={sectionId} field="bookTitle" value={bookTitle} tag="span" />
              </h3>

              <p style={{
                fontFamily: SANS, fontSize: "0.95rem", fontWeight: 300,
                color: BURGUNDY, opacity: 0.8, lineHeight: 1.7,
                margin: "0 0 32px",
              }}>
                <GenericEditableText sectionId={sectionId} field="bookNote" value={bookNote} tag="span" />
              </p>

              <a href={bookHref} target="_blank" rel="noopener noreferrer" className="n01-about-cta">
                <span className="n01-about-cta-label">
                  <GenericEditableText sectionId={sectionId} field="bookCta" value={bookCta} tag="span" />
                </span>
                <span aria-hidden="true" className="n01-about-cta-arrow">→</span>
              </a>

              <div style={{
                marginTop: 40,
                paddingTop: 24,
                borderTop: `1px solid rgba(121,20,43,0.2)`,
                display: "flex", gap: 14, alignItems: "center",
              }}>
                <span style={{
                  fontFamily: SANS, fontSize: "0.62rem", fontWeight: 300,
                  letterSpacing: "0.32em", textTransform: "uppercase",
                  color: BURGUNDY, opacity: 0.6,
                }}>Sledujte nás</span>
                <a href={socialsIg} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="n01-contact-social">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/></svg>
                </a>
                <a href={socialsFb} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="n01-contact-social">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── contact-massage-01 ───────────────────────────────────────────────────────
function ContactMassage01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const sectionTag  = String(content.sectionTag  ?? "Kontakt");
  const heading     = String(content.heading     ?? "Kde nás najdete");
  const description = String(content.description ?? "");
  const address     = String(content.address     ?? "");
  const phone       = String(content.phone       ?? "");
  const email       = String(content.email       ?? "");
  const hours       = String(content.hours       ?? "");
  const mapEmbedUrl = String(content.mapEmbedUrl ?? "");

  const items: { label: string; value: string; field: string; href?: string; icon: React.ReactNode }[] = [
    {
      label: "Adresa", field: "address", value: address,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
      ),
    },
    {
      label: "Telefon", field: "phone", value: phone, href: `tel:${phone.replace(/\s/g, "")}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      ),
    },
    {
      label: "E-mail", field: "email", value: email, href: `mailto:${email}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
    },
    {
      label: "Otevírací doba", field: "hours", value: hours,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
  ].filter(item => item.value);

  const showHeader = !!(sectionTag.trim() || heading.trim());

  return (
    <section id="kontakt" className="m01-contact" data-template="massage-01">
      <div className="m01-contact-grid">
        {/* Left — info */}
        <div className="m01-contact-info">
          {showHeader && (
            <>
              <p className="m01-hero-tag">
                <span className="m01-hero-tag-dot" />
                <GenericEditableText sectionId={sectionId} field="sectionTag" value={sectionTag} tag="span" />
              </p>
              <h2 className="m01-contact-title">
                <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
              </h2>
            </>
          )}
          {description.trim() && (
            <p className="m01-contact-desc">
              <GenericEditableText sectionId={sectionId} field="description" value={description} tag="span" />
            </p>
          )}
          <div className="m01-contact-items">
            {items.map((item, i) => (
              <div key={i} className="m01-contact-item">
                <div className="m01-contact-icon">{item.icon}</div>
                <div className="m01-contact-item-text">
                  <p className="m01-contact-label">{item.label}</p>
                  <p className="m01-contact-value">
                    {item.href ? (
                      <a href={item.href} className="m01-contact-link">
                        <GenericEditableText sectionId={sectionId} field={item.field} value={item.value} tag="span" />
                      </a>
                    ) : (
                      <GenericEditableText sectionId={sectionId} field={item.field} value={item.value} tag="span" />
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — map */}
        <div className="m01-contact-map">
          {mapEmbedUrl ? (
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, display: "block", minHeight: 400 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="m01-contact-map-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="40" height="40">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <p>Vložte URL mapy</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// hair-04: tmavé bg, 2-col — vlevo mapa, vpravo kontaktní info — 1:1 kim-impressive.cz
function ContactHair04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title       = String(content.title       ?? "Kudy k nám");
  const addressTitle = String(content.addressTitle ?? "Adresa a kontakty");
  const address     = String(content.address     ?? "");
  const hours       = String(content.hours       ?? "");
  const phone       = String(content.phone       ?? "");
  const phoneHref   = String(content.phoneHref   ?? "");
  const email       = String(content.email       ?? "");
  const facebook    = String(content.facebook    ?? "");
  const instagram   = String(content.instagram   ?? "");
  const mapEmbedUrl = String(content.mapEmbedUrl ?? "");

  const GOLD  = "#FFDF25";
  const DARK  = "#0d0d0d";
  const LATO  = "'Lato', sans-serif";
  const DEMO_MAP = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2560.5!2d14.4378!3d50.0755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTDCsDA0JzMxLjkiTiAxNMKwMjYnMTYuMSJF!5e0!3m2!1scs!2scz!4v1600000000000";
  const mapSrc = mapEmbedUrl || DEMO_MAP;

  return (
    <section
      id="kontakt"
      data-template="hair-04"
      style={{ backgroundColor: DARK }}
    >
      {/* Gold linka nahoře */}
      <div style={{ height: 3, backgroundColor: GOLD }} aria-hidden />

      {/* Nadpis */}
      <div style={{ textAlign: "center", padding: "64px 24px 48px" }}>
        <h2 style={{ fontFamily: LATO, fontSize: "clamp(28px,3vw,42px)", fontWeight: 700, color: GOLD, margin: 0, letterSpacing: "0.02em" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
      </div>

      {/* 2-col: mapa vlevo, info vpravo — jeden řádek */}
      <style>{`
        @media (max-width: 768px) {
          [data-template="hair-04"] .h04-contact-row { flex-direction: column !important; }
          [data-template="hair-04"] .h04-contact-map { flex: 1 1 100% !important; margin-left: 0 !important; border-radius: 0 !important; min-height: 280px !important; }
          [data-template="hair-04"] .h04-contact-info { padding: 40px 24px !important; }
        }
      `}</style>
      <div className="h04-contact-row" style={{ display: "flex", minHeight: 420 }}>

        {/* Mapa — s levým odsazením */}
        <div className="h04-contact-map" style={{ flex: "0 0 55%", minHeight: 400, position: "relative", backgroundColor: "#1a1a1a", marginLeft: "clamp(32px,6vw,100px)", borderRadius: 6, overflow: "hidden" }}>
          <iframe
            src={mapSrc}
            width="100%"
            height="100%"
            style={{ border: 0, display: "block", minHeight: 400, filter: "invert(0.85) hue-rotate(180deg)" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa"
          />
        </div>

        {/* Kontaktní info — zarovnáno na střed, pravé odsazení stejné jako levé u mapy */}
        <div className="h04-contact-info" style={{
          flex: "1 1 0",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "56px clamp(32px,6vw,100px)",
          gap: 28,
        }}>
          <h3 style={{ fontFamily: LATO, fontSize: 20, fontWeight: 600, color: GOLD, margin: 0, letterSpacing: "0.04em" }}>
            <GenericEditableText sectionId={sectionId} field="addressTitle" value={addressTitle} tag="span" />
          </h3>

          {/* Adresa */}
          {address && (
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", justifyContent: "center" }}>
              <span style={{ color: GOLD, marginTop: 2, flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </span>
              <GenericEditableText sectionId={sectionId} field="address" value={address} tag="p"
                style={{ fontFamily: LATO, fontSize: 15, fontWeight: 300, color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.6, textAlign: "left" }} />
            </div>
          )}

          {/* Hodiny */}
          {hours && (
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", justifyContent: "center" }}>
              <span style={{ color: GOLD, marginTop: 2, flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </span>
              <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="p"
                style={{ fontFamily: LATO, fontSize: 15, fontWeight: 300, color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.6, textAlign: "left" }} />
            </div>
          )}

          {/* Telefon */}
          {phone && (
            <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: GOLD, flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6.29 6.29l.95-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </span>
              <a href={phoneHref} style={{ fontFamily: LATO, fontSize: 15, fontWeight: 400, color: "rgba(255,255,255,0.85)", textDecoration: "none" }}
                onMouseEnter={e => { e.currentTarget.style.color = GOLD; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            </div>
          )}

          {/* Email */}
          {email && (
            <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: GOLD, flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
              <a href={`mailto:${email}`} style={{ fontFamily: LATO, fontSize: 15, fontWeight: 400, color: "rgba(255,255,255,0.85)", textDecoration: "none" }}
                onMouseEnter={e => { e.currentTarget.style.color = GOLD; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            </div>
          )}

          {/* Sociální sítě */}
          {(facebook || instagram) && (
            <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                  style={{ color: "rgba(255,255,255,0.6)", transition: "color 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = GOLD; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                  style={{ color: "rgba(255,255,255,0.6)", transition: "color 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = GOLD; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ height: 60, backgroundColor: DARK }} aria-hidden />
    </section>
  );
}

// beauty-01: cream bg, Cormorant title, adresa + hodiny + kontakty v 2-col layoutu
// Reference: selfbeautystudio.com — "Najdete nás v srdci Prahy."
function ContactBeauty01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  // beauty-01 — Sand-Cream Editorial Wellness contact
  // Magazine header + 5/7 split: LEFT = info ledger (mono labels, big Fahkwang phone),
  // RIGHT = Google Maps iframe s grayscale filter.
  const cc = content as Record<string, unknown>;
  const eyebrowRaw  = cc.eyebrow;
  const titleRaw    = cc.title;
  const subtitleRaw = cc.subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Kontakt" : String(eyebrowRaw);
  const titleStr = titleRaw    === undefined ? "Najdete nás\nve Vinohradech." : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Třípodlažní atelier v secesní vilce. Vlastní vchod z ulice, parkování v okolí." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || titleStr.trim() || subtitle.trim());
  const address     = String(cc.address     ?? "");
  const addressLabel = String(cc.addressLabel ?? "Adresa");
  const mapsLabel   = String(cc.mapsLabel   ?? "Otevřít v Google Maps");
  const mapsHref    = String(cc.mapsHref    ?? "https://maps.google.com");
  const phone       = String(cc.phone       ?? "");
  const phoneLabel  = String(cc.phoneLabel  ?? "Telefon");
  const email       = String(cc.email       ?? "");
  const emailLabel  = String(cc.emailLabel  ?? "E-mail");
  const hoursLabel  = String(cc.hoursLabel  ?? "Otevírací doba");
  const hours       = (cc.hours as Array<{ day: string; value: string }>) ?? [];
  const mapEmbed    = String(cc.mapEmbed ?? "");

  const CREAM  = "#FFF8F1";
  const DARK   = "#1F1F1F";
  const MUTED  = "#5B4D43";
  const SAND   = "#E0BE9A";
  const FONT   = "'Fahkwang', Georgia, serif";
  const SANS   = "var(--font-overpass), 'Overpass', Inter, system-ui, sans-serif";
  const MONO   = "var(--font-overpass-mono), 'Overpass Mono', Menlo, monospace";

  return (
    <section
      id="kontakt"
      style={{
        backgroundColor: CREAM,
        padding: "clamp(72px, 9vw, 128px) clamp(24px, 5vw, 64px)",
      }}
      data-template="beauty-01"
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        {showHeader && (
          <div className="b01-cnt-head" style={{
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
                  lineHeight: 1.08, letterSpacing: "0.01em",
                  color: DARK, whiteSpace: "pre-line",
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

        <div className="b01-cnt-grid" style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 5fr) minmax(0, 7fr)",
          gap: "clamp(32px, 5vw, 80px)",
          alignItems: "start",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {phone && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{
                  fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em",
                  textTransform: "uppercase", color: MUTED,
                }}>
                  <GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span" />
                </span>
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="b01-cnt-link" style={{
                  fontFamily: FONT, fontWeight: 500,
                  fontSize: "clamp(20px, 2vw, 28px)",
                  letterSpacing: "0.04em", color: DARK, textDecoration: "none",
                  transition: "color 0.3s ease",
                }}>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              </div>
            )}

            {email && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{
                  fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em",
                  textTransform: "uppercase", color: MUTED,
                }}>
                  <GenericEditableText sectionId={sectionId} field="emailLabel" value={emailLabel} tag="span" />
                </span>
                <a href={`mailto:${email}`} className="b01-cnt-link" style={{
                  fontFamily: SANS, fontWeight: 400,
                  fontSize: "clamp(15px, 1.3vw, 18px)",
                  color: DARK, textDecoration: "none",
                  transition: "color 0.3s ease",
                }}>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              </div>
            )}

            {address && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{
                  fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em",
                  textTransform: "uppercase", color: MUTED,
                }}>
                  <GenericEditableText sectionId={sectionId} field="addressLabel" value={addressLabel} tag="span" />
                </span>
                <span style={{
                  fontFamily: SANS, fontWeight: 400,
                  fontSize: "clamp(15px, 1.3vw, 18px)",
                  lineHeight: 1.5, color: DARK, whiteSpace: "pre-line",
                }}>
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                </span>
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="b01-cnt-mapslink inline-flex items-center gap-2"
                  style={{
                    marginTop: 4,
                    fontFamily: FONT, fontSize: 12, fontWeight: 500,
                    letterSpacing: "0.18em", textTransform: "uppercase",
                    color: DARK, textDecoration: "none",
                    borderBottom: `1px solid ${SAND}`, paddingBottom: 3,
                    alignSelf: "flex-start",
                    transition: "color 0.3s ease, border-color 0.3s ease",
                  }}
                >
                  <GenericEditableText sectionId={sectionId} field="mapsLabel" value={mapsLabel} tag="span" />
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            )}

            {hours.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{
                  fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em",
                  textTransform: "uppercase", color: MUTED,
                }}>
                  <GenericEditableText sectionId={sectionId} field="hoursLabel" value={hoursLabel} tag="span" />
                </span>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  {hours.map((h, i) => (
                    <li key={`b1-h-${i}`} style={{
                      display: "flex", justifyContent: "space-between", gap: 16,
                      paddingBottom: 6, borderBottom: "1px solid rgba(224,190,154,0.25)",
                    }}>
                      <span style={{ fontFamily: SANS, fontSize: 14, color: MUTED }}>
                        <GenericEditableText sectionId={sectionId} field={`hours.${i}.day`} value={h.day} tag="span" />
                      </span>
                      <span style={{ fontFamily: MONO, fontSize: 13, color: DARK, letterSpacing: "0.04em" }}>
                        <GenericEditableText sectionId={sectionId} field={`hours.${i}.value`} value={h.value} tag="span" />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="b01-cnt-map" style={{
            position: "relative",
            minHeight: 480,
            backgroundColor: "#F5EDE4",
            border: "1px solid rgba(224,190,154,0.35)",
            overflow: "hidden",
          }}>
            {mapEmbed ? (
              <iframe
                src={mapEmbed}
                title="Mapa"
                width="100%" height="100%"
                style={{ border: 0, filter: "grayscale(90%) sepia(8%) contrast(1.02)", position: "absolute", inset: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: MUTED, fontFamily: MONO, fontSize: 12,
                letterSpacing: "0.22em", textTransform: "uppercase",
              }}>
                Mapa — vložte embed
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactHair02Location({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const tag     = String(content.tag     ?? "");
  const title   = String(content.title   ?? "");
  const body    = String(content.body    ?? "");
  const ctaText = String(content.ctaText ?? "On-line rezervace");
  const ctaHref = String(content.ctaHref ?? "#kontakt");
  const phone   = String(content.phone   ?? "");
  const email   = String(content.email   ?? "");
  const image   = String(content.image   ?? "");
  const TEAL  = "#8ab2ab";
  const BEIGE = "rgb(235,232,226)";
  const FONT  = "'Montserrat', sans-serif";

  return (
    <section id="kontakt" style={{ backgroundColor: "#ffffff", padding: 0 }} data-template="hair-02">
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "stretch", minHeight: 520 }}>
        {/* Left — beige, padding 50px */}
        <div style={{ flex: "0 0 42%", minWidth: 280, backgroundColor: BEIGE, padding: "80px 50px", boxSizing: "border-box" }}>
          {/* H6 teal tag */}
          {tag && (
            <h6 style={{ color: TEAL, fontFamily: FONT, fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 20px" }}>
              <GenericEditableText sectionId={sectionId} field="tag" value={tag} tag="span" />
            </h6>
          )}
          {/* H1 address */}
          <h2 style={{ color: "#000000", fontFamily: FONT, fontSize: "clamp(1.8rem, 2.5vw, 2.2rem)", fontWeight: 700, lineHeight: 1.2, margin: "0 0 20px", textTransform: "uppercase" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {/* Body text */}
          {body && (
            <p style={{ color: "#000000", fontFamily: FONT, fontSize: 15, lineHeight: 1.75, textAlign: "justify", margin: "0 0 28px" }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
          {/* CTA button */}
          <a
            href={ctaHref}
            data-btn="primary"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              backgroundColor: TEAL, color: "#fff",
              fontFamily: FONT, fontSize: 14, fontWeight: 600,
              letterSpacing: "0.05em", textTransform: "lowercase",
              padding: "11px 26px", borderRadius: 4,
              textDecoration: "none", marginBottom: 28,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M2 6h8M6 2l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          {/* Phone + email */}
          <div style={{ fontFamily: FONT, fontSize: 14, color: "#000000", lineHeight: 1.8 }}>
            {phone && <p style={{ margin: "0 0 4px" }}>Telefon: <a href={`tel:${phone}`} style={{ color: "#000", textDecoration: "none" }}>{phone}</a></p>}
            {email && <p style={{ margin: 0 }}>Email: <a href={`mailto:${email}`} style={{ color: "#000", textDecoration: "none" }}>{email}</a></p>}
          </div>
        </div>

        {/* Right — full-height photo */}
        <div style={{ flex: "1 1 58%", minHeight: 480, position: "relative", overflow: "hidden" }}>
          {image && (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              style={{ objectPosition: "47% 100%" }}
              sizes="(max-width:768px) 100vw, 58vw"
              unoptimized={shouldSkipNextImageOptimization(image)}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function ContactSectionForm({ content, isAdmin, tenantSlug, sectionId }: Omit<Props, "variant">) {
  const c = content as ContactContent;
  const nameLabel = String(content.nameLabel ?? "Jméno *");
  const emailLabel = String(content.emailLabel ?? "E-mail *");
  const phoneLabel = String(content.phoneLabel ?? "Telefon");
  const messageLabel = String(content.messageLabel ?? "Zpráva *");
  const submitText = String(content.submitText ?? "Odeslat zprávu");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isAdmin) return;
    if (honeypot) return; // bot detected
    if (!tenantSlug) return;

    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/demo/${tenantSlug}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message, website: honeypot }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) {
        setErrorMsg(json.error ?? "Nepodařilo se odeslat zprávu.");
        setStatus("error");
      } else {
        setStatus("success");
        setName(""); setEmail(""); setPhone(""); setMessage("");
      }
    } catch {
      setErrorMsg("Nepodařilo se odeslat zprávu. Zkuste to znovu.");
      setStatus("error");
    }
  }

  return (
    <section className="py-20 px-6" style={{ backgroundColor: "var(--color-surface, #f9fafb)" }}>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact info */}
        <div>
          <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #111)" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={c.title || "Kontakt"} tag="span" />
          </h2>
          <div className="space-y-4">
            {c.address && (
              <p className="flex items-start gap-3" style={{ color: "var(--color-text, #111)" }}>
                <span className="text-lg">📍</span>
                <GenericEditableText sectionId={sectionId} field="address" value={c.address} tag="span" />
              </p>
            )}
            {c.phone && (
              <p className="flex items-center gap-3">
                <span className="text-lg">📞</span>
                <a href={`tel:${c.phone}`} style={{ color: "var(--color-primary, #6366f1)" }} className="hover:underline">
                  <GenericEditableText sectionId={sectionId} field="phone" value={c.phone} tag="span" />
                </a>
              </p>
            )}
            {c.email && (
              <p className="flex items-center gap-3">
                <span className="text-lg">✉️</span>
                <a href={`mailto:${c.email}`} style={{ color: "var(--color-primary, #6366f1)" }} className="hover:underline">
                  <GenericEditableText sectionId={sectionId} field="email" value={c.email} tag="span" />
                </a>
              </p>
            )}
          </div>
        </div>

        {/* Contact form */}
        <div>
          {status === "success" ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ backgroundColor: "var(--color-bg, #fff)", border: "1px solid var(--color-border, #e5e7eb)" }}
            >
              <div className="text-4xl mb-3">✅</div>
              <p className="font-semibold text-lg" style={{ color: "var(--color-text, #111)" }}>Zpráva odeslána!</p>
              <p className="text-sm mt-2" style={{ color: "var(--color-text-muted, #6b7280)" }}>
                Brzy se vám ozveme.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-4 text-sm underline"
                style={{ color: "var(--color-primary, #6366f1)" }}
              >
                Odeslat další zprávu
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot — hidden from users, filled only by bots */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px" }}
              />

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-text, #111)" }}>
                  <GenericEditableText sectionId={sectionId} field="nameLabel" value={nameLabel} tag="span" />
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vaše jméno"
                  className="w-full px-4 py-2 rounded-lg text-sm outline-none focus:ring-2"
                  style={{
                    border: "1px solid var(--color-border, #e5e7eb)",
                    backgroundColor: "var(--color-bg, #fff)",
                    color: "var(--color-text, #111)",
                    borderRadius: "var(--radius, 8px)",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-text, #111)" }}>
                  <GenericEditableText sectionId={sectionId} field="emailLabel" value={emailLabel} tag="span" />
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vas@email.cz"
                  className="w-full px-4 py-2 rounded-lg text-sm outline-none focus:ring-2"
                  style={{
                    border: "1px solid var(--color-border, #e5e7eb)",
                    backgroundColor: "var(--color-bg, #fff)",
                    color: "var(--color-text, #111)",
                    borderRadius: "var(--radius, 8px)",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-text, #111)" }}>
                  <GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span" />
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+420 ..."
                  className="w-full px-4 py-2 rounded-lg text-sm outline-none focus:ring-2"
                  style={{
                    border: "1px solid var(--color-border, #e5e7eb)",
                    backgroundColor: "var(--color-bg, #fff)",
                    color: "var(--color-text, #111)",
                    borderRadius: "var(--radius, 8px)",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-text, #111)" }}>
                  <GenericEditableText sectionId={sectionId} field="messageLabel" value={messageLabel} tag="span" />
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Jak vám můžeme pomoci?"
                  className="w-full px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 resize-none"
                  style={{
                    border: "1px solid var(--color-border, #e5e7eb)",
                    backgroundColor: "var(--color-bg, #fff)",
                    color: "var(--color-text, #111)",
                    borderRadius: "var(--radius, 8px)",
                  }}
                />
              </div>

              {status === "error" && (
                <p className="text-sm text-red-600">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "sending" || isAdmin}
                className="w-full py-3 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-60"
                style={{
                  backgroundColor: "var(--color-primary, #6366f1)",
                  color: "var(--color-on-primary, #fff)",
                  borderRadius: "var(--radius, 8px)",
                }}
              >
                {status === "sending" ? "Odesílám…" : <GenericEditableText sectionId={sectionId} field="submitText" value={submitText} tag="span" />}
              </button>

              {isAdmin && (
                <p className="text-xs text-center" style={{ color: "var(--color-text-muted, #6b7280)" }}>
                  Formulář je v režimu editoru — odesílání je vypnuto.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// ── tawan-01-contact ──────────────────────────────────────────────────────────
// Kontaktní sekce — bílé BG, 2-col: vlevo info + formulář; vpravo mapa iframe
// Design tokens: PURPLE #393145, BRONZE #af8c6a, Muli
// 1:1 inspirace tawan.cz — sekce Kontakt na homepagi
// ─────────────────────────────────────────────────────────────────────────────
function ContactTawan01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const heading     = String(content.heading     ?? "Navštivte nás");
  const description = String(content.description ?? "");
  const address     = String(content.address     ?? "");
  const phone       = String(content.phone       ?? "");
  const email       = String(content.email       ?? "");
  const hours       = String(content.hours       ?? "");
  const mapEmbedUrl = String(content.mapEmbedUrl ?? "");

  const [name,    setName]    = useState("");
  const [msg,     setMsg]     = useState("");
  const [sent,    setSent]    = useState(false);

  const PURPLE = "#393145";
  const BRONZE = "#af8c6a";
  const MUTED  = "#6b6278";
  const FONT   = "'Muli', sans-serif";
  const BR     = "16px 0 16px 0";

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    padding: "12px 16px", fontFamily: FONT, fontSize: 14, color: PURPLE,
    border: `1px solid #d6d0da`, outline: "none", background: "#faf9fb",
    borderRadius: 4, marginBottom: 16,
  };

  return (
    <section id="kontakt" style={{ backgroundColor: "#fff", padding: "96px 0" }} data-template="tawan-01">
      <style>{`
        .tw-ct-input:focus { border-color: ${BRONZE} !important; background: #fff !important; }
        @media(max-width:767px){ .tw-ct-grid { grid-template-columns:1fr!important; } .tw-ct-map { display:none!important; } }
      `}</style>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>

        {/* Heading */}
        <div style={{ marginBottom: 56, textAlign: "center" }}>
          <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: BRONZE, display: "block", marginBottom: 16 }}>Kontakt</span>
          <h2 style={{ fontFamily: FONT, fontSize: "clamp(28px,3vw,44px)", fontWeight: 300, color: PURPLE, margin: "0 0 16px", letterSpacing: 1 }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          {description && <p style={{ fontFamily: FONT, fontSize: 15, color: MUTED, maxWidth: 560, margin: "0 auto" }}>
            <GenericEditableText sectionId={sectionId} field="description" value={description} tag="span" />
          </p>}
          <div style={{ width: 48, height: 1, backgroundColor: BRONZE, margin: "24px auto 0" }} />
        </div>

        <div className="tw-ct-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>

          {/* Levý sloupec: info + formulář */}
          <div>
            {/* Info items */}
            <div style={{ marginBottom: 40, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 32px" }}>
              {[
                { label: "Adresa", value: address, field: "address", icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BRONZE} strokeWidth="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                )},
                { label: "Telefon", value: phone, field: "phone", icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BRONZE} strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 010 1.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.93v1.99z"/></svg>
                )},
                { label: "E-mail", value: email, field: "email", icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BRONZE} strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
                )},
                { label: "Otevírací doba", value: hours, field: "hours", icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BRONZE} strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                )},
              ].filter(i => i.value).map((item) => (
                <div key={item.field} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ flexShrink: 0, marginTop: 2 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: BRONZE, marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontFamily: FONT, fontSize: 14, color: PURPLE, lineHeight: 1.5 }}>
                      <GenericEditableText sectionId={sectionId} field={item.field} value={item.value} tag="span" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ width: "100%", height: 1, backgroundColor: "#ede8f0", marginBottom: 36 }} />

            {/* Rezervační formulář */}
            <h3 style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: PURPLE, marginBottom: 24 }}>Rezervujte si termín</h3>
            {sent ? (
              <p style={{ fontFamily: FONT, fontSize: 15, color: BRONZE }}>Děkujeme! Brzy se vám ozveme.</p>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true); }}>
                <input className="tw-ct-input" style={inputStyle} placeholder="Vaše jméno" value={name} onChange={e => setName(e.target.value)} required />
                <input className="tw-ct-input" style={inputStyle} placeholder="Telefon nebo e-mail" />
                <select className="tw-ct-input" style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
                  <option value="">Vyberte typ masáže</option>
                  <option>Klasická thajská masáž</option>
                  <option>Olejová masáž</option>
                  <option>Herbal Royal masáž</option>
                  <option>Masáž zad a šíje</option>
                </select>
                <textarea className="tw-ct-input" style={{ ...inputStyle, resize: "vertical", minHeight: 100 }} placeholder="Poznámka (salon, datum, čas…)" value={msg} onChange={e => setMsg(e.target.value)} />
                <button type="submit" style={{
                  fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: 2,
                  textTransform: "uppercase", padding: "0 40px", height: 52,
                  background: BRONZE, color: "#fff", border: "none",
                  borderRadius: BR, cursor: "pointer",
                }}>
                  Odeslat rezervaci
                </button>
              </form>
            )}
          </div>

          {/* Pravý sloupec: mapa */}
          <div className="tw-ct-map" style={{ position: "sticky", top: 100 }}>
            {mapEmbedUrl ? (
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="460"
                style={{ border: 0, display: "block", borderRadius: "4px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div style={{ width: "100%", height: 460, background: "#ede8f0", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
                <span style={{ fontFamily: FONT, fontSize: 13, color: MUTED }}>Google Maps</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

// ── harmonie-01-contact ─────────────────────────────────────────────────────────
function ContactHarmonie01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GOLD  = "#AA813A";
  const CREAM = "#F2EDE4";

  const [status, setStatus] = useState<Status>("idle");

  const title   = String(content.title   ?? "CHCETE VĚDĚT VÍC?\nKONTAKTUJTE NÁS");
  const phone   = String(content.phone   ?? "704 123 456");
  const email   = String(content.email   ?? "info@demo.cz");
  const address = String(content.address ?? "Náměstí Míru 12, Praha 2");
  const hours   = String(content.hours   ?? "Po–Pá 9:00–20:00 / So–Ne 10:00–18:00");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    await new Promise(r => setTimeout(r, 900));
    setStatus("success");
  }

  return (
    <section id="kontakt" data-template="harmonie-01" style={{ backgroundColor: GOLD, padding: "88px 0 96px" }}>
      <div className="harmonie-con-wrap">
        {/* Left — info */}
        <div>
          <h2 style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "clamp(22px,2.8vw,34px)",
            fontWeight: 300,
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: CREAM,
            margin: "0 0 40px",
            whiteSpace: "pre-line",
            lineHeight: 1.3,
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>

          <p className="harmonie-con-info-label">Telefon</p>
          <p className="harmonie-con-info-val"><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" /></p>

          <p className="harmonie-con-info-label">E-mail</p>
          <p className="harmonie-con-info-val"><GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" /></p>

          <p className="harmonie-con-info-label">Adresa</p>
          <p className="harmonie-con-info-val"><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></p>

          <p className="harmonie-con-info-label">Otevírací doba</p>
          <p className="harmonie-con-info-val" style={{ marginBottom: 0 }}><GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" /></p>
        </div>

        {/* Right — form */}
        <div className="harmonie-con-form">
          {status === "success" ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 18, color: CREAM, letterSpacing: 1 }}>
                Děkujeme! Ozveme se vám co nejdříve.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input  className="harmonie-con-field" type="text"  name="name"  placeholder="Jméno a příjmení" required />
              <input  className="harmonie-con-field" type="email" name="email" placeholder="E-mail" required />
              <input  className="harmonie-con-field" type="tel"   name="phone" placeholder="Telefon (nepovinné)" />
              <textarea className="harmonie-con-field textarea" name="message" placeholder="Váš dotaz nebo zájem o proceduru..." />
              <button className="harmonie-con-submit" type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Odesílám…" : "Odeslat zprávu"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// ── tattoo-01-contact ─────────────────────────────────────────────────────────
function ContactTattoo01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const heading   = String(content.heading   ?? "Kontakt");
  const eyebrow   = String(content.eyebrow   ?? "Najdete nás");
  const address   = String(content.address   ?? "");
  const phone     = String(content.phone     ?? "");
  const email     = String(content.email     ?? "");
  const hours     = String(content.hours     ?? "");
  const image     = String(content.image     ?? "");
  const facebook  = String(content.facebook  ?? "");
  const instagram = String(content.instagram ?? "");
  const ACCENT = "#ff5c4b";
  const SANS   = "Arial, Helvetica, sans-serif";

  const infoRef  = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const [infoVis, setInfoVis]   = useState(false);
  const [photoVis, setPhotoVis] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInfoVis(true); o.disconnect(); } }, { threshold: 0.25 });
    if (infoRef.current) o.observe(infoRef.current);
    return () => o.disconnect();
  }, []);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setPhotoVis(true); o.disconnect(); } }, { threshold: 0.2 });
    if (photoRef.current) o.observe(photoRef.current);
    return () => o.disconnect();
  }, []);

  const iconSvg = (name: string) => {
    const base = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: ACCENT, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    switch (name) {
      case "address": return <svg {...base}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
      case "phone":   return <svg {...base}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
      case "email":   return <svg {...base}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/></svg>;
      case "hours":   return <svg {...base}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
      default:        return null;
    }
  };

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .t01-contact-row { flex-direction: column !important; }
          .t01-contact-photo { min-height: 240px !important; flex: none !important; }
        }
      `}</style>
      <section id="kontakt" data-template="tattoo-01" style={{ backgroundColor: "#0a0a0a", overflow: "hidden" }}>
        <div className="t01-contact-row" style={{ display: "flex", maxWidth: 1280, margin: "0 auto" }}>
          {/* Levý sloupec — info */}
          <div ref={infoRef} className={`t01-gal-reveal ${infoVis ? "t01-visible" : ""}`} style={{ flex: "0 0 50%", padding: "clamp(56px, 8vw, 96px) clamp(32px, 5vw, 72px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p style={{ fontFamily: SANS, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: ACCENT, margin: "0 0 16px" }}>
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </p>
            <div style={{ width: 48, height: 3, backgroundColor: ACCENT, marginBottom: 24 }} aria-hidden />
            <h2 style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 900, color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 clamp(28px, 4vw, 44px)" }}>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            {[
              { icon: "address", field: "address", value: address },
              { icon: "phone",   field: "phone",   value: phone   },
              { icon: "email",   field: "email",   value: email   },
              { icon: "hours",   field: "hours",   value: hours   },
            ].filter(r => r.value).map(({ icon, field, value }) => (
              <div key={field} className="t01-contact-line">
                <span className="t01-contact-icon" aria-hidden>{iconSvg(icon)}</span>
                <span style={{ fontFamily: SANS, fontSize: "0.95rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
                  <GenericEditableText sectionId={sectionId} field={field} value={value} tag="span" />
                </span>
              </div>
            ))}
            {(facebook || instagram) && (
              <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.55)", fontFamily: SANS, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = ACCENT)} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    Facebook
                  </a>
                )}
                {instagram && (
                  <a href={instagram} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.55)", fontFamily: SANS, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = ACCENT)} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
                    Instagram
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Pravý sloupec — foto studia */}
          <div ref={photoRef} className={`t01-contact-photo t01-contact-photo-reveal ${photoVis ? "t01-visible" : ""}`} style={{ flex: "0 0 50%", position: "relative", minHeight: "clamp(300px, 40vw, 500px)" }}>
            {image ? (
              <>
                <GenericEditableImage sectionId={sectionId} field="image" src={image} alt="Studio" className="t01-contact-img" style={{ position: "absolute", inset: 0 }}>
                  <Image src={image} alt="Studio" fill className="object-cover" sizes="50vw" unoptimized={shouldSkipNextImageOptimization(image)} />
                </GenericEditableImage>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(10,10,10,0.55) 0%, transparent 42%)", pointerEvents: "none" }} aria-hidden />
              </>
            ) : (
              <div style={{ position: "absolute", inset: 0, backgroundColor: "#1a1a1a" }} />
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// ── tattoo-02-contact ─────────────────────────────────────────────────────────
// Dark 2-col: left info (Oswald + gold icons), right studio photo. Luxe tier.
// ─────────────────────────────────────────────────────────────────────────────
function ContactTattoo02({ content, sectionId }: {
  content: Record<string, unknown>;
  sectionId: number;
}) {
  const c          = content as Record<string, unknown>;
  const showHeader = c.showHeader !== false;
  const eyebrow   = String(c.eyebrow   ?? "Kontakt");
  const heading    = String(c.heading   ?? "Rezervujte si termín");
  const text       = String(c.text      ?? "Každé tetování začíná rozhovorem. Napište nám nebo zavolejte — konzultace je zdarma a nezávazná.");
  const address    = String(c.address   ?? "Ukázková 123, 110 00 Praha 1");
  const phone      = String(c.phone     ?? "704 123 456");
  const email      = String(c.email     ?? "email@demo.cz");
  const hours      = String(c.hours     ?? "Po–Pá 10:00–19:00 · So 10:00–15:00");
  const ctaText    = String(c.ctaText   ?? "Zavolat studio");
  const instagram  = String(c.instagram ?? "");
  const facebook   = String(c.facebook  ?? "");
  const image      = String(c.image     ?? "/templates/tattoo-02/contact.webp");

  const OSWALD = "var(--font-oswald), 'Oswald', Impact, sans-serif";

  return (
    <section id="kontakt" data-template="tattoo-02" className="t02-ct-section">
      <div className="t02-ct-wrap">
        {/* Left — contact info */}
        <div className="t02-ct-info">
          {showHeader && (
            <>
              <p className="t02-ct-eyebrow" style={{ fontFamily: OSWALD }}>
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              </p>
              <div className="t02-ct-rule" aria-hidden />
              <h2 className="t02-ct-heading" style={{ fontFamily: OSWALD }}>
                <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
              </h2>
            </>
          )}
          <p className="t02-ct-text">
            <GenericEditableText sectionId={sectionId} field="text" value={text} tag="span" />
          </p>

          {/* Info rows */}
          <div className="t02-ct-rows">
            <div className="t02-ct-row">
              <div className="t02-ct-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                </svg>
              </div>
              <div className="t02-ct-label">
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </div>
            </div>
            <div className="t02-ct-row">
              <div className="t02-ct-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 010 2.18A2 2 0 012.18 0H5a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0120 18.92z"/>
                </svg>
              </div>
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="t02-ct-label t02-ct-link">
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            </div>
            <div className="t02-ct-row">
              <div className="t02-ct-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <a href={`mailto:${email}`} className="t02-ct-label t02-ct-link">
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            </div>
            <div className="t02-ct-row">
              <div className="t02-ct-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <div className="t02-ct-label">
                <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
              </div>
            </div>
          </div>

          {/* CTA */}
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="t02-ct-cta" style={{ fontFamily: OSWALD }}>
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>

          {/* Social */}
          <div className="t02-ct-social">
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </a>
            )}
            {facebook && (
              <a href={facebook} target="_blank" rel="noopener" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Right — studio photo */}
        <div className="t02-ct-photo">
          <GenericEditableImage sectionId={sectionId} field="image" src={image} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <Image
              src={image}
              alt="Studio"
              fill
              sizes="(max-width:800px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
              unoptimized={shouldSkipNextImageOptimization(image)}
            />
          </GenericEditableImage>
          <div className="t02-ct-photo-border" aria-hidden />
        </div>
      </div>
    </section>
  );
}

// ── tattoo-03-contact ─────────────────────────────────────────────────────────
// Dark 2-col: studio photo left (grayscale hover), contact info right
// Bebas Neue heading, Barlow Condensed labels, crimson accents + brackets
// ─────────────────────────────────────────────────────────────────────────────
function ContactTattoo03({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const c          = content as Record<string, unknown>;
  const showHeader = c.showHeader !== false;
  const showForm   = c.showForm === true;
  const eyebrow    = String(c.eyebrow    ?? "Kontakt");
  const heading    = String(c.heading    ?? "Rezervujte si termín");
  const address    = String(c.address    ?? "Ukázková 123, 110 00 Praha 1");
  const phone      = String(c.phone      ?? "704 123 456");
  const email      = String(c.email      ?? "email@demo.cz");
  const hours      = String(c.hours      ?? "Po–Pá 10:00–20:00 · So 10:00–16:00");
  const ctaLabel   = String(c.ctaLabel   ?? "Zavolat studio");
  const facebook   = String(c.facebook   ?? "https://facebook.com/demo");
  const instagram  = String(c.instagram  ?? "https://instagram.com/demo");
  const image      = String(c.image      ?? "/templates/tattoo-03/contact-studio.webp");
  const formTitle  = String(c.formTitle  ?? "Napište nám");
  const submitText = String(c.submitText ?? "Odeslat poptávku");

  const ACCENT = "#D41515";

  const [fName, setFName] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fMsg, setFMsg] = useState("");
  const [honey, setHoney] = useState("");
  const [fStatus, setFStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [fErr, setFErr] = useState("");

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isAdmin || honey || !tenantSlug) return;
    setFStatus("sending"); setFErr("");
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fName, email: fEmail, phone: fPhone, message: fMsg, website: honey }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) { setFErr(json.error ?? "Nepodařilo se odeslat zprávu."); setFStatus("error"); }
      else { setFStatus("success"); setFName(""); setFEmail(""); setFPhone(""); setFMsg(""); }
    } catch {
      setFErr("Nepodařilo se odeslat zprávu. Zkuste to znovu."); setFStatus("error");
    }
  }

  const rows = [
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
      label: "ADRESA", field: "address", value: address, href: `https://maps.google.com/?q=${encodeURIComponent(address)}`,
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.4 2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
      label: "TELEFON", field: "phone", value: phone, href: `tel:+420${phone.replace(/\s/g, "")}`,
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
      label: "E-MAIL", field: "email", value: email, href: `mailto:${email}`,
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      label: "OTEVÍRACÍ DOBA", field: "hours", value: hours, href: null,
    },
  ];

  return (
    <section id="kontakt" data-template="tattoo-03" style={{ backgroundColor: "#0a0a0a" }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600&family=Barlow:wght@400&display=swap" rel="stylesheet" />

      <style>{`
        [data-template="tattoo-03"] .t03-form-input {
          width: 100%; box-sizing: border-box;
          background: #131315; border: 1px solid rgba(255,255,255,0.1);
          color: #fff; font-family: 'Barlow', sans-serif; font-size: 0.95rem;
          padding: 14px 16px; outline: none;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        [data-template="tattoo-03"] .t03-form-input::placeholder { color: rgba(255,255,255,0.35); }
        [data-template="tattoo-03"] .t03-form-input:focus { border-color: ${ACCENT}; background: #17171a; }
        [data-template="tattoo-03"] .t03-form-input:disabled { opacity: 0.5; }
        [data-template="tattoo-03"] .t03-form-submit:hover { background: #b31212; }
      `}</style>
      <div className="t03-contact-grid" style={{ maxWidth: 1360, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        {showForm ? (
          /* Contact form — left */
          <div style={{ padding: "clamp(48px,6vw,88px) clamp(28px,5vw,72px)", backgroundColor: "#0a0a0a", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: "clamp(26px, 3vw, 40px)", color: "#ffffff", margin: "0 0 6px", letterSpacing: "0.04em", lineHeight: 1.05 }}>
              <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" />
            </h3>
            <div style={{ width: 40, height: 2, backgroundColor: ACCENT, margin: "12px 0 32px" }} aria-hidden />
            {fStatus === "success" ? (
              <div style={{ padding: "28px 24px", border: "1px solid rgba(212,21,21,0.4)", background: "rgba(212,21,21,0.06)", color: "#fff", fontFamily: "'Barlow', sans-serif" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.04em", marginBottom: 6 }}>Děkujeme!</div>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: "0.95rem" }}>Vaše poptávka dorazila. Ozveme se vám co nejdříve.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input type="text" required placeholder="Jméno *" aria-label="Jméno" className="t03-form-input" value={fName} onChange={e => setFName(e.target.value)} disabled={fStatus === "sending"} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <input type="email" required placeholder="E-mail *" aria-label="E-mail" className="t03-form-input" value={fEmail} onChange={e => setFEmail(e.target.value)} disabled={fStatus === "sending"} />
                  <input type="tel" placeholder="Telefon" aria-label="Telefon" className="t03-form-input" value={fPhone} onChange={e => setFPhone(e.target.value)} disabled={fStatus === "sending"} />
                </div>
                <textarea required rows={5} placeholder="Váš motiv, umístění, velikost, termín… *" aria-label="Zpráva" className="t03-form-input" style={{ resize: "vertical", minHeight: 120 }} value={fMsg} onChange={e => setFMsg(e.target.value)} disabled={fStatus === "sending"} />
                <input type="text" tabIndex={-1} autoComplete="off" aria-hidden value={honey} onChange={e => setHoney(e.target.value)} style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
                {fStatus === "error" && <p style={{ margin: 0, color: "#ff6b6b", fontFamily: "'Barlow', sans-serif", fontSize: "0.85rem" }}>{fErr}</p>}
                <button type="submit" disabled={fStatus === "sending"} className="t03-form-submit"
                  style={{ marginTop: 6, alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 10, backgroundColor: ACCENT, color: "#fff", border: "none", cursor: fStatus === "sending" ? "wait" : "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.95rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", padding: "15px 40px", transition: "background 0.2s ease" }}>
                  {fStatus === "sending" ? "Odesílám…" : submitText}
                  <span aria-hidden>→</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Studio photo — left */
          <div className="t03-contact-img t03-contact-photo" style={{ position: "relative", minHeight: 600, overflow: "hidden" }}>
            <GenericEditableImage sectionId={sectionId} field="image" src={image} alt="Tetovací studio" className="absolute inset-0 w-full h-full" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              <img src={image} alt="Tetovací studio" loading="lazy" className="t03-contact-photo-img" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", transition: "filter 0.5s ease, transform 0.5s ease" }} />
            </GenericEditableImage>
            <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 50%, rgba(10,10,10,0.7) 100%)" }} />
            {/* Corner brackets */}
            <div className="t03-contact-bracket" style={{ position: "absolute", top: 24, left: 24, width: 40, height: 40, borderTop: `2px solid rgba(212,21,21,0.6)`, borderLeft: `2px solid rgba(212,21,21,0.6)`, pointerEvents: "none" }} />
            <div className="t03-contact-bracket" style={{ position: "absolute", bottom: 24, right: 24, width: 40, height: 40, borderBottom: `2px solid rgba(255,255,255,0.2)`, borderRight: `2px solid rgba(255,255,255,0.2)`, pointerEvents: "none" }} />
          </div>
        )}

        {/* Contact info — right */}
        <div style={{ padding: "clamp(48px,6vw,88px) clamp(28px,5vw,72px)", backgroundColor: "#0e0e0e", display: "flex", flexDirection: "column", justifyContent: "center", borderLeft: "1px solid rgba(255,255,255,0.04)" }}>

          {showHeader && (
            <>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.4" aria-hidden><line x1="12" y1="2" x2="12" y2="22"/><line x1="8" y1="6" x2="16" y2="6" strokeWidth="0.8"/></svg>
                <p style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "0.72rem", fontWeight: 600,
                  color: ACCENT, letterSpacing: "0.22em",
                  textTransform: "uppercase", margin: 0,
                }}>
                  <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
                </p>
              </div>
              <h2 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontWeight: 400,
                fontSize: "clamp(28px, 3.2vw, 48px)",
                color: "#ffffff",
                margin: "0 0 8px",
                letterSpacing: "0.04em",
                lineHeight: 1.05,
              }}>
                <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
              </h2>
              <div style={{ width: 40, height: 2, backgroundColor: ACCENT, margin: "12px 0 40px" }} aria-hidden />
            </>
          )}

          {/* Contact rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 44 }}>
            {rows.map((row, i) => {
              const inner = (
                <div className="t03-contact-row" style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{
                    width: 44, height: 44, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid rgba(212,21,21,0.2)",
                    backgroundColor: "rgba(212,21,21,0.04)",
                  }}>
                    {row.icon}
                  </div>
                  <div>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: "0.62rem", fontWeight: 600,
                      color: "rgba(255,255,255,0.3)",
                      textTransform: "uppercase", letterSpacing: "0.16em",
                      marginBottom: 4,
                    }}>
                      {row.label}
                    </div>
                    <div style={{
                      fontFamily: "'Barlow', sans-serif",
                      fontSize: "0.92rem",
                      color: "rgba(255,255,255,0.85)",
                      lineHeight: 1.4,
                    }}>
                      <GenericEditableText sectionId={sectionId} field={row.field} value={row.value} tag="span" />
                    </div>
                  </div>
                </div>
              );
              return row.href ? (
                <a key={i} href={row.href} className="t03-contact-link" style={{ textDecoration: "none" }}>{inner}</a>
              ) : (
                <div key={i}>{inner}</div>
              );
            })}
          </div>

          {/* CTA + Social */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <a
              href={`tel:+420${phone.replace(/\s/g, "")}`}
              className="t03-contact-cta"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                backgroundColor: ACCENT, color: "#ffffff",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "0.88rem", fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "15px 36px",
                textDecoration: "none",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.4 2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <GenericEditableText sectionId={sectionId} field="ctaLabel" value={ctaLabel} tag="span" />
            </a>

            <div style={{ display: "flex", gap: 10 }}>
              {[
                { href: facebook, label: "Facebook", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
                { href: instagram, label: "Instagram", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg> },
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="t03-contact-social"
                  style={{
                    width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)",
                    textDecoration: "none",
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── nails-02-contact ──────────────────────────────────────────────────────────
// Dark wine #1f1411 sekce s 2-col: vlevo (04) prefix + serif italic cream
// "Kontakty" + taupe linka + uppercase kicker, pak 4 info bloky (Adresa, Email,
// Telefon, Otevírací doba) s taupe ikonkami; vpravo embed Google mapa s tmavým
// rámem. Foot: malé IG + WhatsApp linky.
// ─────────────────────────────────────────────────────────────────────────────
function ContactNails02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const DARK  = "#1f1411";
  const WINE  = "#6b3f38";
  const TAUPE = "#d4a080";
  const CREAM = "#f6efe9";
  const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
  const SANS  = "'Helvetica Neue', Arial, sans-serif";

  const numberPrefix = String(content.numberPrefix ?? "(04)");
  const title        = String(content.title        ?? "Kontakty");
  const kicker       = String(content.kicker       ?? "Těšíme se na vás");
  const address      = String(content.address      ?? "Melantrichova 15, 110 00 Praha 1");
  const email        = String(content.email        ?? "studio@premiumnails.cz");
  const phone        = String(content.phone        ?? "+420 704 123 456");
  const hours        = String(content.hours        ?? "Po–Pá 9:00–20:00 · So 9:00–15:00");
  const mapEmbedUrl  = String(content.mapEmbedUrl  ?? "https://www.google.com/maps?q=Melantrichova+15,+Praha&output=embed");
  const igHref       = String(content.igHref       ?? "https://instagram.com/premiumnails.demo");
  const waHref       = String(content.waHref       ?? "https://wa.me/420704123456");

  type InfoItem = { label: string; value: string; href?: string; icon: React.ReactNode };
  const items: InfoItem[] = [
    {
      label: "Adresa", value: address,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    },
    {
      label: "Email", value: email, href: `mailto:${email}`,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>,
    },
    {
      label: "Telefon", value: phone, href: `tel:${phone.replace(/\s/g, "")}`,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0122 16.92z"/></svg>,
    },
    {
      label: "Otevírací doba", value: hours,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    },
  ];

  return (
    <section
      id="kontakt"
      data-section-type="contact"
      data-variant="nails-02-contact"
      data-template="nails-02"
      style={{
        backgroundColor: DARK,
        padding: (title || kicker || numberPrefix) ? "clamp(90px, 12vw, 160px) clamp(24px, 6vw, 72px)" : "clamp(48px, 6vw, 72px) clamp(24px, 6vw, 72px)",
        position: "relative",
      }}
    >
      {/* Section eyebrow — hidden on subpages */}
      {(title || kicker || numberPrefix) && (
      <div
        className="n02-contact-eyebrow"
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
        <span>Kapitola · 05</span>
        <span style={{ display: "block", width: 42, height: 1, backgroundColor: TAUPE, opacity: 0.6 }} />
      </div>
      )}

      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div
          className="nails02-contact-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.05fr)",
            gap: "clamp(48px, 6vw, 96px)",
            alignItems: "stretch",
          }}
        >
          {/* Left: text + info */}
          <div>
            {/* (04) with vertical hairline — hidden on subpage */}
            {numberPrefix && (
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
              <span aria-hidden style={{ display: "block", width: 1, height: 32, backgroundColor: TAUPE }} />
              <span style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(1.5rem, 1.9vw, 1.9rem)",
                color: TAUPE,
                lineHeight: 1,
                opacity: 0.9,
              }}>
                <GenericEditableText sectionId={sectionId} field="numberPrefix" value={numberPrefix} tag="span" />
              </span>
            </div>
            )}

            {title && (
            <h2
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(3.2rem, 7vw, 6.6rem)",
                lineHeight: 0.95,
                color: CREAM,
                margin: 0,
                letterSpacing: "-0.015em",
              }}
            >
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            )}
            {(title || kicker) && (
            <div aria-hidden="true" style={{ width: 88, height: 1, backgroundColor: TAUPE, margin: "48px 0 28px" }} />
            )}
            {kicker && (
            <p
              style={{
                fontFamily: SANS,
                fontSize: "0.76rem",
                fontWeight: 600,
                color: TAUPE,
                textTransform: "uppercase",
                letterSpacing: "0.32em",
                margin: 0,
              }}
            >
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            </p>
            )}

            {/* Prominent tel display */}
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="n02-contact-tel"
              style={{
                display: "inline-flex",
                alignItems: "baseline",
                gap: 16,
                marginTop: 44,
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(2.2rem, 3.5vw, 3.2rem)",
                color: TAUPE,
                textDecoration: "none",
                letterSpacing: "-0.005em",
                lineHeight: 1,
                paddingBottom: 8,
                borderBottom: `1px solid transparent`,
                transition: "border-color 0.35s ease, color 0.35s ease",
              }}
            >
              <span style={{ fontSize: "0.6em", opacity: 0.6, letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: SANS, fontStyle: "normal", fontWeight: 500 }}>Tel</span>
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>

            <ul style={{ listStyle: "none", margin: "44px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              {items.map((item, i) => (
                <li
                  key={`ci-${i}`}
                  className="n02-contact-row"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 20,
                    padding: "18px 16px 18px 8px",
                    borderTop: i === 0 ? `1px solid rgba(212,160,128,0.18)` : "none",
                    borderBottom: `1px solid rgba(212,160,128,0.18)`,
                    position: "relative",
                    transition: "padding-left 0.4s ease, background-color 0.4s ease",
                  }}
                >
                  <span aria-hidden className="n02-contact-row-mark" style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    width: 0,
                    height: 20,
                    backgroundColor: TAUPE,
                    transform: "translateY(-50%)",
                    transition: "width 0.4s ease",
                  }} />
                  <span
                    aria-hidden="true"
                    style={{
                      flexShrink: 0,
                      width: 36, height: 36,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 999,
                      border: `1px solid rgba(212,160,128,0.35)`,
                      color: TAUPE,
                      marginTop: 2,
                    }}
                  >
                    {item.icon}
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                    <span
                      style={{
                        fontFamily: SERIF,
                        fontStyle: "italic",
                        fontSize: "0.98rem",
                        fontWeight: 400,
                        color: TAUPE,
                        letterSpacing: "0.02em",
                        opacity: 0.85,
                      }}
                    >
                      {item.label}
                    </span>
                    {item.href ? (
                      <a
                        href={item.href}
                        style={{
                          fontFamily: SANS,
                          fontSize: "1.02rem",
                          fontWeight: 300,
                          color: CREAM,
                          textDecoration: "none",
                          letterSpacing: "0.01em",
                          transition: "color 0.25s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = TAUPE)}
                        onMouseLeave={e => (e.currentTarget.style.color = CREAM)}
                      >
                        <GenericEditableText sectionId={sectionId} field={ ["address","email","phone","hours"][i] } value={item.value} tag="span" />
                      </a>
                    ) : (
                      <span style={{
                        fontFamily: SANS,
                        fontSize: "1.02rem",
                        fontWeight: 300,
                        color: CREAM,
                        letterSpacing: "0.01em",
                      }}>
                        <GenericEditableText sectionId={sectionId} field={ ["address","email","phone","hours"][i] } value={item.value} tag="span" />
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Social pills — luxe outline with sweep */}
            <div style={{ display: "flex", gap: 14, marginTop: 44, flexWrap: "wrap" }}>
              <a
                href={igHref}
                target="_blank"
                rel="noopener noreferrer"
                className="n02-contact-social n02-contact-social-outline"
                style={{
                  position: "relative",
                  display: "inline-flex", alignItems: "center", gap: 12,
                  padding: "13px 26px",
                  border: `1px solid ${TAUPE}`,
                  color: TAUPE,
                  fontFamily: SANS,
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  overflow: "hidden",
                  transition: "color 0.35s ease",
                }}
              >
                <span style={{ position: "relative", zIndex: 2, display: "inline-flex", alignItems: "center", gap: 12 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/></svg>
                  Instagram
                </span>
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="n02-contact-social n02-contact-social-filled"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 12,
                  padding: "13px 26px",
                  backgroundColor: TAUPE,
                  color: DARK,
                  fontFamily: SANS,
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  transition: "background-color 0.3s, transform 0.3s ease",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 14.3c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.2-.4-2.4-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.7.1-.1.3-.3.5-.5.1-.2.2-.3.3-.5.1-.2.1-.4 0-.5-.1-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .2.2 2 3.1 4.9 4.4 1.7.7 2.4.8 3.3.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3z"/></svg>
                WhatsApp
              </a>
            </div>
          </div>

          {/* Right: map with wine corner brackets */}
          <div
            className="nails02-contact-map"
            style={{
              position: "relative",
              minHeight: 520,
              border: `1px solid rgba(212,160,128,0.22)`,
              overflow: "hidden",
              alignSelf: "stretch",
            }}
          >
            <iframe
              title="Mapa — Premium Nails"
              src={mapEmbedUrl}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                border: 0,
                filter: "grayscale(0.75) contrast(0.9) brightness(0.85)",
              }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            {/* Corner brackets */}
            {[
              { top: -1, left: -1, rotate: 0 },
              { top: -1, right: -1, rotate: 90 },
              { bottom: -1, right: -1, rotate: 180 },
              { bottom: -1, left: -1, rotate: 270 },
            ].map(({ rotate, ...pos }, bi) => (
              <span
                key={`mapbrk-${bi}`}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  ...pos,
                  width: 32,
                  height: 32,
                  transform: `rotate(${rotate}deg)`,
                  transformOrigin: "center",
                  zIndex: 3,
                  pointerEvents: "none",
                }}
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M32 0 H8 A8 8 0 0 0 0 8 V32" stroke={TAUPE} strokeWidth="1.5" fill="none"/>
                </svg>
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        .n02-contact-tel:hover { color: ${CREAM}; border-bottom-color: ${TAUPE}; }
        .n02-contact-row:hover { background-color: rgba(212,160,128,0.05); padding-left: 20px !important; }
        .n02-contact-row:hover .n02-contact-row-mark { width: 3px; }
        .n02-contact-social-outline::before {
          content: "";
          position: absolute;
          inset: 0;
          background-color: ${TAUPE};
          transform: translateX(-101%);
          transition: transform 0.45s cubic-bezier(0.65,0,0.35,1);
          z-index: 1;
        }
        .n02-contact-social-outline:hover::before { transform: translateX(0); }
        .n02-contact-social-outline:hover { color: ${DARK}; }
        .n02-contact-social-filled:hover { background-color: #c08e6e; transform: translateY(-2px); }
        @media (max-width: 900px) {
          .nails02-contact-grid { grid-template-columns: 1fr !important; }
          .nails02-contact-map { min-height: 380px !important; }
          .n02-contact-eyebrow { display: none !important; }
        }
      `}</style>
    </section>
  );
}

// ── nails-03-contact ──────────────────────────────────────────────────────────
function ContactNails03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const CREAM = "#FCF9F0";
  const DARK  = "#0B090C";
  const BROWN = "#806248";
  const MUTED = "#5a5047";
  const FONT  = "'Manrope', 'Helvetica Neue', Arial, sans-serif";

  const title       = String(content.title       ?? "Kontakty");
  const kicker      = String(content.kicker      ?? "Najdete nás v srdci města");
  const address     = String(content.address     ?? "Vinohradská 42, 120 00 Praha 2");
  const email       = String(content.email       ?? "info@studiokrasy.cz");
  const phone       = String(content.phone       ?? "+420 704 123 456");
  const phone2      = String(content.phone2      ?? "");
  const hours       = String(content.hours       ?? "Po–Pá 9:00–19:00, So 9:00–14:00");
  const mapEmbedUrl = String(content.mapEmbedUrl ?? "https://www.google.com/maps?q=Vinohradska+42+Praha&output=embed");
  const igHref      = String(content.igHref      ?? "https://instagram.com/studio_krasy");

  const showHeader = content.title !== "" && content.kicker !== "";

  const iconAddress = <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={BROWN} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
  const iconEmail   = <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={BROWN} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>;
  const iconPhone   = <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={BROWN} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0122 16.92z"/></svg>;
  const iconClock   = <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={BROWN} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

  const infoRows: { icon: React.ReactNode; label: string; field: string; value: string; isLink?: string }[] = [
    { icon: iconAddress, label: "Adresa", field: "address", value: address },
    { icon: iconEmail, label: "Email", field: "email", value: email, isLink: `mailto:${email}` },
    { icon: iconPhone, label: "Telefon", field: "phone", value: phone, isLink: `tel:${phone.replace(/\s/g, "")}` },
    { icon: iconClock, label: "Otevírací doba", field: "hours", value: hours },
  ];

  return (
    <section
      id="kontakt"
      data-section-type="contact"
      data-template="nails-03"
      data-variant="nails-03-contact"
      style={{ backgroundColor: CREAM, padding: "110px 24px" }}
    >
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        {showHeader && (
          <div style={{ textAlign: "center", marginBottom: 60 }}>
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
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              color: DARK, margin: 0, lineHeight: 1.08,
            }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          </div>
        )}

        <div
          className="n03-contact-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}
        >
          {/* Left: info rows */}
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {infoRows.map((row, i) => (
                <div key={i} className="n03-contact-row" style={{
                  display: "flex", gap: 16, alignItems: "flex-start",
                  padding: "20px 0",
                  borderBottom: i < infoRows.length - 1 ? `1px dashed rgba(128,98,72,0.18)` : "none",
                }}>
                  <span style={{ marginTop: 2, flexShrink: 0, opacity: 0.85 }}>{row.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: FONT, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.20em", textTransform: "uppercase", color: BROWN, margin: "0 0 5px" }}>
                      <GenericEditableText sectionId={sectionId} field={`${row.field}Label`} value={row.label} tag="span" />
                    </p>
                    {row.isLink ? (
                      <a href={row.isLink} className="n03-contact-link" style={{ fontFamily: FONT, fontSize: "0.93rem", color: DARK, textDecoration: "none", transition: "color 0.25s ease" }}>
                        <GenericEditableText sectionId={sectionId} field={row.field} value={row.value} tag="span" />
                      </a>
                    ) : (
                      <p style={{ fontFamily: FONT, fontSize: "0.93rem", color: DARK, margin: 0, lineHeight: 1.55 }}>
                        <GenericEditableText sectionId={sectionId} field={row.field} value={row.value} tag="span" />
                      </p>
                    )}
                    {row.field === "phone" && phone2 && (
                      <a href={`tel:${phone2.replace(/\s/g, "")}`} className="n03-contact-link" style={{ fontFamily: FONT, fontSize: "0.93rem", color: DARK, textDecoration: "none", display: "block", marginTop: 3, transition: "color 0.25s ease" }}>
                        <GenericEditableText sectionId={sectionId} field="phone2" value={phone2} tag="span" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* IG link */}
            <a
              href={igHref}
              target="_blank"
              rel="noopener noreferrer"
              className="n03-contact-ig"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                marginTop: 32,
                fontFamily: FONT, fontSize: "0.78rem", fontWeight: 600,
                color: MUTED, textDecoration: "none", letterSpacing: "0.06em",
                transition: "color 0.25s ease",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
              <GenericEditableText sectionId={sectionId} field="igText" value="@studio_krasy" tag="span" />
            </a>
          </div>

          {/* Right: map with corner brackets */}
          <div style={{ position: "relative" }}>
            <div aria-hidden="true" style={{ position: "absolute", inset: -10, pointerEvents: "none", zIndex: 2 }}>
              <span style={{ position: "absolute", top: 0, left: 0, width: 24, height: 24, borderTop: `1.5px solid rgba(128,98,72,0.30)`, borderLeft: `1.5px solid rgba(128,98,72,0.30)` }} />
              <span style={{ position: "absolute", top: 0, right: 0, width: 24, height: 24, borderTop: `1.5px solid rgba(128,98,72,0.30)`, borderRight: `1.5px solid rgba(128,98,72,0.30)` }} />
              <span style={{ position: "absolute", bottom: 0, left: 0, width: 24, height: 24, borderBottom: `1.5px solid rgba(128,98,72,0.30)`, borderLeft: `1.5px solid rgba(128,98,72,0.30)` }} />
              <span style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderBottom: `1.5px solid rgba(128,98,72,0.30)`, borderRight: `1.5px solid rgba(128,98,72,0.30)` }} />
            </div>
            <div
              className="n03-contact-map"
              style={{ position: "relative", width: "100%", minHeight: 440, overflow: "hidden", borderRadius: 2 }}
            >
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ position: "absolute", inset: 0, border: 0, width: "100%", height: "100%" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── clinic-02-contact ──────────────────────────────────────────────────────
// White bg, 2-col: 4 info cards left (Adresa/Tel/Email/Hodiny) + Navy CTA card
// with amber pill CTA right.
function ContactClinic02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY   = "#0F203E";
  const NAVY_D = "#0a172e";
  const AMBER  = "#ffa60b";
  const MUTED  = "#606266";
  const CREAM  = "#fffaf2";
  const FONT_H = "'Poppins', Arial, sans-serif";
  const FONT_B = "'Open Sans', Arial, sans-serif";

  const title    = String(content.title    ?? "Kontaktujte nás");
  const kicker   = String(content.kicker   ?? "Jsme tu pro vás");
  const address  = String(content.address  ?? "Vinohradská 2828/151");
  const city     = String(content.city     ?? "130 00 Praha 3 — Vinohrady");
  const phone    = String(content.phone    ?? "+420 234 567 890");
  const email    = String(content.email    ?? "info@aurelie-clinic.cz");
  const web = String(content.web ?? "");
  const ctaText  = String(content.ctaText  ?? "Zavolat nyní");
  const ctaCardTitle = String((content as Record<string,unknown>).ctaCardTitle ?? "Rezervujte si návštěvu");
  const ctaCardBody  = String((content as Record<string,unknown>).ctaCardBody  ?? "Vyberte si termín, který vám vyhovuje. Naše recepce je vám k dispozici po celý pracovní den.");
  const ctaCardBtn   = String((content as Record<string,unknown>).ctaCardBtn   ?? "Online rezervace");
  const hours    = Array.isArray(content.hours)
    ? (content.hours as Array<{ days?: string; time?: string }>)
    : [];

  type InfoCard = { label: string; icon: React.ReactNode; body: React.ReactNode };
  const cards: InfoCard[] = [
    {
      label: "Adresa",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
      body: (
        <>
          <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /><br />
          <GenericEditableText sectionId={sectionId} field="city" value={city} tag="span" />
        </>
      ),
    },
    {
      label: "Telefon",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
      body: (
        <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ color: NAVY, textDecoration: "none" }}>
          <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
        </a>
      ),
    },
    {
      label: "E-mail",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>,
      body: (
        <a href={`mailto:${email}`} style={{ color: NAVY, textDecoration: "none" }}>
          <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
        </a>
      ),
    },
    ...(web ? [{
      label: "Web",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
      body: (
        <a href={web} target="_blank" rel="noopener noreferrer" style={{ color: NAVY, textDecoration: "none" }}>
          <GenericEditableText sectionId={sectionId} field="web" value={web.replace(/^https?:\/\//, "")} tag="span" />
        </a>
      ),
    }] : []),
    {
      label: "Otevírací doba",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {hours.map((h, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: "0.88rem" }}>
              <span style={{ color: MUTED }}>{h.days}</span>
              <span style={{ fontWeight: 600, color: NAVY }}>{h.time}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <section id="kontakt" data-template="clinic-02" style={{ backgroundColor: "#FFFFFF", padding: "clamp(72px,9vw,120px) 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(24px,5vw,60px)" }}>
        {/* Header — hidden on subpages */}
        {(content.showHeader !== false) && (kicker || title) && (
          <div style={{ marginBottom: "clamp(44px,5.5vw,64px)" }}>
            {kicker && (
              <p style={{
                fontFamily: FONT_B, fontSize: "0.75rem", fontWeight: 700,
                letterSpacing: "0.22em", textTransform: "uppercase", color: AMBER, margin: "0 0 18px",
                display: "inline-flex", alignItems: "center", gap: 12,
              }}>
                <span style={{ width: 28, height: 1, backgroundColor: AMBER }} />
                <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
              </p>
            )}
            {title && (
              <h2 style={{
                fontFamily: FONT_H, fontSize: "clamp(1.9rem,3.6vw,2.8rem)", fontWeight: 700,
                color: NAVY, margin: 0, letterSpacing: "-0.005em",
              }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
          </div>
        )}

        {/* 2-col grid */}
        <div className="c02-contact-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "clamp(32px,4vw,56px)", alignItems: "start" }}>
          {/* Left: 4 info cards in 2x2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {cards.map((c, i) => (
              <div
                key={i}
                className="c02-contact-card"
                style={{
                  backgroundColor: "#f7f6f5",
                  border: "1px solid rgba(15,32,62,0.06)",
                  borderRadius: 6,
                  padding: "26px 24px",
                  transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease",
                }}
              >
                <div style={{
                  width: 38, height: 38,
                  borderRadius: 999,
                  backgroundColor: "rgba(255,166,11,0.14)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 14,
                }}>
                  {c.icon}
                </div>
                <div style={{
                  fontFamily: FONT_B,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: AMBER,
                  marginBottom: 8,
                }}>
                  {c.label}
                </div>
                <div style={{ fontFamily: FONT_B, fontSize: "0.92rem", color: NAVY, lineHeight: 1.55 }}>
                  {c.body}
                </div>
              </div>
            ))}
          </div>

          {/* Right: Navy CTA card */}
          <div style={{
            position: "relative",
            background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_D} 100%)`,
            color: CREAM,
            borderRadius: 8,
            padding: "clamp(36px,4vw,52px)",
            overflow: "hidden",
            boxShadow: "0 24px 60px -16px rgba(15,32,62,0.32)",
          }}>
            {/* Amber radial accent */}
            <div aria-hidden style={{
              position: "absolute", top: "-100px", right: "-80px",
              width: 280, height: 280, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,166,11,0.22) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <div style={{ position: "relative" }}>
              <h3 style={{
                fontFamily: FONT_H, fontSize: "clamp(1.4rem,2.4vw,1.9rem)", fontWeight: 700,
                color: CREAM, margin: "0 0 16px", lineHeight: 1.15,
              }}>
                <GenericEditableText sectionId={sectionId} field="ctaCardTitle" value={ctaCardTitle} tag="span" />
              </h3>
              <p style={{
                fontFamily: FONT_B, fontSize: "0.95rem", color: "rgba(255,250,242,0.72)",
                lineHeight: 1.75, margin: "0 0 32px",
              }}>
                <GenericEditableText sectionId={sectionId} field="ctaCardBody" value={ctaCardBody} tag="span" />
              </p>

              {/* Primary amber pill */}
              <a
                href="#newsletter"
                className="c02-contact-cta-primary"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "15px 30px",
                  backgroundColor: AMBER, color: NAVY,
                  fontFamily: FONT_B, fontSize: "0.82rem", fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  textDecoration: "none", borderRadius: 999,
                  boxShadow: "0 6px 18px rgba(255,166,11,0.42)",
                  transition: "transform .22s ease, background-color .22s ease, box-shadow .22s ease",
                }}
              >
                <GenericEditableText sectionId={sectionId} field="ctaCardBtn" value={ctaCardBtn} tag="span" />
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 5 20 12 13 19"/></svg>
              </a>

              {/* Phone fallback */}
              <div style={{ marginTop: 22, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                <div style={{ fontFamily: FONT_B, fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,166,11,0.85)", marginBottom: 8 }}>
                  Nebo zavolejte
                </div>
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="c02-contact-cta-phone"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    fontFamily: FONT_H, fontSize: "1.15rem", fontWeight: 700,
                    color: CREAM, textDecoration: "none",
                    transition: "color .2s ease",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/></svg>
                  {phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .c02-contact-card:hover {
          transform: translateY(-3px);
          border-color: rgba(255,166,11,0.42) !important;
          box-shadow: 0 12px 28px -10px rgba(15,32,62,0.18);
        }
        .c02-contact-cta-primary:hover {
          transform: translateY(-2px);
          background-color: #ffb73a !important;
          box-shadow: 0 12px 26px rgba(255,166,11,0.5);
        }
        .c02-contact-cta-phone:hover { color: ${AMBER} !important; }
        @media (max-width: 860px) {
          #kontakt .c02-contact-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          #kontakt .c02-contact-grid > div:first-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── clinic-03-contact ──────────────────────────────────────────────────────
// Surface #F7F5F0 bg, gold kicker + dark H2
// 2-col: vlevo 4 info bloky (Adresa/Tel/Email/Hodiny) s gold ikonami
//        vpravo white card s gold CTA
// Reference: diamond-look.cz — kontaktní sekce
// ─────────────────────────────────────────────────────────────────────────────
function ContactClinic03({ content, sectionId }: { content: Record<string,unknown>; sectionId: number }) {
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
  const eyebrow = eyebrowRaw === undefined ? "Jsme tu pro vás — online i osobně" : String(eyebrowRaw);
  const title   = titleRaw   === undefined ? "Rezervujte si konzultaci" : String(titleRaw);
  const address = String(content.address ?? "Pařížská 28, 110 00 Praha 1");
  const phone   = String(content.phone   ?? "+420 222 888 999");
  const email   = String(content.email   ?? "recepce@diamondlook.cz");
  const hours   = String(content.hours   ?? "Po–Pá 8:00–19:00, So 9:00–14:00");
  const ctaText = String(content.ctaText ?? "Odeslat zprávu");
  const ctaHref = String(content.ctaHref ?? "#kontakt");
  const formTitle     = String((content as Record<string,unknown>).formTitle ?? "Napište nám");
  const formSubtitle  = String((content as Record<string,unknown>).formSubtitle ?? "Odpovíme do 24 hodin");
  const nameLabel     = String((content as Record<string,unknown>).nameLabel ?? "Jméno a příjmení");
  const emailLabel    = String((content as Record<string,unknown>).emailLabel ?? "E-mail");
  const phoneLabel    = String((content as Record<string,unknown>).phoneLabel ?? "Telefon");
  const messageLabel  = String((content as Record<string,unknown>).messageLabel ?? "Vaše zpráva");
  const showHeader = !!(eyebrow.trim() || title.trim());

  const infoItems = [
    { icon: "pin",   label: "addressLabel", labelDefault: "Adresa",         value: address, field: "address" },
    { icon: "phone", label: "phoneInfoLabel", labelDefault: "Telefon",      value: phone,   field: "phone" },
    { icon: "mail",  label: "emailInfoLabel", labelDefault: "E-mail",       value: email,   field: "email" },
    { icon: "clock", label: "hoursLabel",     labelDefault: "Otevírací doba", value: hours, field: "hours" },
  ];

  const iconSvg = (type: string) => {
    const props = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: GOLD, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    if (type === "pin") return <svg {...props}><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
    if (type === "phone") return <svg {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5 13a19.79 19.79 0 0 1-3-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.73.32 1.44.58 2.12a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.68.26 1.39.46 2.12.58A2 2 0 0 1 22 16.92z"/></svg>;
    if (type === "mail") return <svg {...props}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
    return <svg {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 46, padding: "0 16px",
    border: `1px solid ${GOLD}25`, backgroundColor: WHITE,
    fontFamily: SANS, fontSize: "0.82rem", color: DARK,
    outline: "none", boxSizing: "border-box",
    transition: "border-color 0.25s ease",
  };

  return (
    <section id="kontakt" data-template="clinic-03" style={{ backgroundColor: SURF, padding: "clamp(64px, 8vw, 100px) 0", fontFamily: SANS }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 56px)" }}>

        {/* Header */}
        {showHeader && (
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <span aria-hidden style={{ display: "block", width: 24, height: 1, backgroundColor: GOLD }} />
              <GenericEditableText sectionId={sectionId} field="kicker" value={eyebrow} tag="p"
                style={{ fontSize: "0.65rem", fontWeight: 500, color: GOLD, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}
              />
            </div>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2"
              style={{ fontFamily: SERIF, fontSize: "clamp(1.6rem, 2.8vw, 2.3rem)", fontWeight: 300, fontStyle: "italic", color: DARK, margin: 0, lineHeight: 1.2 }}
            />
          </div>
        )}

        <div className="c03-contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "clamp(36px, 5vw, 64px)" }}>
          {/* Left: contact info */}
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {infoItems.map((item, i) => (
                <div key={i} className="c03-info-row" style={{
                  display: "flex", gap: 16, alignItems: "flex-start",
                  padding: "20px 0",
                  borderBottom: `1px solid ${GOLD}15`,
                  transition: "padding-left 0.25s ease",
                }}>
                  <div style={{
                    width: 38, height: 38,
                    backgroundColor: `${GOLD}0a`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {iconSvg(item.icon)}
                  </div>
                  <div>
                    <GenericEditableText sectionId={sectionId} field={item.label} value={
                      String((content as Record<string,unknown>)[item.label] ?? item.labelDefault)
                    } tag="div"
                      style={{ fontSize: "0.62rem", fontWeight: 500, color: GOLD, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 4 }}
                    />
                    <GenericEditableText sectionId={sectionId} field={item.field} value={item.value} tag="div"
                      style={{ fontFamily: SANS, fontSize: "0.9rem", color: DARK, lineHeight: 1.55 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Diamond decorative */}
            <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 12 }}>
              <svg width="16" height="16" viewBox="0 0 30 30" aria-hidden style={{ opacity: 0.25 }}>
                <path d="M15 2 L28 15 L15 28 L2 15 Z" fill="none" stroke={GOLD} strokeWidth="1.2" />
                <path d="M15 11 L19 15 L15 19 L11 15 Z" fill={GOLD} />
              </svg>
              <span style={{ display: "block", flex: 1, height: 1, backgroundColor: `${GOLD}20` }} />
            </div>
          </div>

          {/* Right: contact form */}
          <div style={{ backgroundColor: WHITE, padding: "clamp(28px, 4vw, 44px)", boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
            <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="h3"
              style={{ fontFamily: SERIF, fontSize: "1.3rem", fontWeight: 300, fontStyle: "italic", color: DARK, margin: "0 0 4px" }}
            />
            <GenericEditableText sectionId={sectionId} field="formSubtitle" value={formSubtitle} tag="p"
              style={{ fontFamily: SANS, fontSize: "0.75rem", color: MUTED, margin: "0 0 28px" }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <GenericEditableText sectionId={sectionId} field="nameLabel" value={nameLabel} tag="label"
                  style={{ display: "block", fontSize: "0.62rem", fontWeight: 500, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}
                />
                <input type="text" placeholder={nameLabel} style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = GOLD; }}
                  onBlur={e => { e.currentTarget.style.borderColor = `${GOLD}25`; }}
                />
              </div>
              <div>
                <GenericEditableText sectionId={sectionId} field="emailLabel" value={emailLabel} tag="label"
                  style={{ display: "block", fontSize: "0.62rem", fontWeight: 500, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}
                />
                <input type="email" placeholder={emailLabel} style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = GOLD; }}
                  onBlur={e => { e.currentTarget.style.borderColor = `${GOLD}25`; }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="label"
                style={{ display: "block", fontSize: "0.62rem", fontWeight: 500, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}
              />
              <input type="tel" placeholder={phoneLabel} style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = GOLD; }}
                onBlur={e => { e.currentTarget.style.borderColor = `${GOLD}25`; }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <GenericEditableText sectionId={sectionId} field="messageLabel" value={messageLabel} tag="label"
                style={{ display: "block", fontSize: "0.62rem", fontWeight: 500, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}
              />
              <textarea placeholder={messageLabel} rows={4}
                style={{ ...inputStyle, height: "auto", padding: "12px 16px", resize: "vertical" }}
                onFocus={e => { e.currentTarget.style.borderColor = GOLD; }}
                onBlur={e => { e.currentTarget.style.borderColor = `${GOLD}25`; }}
              />
            </div>

            <a
              href={ctaHref}
              className="c03-contact-submit"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                height: 48, padding: "0 32px",
                backgroundColor: GOLD, color: WHITE,
                fontFamily: SANS, fontSize: "0.68rem", fontWeight: 600,
                letterSpacing: "0.16em", textTransform: "uppercase",
                textDecoration: "none",
                transition: "background-color 0.3s ease, transform 0.3s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = GOLD_H; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── contact-fitness-02 ────────────────────────────────────────────────────────
// 3 location cards grid — 1:1 fitnessvictory.cz
// Black bg, pink kicker + Archivo Black H2
// Cards: full-width photo, location name, address/phone/email/hours
// ─────────────────────────────────────────────────────────────────────────────
type Fitness02Location = {
  name?: string; address?: string; phone?: string;
  email?: string; hours?: string; image?: string;
};

function ContactFitness02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const tagline   = String(content.tagline   ?? "Kontakt");
  const title     = String(content.title     ?? "Vyber si své studio");
  const phone     = String(content.phone     ?? "");
  const email     = String(content.email     ?? "");
  const facebookUrl  = String(content.facebookUrl  ?? "");
  const instagramUrl = String(content.instagramUrl ?? "");
  const hours     = String(content.hours     ?? "");
  const locations = ((content.locations as Fitness02Location[]) ?? []).slice(0, 4);
  const showHeader = (content as { showHeader?: boolean }).showHeader !== false;

  const ACCENT  = "#FF5500";
  const WHITE   = "#FFFFFF";
  const MUTED   = "#C3C3C3";
  const FONT_H  = "'Archivo Black', sans-serif";
  const FONT_B  = "'Montserrat', sans-serif";

  const InfoRow = ({ icon, value, field, idx }: { icon: React.ReactNode; value: string; field: string; idx: number }) => (
    <div className="fitness02-info-row" style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
      <span className="fitness02-info-icon" style={{ color: ACCENT, flexShrink: 0, marginTop: 2, transition: "transform 0.35s cubic-bezier(0.22,0.61,0.36,1)" }}>{icon}</span>
      <span className="fitness02-info-text" style={{ fontSize: 14, fontWeight: 400, color: MUTED, lineHeight: 1.55, transition: "color 0.35s ease" }}>
        <GenericEditableText sectionId={sectionId} field={`locations.${idx}.${field}`} value={value} tag="span" />
      </span>
    </div>
  );

  const PinIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
  const PhoneIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"/>
    </svg>
  );
  const MailIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  );
  const ClockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );

  return (
    <section
      id="kontakt"
      className="fitness02-contact"
      style={{ backgroundColor: "#000000", padding: "120px 0", fontFamily: FONT_B, position: "relative", overflow: "hidden" }}
      data-template="fitness-02"
      data-section="fitness-02-contact"
    >
      <div aria-hidden="true" className="fitness02-grain" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04, mixBlendMode: "overlay" }} />

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        {showHeader && (
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div className="fitness02-contact-kicker" style={{ display: "inline-flex", alignItems: "center", gap: 16, marginBottom: 26, justifyContent: "center" }}>
              <span aria-hidden="true" style={{ display: "inline-block", width: 40, height: 2, background: ACCENT }} />
              <span style={{
                fontSize: 12, fontWeight: 600, letterSpacing: "0.28em",
                textTransform: "uppercase", color: ACCENT, fontFamily: FONT_B,
              }}>
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </span>
              <span aria-hidden="true" style={{ display: "inline-block", width: 40, height: 2, background: ACCENT }} />
            </div>
            <h2 className="fitness02-contact-title" style={{
              fontFamily: FONT_H, fontSize: "clamp(32px, 4vw, 56px)",
              color: WHITE, textTransform: "uppercase", lineHeight: 1.1, margin: 0, letterSpacing: "-0.01em",
            }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          </div>
        )}

        {/* Contact info strip */}
        {(phone || email || hours) && (
          <div className="fitness02-contact-strip" style={{
            display: "flex", justifyContent: "center", alignItems: "center", gap: 32,
            padding: "20px 0", marginBottom: 56,
            borderTop: "1px solid rgba(255,85,0,0.25)",
            borderBottom: "1px solid rgba(255,85,0,0.25)",
            flexWrap: "wrap",
          }}>
            {phone && (
              <a href={`tel:${phone.replace(/\s/g,"")}`} className="fitness02-contact-strip-item" style={{
                display: "inline-flex", alignItems: "center", gap: 10, color: MUTED, textDecoration: "none",
                fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: FONT_B, fontWeight: 500,
                transition: "color 0.3s ease",
              }}>
                <span style={{ color: ACCENT }}><PhoneIcon /></span>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="fitness02-contact-strip-item" style={{
                display: "inline-flex", alignItems: "center", gap: 10, color: MUTED, textDecoration: "none",
                fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: FONT_B, fontWeight: 500,
                transition: "color 0.3s ease",
              }}>
                <span style={{ color: ACCENT }}><MailIcon /></span>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            )}
            {(facebookUrl || instagramUrl) && (
              <span className="fitness02-contact-strip-item" style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                {facebookUrl && (
                  <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ color: ACCENT, display: "inline-flex" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/></svg>
                  </a>
                )}
                {instagramUrl && (
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: ACCENT, display: "inline-flex" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1zm0 3.4a6.4 6.4 0 1 0 0 12.8 6.4 6.4 0 0 0 0-12.8zm0 10.6a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4zm6.6-10.9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>
                  </a>
                )}
              </span>
            )}
            {hours && (
              <span className="fitness02-contact-strip-item" style={{
                display: "inline-flex", alignItems: "center", gap: 10, color: MUTED,
                fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: FONT_B, fontWeight: 500,
              }}>
                <span style={{ color: ACCENT }}><ClockIcon /></span>
                <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
              </span>
            )}
          </div>
        )}

        {/* Location cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: locations.length === 4 ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
            gap: 8,
          }}
          className="fitness02-location-grid"
        >
          {locations.map((loc, i) => (
            <div
              key={i}
              className="fitness02-location-card"
              style={{
                backgroundColor: "#0D0D0D",
                border: "1px solid rgba(255,85,0,0.25)",
                overflow: "hidden",
                position: "relative",
                transition: "transform 0.5s cubic-bezier(0.22,0.61,0.36,1), border-color 0.4s ease, box-shadow 0.5s ease",
              }}
            >
              {/* Photo */}
              {loc.image && (
                <GenericEditableImage sectionId={sectionId} field={`locations.${i}.image`} src={loc.image} alt={loc.name ?? ""} className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  <div style={{ aspectRatio: "16/9", overflow: "hidden" }}>
                    <img
                      src={loc.image}
                      alt={loc.name ?? ""}
                      loading="lazy"
                      className="fitness02-location-img"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.8s cubic-bezier(0.22,0.61,0.36,1)" }}
                    />
                  </div>
                </GenericEditableImage>
              )}

              {/* Corner bracket */}
              <span aria-hidden="true" className="fitness02-location-bracket" style={{
                position: "absolute", top: 12, right: 12, width: 32, height: 32,
                borderTop: `2px solid ${ACCENT}`, borderRight: `2px solid ${ACCENT}`,
                opacity: 0, transform: "translate(6px,-6px)",
                transition: "opacity 0.35s ease, transform 0.45s cubic-bezier(0.22,0.61,0.36,1)",
                pointerEvents: "none",
              }} />

              {/* Info */}
              <div style={{ padding: "28px" }}>
                <h3 className="fitness02-location-h3" style={{
                  fontFamily: FONT_H, fontSize: 22,
                  color: WHITE, textTransform: "uppercase", margin: 0, marginBottom: 20,
                  paddingBottom: 14,
                  letterSpacing: "-0.005em", lineHeight: 1.15,
                  position: "relative",
                }}>
                  <GenericEditableText sectionId={sectionId} field={`locations.${i}.name`} value={loc.name ?? ""} tag="span" />
                  <span aria-hidden="true" className="fitness02-location-rule" style={{
                    position: "absolute", left: 0, bottom: 0, width: 48, height: 2,
                    background: ACCENT,
                    transition: "width 0.5s cubic-bezier(0.22,0.61,0.36,1)",
                  }} />
                </h3>
                {loc.address && <InfoRow icon={<PinIcon />} value={loc.address} field="address" idx={i} />}
                {loc.phone   && <InfoRow icon={<PhoneIcon />} value={loc.phone} field="phone" idx={i} />}
                {loc.email   && <InfoRow icon={<MailIcon />} value={loc.email} field="email" idx={i} />}
                {loc.hours   && <InfoRow icon={<ClockIcon />} value={loc.hours} field="hours" idx={i} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── contact-fitness-01 ────────────────────────────────────────────────────────
// Luxe Warm Physio Sanctuary — 2-col contact
// Header: rail 07 + eyebrow + H2 italic accent + subheading
// Left: info card se portrait, name italic serif, contact rows s pill icons
// (phone/email/address/hours), social pill row, hairline dividers
// Right: form s luxe hairline inputs, focus warm ring, uppercase labels, CTA
// ────────────────────────────────────────────────────────────────────────────
function ContactFitness01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const sectionTag    = String(content.sectionTag    ?? "Kontakt");
  const eyebrowMark   = String(content.eyebrowMark   ?? "07");
  const headingPre    = String(content.headingPre    ?? "Domluvme si");
  const headingAccent = String(content.headingAccent ?? "první");
  const headingPost   = String(content.headingPost   ?? "setkání");
  const subheading    = String(content.subheading    ?? "");
  const name          = String(content.name          ?? "Adam Vítek");
  const role          = String(content.role          ?? "Fyzioterapeut · Osobní trenér");
  const email         = String(content.email         ?? "");
  const phone         = String(content.phone         ?? "");
  const phoneNote     = String(content.phoneNote     ?? "");
  const address       = String(content.address       ?? "");
  const city          = String(content.city          ?? "");
  const hours         = String(content.hours         ?? "");
  const mapHint       = String(content.mapHint       ?? "");
  const facebookUrl   = String(content.facebookUrl   ?? "");
  const instagramUrl  = String(content.instagramUrl  ?? "");
  const image         = String(content.image         ?? "/assets/fitness-01/about-adam.webp");
  const imageAlt      = String(content.imageAlt      ?? name);
  const formTitle     = String(content.formTitle     ?? "Napište mi");
  const formNote      = String(content.formNote      ?? "");
  const ctaText       = String(content.ctaText       ?? "Odeslat zprávu");
  const showHeader    = (content as { showHeader?: boolean }).showHeader !== false;

  return (
    <section id="kontakt" className="fit01-contact" data-template="fitness-01">
      <div className="fit01-contact-inner">
        {showHeader && (
          <div className="fit01-contact-header">
            <div className="fit01-services-rail" aria-hidden="true">
              <span className="fit01-rail-line" />
              <span className="fit01-rail-mark">{eyebrowMark}</span>
            </div>
            <div className="fit01-services-eyebrow">
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

        <div className="fit01-contact-grid">
          {/* LEFT: info card */}
          <aside className="fit01-contact-card">
            {image && (
              <div className="fit01-contact-photo-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt={imageAlt} className="fit01-contact-photo" loading="lazy" />
                <div className="fit01-contact-photo-overlay" aria-hidden="true" />
                <div className="fit01-contact-name-plate">
                  <div className="fit01-contact-name">
                    <GenericEditableText sectionId={sectionId} field="name" value={name} tag="span" />
                  </div>
                  <div className="fit01-contact-role">
                    <GenericEditableText sectionId={sectionId} field="role" value={role} tag="span" />
                  </div>
                </div>
              </div>
            )}
            <div className="fit01-contact-body">
              <ul className="fit01-contact-list">
                {phone && (
                  <li className="fit01-contact-row">
                    <span className="fit01-contact-icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </span>
                    <div className="fit01-contact-row-body">
                      <a href={`tel:${phone.replace(/\s/g, "")}`} className="fit01-contact-value">
                        <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                      </a>
                      {phoneNote && (
                        <div className="fit01-contact-note">
                          <GenericEditableText sectionId={sectionId} field="phoneNote" value={phoneNote} tag="span" />
                        </div>
                      )}
                    </div>
                  </li>
                )}
                {email && (
                  <li className="fit01-contact-row">
                    <span className="fit01-contact-icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg>
                    </span>
                    <div className="fit01-contact-row-body">
                      <a href={`mailto:${email}`} className="fit01-contact-value">
                        <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                      </a>
                    </div>
                  </li>
                )}
                {(address || city) && (
                  <li className="fit01-contact-row">
                    <span className="fit01-contact-icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </span>
                    <div className="fit01-contact-row-body">
                      <div className="fit01-contact-value">
                        <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                      </div>
                      {city && (
                        <div className="fit01-contact-note">
                          <GenericEditableText sectionId={sectionId} field="city" value={city} tag="span" />
                        </div>
                      )}
                      {mapHint && (
                        <div className="fit01-contact-note fit01-contact-note-italic">
                          <GenericEditableText sectionId={sectionId} field="mapHint" value={mapHint} tag="span" />
                        </div>
                      )}
                    </div>
                  </li>
                )}
                {hours && (
                  <li className="fit01-contact-row">
                    <span className="fit01-contact-icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </span>
                    <div className="fit01-contact-row-body">
                      <div className="fit01-contact-value">
                        <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
                      </div>
                    </div>
                  </li>
                )}
              </ul>

              {(facebookUrl || instagramUrl) && (
                <div className="fit01-contact-socials">
                  {facebookUrl && (
                    <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="fit01-social-pill" aria-label="Facebook">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12A10 10 0 1 0 10.42 21.88v-6.98H7.9V12h2.52V9.84c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.9h-2.34v6.98A10 10 0 0 0 22 12z"/></svg>
                    </a>
                  )}
                  {instagramUrl && (
                    <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="fit01-social-pill" aria-label="Instagram">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* RIGHT: form */}
          <div className="fit01-contact-form-wrap">
            <div className="fit01-form-head">
              <h3 className="fit01-form-title">
                <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" />
              </h3>
              {formNote && (
                <p className="fit01-form-note">
                  <GenericEditableText sectionId={sectionId} field="formNote" value={formNote} tag="span" />
                </p>
              )}
            </div>
            <form className="fit01-form" onSubmit={e => e.preventDefault()}>
              <div className="fit01-form-row-2">
                <div className="fit01-field">
                  <label className="fit01-label">Jméno</label>
                  <input type="text" placeholder="Vaše jméno" className="fit01-input" />
                </div>
                <div className="fit01-field">
                  <label className="fit01-label">Telefon</label>
                  <input type="tel" placeholder="+420 000 000 000" className="fit01-input" />
                </div>
              </div>
              <div className="fit01-field">
                <label className="fit01-label">E-mail</label>
                <input type="email" placeholder="vas@email.cz" className="fit01-input" />
              </div>
              <div className="fit01-field">
                <label className="fit01-label">S čím vám mohu pomoci</label>
                <textarea rows={5} placeholder="Popište, s čím se potýkáte nebo o co máte zájem…" className="fit01-input fit01-textarea" />
              </div>
              <div className="fit01-form-foot">
                <button type="submit" className="fit01-form-cta" data-btn="primary">
                  <span>
                    <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                  </span>
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 5h11M8 1l4 4-4 4"/></svg>
                </button>
                <div className="fit01-form-privacy">
                  Odesláním souhlasíte se&nbsp;zpracováním údajů dle&nbsp;GDPR.
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── contact-fyzio-01 ──────────────────────────────────────────────────────────
// Surface #f5f8fc bg, 2-col: vlevo navy kicker + Montserrat H2 + 4 info bloky s ikonami
// (tel/email/adresa/hodiny) + FB/IG; vpravo bílá karta s kontaktním formulářem + zelené CTA
// Inspirováno fyziovsem.cz — sekce kontakt + objednat se
// ─────────────────────────────────────────────────────────────────────────────
function ContactFyzio01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const [status, setStatus] = useState<Status>("idle");

  const taglineRaw = (content as Record<string, unknown>).tagline;
  const titleRaw   = (content as Record<string, unknown>).title;
  const tagline = taglineRaw === undefined ? "Kontakt" : String(taglineRaw);
  const title   = titleRaw   === undefined ? "Jsme tu pro vás" : String(titleRaw);
  const showHeader = !!(tagline.trim() || title.trim());

  const lead     = String(content.lead        ?? "Máte dotaz nebo se chcete objednat? Napište nám nebo zavolejte — ozveme se vám zpravidla do 24 hodin.");
  const phone    = String(content.phone       ?? "704 123 456");
  const email    = String(content.email       ?? "info@demo.cz");
  const address  = String(content.address     ?? "Ukázková 123");
  const city     = String(content.city        ?? "110 00 Praha 1");
  const hours    = String(content.hours       ?? "Po–Pá 7:00–20:00");
  const fbUrl    = String(content.facebookUrl  ?? "https://facebook.com/demo");
  const igUrl    = String(content.instagramUrl ?? "https://instagram.com/demo");
  const mapEmbed = String(content.mapEmbed ?? "");

  const phoneLabel = String(content.phoneLabel ?? "Telefon");
  const emailLabel = String(content.emailLabel ?? "E-mail");
  const addressLabel = String(content.addressLabel ?? "Adresa");
  const hoursLabel = String(content.hoursLabel ?? "Otevírací doba");
  const formTitle  = String(content.formTitle ?? "Napište nám");
  const nameFieldLabel = String(content.nameFieldLabel ?? "Jméno a příjmení");
  const emailFieldLabel = String(content.emailFieldLabel ?? "E-mail");
  const phoneFieldLabel = String(content.phoneFieldLabel ?? "Telefon");
  const messageFieldLabel = String(content.messageFieldLabel ?? "Zpráva");
  const submitLabel = String(content.submitLabel ?? "Odeslat zprávu");
  const sendingLabel = String(content.sendingLabel ?? "Odesílám…");
  const successTitle = String(content.successTitle ?? "Zpráva odeslána!");
  const successBody = String(content.successBody ?? "Ozveme se vám co nejdříve.");

  const NAVY    = "#1f2d69";
  const GREEN   = "#10d15d";
  const TEAL    = "#6bbea1";
  const TEXT    = "#333333";
  const MUTED   = "#666666";
  const BORDER  = "#e8edf5";
  const MONT    = "'Montserrat', sans-serif";
  const SANS    = "'Open Sans', sans-serif";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => setStatus("success"), 1200);
  };

  const infoBlocks: Array<{ key: string; label: string; field: string; value: string; href?: string; icon: React.ReactNode; multiline?: boolean }> = [
    { key: "phone", label: phoneLabel, field: "phone", value: phone, href: `tel:+420${phone.replace(/\s/g, "")}`,
      icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.75a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z"/> },
    { key: "email", label: emailLabel, field: "email", value: email, href: `mailto:${email}`,
      icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></> },
  ];

  return (
    <section id="kontakt" data-template="fyzio-01" className="fyzio01-contact" style={{ fontFamily: SANS }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div className="fyzio01-contact-grid">

          {/* LEFT — info */}
          <div>
            {showHeader && (
              <>
                {tagline.trim() && (
                  <div className="fyzio01-contact-kicker">
                    <span className="fyzio01-contact-kicker-dash" aria-hidden="true" />
                    <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span"
                      style={{ fontFamily: MONT, fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: GREEN }} />
                  </div>
                )}
                {title.trim() && (
                  <h2 style={{ fontFamily: MONT, fontSize: "clamp(24px,3vw,38px)", fontWeight: 800, color: NAVY, margin: "14px 0 16px", letterSpacing: "-0.01em" }}>
                    <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
                  </h2>
                )}
              </>
            )}
            {lead && (
              <p style={{ fontFamily: SANS, fontSize: 15.5, color: MUTED, lineHeight: 1.75, margin: "0 0 34px", maxWidth: 460 }}>
                <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
              </p>
            )}

            {/* Kontaktní bloky */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {infoBlocks.map(b => (
                <a key={b.key} href={b.href} className="fyzio01-contact-item">
                  <span className="fyzio01-contact-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{b.icon}</svg>
                  </span>
                  <span>
                    <GenericEditableText sectionId={sectionId} field={`${b.key}Label`} value={b.label} tag="span"
                      style={{ display: "block", fontFamily: MONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 3 }} />
                    <GenericEditableText sectionId={sectionId} field={b.field} value={b.value} tag="span"
                      style={{ fontSize: 16, fontWeight: 600, color: TEXT }} />
                  </span>
                </a>
              ))}
              {/* Adresa */}
              <div className="fyzio01-contact-item">
                <span className="fyzio01-contact-icon" aria-hidden="true">
                  <svg width="16" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </span>
                <span>
                  <GenericEditableText sectionId={sectionId} field="addressLabel" value={addressLabel} tag="span"
                    style={{ display: "block", fontFamily: MONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 3 }} />
                  <span style={{ fontSize: 16, fontWeight: 600, color: TEXT, lineHeight: 1.5 }}>
                    <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />{" · "}
                    <GenericEditableText sectionId={sectionId} field="city" value={city} tag="span" />
                  </span>
                </span>
              </div>
              {/* Hodiny */}
              <div className="fyzio01-contact-item">
                <span className="fyzio01-contact-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </span>
                <span>
                  <GenericEditableText sectionId={sectionId} field="hoursLabel" value={hoursLabel} tag="span"
                    style={{ display: "block", fontFamily: MONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 3 }} />
                  <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span"
                    style={{ fontSize: 16, fontWeight: 600, color: TEXT }} />
                </span>
              </div>
            </div>

            {/* Social */}
            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              <a href={fbUrl} aria-label="Facebook" className="fyzio01-contact-social">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href={igUrl} aria-label="Instagram" className="fyzio01-contact-social">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            </div>
          </div>

          {/* RIGHT — formulář */}
          <div className="fyzio01-contact-card">
            <h3 style={{ fontFamily: MONT, fontSize: 21, fontWeight: 800, color: NAVY, margin: "0 0 26px" }}>
              <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" />
            </h3>
            {status === "success" ? (
              <div style={{ textAlign: "center", padding: "36px 0" }}>
                <div className="fyzio01-contact-success-check">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p style={{ fontFamily: MONT, fontSize: 16, fontWeight: 700, color: NAVY }}>
                  <GenericEditableText sectionId={sectionId} field="successTitle" value={successTitle} tag="span" />
                </p>
                <p style={{ fontSize: 14, color: MUTED, marginTop: 8 }}>
                  <GenericEditableText sectionId={sectionId} field="successBody" value={successBody} tag="span" />
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { field: "nameFieldLabel",  label: nameFieldLabel,  type: "text",  required: true  },
                  { field: "emailFieldLabel", label: emailFieldLabel, type: "email", required: true  },
                  { field: "phoneFieldLabel", label: phoneFieldLabel, type: "tel",   required: false },
                ].map(f => (
                  <div key={f.field}>
                    <label style={{ display: "block", fontFamily: MONT, fontSize: 12, fontWeight: 600, color: NAVY, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                      <GenericEditableText sectionId={sectionId} field={f.field} value={f.label} tag="span" />
                    </label>
                    <input type={f.type} required={f.required} className="fyzio01-contact-input" style={{ width: "100%", boxSizing: "border-box" }} />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontFamily: MONT, fontSize: 12, fontWeight: 600, color: NAVY, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                    <GenericEditableText sectionId={sectionId} field="messageFieldLabel" value={messageFieldLabel} tag="span" />
                  </label>
                  <textarea rows={4} required className="fyzio01-contact-input" style={{ width: "100%", boxSizing: "border-box", resize: "vertical" }} />
                </div>
                <button type="submit" disabled={status === "sending"} className="fyzio01-contact-submit"
                  style={{ backgroundColor: GREEN, color: "#fff", fontFamily: MONT, fontSize: 15, fontWeight: 700, padding: "15px", borderRadius: 999, border: "none", cursor: status === "sending" ? "wait" : "pointer", letterSpacing: "0.03em", opacity: status === "sending" ? 0.7 : 1 }}>
                  <GenericEditableText sectionId={sectionId} field={status === "sending" ? "sendingLabel" : "submitLabel"} value={status === "sending" ? sendingLabel : submitLabel} tag="span" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Map */}
        {mapEmbed && (
          <div className="fyzio01-contact-map">
            <iframe src={mapEmbed} title="Mapa" loading="lazy" referrerPolicy="no-referrer-when-downgrade" style={{ width: "100%", height: "100%", border: 0, display: "block" }} />
          </div>
        )}
      </div>
    </section>
  );
}

// ── contact-fyzio-02 ──────────────────────────────────────────────────────────
// Světlé #f1f6f6, 2-col: vlevo intro + info karty (teal ikony) + hodiny,
// vpravo form karta (teal focus + pill submit), dole full-width OSM mapa. Movia.
// ─────────────────────────────────────────────────────────────────────────────
function ContactFyzio02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const id      = String(content.id      ?? "kontakt");
  const phone   = String(content.phone   ?? "725 480 190");
  const email   = String(content.email   ?? "recepce@movia.cz");
  const address = String(content.address ?? "Vinohradská 42");
  const city    = String(content.city    ?? "120 00 Praha 2 — Vinohrady");
  const hours   = String(content.hours   ?? "Po–Pá 7:00–20:00, So 8:00–13:00");

  const labelPhone   = String(content.labelPhone   ?? "Telefon");
  const labelEmail   = String(content.labelEmail   ?? "E-mail");
  const labelAddress = String(content.labelAddress ?? "Kde nás najdete");
  const labelHours   = String(content.labelHours   ?? "Ordinační hodiny");

  const formTitle    = String(content.formTitle    ?? "Napište nám");
  const nameLabel    = String(content.nameLabel    ?? "Jméno a příjmení");
  const emailLabel   = String(content.emailLabel   ?? "E-mail");
  const phoneFieldLabel = String(content.phoneFieldLabel ?? "Telefon");
  const messageLabel = String(content.messageLabel ?? "Co vás trápí?");
  const submitLabel  = String(content.submitLabel  ?? "Odeslat poptávku");
  const formNote     = String(content.formNote     ?? "Ozveme se vám do jednoho pracovního dne.");

  // conditional header
  const eyebrowRaw = (content as Record<string, unknown>).tagline;
  const titleRaw   = (content as Record<string, unknown>).title;
  const bodyRaw    = (content as Record<string, unknown>).body;
  const tagline = eyebrowRaw === undefined ? "Objednání" : String(eyebrowRaw);
  const title   = titleRaw   === undefined ? "Objednejte se nebo se zeptejte" : String(titleRaw);
  const body    = bodyRaw    === undefined ? "Rádi zodpovíme jakékoli dotazy ještě před první návštěvou. Stačí zavolat nebo vyplnit formulář." : String(bodyRaw);
  const showHeader = !!(tagline.trim() || title.trim() || body.trim());

  const mapLat = String(content.mapLat ?? "50.0782");
  const mapLng = String(content.mapLng ?? "14.4490");
  const latN = parseFloat(mapLat);
  const lngN = parseFloat(mapLng);
  const delta = 0.005;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lngN - delta}%2C${latN - delta}%2C${lngN + delta}%2C${latN + delta}&layer=mapnik&marker=${latN}%2C${lngN}`;

  const secRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add("fz2-vis"); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    el.querySelectorAll<HTMLElement>("[data-fz2ct]").forEach(i => obs.observe(i));
    return () => obs.disconnect();
  }, []);

  const iconPhone = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.71 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
  const iconMail  = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
  const iconPin   = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
  const iconClock = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;

  return (
    <section ref={secRef} id={id} data-template="fyzio-02" className="fz2-ct">
      <div className="fz2-ct-inner">
        {showHeader && (
          <div className="fz2-ct-head fz2-reveal" data-fz2ct>
            {tagline.trim() && (
              <span className="fz2-pill">
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </span>
            )}
            {title.trim() && (
              <h2 className="fz2-ct-title">
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {body.trim() && (
              <p className="fz2-ct-lead">
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}
          </div>
        )}

        <div className="fz2-ct-grid">
          {/* Levý sloupec — info */}
          <div className="fz2-ct-info fz2-reveal" data-fz2ct>
            <a href={`tel:+420${phone.replace(/\s/g, "")}`} className="fz2-ct-card">
              <span className="fz2-ct-ico">{iconPhone}</span>
              <span className="fz2-ct-card-txt">
                <GenericEditableText sectionId={sectionId} field="labelPhone" value={labelPhone} tag="span" style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#218384", marginBottom: "3px" }} />
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" style={{ display: "block", fontSize: "1.02rem", fontWeight: 600, color: "#092029" }} />
              </span>
            </a>
            <a href={`mailto:${email}`} className="fz2-ct-card">
              <span className="fz2-ct-ico">{iconMail}</span>
              <span className="fz2-ct-card-txt">
                <GenericEditableText sectionId={sectionId} field="labelEmail" value={labelEmail} tag="span" style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#218384", marginBottom: "3px" }} />
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" style={{ display: "block", fontSize: "1.02rem", fontWeight: 600, color: "#092029" }} />
              </span>
            </a>
            <div className="fz2-ct-card fz2-ct-card--static">
              <span className="fz2-ct-ico">{iconPin}</span>
              <span className="fz2-ct-card-txt">
                <GenericEditableText sectionId={sectionId} field="labelAddress" value={labelAddress} tag="span" style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#218384", marginBottom: "3px" }} />
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" style={{ display: "block", fontSize: "1.02rem", fontWeight: 600, color: "#092029" }} />
                <GenericEditableText sectionId={sectionId} field="city" value={city} tag="span" style={{ display: "block", fontSize: "0.86rem", color: "#56676a", marginTop: "2px" }} />
              </span>
            </div>
            <div className="fz2-ct-card fz2-ct-card--static">
              <span className="fz2-ct-ico">{iconClock}</span>
              <span className="fz2-ct-card-txt">
                <GenericEditableText sectionId={sectionId} field="labelHours" value={labelHours} tag="span" style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#218384", marginBottom: "3px" }} />
                <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" style={{ display: "block", fontSize: "0.98rem", fontWeight: 500, color: "#092029" }} />
              </span>
            </div>
          </div>

          {/* Pravý sloupec — formulář */}
          <div className="fz2-ct-form fz2-reveal" data-fz2ct style={{ transitionDelay: "0.1s" }}>
            <h3 className="fz2-ct-form-title">
              <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" />
            </h3>
            <form onSubmit={e => e.preventDefault()} className="fz2-ct-form-body">
              <label className="fz2-ct-field">
                <GenericEditableText sectionId={sectionId} field="nameLabel" value={nameLabel} tag="span" />
                <input type="text" className="fz2-ct-input" aria-label={nameLabel} />
              </label>
              <div className="fz2-ct-field-row">
                <label className="fz2-ct-field">
                  <GenericEditableText sectionId={sectionId} field="emailLabel" value={emailLabel} tag="span" />
                  <input type="email" className="fz2-ct-input" aria-label={emailLabel} />
                </label>
                <label className="fz2-ct-field">
                  <GenericEditableText sectionId={sectionId} field="phoneFieldLabel" value={phoneFieldLabel} tag="span" />
                  <input type="tel" className="fz2-ct-input" aria-label={phoneFieldLabel} />
                </label>
              </div>
              <label className="fz2-ct-field">
                <GenericEditableText sectionId={sectionId} field="messageLabel" value={messageLabel} tag="span" />
                <textarea className="fz2-ct-input fz2-ct-textarea" aria-label={messageLabel} />
              </label>
              <button type="submit" data-btn="primary" className="fz2-ct-submit">
                <GenericEditableText sectionId={sectionId} field="submitLabel" value={submitLabel} tag="span" />
                <svg width="15" height="11" viewBox="0 0 15 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 5.5h12M9 1l4 4.5L9 10" /></svg>
              </button>
              <p className="fz2-ct-note">
                <GenericEditableText sectionId={sectionId} field="formNote" value={formNote} tag="span" />
              </p>
            </form>
          </div>
        </div>

        {/* OSM mapa */}
        <div className="fz2-ct-map fz2-reveal" data-fz2ct>
          <iframe title="Mapa — Movia" src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>
    </section>
  );
}

// ── cafe-02-contact ───────────────────────────────────────────────────────────
// Cream #F7F4EF bg; gold kicker + burgundy serif H2
// Levá strana: 4 kontaktní položky (gold SVG ikony) + burgundy CTA
// Pravá strana: OSM embed (Praha)
// ─────────────────────────────────────────────────────────────────────────────
function ContactCafe02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const secRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add("c02con-vis"); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    el.querySelectorAll<HTMLElement>("[data-c02con]").forEach(i => obs.observe(i));
    return () => obs.disconnect();
  }, []);

  const id            = String(content.id       ?? "kontakt");
  const eyebrow       = String(content.eyebrow  ?? content.tagline ?? "Kde nás najdete");
  const title         = String(content.title    ?? "Kontakt\na rezervace");
  const intro         = String(content.intro    ?? "Rádi vás uvítáme v salonu Belvedere. Napište nám, zavolejte nebo se prostě zastavte — dveře jsou otevřené od časných snídaní do noci.");
  const address       = String(content.address  ?? "Národní 12, 110 00 Praha 1");
  const addressExtra  = String(content.addressExtra ?? "Vchod z pasáže naproti Národnímu divadlu");
  const phone         = String(content.phone    ?? "+420 700 111 222");
  const email         = String(content.email    ?? "rezervace@belvedere-demo.cz");
  const hours         = String(content.hours    ?? "Po–Ne · 8:00 – 23:00");
  const ctaText       = String(content.ctaText  ?? "Rezervovat stůl online");
  const ctaHref       = String(content.ctaHref  ?? "/rezervace");
  const directionsLabel = String(content.directionsLabel ?? "Získat trasu");
  const directionsHref  = String(content.directionsHref ?? "https://maps.google.com/?q=Národní+12,+Praha");
  const showHeader = content.showHeader !== false && (eyebrow || title);
  const mapLat  = String(content.mapLat  ?? "50.0810");
  const mapLng  = String(content.mapLng  ?? "14.4137");

  const latN = parseFloat(mapLat);
  const lngN = parseFloat(mapLng);
  const delta = 0.006;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lngN - delta}%2C${latN - delta}%2C${lngN + delta}%2C${latN + delta}&layer=mapnik&marker=${latN}%2C${lngN}`;

  // socials[] má přednost; jinak se poskládá z plochých URL polí (facebookUrl/instagramUrl)
  const flatSocials = [
    content.instagramUrl ? { icon: "instagram", label: "Instagram", href: String(content.instagramUrl) } : null,
    content.facebookUrl  ? { icon: "facebook",  label: "Facebook",  href: String(content.facebookUrl)  } : null,
  ].filter(Boolean) as Array<{ label?: string; href?: string; icon?: string }>;
  const socials = (content.socials as Array<{ label?: string; href?: string; icon?: string }>)
    ?? (flatSocials.length ? flatSocials : [
      { icon: "instagram", label: "Instagram", href: "https://instagram.com/" },
      { icon: "facebook",  label: "Facebook",  href: "https://facebook.com/" },
      { icon: "google",    label: "Google",    href: "https://google.com/" },
    ]);

  const SocialIcon = ({ name }: { name?: string }) => {
    const p = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
    switch ((name || "").toLowerCase()) {
      case "instagram": return (<svg {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>);
      case "facebook":  return (<svg {...p}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>);
      case "tripadvisor":
      case "google":    return (<svg {...p}><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/></svg>);
      default:          return (<svg {...p}><circle cx="12" cy="12" r="9"/></svg>);
    }
  };

  const iconPin   = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>;
  const iconPhone = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
  const iconMail  = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
  const iconClock = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>;

  return (
    <section
      ref={secRef}
      id={id}
      data-template="cafe-02"
      data-variant="cafe-02-contact"
      className="cafe02-contact"
      aria-label="Kontakt"
    >
      <div className="cafe02-contact__inner">
        {showHeader && (
          <div className="cafe02-contact__head" data-c02con="0">
            <div className="cafe02-contact__eyebrow">
              <span className="cafe02-contact__eyebrow-rule" />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              <span className="cafe02-contact__eyebrow-rule" />
            </div>
            <h2 className="cafe02-contact__title">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            {intro && (
              <p className="cafe02-contact__intro">
                <GenericEditableText sectionId={sectionId} field="intro" value={intro} tag="span" />
              </p>
            )}
          </div>
        )}

        <div className="cafe02-contact__grid">
          <div className="cafe02-contact__info" data-c02con="1" style={{ transitionDelay: "0.12s" }}>
            <ul className="cafe02-contact__list">
              <li className="cafe02-contact__row">
                <span className="cafe02-contact__badge">{iconPin}</span>
                <div>
                  <span className="cafe02-contact__label">
                    <GenericEditableText sectionId={sectionId} field="labelAddress" value={String(content.labelAddress ?? "Adresa")} tag="span" />
                  </span>
                  <div className="cafe02-contact__value">
                    <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                  </div>
                  <div className="cafe02-contact__value-sub">
                    <GenericEditableText sectionId={sectionId} field="addressExtra" value={addressExtra} tag="span" />
                  </div>
                  <a href={directionsHref} target="_blank" rel="noopener noreferrer" className="cafe02-contact__directions">
                    <GenericEditableText sectionId={sectionId} field="directionsLabel" value={directionsLabel} tag="span" />
                    <svg width="14" height="10" viewBox="0 0 16 10" fill="none" aria-hidden>
                      <path d="M1 5H15M10 1L15 5L10 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>
              </li>
              <li className="cafe02-contact__row">
                <span className="cafe02-contact__badge">{iconPhone}</span>
                <div>
                  <span className="cafe02-contact__label">
                    <GenericEditableText sectionId={sectionId} field="labelPhone" value={String(content.labelPhone ?? "Telefon")} tag="span" />
                  </span>
                  <div className="cafe02-contact__value">
                    <a href={"tel:" + phone.replace(/\s+/g, "")}>
                      <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                    </a>
                  </div>
                </div>
              </li>
              <li className="cafe02-contact__row">
                <span className="cafe02-contact__badge">{iconMail}</span>
                <div>
                  <span className="cafe02-contact__label">
                    <GenericEditableText sectionId={sectionId} field="labelEmail" value={String(content.labelEmail ?? "E-mail")} tag="span" />
                  </span>
                  <div className="cafe02-contact__value">
                    <a href={"mailto:" + email}>
                      <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                    </a>
                  </div>
                </div>
              </li>
              <li className="cafe02-contact__row">
                <span className="cafe02-contact__badge">{iconClock}</span>
                <div>
                  <span className="cafe02-contact__label">
                    <GenericEditableText sectionId={sectionId} field="labelHours" value={String(content.labelHours ?? "Otevírací doba")} tag="span" />
                  </span>
                  <div className="cafe02-contact__value">
                    <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
                  </div>
                </div>
              </li>
            </ul>

            <div className="cafe02-contact__actions">
              <a href={ctaHref} data-btn="primary" className="cafe02-contact__cta">
                <span className="cafe02-nav__cta-shine" aria-hidden />
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>
              {socials.length > 0 && (
                <ul className="cafe02-contact__socials">
                  {socials.map((s, i) => (
                    <li key={i}>
                      <a href={s.href || "#"} aria-label={s.label || s.icon} target="_blank" rel="noopener noreferrer">
                        <SocialIcon name={s.icon} />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="cafe02-contact__map" data-c02con="2" style={{ transitionDelay: "0.24s" }}>
            <span className="cafe02-contact__map-corner cafe02-contact__map-corner--tl" aria-hidden />
            <span className="cafe02-contact__map-corner cafe02-contact__map-corner--br" aria-hidden />
            <div className="cafe02-contact__map-inner">
              <iframe
                src={mapSrc}
                title="Mapa"
                loading="lazy"
              />
              <div className="cafe02-contact__map-pin" aria-hidden>
                <span />
                <i />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── restaurant-01-contact ─────────────────────────────────────────────────────
// Dark #1a0e0a bg; 2-col: vlevo kontaktní info s amber ikonami + červené CTA
// vpravo OpenStreetMap embed (nebo placeholder)
// ─────────────────────────────────────────────────────────────────────────────
function ContactRestaurant01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const secRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add("r01-vis"); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    el.querySelectorAll<HTMLElement>("[data-r01]").forEach(i => obs.observe(i));
    return () => obs.disconnect();
  }, []);

  const siteMode = String(content.siteMode ?? "multipage");
  const resolve  = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const id      = String(content.id      ?? "kontakt");
  const tagline = String(content.tagline ?? "Přijďte k nám");
  const title   = String(content.title   ?? "Rezervace\na kontakt");
  const address = String(content.address ?? "Vinohradská 42, 120 00 Praha 2");
  const phone   = String(content.phone   ?? "222 333 444");
  const email   = String(content.email   ?? "rezervace@memento.cz");
  const hours   = String(content.hours   ?? "Po–Čt 11:00–23:00, Pá–So 11:00–00:00, Ne 11:00–22:00");
  const ctaText = String(content.ctaText ?? "Rezervovat stůl");
  const ctaHref = String(content.ctaHref ?? "mailto:rezervace@memento.cz");
  const mapLat  = String(content.mapLat  ?? "50.0755");
  const mapLng  = String(content.mapLng  ?? "14.4378");
  const fbUrl   = String(content.facebookUrl  ?? "");
  const igUrl   = String(content.instagramUrl ?? "");

  const addressLabel = String(content.addressLabel ?? "Adresa");
  const phoneLabel   = String(content.phoneLabel   ?? "Telefon");
  const emailLabel   = String(content.emailLabel   ?? "E-mail");
  const hoursLabel   = String(content.hoursLabel   ?? "Otevírací doba");

  const showHeader = !!(tagline.trim() || title.trim());

  const DARK  = "#1a0e0a";
  const CREAM = "#f5ede0";
  const AMBER = "#c8943f";
  const MUTED = "#a08060";
  const RED   = "#c0392b";
  const FONT  = "Georgia, 'Times New Roman', serif";
  const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const lat = parseFloat(mapLat);
  const lng = parseFloat(mapLng);
  const mapBbox = `${(lng - 0.015).toFixed(4)}%2C${(lat - 0.015).toFixed(4)}%2C${(lng + 0.015).toFixed(4)}%2C${(lat + 0.015).toFixed(4)}`;
  const mapSrc  = `https://www.openstreetmap.org/export/embed.html?bbox=${mapBbox}&layer=mapnik&marker=${lat}%2C${lng}`;

  const iconCircle = (children: React.ReactNode) => (
    <span style={{ width: 44, height: 44, borderRadius: "50%", border: `1px solid rgba(200,148,63,0.35)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {children}
    </span>
  );

  const svgPin   = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>;
  const svgPhone = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
  const svgMail  = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
  const svgClock = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>;

  const infos = [
    { icon: svgPin,   label: addressLabel, value: address, field: "address", labelField: "addressLabel" },
    { icon: svgPhone, label: phoneLabel,   value: phone,   field: "phone",   labelField: "phoneLabel" },
    { icon: svgMail,  label: emailLabel,   value: email,   field: "email",   labelField: "emailLabel" },
    { icon: svgClock, label: hoursLabel,   value: hours,   field: "hours",   labelField: "hoursLabel" },
  ];

  const socialIcon = (url: string, d: string) => url ? (
    <a href={url} target="_blank" rel="noopener noreferrer" className="r01-ct-social" style={{ width: 40, height: 40, borderRadius: "50%", border: `1px solid rgba(200,148,63,0.3)`, display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "border-color .3s, background-color .3s" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill={AMBER} style={{ transition: "fill .3s" }}><path d={d}/></svg>
    </a>
  ) : null;

  return (
    <section ref={secRef} id={id} data-template="restaurant-01" style={{ backgroundColor: DARK, padding: "clamp(72px, 10vw, 120px) 0", fontFamily: SANS, position: "relative", overflow: "hidden" }}>
      {/* top amber hairline */}
      <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: `linear-gradient(90deg, transparent, ${AMBER}44, transparent)` }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(24px, 5vw, 64px)" }}>
        {/* Conditional header */}
        {showHeader && (
          <div data-r01="0" style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: AMBER, margin: "0 0 18px" }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            {/* diamond ornament */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "0 0 24px" }}>
              <div style={{ width: 40, height: 1, backgroundColor: `${AMBER}55` }} />
              <div style={{ width: 7, height: 7, backgroundColor: AMBER, transform: "rotate(45deg)", opacity: 0.7 }} />
              <div style={{ width: 40, height: 1, backgroundColor: `${AMBER}55` }} />
            </div>
            <h2 style={{ fontFamily: FONT, fontSize: "clamp(30px, 4vw, 50px)", fontWeight: 400, color: CREAM, margin: 0, lineHeight: 1.15, whiteSpace: "pre-line" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          </div>
        )}

        <div className="r01-ct-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 6vw, 72px)", alignItems: "start" }}>
          {/* Left — info cards */}
          <div data-r01="1" style={{ transitionDelay: "0.1s" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {infos.map((inf, i) => (
                <div key={i} className="r01-ct-info" style={{ display: "flex", gap: 18, alignItems: "flex-start", padding: "20px 24px", borderRadius: 4, border: `1px solid rgba(200,148,63,0.12)`, backgroundColor: "rgba(200,148,63,0.03)", transition: "border-color .3s, background-color .3s" }}>
                  {iconCircle(inf.icon)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: AMBER, margin: "0 0 6px" }}>
                      <GenericEditableText sectionId={sectionId} field={inf.labelField} value={inf.label} tag="span" />
                    </p>
                    <p style={{ fontSize: 15, fontWeight: 300, color: MUTED, margin: 0, lineHeight: 1.6 }}>
                      <GenericEditableText sectionId={sectionId} field={inf.field} value={inf.value} tag="span" />
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social + CTA row */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 36, flexWrap: "wrap" }}>
              <a href={resolve(ctaHref)} data-btn="primary" className="r01-ct-cta" style={{
                fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "#fff", textDecoration: "none",
                padding: "15px 40px", backgroundColor: RED, borderRadius: 3,
                display: "inline-block", transition: "background-color 0.3s, transform 0.3s, box-shadow 0.3s",
              }}>
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>

              {(fbUrl || igUrl) && (
                <div style={{ display: "flex", gap: 10 }}>
                  {socialIcon(fbUrl, "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z")}
                  {socialIcon(igUrl, "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z")}
                </div>
              )}
            </div>
          </div>

          {/* Right — map */}
          <div data-r01="2" className="r01-ct-map" style={{ aspectRatio: "4/3", borderRadius: 4, overflow: "hidden", border: `1px solid rgba(200,148,63,0.2)`, transitionDelay: "0.22s", position: "relative" }}>
            <iframe
              src={mapSrc}
              style={{ width: "100%", height: "100%", border: 0, display: "block", filter: "invert(0.85) hue-rotate(180deg) brightness(0.85) contrast(1.05)" }}
              title="Mapa"
              loading="lazy"
            />
            {/* amber corner accent */}
            <div style={{ position: "absolute", top: 0, left: 0, width: 32, height: 32, borderTop: `2px solid ${AMBER}55`, borderLeft: `2px solid ${AMBER}55`, pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 32, height: 32, borderBottom: `2px solid ${AMBER}55`, borderRight: `2px solid ${AMBER}55`, pointerEvents: "none" }} />
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){.r01-ct-grid{grid-template-columns:1fr!important}}
        @media(max-width:768px){.r01-ct-map{aspect-ratio:16/9!important}}
        .r01-ct-info:hover{border-color:rgba(200,148,63,0.3)!important;background-color:rgba(200,148,63,0.06)!important}
        .r01-ct-cta:hover{background-color:#a93226!important;transform:translateY(-2px);box-shadow:0 8px 24px rgba(192,57,43,0.3)!important}
        .r01-ct-social:hover{border-color:${AMBER}!important;background-color:rgba(200,148,63,0.12)!important}
        [data-r01]{opacity:0;transform:translateY(36px);transition:opacity .72s cubic-bezier(.22,1,.36,1),transform .72s cubic-bezier(.22,1,.36,1)}
        [data-r01].r01-vis{opacity:1;transform:translateY(0)}
      `}</style>
    </section>
  );
}

// ── restaurant-02-contact ─────────────────────────────────────────────────────
// Bílé bg, 2-col: info vlevo (adresa, tel, email, hodiny, social) + mapa vpravo
// Ref: restauracehybernska.cz — kontaktní sekce
// ─────────────────────────────────────────────────────────────────────────────
function ContactRestaurant02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const id       = String(content.id       ?? "kontakt");
  const taglineRaw = content.tagline;
  const titleRaw   = content.title;
  const tagline = taglineRaw === undefined ? "Kde nás najdete" : String(taglineRaw);
  const title   = titleRaw   === undefined ? "Kontakt\na rezervace" : String(titleRaw);
  const showHeader = !!(tagline.trim() || title.trim());
  const address  = String(content.address  ?? "Ukázková 123, 110 00 Praha 1");
  const phone    = String(content.phone    ?? "704 123 456");
  const email    = String(content.email    ?? "rezervace@demo.cz");
  const hours    = String(content.hours    ?? "Po–Pá 11:00–23:00, So–Ne 12:00–23:00");
  const addressLabel = String(content.addressLabel ?? "Adresa");
  const phoneLabel   = String(content.phoneLabel   ?? "Telefon");
  const emailLabel   = String(content.emailLabel   ?? "E-mail");
  const hoursLabel   = String(content.hoursLabel   ?? "Otevírací doba");
  const ctaText  = String(content.ctaText  ?? "Rezervovat stůl");
  const ctaHref  = String(content.ctaHref  ?? "mailto:rezervace@demo.cz");
  const mapLat   = String(content.mapLat   ?? "50.0875");
  const mapLng   = String(content.mapLng   ?? "14.4213");
  const fbUrl    = String(content.facebookUrl  ?? "");
  const igUrl    = String(content.instagramUrl ?? "");

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

  const rise = (d: number): React.CSSProperties => ({
    opacity: vis ? 1 : 0,
    transform: vis ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 0.7s cubic-bezier(.2,.7,.2,1) ${d}s, transform 0.7s cubic-bezier(.2,.7,.2,1) ${d}s`,
  });

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(mapLng)-0.012}%2C${parseFloat(mapLat)-0.008}%2C${parseFloat(mapLng)+0.012}%2C${parseFloat(mapLat)+0.008}&layer=mapnik&marker=${mapLat}%2C${mapLng}`;

  const iconAddr = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
  const iconPhone = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.95-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
  const iconMail = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
  const iconClock = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

  const rows: Array<{ icon: React.ReactNode; label: string; labelField: string; value: string; field: string; href?: string }> = [
    { icon: iconAddr,  label: addressLabel, labelField: "addressLabel", value: address, field: "address" },
    { icon: iconPhone, label: phoneLabel,   labelField: "phoneLabel",   value: phone,   field: "phone", href: `tel:${phone.replace(/\s/g, "")}` },
    { icon: iconMail,  label: emailLabel,   labelField: "emailLabel",   value: email,   field: "email", href: `mailto:${email}` },
    { icon: iconClock, label: hoursLabel,   labelField: "hoursLabel",   value: hours,   field: "hours" },
  ];

  return (
    <section ref={secRef} id={id} data-template="restaurant-02" style={{ backgroundColor: "#ffffff", padding: "clamp(72px, 9vw, 120px) 0", fontFamily: POPPINS }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 6vw, 88px)", alignItems: "start" }} className="r02-contact-grid">

        {/* Info vlevo */}
        <div>
          {showHeader && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, ...rise(0) }}>
                <span aria-hidden style={{ width: 36, height: 2, background: RED }} />
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span"
                  style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: RED }} />
              </div>
              <h2 style={{ ...rise(0.06), fontSize: "clamp(28px, 3.2vw, 42px)", fontWeight: 700, lineHeight: 1.18, color: BLACK, margin: "0 0 36px", whiteSpace: "pre-line" }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            </>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 34 }}>
            {rows.map((r, i) => {
              const inner = (
                <>
                  <span className="r02-contact-ico" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, flexShrink: 0, borderRadius: 3, backgroundColor: "rgba(192,57,43,0.08)", color: RED }}>{r.icon}</span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <GenericEditableText sectionId={sectionId} field={r.labelField} value={r.label} tag="span"
                      style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: RED }} />
                    <GenericEditableText sectionId={sectionId} field={r.field} value={r.value} tag="span"
                      style={{ fontSize: 14.5, lineHeight: 1.5, color: r.href ? BLACK : MUTED, fontWeight: r.href ? 600 : 400 }} />
                  </span>
                </>
              );
              return r.href ? (
                <a key={i} href={r.href} className="r02-contact-row" style={{ ...rise(0.1 + i * 0.06), display: "flex", gap: 14, alignItems: "center", textDecoration: "none", padding: "10px 12px", borderRadius: 4 }}>{inner}</a>
              ) : (
                <div key={i} className="r02-contact-row" style={{ ...rise(0.1 + i * 0.06), display: "flex", gap: 14, alignItems: "center", padding: "10px 12px", borderRadius: 4 }}>{inner}</div>
              );
            })}
          </div>

          {/* Social + CTA */}
          <div style={{ ...rise(0.38), display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <a href={ctaHref} className="r02-contact-cta" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase", color: "#ffffff", textDecoration: "none", padding: "14px 34px", backgroundColor: RED, display: "inline-block", position: "relative", overflow: "hidden" }}>
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            <div style={{ display: "flex", gap: 10 }}>
              {fbUrl && (
                <a href={fbUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="r02-contact-social">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {igUrl && (
                <a href={igUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="r02-contact-social">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Mapa vpravo — rámovaná s red accentem */}
        <div className="r02-contact-map" style={{ ...rise(0.15), position: "relative", lineHeight: 0 }}>
          <span aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: RED, zIndex: 1 }} />
          <iframe
            src={mapSrc}
            width="100%"
            style={{ aspectRatio: "4/3", border: 0, display: "block" }}
            allowFullScreen
            loading="lazy"
            title="Mapa restaurace"
          />
        </div>
      </div>
    </section>
  );
}

// ── restaurant-03-contact ─────────────────────────────────────────────────────
// La Casa Dorada — luxe deep-green #0c351a + gold. Ornament header, 2-col:
// LEVÁ gold-framed info karta (ikony/hodiny/social) · PRAVÁ rezervační formulář
// (underline inputy, gold focus, gold submit). Dole celoširoká mapa se zlatým
// rámem + green duotone filter. Conditional header pro /kontakt.
// ─────────────────────────────────────────────────────────────────────────────
function ContactRestaurant03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const id      = String(content.id      ?? "kontakt");
  const taglineRaw = content.tagline;
  const titleRaw   = content.title;
  const tagline = taglineRaw === undefined ? "Kde nás najdete" : String(taglineRaw);
  const title   = titleRaw   === undefined ? "Kontakt\na rezervace" : String(titleRaw);
  const showHeader = !!(tagline.trim() || title.trim());
  const address = String(content.address ?? "Zlatnická 12, 110 00 Praha 1");
  const phone   = String(content.phone   ?? "704 123 456");
  const email   = String(content.email   ?? "rezervace@lacasadorada.cz");
  const hours   = String(content.hours   ?? "Po–Ne: 12:00–01:00");
  const hours2  = String(content.hours2  ?? "");
  const infoTitle = String(content.infoTitle ?? "Spojení");
  const formTitle = String(content.formTitle ?? "Rezervace stolu");
  const formNote  = String(content.formNote  ?? "Ozveme se vám do hodiny s potvrzením.");
  const nameLabel   = String(content.nameLabel   ?? "Jméno a příjmení");
  const phoneLabel  = String(content.phoneLabel  ?? "Telefon");
  const dateLabel   = String(content.dateLabel   ?? "Datum & čas");
  const guestsLabel = String(content.guestsLabel ?? "Počet hostů");
  const noteLabel   = String(content.noteLabel   ?? "Poznámka");
  const submitLabel = String(content.submitLabel ?? "Odeslat rezervaci");
  const mapUrl  = String(content.mapEmbedUrl ?? "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2559.9!2d14.4208!3d50.0880!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTDCsDA1JzE2LjgiTiAxNMKwMjUnMTUuMCJF!5e0!3m2!1scs!2scz!4v1700000000000");

  const BG   = "#0c351a";
  const SURF = "#0a2d15";
  const GOLD = "#b97d26";
  const GOLD_LT = "#d4a24c";
  const WHITE = "#ffffff";
  const FONT = "Georgia, 'Times New Roman', serif";
  const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const secRef = useRef<HTMLElement>(null);

  const infoRows = [
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-5.686-8-11a8 8 0 1116 0c0 5.314-8 11-8 11z"/><circle cx="12" cy="11" r="3"/></svg>,
      label: "Adresa", field: "address", value: address, href: undefined,
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.07 1.18 2 2 0 012 .07h3a2 2 0 012 1.72 12.05 12.05 0 00.66 2.89 2 2 0 01-.45 2.11L6.04 7.91a16 16 0 006.05 6.05l1.12-1.17a2 2 0 012.11-.45 12.05 12.05 0 002.89.66A2 2 0 0122 14.92z"/></svg>,
      label: "Telefon", field: "phone", value: phone, href: `tel:+420${phone.replace(/\s/g, "")}`,
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
      label: "E-mail", field: "email", value: email, href: `mailto:${email}`,
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      label: "Otevírací doba", field: "hours", value: hours, href: undefined,
    },
  ];

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "transparent", border: "none",
    borderBottom: "1px solid rgba(212,162,76,0.35)", color: WHITE,
    fontFamily: SANS, fontSize: 14.5, padding: "10px 2px", outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em",
    textTransform: "uppercase", color: `${WHITE}88`, marginBottom: 6, display: "block",
  };

  return (
    <section ref={secRef} id={id} data-template="restaurant-03" data-variant="restaurant-03-contact" style={{ backgroundColor: BG, padding: "clamp(72px,10vw,116px) 0", fontFamily: SANS }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)" }}>
        {/* Header */}
        {showHeader && (
          <div style={{ marginBottom: 54, textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span aria-hidden style={{ width: 34, height: 1, background: `linear-gradient(to right, ${GOLD}00, ${GOLD})` }} />
              <span aria-hidden style={{ width: 6, height: 6, background: GOLD, transform: "rotate(45deg)" }} />
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span"
                style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: GOLD_LT }} />
              <span aria-hidden style={{ width: 6, height: 6, background: GOLD, transform: "rotate(45deg)" }} />
              <span aria-hidden style={{ width: 34, height: 1, background: `linear-gradient(to left, ${GOLD}00, ${GOLD})` }} />
            </div>
            <h2 style={{ fontFamily: FONT, fontSize: "clamp(28px, 3.6vw, 48px)", fontWeight: 400, color: WHITE, margin: 0, lineHeight: 1.16, whiteSpace: "pre-line" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          </div>
        )}

        {/* 2-col grid: info + form */}
        <div className="r03-contact-grid" style={{ display: "grid", gridTemplateColumns: "0.85fr 1fr", gap: "clamp(28px, 4vw, 56px)", alignItems: "stretch", marginBottom: 40 }}>

          {/* Levá info karta */}
          <div style={{ position: "relative", background: SURF, border: "1px solid rgba(185,125,38,0.28)", borderRadius: 2, padding: "clamp(28px,4vw,40px)" }}>
            <h3 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 400, color: WHITE, margin: "0 0 26px" }}>
              <GenericEditableText sectionId={sectionId} field="infoTitle" value={infoTitle} tag="span" />
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {infoRows.map((row, i) => (
                <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ color: GOLD_LT, flexShrink: 0, marginTop: 2 }}>{row.icon}</div>
                  <div>
                    <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: `${WHITE}66`, margin: "0 0 4px" }}>{row.label}</p>
                    {row.href ? (
                      <a href={row.href} className="r03-contact-link" style={{ fontFamily: SANS, fontSize: 15, color: `${WHITE}cc`, textDecoration: "none", lineHeight: 1.5, transition: "color 0.2s" }}
                        onMouseEnter={e => (e.currentTarget.style.color = GOLD_LT)}
                        onMouseLeave={e => (e.currentTarget.style.color = `${WHITE}cc`)}
                      >
                        <GenericEditableText sectionId={sectionId} field={row.field} value={row.value} tag="span" />
                      </a>
                    ) : (
                      <p style={{ fontFamily: SANS, fontSize: 15, color: `${WHITE}cc`, margin: 0, lineHeight: 1.5 }}>
                        <GenericEditableText sectionId={sectionId} field={row.field} value={row.value} tag="span" />
                        {hours2 && i === 3 && (
                          <><br /><GenericEditableText sectionId={sectionId} field="hours2" value={hours2} tag="span" style={{ fontSize: 13, color: `${WHITE}88` }} /></>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pravá — rezervační formulář */}
          <div style={{ position: "relative", background: SURF, border: "1px solid rgba(185,125,38,0.28)", borderRadius: 2, padding: "clamp(28px,4vw,40px)" }}>
            <h3 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 400, color: WHITE, margin: "0 0 6px" }}>
              <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" />
            </h3>
            <p style={{ fontFamily: SANS, fontSize: 13.5, color: `${WHITE}88`, margin: "0 0 26px", lineHeight: 1.6 }}>
              <GenericEditableText sectionId={sectionId} field="formNote" value={formNote} tag="span" />
            </p>
            <form onSubmit={(e) => e.preventDefault()} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 22px" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <GenericEditableText sectionId={sectionId} field="nameLabel" value={nameLabel} tag="label" style={labelStyle} />
                <input className="r03-input" type="text" style={inputStyle} />
              </div>
              <div>
                <GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="label" style={labelStyle} />
                <input className="r03-input" type="tel" style={inputStyle} />
              </div>
              <div>
                <GenericEditableText sectionId={sectionId} field="dateLabel" value={dateLabel} tag="label" style={labelStyle} />
                <input className="r03-input" type="text" style={inputStyle} />
              </div>
              <div>
                <GenericEditableText sectionId={sectionId} field="guestsLabel" value={guestsLabel} tag="label" style={labelStyle} />
                <input className="r03-input" type="number" min={1} style={inputStyle} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <GenericEditableText sectionId={sectionId} field="noteLabel" value={noteLabel} tag="label" style={labelStyle} />
                <input className="r03-input" type="text" style={inputStyle} />
              </div>
              <button
                type="submit"
                data-btn="primary"
                style={{ gridColumn: "1 / -1", marginTop: 8, fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: BG, background: GOLD, border: "none", borderRadius: 2, padding: "15px 32px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "background-color 0.3s, transform 0.3s" }}
                onMouseEnter={e => { e.currentTarget.style.background = GOLD_LT; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = GOLD; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <span aria-hidden style={{ width: 6, height: 6, background: "currentColor", transform: "rotate(45deg)" }} />
                <GenericEditableText sectionId={sectionId} field="submitLabel" value={submitLabel} tag="span" />
              </button>
            </form>
          </div>
        </div>

        {/* Celoširoká mapa se zlatým rámem */}
        <div style={{ position: "relative", borderRadius: 2, overflow: "hidden", border: `1px solid rgba(185,125,38,0.3)` }}>
          <iframe
            src={mapUrl}
            width="100%"
            height="380"
            style={{ border: 0, display: "block", filter: "grayscale(0.4) sepia(0.25) hue-rotate(70deg) saturate(0.9) brightness(0.85)" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa"
          />
        </div>
      </div>
      <style>{`
        [data-template="restaurant-03"] .r03-input:focus { border-bottom-color: ${GOLD_LT} !important; }
        [data-template="restaurant-03"] .r03-input::placeholder { color: rgba(255,255,255,0.3); }
        @media(max-width:768px){
          .r03-contact-grid{grid-template-columns:1fr!important}
        }
      `}</style>
    </section>
  );
}

// ── cafe-03-contact ────────────────────────────────────────────────────────────
// Cathedral Contact & Reservation — luxe redesign (2026-07-02)
// Parchment bg s decorative gothic arch watermark; editorial header centered
// (eyebrow + Great Vibes H2 + Cormorant kicker); 5fr/7fr grid: LEFT info card
// (big Cormorant italic phone + opening hours grid + address + gold social);
// RIGHT noir form card s gold offset frame — underline-only inputs, gold focus
// slide-in underline, big gold submit "Rezervuji stůl".
// ─────────────────────────────────────────────────────────────────────────────
function ContactCafe03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GOLD    = "#C69C60";
  const GOLD_LT = "#D8B57A";
  const GOLD_DK = "#8F6A38";
  const NOIR    = "#0d0d0d";
  const NOIR_D  = "#050505";
  const INK     = "#1a1a1a";
  const MUTED   = "#5a544a";
  const PARCH   = "#F5EFE4";
  const CREAM   = "#FBF7EF";
  const SCRIPT  = "'Great Vibes', cursive";
  const ITAL    = "'Cormorant Garamond', 'Playfair Display', Georgia, serif";
  const SANS    = "'Inter', 'Open Sans', system-ui, sans-serif";

  const id       = String(content.id       ?? "kontakt");
  const eyebrow  = String(content.eyebrow  ?? "SPOJTE SE S NÁMI");
  const title    = String(content.title    ?? "Rezervace & kontakt");
  const kicker   = String(content.kicker   ?? "prosíme rezervovat s předstihem — víkendy vyprodáno");
  const phoneBig  = String(content.phoneBig ?? "+420 704 218 640");
  const phoneHref = String(content.phoneHref ?? "tel:+420704218640");
  const emailBig  = String(content.emailBig  ?? "hello@cathedral-cafe.cz");
  const address   = String(content.address   ?? "Melantrichova 15, 110 00 Praha 1");
  const mapsHref  = String(content.mapsHref  ?? "https://maps.google.com/?q=Melantrichova+15+Praha");
  const socialFB  = String(content.socialFacebook  ?? "https://facebook.com/cathedralcafe");
  const socialIG  = String(content.socialInstagram ?? "https://instagram.com/cathedralcafe");
  const hoursGrid = (content.hoursGrid as Array<{ day: string; time: string }>) ?? [
    { day: "Pondělí — Čtvrtek",  time: "9:00 — 22:00" },
    { day: "Pátek — Sobota",     time: "9:00 — 24:00" },
    { day: "Neděle",             time: "9:00 — 21:00" },
  ];
  const formTitle    = String(content.formTitle    ?? "Rezervujte stůl");
  const formSubtitle = String(content.formSubtitle ?? "napište nám vaše preference — odpovíme do hodiny");
  const submitLabel  = String(content.submitLabel  ?? "Rezervuji stůl");

  return (
    <section id={id} data-template="cafe-03" className="c3ct" style={{ backgroundColor: PARCH, padding: "clamp(72px, 10vw, 130px) 0", fontFamily: SANS, position: "relative", overflow: "hidden" }}>
      {/* Watermark */}
      <svg aria-hidden width="340" height="500" viewBox="0 0 340 500" style={{ position: "absolute", left: -80, top: 60, opacity: 0.05, pointerEvents: "none" }}>
        <path d="M40 480 V 180 A 130 130 0 0 1 300 180 V 480" stroke={INK} strokeWidth="1" fill="none" />
      </svg>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <header style={{ textAlign: "center", marginBottom: "clamp(48px, 6vw, 72px)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <span aria-hidden style={{ display: "inline-block", width: 32, height: 1, backgroundColor: GOLD }} />
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span">
              <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: "0.36em", textTransform: "uppercase", color: GOLD_DK }}>{eyebrow}</span>
            </GenericEditableText>
            <span aria-hidden style={{ display: "inline-block", width: 32, height: 1, backgroundColor: GOLD }} />
          </div>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2">
            <h2 style={{ fontFamily: SCRIPT, fontSize: "clamp(48px, 6vw, 82px)", fontWeight: 400, color: INK, margin: 0, lineHeight: 1.05 }}>{title}</h2>
          </GenericEditableText>
          <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="p">
            <p style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: "clamp(15px, 1.4vw, 18px)", color: GOLD_DK, margin: "10px auto 0", maxWidth: 560, letterSpacing: "0.02em" }}>— {kicker}</p>
          </GenericEditableText>
        </header>

        <div className="c3ct-grid" style={{ display: "grid", gridTemplateColumns: "5fr 7fr", gap: "clamp(32px, 5vw, 64px)", alignItems: "start" }}>
          {/* LEFT — info */}
          <div>
            {/* Phone big */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: "0.32em", textTransform: "uppercase", color: GOLD_DK, marginBottom: 10 }}>REZERVACE · TELEFON</div>
              <a href={phoneHref} className="c3ct-big" style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: "clamp(28px, 3vw, 38px)", fontWeight: 500, color: INK, textDecoration: "none", letterSpacing: "0.01em", display: "inline-block", position: "relative", paddingBottom: 4 }}>
                <GenericEditableText sectionId={sectionId} field="phoneBig" value={phoneBig} tag="span" />
                <span aria-hidden className="c3ct-big-line" style={{ position: "absolute", left: 0, right: "80%", bottom: 0, height: 1, backgroundColor: GOLD, transition: "right 0.35s cubic-bezier(.4,0,.2,1)" }} />
              </a>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: "0.32em", textTransform: "uppercase", color: GOLD_DK, marginBottom: 10 }}>E-MAIL</div>
              <a href={`mailto:${emailBig}`} className="c3ct-big" style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: "clamp(20px, 1.8vw, 24px)", color: INK, textDecoration: "none", display: "inline-block", position: "relative", paddingBottom: 4 }}>
                <GenericEditableText sectionId={sectionId} field="emailBig" value={emailBig} tag="span" />
                <span aria-hidden className="c3ct-big-line" style={{ position: "absolute", left: 0, right: "80%", bottom: 0, height: 1, backgroundColor: GOLD, transition: "right 0.35s cubic-bezier(.4,0,.2,1)" }} />
              </a>
            </div>

            {/* Address */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: "0.32em", textTransform: "uppercase", color: GOLD_DK, marginBottom: 10 }}>ADRESA</div>
              <a href={mapsHref} target="_blank" rel="noreferrer" className="c3ct-big" style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: "clamp(18px, 1.6vw, 22px)", color: INK, textDecoration: "none", display: "inline-flex", alignItems: "flex-start", gap: 8, position: "relative", paddingBottom: 4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD_DK} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 6, flexShrink: 0 }} aria-hidden><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>
                <span>
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                </span>
                <span aria-hidden className="c3ct-big-line" style={{ position: "absolute", left: 0, right: "80%", bottom: 0, height: 1, backgroundColor: GOLD, transition: "right 0.35s cubic-bezier(.4,0,.2,1)" }} />
              </a>
            </div>

            {/* Opening hours grid */}
            <div style={{ marginBottom: 32, paddingTop: 24, borderTop: `1px solid ${GOLD}55` }}>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: "0.32em", textTransform: "uppercase", color: GOLD_DK, marginBottom: 16 }}>OTEVÍRACÍ DOBA</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {hoursGrid.map((row, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 12, fontFamily: ITAL, fontStyle: "italic", fontSize: 16 }}>
                    <GenericEditableText sectionId={sectionId} field={`hoursGrid.${i}.day`} value={row.day} tag="span">
                      <span style={{ color: INK, minWidth: 168 }}>{row.day}</span>
                    </GenericEditableText>
                    <span aria-hidden style={{ flex: 1, borderBottom: `1px dashed ${GOLD}66`, marginBottom: 4 }} />
                    <GenericEditableText sectionId={sectionId} field={`hoursGrid.${i}.time`} value={row.time} tag="span">
                      <span style={{ color: GOLD_DK, fontWeight: 500 }}>{row.time}</span>
                    </GenericEditableText>
                  </div>
                ))}
              </div>
            </div>

            {/* Social */}
            <div style={{ paddingTop: 24, borderTop: `1px solid ${GOLD}55`, display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: "0.32em", textTransform: "uppercase", color: GOLD_DK }}>SLEDUJTE</span>
              <a href={socialFB} target="_blank" rel="nofollow noreferrer" aria-label="Facebook" className="c3ct-soc" style={{ width: 40, height: 40, borderRadius: "50%", border: `1px solid ${GOLD}66`, display: "flex", alignItems: "center", justifyContent: "center", color: GOLD_DK, transition: "background-color 0.2s, color 0.2s, border-color 0.2s" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href={socialIG} target="_blank" rel="nofollow noreferrer" aria-label="Instagram" className="c3ct-soc" style={{ width: 40, height: 40, borderRadius: "50%", border: `1px solid ${GOLD}66`, display: "flex", alignItems: "center", justifyContent: "center", color: GOLD_DK, transition: "background-color 0.2s, color 0.2s, border-color 0.2s" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
              </a>
            </div>
          </div>

          {/* RIGHT — noir form card */}
          <div style={{ position: "relative" }}>
            {/* Gold offset frame */}
            <span aria-hidden style={{ position: "absolute", inset: "-14px -14px -14px -14px", border: `1px solid ${GOLD}66`, pointerEvents: "none" }} />
            <span aria-hidden style={{ position: "absolute", top: -14, left: -14, width: 22, height: 22, borderTop: `2px solid ${GOLD}`, borderLeft: `2px solid ${GOLD}` }} />
            <span aria-hidden style={{ position: "absolute", bottom: -14, right: -14, width: 22, height: 22, borderBottom: `2px solid ${GOLD}`, borderRight: `2px solid ${GOLD}` }} />

            <div style={{ backgroundColor: NOIR, backgroundImage: `linear-gradient(180deg, ${NOIR} 0%, ${NOIR_D} 100%)`, padding: "clamp(28px, 4vw, 48px)", color: CREAM }}>
              <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="h3">
                <h3 style={{ fontFamily: SCRIPT, fontSize: "clamp(36px, 4vw, 52px)", fontWeight: 400, color: "#fff", margin: 0, lineHeight: 1 }}>{formTitle}</h3>
              </GenericEditableText>
              <GenericEditableText sectionId={sectionId} field="formSubtitle" value={formSubtitle} tag="p">
                <p style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: 16, color: GOLD_LT, margin: "8px 0 32px" }}>— {formSubtitle}</p>
              </GenericEditableText>

              <form onSubmit={e => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div className="c3ct-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <FieldC3 label="Jméno" type="text" />
                  <FieldC3 label="Telefon" type="tel" />
                </div>
                <div className="c3ct-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <FieldC3 label="Datum" type="date" />
                  <FieldC3 label="Počet osob" type="number" defaultValue="2" />
                </div>
                <FieldC3 label="E-mail" type="email" />
                <FieldC3 label="Zpráva & preference" type="textarea" />

                <button
                  type="submit"
                  className="c3ct-submit"
                  style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: NOIR, padding: "18px 32px", backgroundColor: GOLD, border: "none", cursor: "pointer", alignSelf: "flex-start", marginTop: 8, display: "inline-flex", alignItems: "center", gap: 10, transition: "background-color 0.28s ease, letter-spacing 0.28s ease" }}
                >
                  <span style={{ fontFamily: ITAL, fontStyle: "italic", textTransform: "none", letterSpacing: "0.02em", fontSize: 16, fontWeight: 500 }}>~</span>
                  <GenericEditableText sectionId={sectionId} field="submitLabel" value={submitLabel} tag="span" />
                </button>
                <p style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: 13, color: GOLD_LT, opacity: 0.7, margin: 0 }}>Odesláním souhlasíte se zpracováním osobních údajů pro účel rezervace.</p>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        [data-template="cafe-03"].c3ct .c3ct-big:hover .c3ct-big-line { right: 0 !important; }
        [data-template="cafe-03"].c3ct .c3ct-big:hover { color: ${GOLD_DK} !important; }
        [data-template="cafe-03"].c3ct .c3ct-soc:hover { background-color: ${GOLD} !important; color: ${NOIR} !important; border-color: ${GOLD} !important; }
        [data-template="cafe-03"].c3ct .c3ct-submit:hover { background-color: ${GOLD_LT} !important; letter-spacing: 0.28em !important; }
        [data-template="cafe-03"].c3ct .c3ct-field { position: relative; }
        [data-template="cafe-03"].c3ct .c3ct-field label { display: block; font-family: ${SANS}; font-size: 10px; font-weight: 500; letter-spacing: 0.28em; text-transform: uppercase; color: ${GOLD_LT}; margin-bottom: 10px; }
        [data-template="cafe-03"].c3ct .c3ct-field input, [data-template="cafe-03"].c3ct .c3ct-field textarea {
          width: 100%; box-sizing: border-box; background: transparent; border: none;
          border-bottom: 1px solid ${GOLD}55; padding: 8px 0 10px; color: ${CREAM};
          font-family: ${ITAL}; font-style: italic; font-size: 18px; letter-spacing: 0.01em; outline: none;
          transition: border-color 0.3s ease;
        }
        [data-template="cafe-03"].c3ct .c3ct-field textarea { resize: vertical; min-height: 84px; }
        [data-template="cafe-03"].c3ct .c3ct-field input:focus, [data-template="cafe-03"].c3ct .c3ct-field textarea:focus { border-bottom-color: ${GOLD} !important; }
        @media (max-width: 900px) {
          [data-template="cafe-03"].c3ct .c3ct-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          [data-template="cafe-03"].c3ct .c3ct-form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function FieldC3({ label, type, defaultValue }: { label: string; type: string; defaultValue?: string }) {
  return (
    <div className="c3ct-field">
      <label>{label}</label>
      {type === "textarea"
        ? <textarea rows={3} />
        : <input type={type} defaultValue={defaultValue} />}
    </div>
  );
}

// ── cafe-04-contact ───────────────────────────────────────────────────────────
// Ref: coffeeroom.cz/contact — border box, form left + contact info right
// .contact-form-wrap border #b7957080, .text-field coffeebrown border, dark-button
// ─────────────────────────────────────────────────────────────────────────────
function ContactCafe04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrow    = String(content.eyebrow    ?? "Napište nám");
  const heading    = String(content.heading    ?? "Ozvěte se, jsme na příjmu.");
  const subheading = String(content.subheading ?? "Rezervace většího stolu, spolupráce nebo jen zpětná vazba — rádi si vás poslechneme.");
  const email      = String(content.email      ?? "ahoj@coffeeroom.cz");
  const phone      = String(content.phone      ?? "+420 704 123 456");
  const address    = String(content.address    ?? "Rumunská 74\n120 00 Praha 2");
  const emailLabel = String(content.emailLabel ?? "E-mail");
  const phoneLabel = String(content.phoneLabel ?? "Telefon");
  const addressLabel = String(content.addressLabel ?? "Adresa");
  const successText  = String(content.successText  ?? "Díky, ozveme se do 24 hodin.");
  const fields     = (content.formFields as { name?: string; email?: string; message?: string; submit?: string }) ?? {};

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const hideHeader = content.showHeader === false || (!heading && !eyebrow && !subheading);

  return (
    <section className="cr04-ct" data-template="cafe-04">
      <div className="cr04-ct-inner">
        {!hideHeader && (
          <div className="cr04-ct-header">
            <span className="cr04-ct-eyebrow">
              <span className="cr04-ct-eyebrow-rule" aria-hidden />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </span>
            <h2 className="cr04-ct-title">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            <p className="cr04-ct-sub">
              <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
            </p>
          </div>
        )}

        <div className="cr04-ct-grid">
          {/* Left: info */}
          <div className="cr04-ct-info">
            <div className="cr04-ct-info-item">
              <span className="cr04-ct-info-lbl">
                <GenericEditableText sectionId={sectionId} field="emailLabel" value={emailLabel} tag="span" />
              </span>
              <a href={`mailto:${email}`} className="cr04-ct-info-val cr04-ct-info-link">
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            </div>
            <div className="cr04-ct-info-item">
              <span className="cr04-ct-info-lbl">
                <GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span" />
              </span>
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="cr04-ct-info-val cr04-ct-info-link">
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            </div>
            <div className="cr04-ct-info-item">
              <span className="cr04-ct-info-lbl">
                <GenericEditableText sectionId={sectionId} field="addressLabel" value={addressLabel} tag="span" />
              </span>
              <p className="cr04-ct-info-val">
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </p>
            </div>
          </div>

          {/* Right: form */}
          <div className="cr04-ct-form-wrap">
            {!submitted ? (
              <form className="cr04-ct-form" onSubmit={e => { e.preventDefault(); setSubmitted(true); }}>
                <label className="cr04-ct-field">
                  <span className="cr04-ct-field-lbl">
                    <GenericEditableText sectionId={sectionId} field="formFields.name" value={fields.name ?? "Jméno"} tag="span" />
                  </span>
                  <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="cr04-ct-input" />
                </label>
                <label className="cr04-ct-field">
                  <span className="cr04-ct-field-lbl">
                    <GenericEditableText sectionId={sectionId} field="formFields.email" value={fields.email ?? "E-mail"} tag="span" />
                  </span>
                  <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="cr04-ct-input" />
                </label>
                <label className="cr04-ct-field">
                  <span className="cr04-ct-field-lbl">
                    <GenericEditableText sectionId={sectionId} field="formFields.message" value={fields.message ?? "Zpráva"} tag="span" />
                  </span>
                  <textarea rows={4} required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="cr04-ct-textarea" />
                </label>
                <button type="submit" className="cr04-ct-submit">
                  <GenericEditableText sectionId={sectionId} field="formFields.submit" value={fields.submit ?? "Odeslat"} tag="span" />
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
                    <path d="M1 5H13M9 1L13 5L9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </form>
            ) : (
              <p className="cr04-ct-success">
                <GenericEditableText sectionId={sectionId} field="successText" value={successText} tag="span" />
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── reality-02-contact ────────────────────────────────────────────────────────
// Ref: realitni-pruvodce.cz kontakt stránka — tel/email/adresa vlevo + CTA karta vpravo
// ─────────────────────────────────────────────────────────────────────────────
function ContactReality02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title    = String(content.title    ?? "Kontaktujte nás");
  const subtitle = String(content.subtitle ?? "Jsme tu pro vás. Napište nám nebo zavolejte — ozveme se do 24 hodin.");
  const phone    = String(content.phone    ?? "+420 222 888 111");
  const email    = String(content.email    ?? "info@realitni-pruvodce.cz");
  const address  = String(content.address  ?? "Vinohradská 42, 120 00 Praha 2");
  const hours    = String(content.hours    ?? "Po–Pá 9:00–18:00");
  const ctaTitle = String(content.ctaTitle ?? "Prodejte svou nemovitost");
  const ctaBody  = String(content.ctaBody  ?? "Zanechte nám kontakt a ozveme se do 24 hodin s nabídkou prověřeného makléře.");
  const ctaBtn   = String(content.ctaBtn   ?? "Nezávazná konzultace");
  const ctaHref  = String(content.ctaHref  ?? "#prodej");

  const DARK  = "#05303a";
  const GREEN = "#3DCE78";
  const LIGHT = "#f0f6f5";
  const FONT_H = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const FONT_B = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  return (
    <section id="kontakt" data-template="reality-02" style={{ backgroundColor: "#ffffff", fontFamily: FONT_B, padding: "clamp(56px,9vw,96px) clamp(16px,5vw,48px)" }}>
      <div className="r02-contact-grid" style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "clamp(32px,5vw,56px)", alignItems: "start" }}>
        <div>
          <h2 style={{ fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 700, color: DARK, marginBottom: 14, fontFamily: FONT_H }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p style={{ fontSize: 15, color: DARK, opacity: 0.68, marginBottom: 36, lineHeight: 1.7 }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <a href={`tel:${phone.replace(/\s/g,"")}`} className="r02-contact-item" style={{ display: "flex", alignItems: "center", gap: 14, color: DARK, textDecoration: "none", fontSize: 15, fontWeight: 600 }}>
              <span style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: LIGHT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.71 3.32a2 2 0 0 1 1.994-2.18H5.65a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </span>
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
            <a href={`mailto:${email}`} className="r02-contact-item" style={{ display: "flex", alignItems: "center", gap: 14, color: DARK, textDecoration: "none", fontSize: 15, fontWeight: 600 }}>
              <span style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: LIGHT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
              <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
            </a>
            <div style={{ display: "flex", alignItems: "center", gap: 14, color: DARK, fontSize: 15 }}>
              <span style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: LIGHT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </span>
              <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, color: DARK, fontSize: 15 }}>
              <span style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: LIGHT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </span>
              <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: LIGHT, borderRadius: 18, padding: "clamp(32px,5vw,44px) clamp(24px,4vw,36px)", textAlign: "center" }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: DARK, marginBottom: 14, fontFamily: FONT_H }}>
            <GenericEditableText sectionId={sectionId} field="ctaTitle" value={ctaTitle} tag="span" />
          </h3>
          <p style={{ fontSize: 14, color: DARK, opacity: 0.68, marginBottom: 28, lineHeight: 1.65 }}>
            <GenericEditableText sectionId={sectionId} field="ctaBody" value={ctaBody} tag="span" />
          </p>
          <a href={ctaHref} data-btn="primary" className="r02-contact-cta" style={{ display: "inline-block", padding: "13px 36px", backgroundColor: GREEN, color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none", borderRadius: 28, fontFamily: FONT_H }}>
            <GenericEditableText sectionId={sectionId} field="ctaBtn" value={ctaBtn} tag="span" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ── reality-01-contact ────────────────────────────────────────────────────────
function ContactReality01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrowRaw  = content.eyebrow;
  const titleRaw    = content.title;
  const subtitleRaw = content.subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Kontakt" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Najdete nás snadno" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Stavte se osobně nebo nám napište — odpovídáme do 24 hodin." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());

  const address  = String(content.address  ?? "Pařížská 28, 110 00 Praha 1");
  const phone    = String(content.phone    ?? "704 123 456");
  const email    = String(content.email    ?? "info@domus-reality.cz");
  const hours    = String(content.hours    ?? "Po–Pá 9:00–18:00, So 9:00–14:00");

  const DARK = "#1a3640";
  const GOLD = "#d4a96e";
  const WHITE = "#ffffff";
  const SURFACE = "#f4ebe5";
  const TEXT_MUTED = "#6b7280";
  const FONT = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const BODY = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed&z=15`;

  type ContactItem = { icon: React.ReactNode; label: string; field: string; value: string; href?: string };
  const items: ContactItem[] = [
    {
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/></svg>,
      label: "Adresa", field: "address", value: address,
    },
    {
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02z" fill="currentColor"/></svg>,
      label: "Telefon", field: "phone", value: `+420 ${phone}`, href: `tel:+420${phone.replace(/\s/g,"")}`,
    },
    {
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/></svg>,
      label: "E-mail", field: "email", value: email, href: `mailto:${email}`,
    },
    {
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z" fill="currentColor"/></svg>,
      label: "Otevírací doba", field: "hours", value: hours,
    },
  ];

  return (
    <section data-template="reality-01" id="contact" style={{ backgroundColor: WHITE, padding: "clamp(64px,9vw,112px) 0", position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px,4vw,56px)" }}>

        {showHeader && (
          <div style={{ marginBottom: 56 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <div style={{ width: 32, height: 1, background: GOLD }} />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span"
                style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: GOLD }} />
            </div>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2"
              style={{ fontFamily: FONT, fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 700, lineHeight: 1.15, color: DARK, margin: "0 0 14px", letterSpacing: "-0.02em" }} />
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p"
              style={{ fontFamily: BODY, fontSize: 16, color: TEXT_MUTED, margin: 0, lineHeight: 1.7, maxWidth: 520 }} />
          </div>
        )}

        <div className="r01-contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px,5vw,72px)", alignItems: "start" }}>
          {/* LEFT — contact cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {items.map((item, i) => (
              <div key={i} className="r01-contact-card" style={{
                padding: "28px 24px", borderRadius: 10,
                backgroundColor: i === 0 ? DARK : SURFACE,
                transition: "transform 0.3s, box-shadow 0.3s",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  backgroundColor: i === 0 ? "rgba(212,169,110,0.15)" : "rgba(26,54,64,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: GOLD, marginBottom: 16,
                }}>
                  {item.icon}
                </div>
                <div style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: i === 0 ? "rgba(255,255,255,0.5)" : TEXT_MUTED, marginBottom: 8 }}>
                  {item.label}
                </div>
                {item.href ? (
                  <a href={item.href} className="r01-contact-link" style={{
                    fontFamily: BODY, fontSize: 15, fontWeight: 500,
                    color: i === 0 ? WHITE : DARK,
                    textDecoration: "none", transition: "color 0.2s",
                  }}>
                    <GenericEditableText sectionId={sectionId} field={item.field} value={item.value} tag="span" />
                  </a>
                ) : (
                  <GenericEditableText sectionId={sectionId} field={item.field} value={item.value} tag="div"
                    style={{ fontFamily: BODY, fontSize: 15, color: i === 0 ? WHITE : DARK, lineHeight: 1.5, fontWeight: 500 }} />
                )}
              </div>
            ))}
          </div>

          {/* RIGHT — map */}
          <div style={{ borderRadius: 10, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", aspectRatio: "4/3", position: "relative", backgroundColor: SURFACE }}>
            <iframe
              title="Mapa kanceláře"
              src={mapSrc}
              width="100%" height="100%"
              style={{ position: "absolute", inset: 0, border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .r01-contact-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 500px) {
          .r01-contact-grid > div:first-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── reality-05-contact ────────────────────────────────────────────────────────
function ContactReality05({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrowRaw  = (content as Record<string,unknown>).eyebrow;
  const titleRaw    = (content as Record<string,unknown>).title;
  const subtitleRaw = (content as Record<string,unknown>).subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Kontakt" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Ozvěte se mi" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Rád zodpovím vaše dotazy a domluvíme nezávaznou konzultaci." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());

  const address   = String(content.address  ?? "Národní 15, 110 00 Praha 1");
  const phone     = String(content.phone    ?? "602 345 678");
  const email     = String(content.email    ?? "info@demo-reality.cz");
  const hours     = String(content.hours    ?? "Po–Pá 9:00–18:00");
  const addrLabel = String((content as Record<string,unknown>).addressLabel ?? "Kancelář");
  const phoneLabel = String((content as Record<string,unknown>).phoneLabel ?? "Telefon");
  const emailLabel = String((content as Record<string,unknown>).emailLabel ?? "E-mail");
  const hoursLabel = String((content as Record<string,unknown>).hoursLabel ?? "Dostupnost");

  const GOLD  = "#CFA968";
  const DARK  = "#1c1c1c";
  const WHITE = "#ffffff";
  const CREAM = "#f8f5f0";
  const SANS  = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed&z=15`;

  const contactItems = [
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>,
      labelField: "addressLabel", label: addrLabel, valueField: "address", value: address,
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
      labelField: "phoneLabel", label: phoneLabel, valueField: "phone", value: phone,
      href: `tel:${phone.replace(/\s/g, "")}`,
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
      labelField: "emailLabel", label: emailLabel, valueField: "email", value: email,
      href: `mailto:${email}`,
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      labelField: "hoursLabel", label: hoursLabel, valueField: "hours", value: hours,
    },
  ];

  return (
    <section id="kontakt" data-template="reality-05" style={{ backgroundColor: WHITE, fontFamily: SANS }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px clamp(20px,4vw,56px) 88px" }}>
        {showHeader && (
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            {eyebrow.trim() && (
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span"
                style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: GOLD, display: "block", marginBottom: 12 }}
              />
            )}
            {title.trim() && (
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2"
                style={{ fontSize: "clamp(28px,3.2vw,40px)", fontWeight: 700, color: DARK, margin: "0 0 14px", lineHeight: 1.15 }}
              />
            )}
            {subtitle.trim() && (
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p"
                style={{ fontSize: 16, color: "#666", margin: "0 0 12px", lineHeight: 1.7, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}
              />
            )}
            <div style={{ width: 40, height: 2, backgroundColor: GOLD, margin: "0 auto", opacity: 0.5 }} />
          </div>
        )}

        <div className="r05-contact-grid">
          {/* LEFT — contact items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {contactItems.map((item, i) => (
              <div key={i} className="r05-contact-item" style={{ display: "flex", gap: 18, alignItems: "flex-start", transition: "transform 0.25s" }}>
                <div style={{
                  width: 44, height: 44, flexShrink: 0,
                  backgroundColor: CREAM, display: "flex", alignItems: "center", justifyContent: "center",
                  color: GOLD, transition: "background-color 0.25s, color 0.25s",
                }}>
                  {item.icon}
                </div>
                <div>
                  <GenericEditableText sectionId={sectionId} field={item.labelField} value={item.label} tag="div"
                    style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#999", marginBottom: 4 }}
                  />
                  {item.href ? (
                    <a href={item.href} className="r05-contact-link" style={{ fontSize: 15, color: DARK, textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }}>
                      <GenericEditableText sectionId={sectionId} field={item.valueField} value={item.value} tag="span" />
                    </a>
                  ) : (
                    <GenericEditableText sectionId={sectionId} field={item.valueField} value={item.value} tag="div"
                      style={{ fontSize: 15, color: DARK, lineHeight: 1.5 }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT — map */}
          <div style={{ overflow: "hidden", aspectRatio: "4/3", position: "relative", backgroundColor: CREAM, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <iframe
              title="Mapa kanceláře"
              src={mapSrc}
              width="100%" height="100%"
              style={{ position: "absolute", inset: 0, border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── reality-04-contact ────────────────────────────────────────────────────────
function ContactReality04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const sectionAnchor = String(content.id ?? "kontakt");
  const eyebrowRaw  = (content as Record<string, unknown>).eyebrow;
  const titleRaw    = (content as Record<string, unknown>).title;
  const subtitleRaw = (content as Record<string, unknown>).subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Kontakt" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Poradíme vám nezávazně s prodejem i pronájmem" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Napište nám nebo zavolejte — ozveme se obvykle do jednoho pracovního dne." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());

  const companyName   = String(content.companyName  ?? "Rezido reality s.r.o.");
  const address       = String(content.address      ?? "Náměstí Míru 12");
  const city          = String(content.city         ?? "120 00 Praha 2");
  const hours         = String(content.hours        ?? "Pracovní dny: 9:00 – 18:00");
  const phone         = String(content.phone        ?? "704 123 456");
  const phone2        = String(content.phone2       ?? "");
  const email         = String(content.email        ?? "info@rezido.cz");
  const mapLat        = Number(content.mapLat       ?? 50.0755);
  const mapLng        = Number(content.mapLng       ?? 14.4378);

  const nameLabel     = String(content.nameLabel     ?? "Jméno a příjmení");
  const phoneLabel    = String(content.phoneLabel    ?? "Telefon");
  const emailLabel    = String(content.emailLabel    ?? "E-mail");
  const typeLabel     = String(content.typeLabel     ?? "Typ nemovitosti");
  const messageLabel  = String(content.messageLabel  ?? "Zpráva");
  const submitLabel   = String(content.submitLabel   ?? "Odeslat poptávku");
  const privacyNote   = String(content.privacyNote   ?? "Odesláním souhlasíte se zpracováním osobních údajů.");
  const infoTitle     = String(content.infoTitle     ?? "Kde nás najdete");

  const PRIMARY = "#1032CF";
  const GREEN   = "#21b276";
  const DARK    = "#141414";
  const MUTED   = "#6b7280";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const labelStyle: React.CSSProperties = { fontFamily: SANS, fontSize: 13, fontWeight: 600, color: DARK, marginBottom: 7, display: "block" };

  const InfoRow = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 18 }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: "#eef1fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ fontFamily: SANS, fontSize: 14.5, color: DARK, lineHeight: 1.5, paddingTop: 4 }}>{children}</div>
    </div>
  );

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${mapLng - 0.008}%2C${mapLat - 0.005}%2C${mapLng + 0.008}%2C${mapLat + 0.005}&layer=mapnik&marker=${mapLat}%2C${mapLng}`;

  return (
    <section id={sectionAnchor} style={{ backgroundColor: "#f6f7fb", padding: "clamp(56px, 7vw, 100px) 0" }} data-template="reality-04">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px, 3vw, 40px)" }}>

        {showHeader && (
          <div style={{ maxWidth: 640, marginBottom: "clamp(32px, 4vw, 52px)" }}>
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

        <div className="r04-contact-grid">
          {/* Levý sloupec — formulář v bílé kartě */}
          <div style={{ background: "#fff", borderRadius: 20, padding: "clamp(24px, 3vw, 40px)", boxShadow: "0 6px 30px rgba(16,50,207,0.08)", border: "1px solid #e8ebf2" }}>
            <form onSubmit={e => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="r04-contact-row">
                <div>
                  <GenericEditableText sectionId={sectionId} field="nameLabel" value={nameLabel} tag="label" style={labelStyle} />
                  <input type="text" className="r04-input" placeholder={nameLabel} required />
                </div>
                <div>
                  <GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="label" style={labelStyle} />
                  <input type="tel" className="r04-input" placeholder={phoneLabel} />
                </div>
              </div>
              <div>
                <GenericEditableText sectionId={sectionId} field="emailLabel" value={emailLabel} tag="label" style={labelStyle} />
                <input type="email" className="r04-input" placeholder={emailLabel} />
              </div>
              <div>
                <GenericEditableText sectionId={sectionId} field="typeLabel" value={typeLabel} tag="label" style={labelStyle} />
                <select className="r04-input r04-select">
                  <option value="">Vyberte…</option>
                  <option>Byt</option>
                  <option>Dům</option>
                  <option>Pozemek</option>
                  <option>Komerční nemovitost</option>
                  <option>Jiné</option>
                </select>
              </div>
              <div>
                <GenericEditableText sectionId={sectionId} field="messageLabel" value={messageLabel} tag="label" style={labelStyle} />
                <textarea className="r04-input" placeholder="Vaše zpráva (nepovinné)" rows={4} style={{ resize: "vertical", lineHeight: 1.6 }} />
              </div>
              <div>
                <button type="submit" className="r04-contact-submit">
                  <GenericEditableText sectionId={sectionId} field="submitLabel" value={submitLabel} tag="span" />
                </button>
                <GenericEditableText sectionId={sectionId} field="privacyNote" value={privacyNote} tag="p"
                  style={{ fontFamily: SANS, fontSize: 12, color: MUTED, margin: "12px 0 0" }} />
              </div>
            </form>
          </div>

          {/* Pravý sloupec — kontaktní info + mapa */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ backgroundColor: "#fff", borderRadius: 20, padding: "clamp(24px, 2.5vw, 34px)", border: "1px solid #e8ebf2", boxShadow: "0 6px 30px rgba(16,50,207,0.06)" }}>
              <div style={{ fontFamily: SANS, fontSize: 17, fontWeight: 700, color: DARK, marginBottom: 22 }}>
                <GenericEditableText sectionId={sectionId} field="companyName" value={companyName} tag="span" />
              </div>
              <InfoRow icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />{", "}
                <GenericEditableText sectionId={sectionId} field="city" value={city} tag="span" />
              </InfoRow>
              <InfoRow icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}>
                <a href={`tel:${phone.replace(/\s/g,"")}`} style={{ color: DARK, textDecoration: "none" }}>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
                {phone2 && <><br /><a href={`tel:${phone2.replace(/\s/g,"")}`} style={{ color: DARK, textDecoration: "none" }}><GenericEditableText sectionId={sectionId} field="phone2" value={phone2} tag="span" /></a></>}
              </InfoRow>
              <InfoRow icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}>
                <a href={`mailto:${email}`} style={{ color: DARK, textDecoration: "none" }}>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              </InfoRow>
              <InfoRow icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}>
                <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
              </InfoRow>
            </div>

            {/* Mapa */}
            <div style={{ borderRadius: 20, overflow: "hidden", height: 260, flexShrink: 0, border: "1px solid #e8ebf2", boxShadow: "0 6px 30px rgba(16,50,207,0.06)" }}>
              <iframe src={mapSrc} width="100%" height="100%" style={{ border: 0, display: "block" }} loading="lazy" title="Mapa" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .r04-contact-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: clamp(24px, 4vw, 44px); align-items: start; }
        .r04-contact-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 860px) { .r04-contact-grid { grid-template-columns: 1fr; } }
        @media (max-width: 480px) { .r04-contact-row { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}

// ── reality-06-contact ────────────────────────────────────────────────────────
function ContactReality06({
  content, sectionId, isAdmin, tenantSlug,
}: { content: Record<string, unknown>; sectionId: number; isAdmin: boolean; tenantSlug?: string }) {
  const PRIMARY = "#263A82";
  const BG      = "#F0F0F8";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const title    = String(content.title    ?? "Kontaktujte mě");
  const subtitle = String(content.subtitle ?? "Rád Vám pomohu s prodejem, koupí nebo pronájmem nemovitosti.");
  const phone    = String(content.phone    ?? "704 123 456");
  const email    = String(content.email    ?? "email@demo.cz");
  const address  = String(content.address  ?? "Ukázková 123, 110 00 Praha 1");

  const [sent, setSent] = React.useState(false);

  return (
    <section id="kontakt" style={{ backgroundColor: BG, padding: "80px 0" }} data-template="reality-06-contact">
      <style>{`
        .r06-contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }
        .r06-contact-input { width: 100%; padding: 11px 14px; border: 1.5px solid #d1d5db; border-radius: 8px; font-family: inherit; font-size: 14px; color: #141414; background: #fff; outline: none; box-sizing: border-box; transition: border-color 0.18s; }
        .r06-contact-input:focus { border-color: #263A82; }
        .r06-contact-submit { width: 100%; padding: 13px; background: #263A82; color: #fff; border: none; border-radius: 8px; font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer; transition: opacity 0.18s; }
        .r06-contact-submit:hover { opacity: 0.88; }
        @media (max-width: 720px) { .r06-contact-grid { grid-template-columns: 1fr; gap: 40px; } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" }}>
        <div className="r06-contact-grid">

          {/* LEFT — info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <h2 style={{ fontFamily: SANS, fontSize: "clamp(26px,4vw,34px)", fontWeight: 700, color: PRIMARY, margin: "0 0 10px" }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
              <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.65, color: "#555", margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Phone */}
              <a href={`tel:+420${phone.replace(/\s/g,"")}`} style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: "#141414" }}>
                <span style={{ width: 42, height: 42, borderRadius: "50%", background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.93 16.92z"/></svg>
                </span>
                <div>
                  <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: "#999", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Telefon</p>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="p" style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: PRIMARY, margin: 0 }} />
                </div>
              </a>

              {/* Email */}
              <a href={`mailto:${email}`} style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: "#141414" }}>
                <span style={{ width: 42, height: 42, borderRadius: "50%", background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>
                </span>
                <div>
                  <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: "#999", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>E-mail</p>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="p" style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: PRIMARY, margin: 0 }} />
                </div>
              </a>

              {/* Address */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ width: 42, height: 42, borderRadius: "50%", background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </span>
                <div>
                  <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: "#999", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Adresa</p>
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="p" style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: "#141414", margin: 0 }} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — form */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "36px 32px", boxShadow: "0 4px 24px rgba(38,58,130,0.09)" }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
                <p style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: PRIMARY }}>Zpráva odeslána!</p>
                <p style={{ fontFamily: SANS, fontSize: 14, color: "#666" }}>Ozvu se Vám co nejdříve.</p>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); if (!isAdmin) setSent(true); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input className="r06-contact-input" type="text" placeholder="Vaše jméno *" required />
                <input className="r06-contact-input" type="tel" placeholder="Telefon *" required />
                <input className="r06-contact-input" type="email" placeholder="E-mail" />
                <textarea className="r06-contact-input" rows={4} placeholder="Zpráva — čím Vám mohu pomoci?" style={{ resize: "vertical" }} />
                <button type="submit" className="r06-contact-submit">Odeslat zprávu</button>
                <p style={{ fontFamily: SANS, fontSize: 11, color: "#aaa", margin: 0, textAlign: "center" }}>Odesláním souhlasíte se zpracováním osobních údajů dle GDPR.</p>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── autoservis-02 Contact ───────────────────────────────────────────────────
// Light #fafafa bg, 2-col: info cards vlevo + form card vpravo.
// Conditional header (showHeader). Editovatelné labely + form fields.
// Red gradient icon circles, input focus glow, CTA lift. Open Sans, #d82a2a.
// ────────────────────────────────────────────────────────────────────────────
function ContactAutoservis02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const RED  = "#d82a2a";
  const DARK = "#1a1a1a";
  const SANS = "'Open Sans', Arial, sans-serif";

  const taglineRaw = content.tagline;
  const titleRaw   = content.title;
  const tagline = taglineRaw === undefined ? "Kontaktujte nás" : String(taglineRaw);
  const title   = titleRaw === undefined ? "Domluvte si\ntermín servisu" : String(titleRaw);
  const showHeader = !!(tagline.trim() || title.trim());

  const address = String(content.address ?? "Revoluční 42, 130 00 Praha 3");
  const phone   = String(content.phone ?? "725 800 900");
  const email   = String(content.email ?? "info@demo-servis.cz");
  const facebookUrl  = String(content.facebookUrl  ?? "");
  const instagramUrl = String(content.instagramUrl ?? "");
  const hours   = String(content.hours ?? "Po–Pá 7:30–17:30, So 8:00–13:00");

  const labelAddress = String(content.labelAddress ?? "Adresa dílny");
  const labelPhone   = String(content.labelPhone ?? "Telefon");
  const labelEmail   = String(content.labelEmail ?? "E-mail");
  const labelHours   = String(content.labelHours ?? "Otevírací doba");
  const formTitle    = String(content.formTitle ?? "Poptejte servis online");
  const phName       = String(content.phName ?? "Vaše jméno");
  const phContact    = String(content.phContact ?? "Telefon nebo e-mail");
  const phVehicle    = String(content.phVehicle ?? "SPZ nebo typ vozidla");
  const phMessage    = String(content.phMessage ?? "Popište požadovaný servis");
  const submitText   = String(content.submitText ?? "Odeslat poptávku");
  const successMsg   = String(content.successMsg ?? "Děkujeme! Brzy se ozveme.");

  const [form, setForm] = React.useState({ name: "", contact: "", vehicle: "", message: "" });
  const [sent, setSent] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSent(true); };

  const infoItems = [
    { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, label: labelAddress, labelField: "labelAddress", field: "address", value: address },
    { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>, label: labelPhone, labelField: "labelPhone", field: "phone", value: phone, href: `tel:${phone.replace(/\s/g, "")}` },
    { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>, label: labelEmail, labelField: "labelEmail", field: "email", value: email, href: `mailto:${email}` },
    { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: labelHours, labelField: "labelHours", field: "hours", value: hours },
  ].filter(item => item.value.trim());

  return (
    <section id={String(content.id ?? "kontakt")} style={{ backgroundColor: "#fafafa", fontFamily: SANS, padding: "clamp(72px,10vw,112px) 0" }} data-template="autoservis-02">
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        {/* Header — conditional */}
        {showHeader && (
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ width: 28, height: 2, background: RED, display: "inline-block", borderRadius: 1 }} aria-hidden="true" />
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: RED, letterSpacing: "2.5px", textTransform: "uppercase" }} />
              <span style={{ width: 28, height: 2, background: RED, display: "inline-block", borderRadius: 1 }} aria-hidden="true" />
            </div>
            <h2 style={{ fontFamily: SANS, fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, color: DARK, margin: 0, lineHeight: 1.2, whiteSpace: "pre-line", letterSpacing: "-0.3px" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          </div>
        )}

        <div className="a02c-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px,5vw,72px)", alignItems: "start" }}>
          {/* Left: contact info cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {infoItems.map((item, i) => {
              const inner = (
                <div className="a02c-info" style={{ display: "flex", gap: 16, alignItems: "center", padding: "20px 24px", backgroundColor: "#fff", borderRadius: 12, border: "1px solid #eee", position: "relative", overflow: "hidden" }}>
                  <div className="a02c-info-accent" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 0, background: RED, transition: "width .25s ease" }} aria-hidden="true" />
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${RED} 0%, #b21f1f 100%)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(216,42,42,0.2)", position: "relative", zIndex: 1 }}>
                    {item.icon}
                  </div>
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 3 }}>
                      <GenericEditableText sectionId={sectionId} field={item.labelField} value={item.label} tag="span" />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: DARK }}>
                      <GenericEditableText sectionId={sectionId} field={item.field} value={item.value} tag="span" />
                    </div>
                  </div>
                </div>
              );
              return item.href ? (
                <a key={i} href={item.href} style={{ textDecoration: "none" }}>{inner}</a>
              ) : (
                <div key={i}>{inner}</div>
              );
            })}
            {(facebookUrl || instagramUrl) && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                {facebookUrl && (
                  <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 10, backgroundColor: RED, color: "#fff", textDecoration: "none" }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/></svg>
                  </a>
                )}
                {instagramUrl && (
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 10, backgroundColor: RED, color: "#fff", textDecoration: "none" }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1zm0 3.4a6.4 6.4 0 1 0 0 12.8 6.4 6.4 0 0 0 0-12.8zm0 10.6a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4zm6.6-10.9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right: form card */}
          <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: "clamp(28px,4vw,44px)", boxShadow: "0 8px 32px rgba(0,0,0,0.07)", border: "1px solid #eee" }}>
            <h3 style={{ fontFamily: SANS, fontSize: 22, fontWeight: 900, color: DARK, margin: "0 0 24px" }}>
              <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" />
            </h3>
            {sent ? (
              <div style={{ padding: "32px 0", textAlign: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg, ${RED}, #b21f1f)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: DARK }}>
                  <GenericEditableText sectionId={sectionId} field="successMsg" value={successMsg} tag="span" />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input className="a02c-input" placeholder={phName} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                  style={{ width: "100%", padding: "14px 16px", border: "1px solid #e0e0e0", borderRadius: 8, fontFamily: SANS, fontSize: 14.5, color: DARK, outline: "none", boxSizing: "border-box" as const, transition: "border-color .2s ease, box-shadow .2s ease" }}
                />
                <input className="a02c-input" placeholder={phContact} value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} required
                  style={{ width: "100%", padding: "14px 16px", border: "1px solid #e0e0e0", borderRadius: 8, fontFamily: SANS, fontSize: 14.5, color: DARK, outline: "none", boxSizing: "border-box" as const, transition: "border-color .2s ease, box-shadow .2s ease" }}
                />
                <input className="a02c-input" placeholder={phVehicle} value={form.vehicle} onChange={e => setForm({...form, vehicle: e.target.value})}
                  style={{ width: "100%", padding: "14px 16px", border: "1px solid #e0e0e0", borderRadius: 8, fontFamily: SANS, fontSize: 14.5, color: DARK, outline: "none", boxSizing: "border-box" as const, transition: "border-color .2s ease, box-shadow .2s ease" }}
                />
                <textarea className="a02c-input" placeholder={phMessage} value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                  style={{ width: "100%", padding: "14px 16px", border: "1px solid #e0e0e0", borderRadius: 8, fontFamily: SANS, fontSize: 14.5, color: DARK, outline: "none", boxSizing: "border-box" as const, minHeight: 110, resize: "vertical", transition: "border-color .2s ease, box-shadow .2s ease" }}
                />
                <button type="submit" className="a02c-submit"
                  style={{ width: "100%", padding: "16px", backgroundColor: RED, color: "#fff", fontFamily: SANS, fontSize: 15.5, fontWeight: 800, border: "none", borderRadius: 8, cursor: "pointer", letterSpacing: ".2px", boxShadow: "0 8px 22px rgba(216,42,42,0.28)" }}
                >
                  <GenericEditableText sectionId={sectionId} field="submitText" value={submitText} tag="span" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── autoservis-01-contact ─────────────────────────────────────────────────────
// Tmavé bg #111111, 2-col: vlevo info + mapa, vpravo formulář; orange akcenty
function ContactAutoservis01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const ORANGE = "#FFA500";
  const DARK   = "#111111";
  const LIGHT  = "#ffffff";
  const MUTED  = "rgba(255,255,255,0.65)";
  const SANS   = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });

  // Conditional header — na /kontakt subpage se vyprázdní → banner nese titulek
  const taglineRaw = (content as Record<string, unknown>).tagline;
  const titleRaw   = (content as Record<string, unknown>).title;
  const tagline = taglineRaw === undefined ? "Kde nás najdete" : String(taglineRaw);
  const title   = titleRaw   === undefined ? "Kontakt\na objednávka" : String(titleRaw);
  const showHeader = !!(tagline.trim() || title.trim());
  const address = String(content.address ?? "");
  const phone   = String(content.phone   ?? "");
  const email   = String(content.email   ?? "");
  const facebookUrl  = String(content.facebookUrl  ?? "");
  const instagramUrl = String(content.instagramUrl ?? "");
  const hours   = String(content.hours   ?? "");
  const mapUrl  = String(content.mapEmbedUrl ?? "");

  // Editovatelné labely
  const labelAddress = String(content.labelAddress ?? "Adresa");
  const labelPhone   = String(content.labelPhone   ?? "Telefon");
  const labelEmail   = String(content.labelEmail   ?? "E-mail");
  const labelHours   = String(content.labelHours   ?? "Otevírací doba");
  // Editovatelný formulář
  const formTitle    = String(content.formTitle    ?? "Objednejte se online");
  const phName       = String(content.phName       ?? "Jméno a příjmení");
  const phPhone      = String(content.phPhone      ?? "Telefon");
  const phEmail      = String(content.phEmail      ?? "E-mail");
  const phMessage    = String(content.phMessage    ?? "Typ vozidla a popis závady");
  const submitText   = String(content.submitText   ?? "Odeslat objednávku");
  const sendingText  = String(content.sendingText  ?? "Odesílám…");
  const successTitle = String(content.successTitle ?? "Zpráva odeslána!");
  const successText  = String(content.successText  ?? "Ozveme se vám co nejdříve.");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    await new Promise(r => setTimeout(r, 800));
    setStatus("success");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    padding: "13px 16px", background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.18)", borderRadius: 6,
    color: LIGHT, fontFamily: SANS, fontSize: 15, outline: "none",
    transition: "border-color .2s ease, background-color .2s ease",
  };

  const infoRows: Array<{ key: string; icon: React.ReactElement; label: string; labelField: string; field: string; value: string; href?: string }> = [
    address ? { key: "address", label: labelAddress, labelField: "labelAddress", field: "address", value: address, icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    ) } : null,
    phone ? { key: "phone", label: labelPhone, labelField: "labelPhone", field: "phone", value: phone, href: `tel:${phone.replace(/\s/g, "")}`, icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.95 12 19.79 19.79 0 0 1 1.92 3.38 2 2 0 0 1 3.89 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    ) } : null,
    email ? { key: "email", label: labelEmail, labelField: "labelEmail", field: "email", value: email, href: `mailto:${email}`, icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>
    ) } : null,
    hours ? { key: "hours", label: labelHours, labelField: "labelHours", field: "hours", value: hours, icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    ) } : null,
  ].filter(Boolean) as Array<{ key: string; icon: React.ReactElement; label: string; labelField: string; field: string; value: string; href?: string }>;

  return (
    <section id={String(content.id ?? "kontakt")} style={{ position: "relative", backgroundColor: DARK, padding: "clamp(64px,9vw,104px) 0", overflow: "hidden" }} data-template="autoservis-01-contact">
      {/* Orange radial glow backdrop */}
      <div aria-hidden="true" style={{ position: "absolute", top: "-20%", right: "-10%", width: "50%", height: "80%", background: "radial-gradient(circle, rgba(255,165,0,0.14), transparent 70%)", pointerEvents: "none" }} />
      <style>{`
        .a01-contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px,6vw,80px); position: relative; }
        @media (max-width: 768px) { .a01-contact-grid { grid-template-columns: 1fr; } }
        .a01-contact-input:focus { border-color: ${ORANGE} !important; background: rgba(255,255,255,0.10) !important; }
        .a01-contact-input:hover { border-color: rgba(255,255,255,0.32); }
        .a01-contact-input::placeholder { color: rgba(255,255,255,0.35); }
        .a01-contact-row { transition: transform .25s cubic-bezier(.4,0,.2,1); }
        .a01-contact-row:hover { transform: translateX(4px); }
        .a01-contact-ic { transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease; }
        .a01-contact-row:hover .a01-contact-ic { transform: scale(1.08) rotate(-6deg); box-shadow: 0 6px 16px rgba(255,165,0,.4); }
        .a01-contact-val { transition: color .2s ease; }
        .a01-contact-row:hover .a01-contact-val { color: ${ORANGE}; }
        .a01-contact-submit { transition: transform .25s cubic-bezier(.4,0,.2,1), box-shadow .25s ease, background-color .25s ease; }
        .a01-contact-submit svg { transition: transform .28s cubic-bezier(.34,1.56,.64,1); }
        .a01-contact-submit:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(255,165,0,.44); background-color: #ffb42e; }
        .a01-contact-submit:not(:disabled):hover svg { transform: translateX(4px); }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <div className="a01-contact-grid">
          {/* Left: info */}
          <div>
            {showHeader && (
              <>
                <p style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE, margin: "0 0 14px" }}>
                  <span aria-hidden="true" style={{ width: 30, height: 3, background: ORANGE, borderRadius: 2 }} />
                  <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
                </p>
                <h2 style={{ fontFamily: SANS, fontSize: "clamp(27px,3.4vw,40px)", fontWeight: 800, color: LIGHT, margin: "0 0 36px", lineHeight: 1.16, letterSpacing: "-0.02em", whiteSpace: "pre-line" }}>
                  <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
                </h2>
              </>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 36 }}>
              {infoRows.map((row) => (
                <div key={row.key} className="a01-contact-row" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span className="a01-contact-ic" style={{ width: 42, height: 42, borderRadius: "50%", backgroundColor: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 3px 10px rgba(255,165,0,.28)" }}>
                    {row.icon}
                  </span>
                  <div>
                    <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: ORANGE, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>
                      <GenericEditableText sectionId={sectionId} field={row.labelField} value={row.label} tag="span" />
                    </div>
                    {row.href ? (
                      <a href={row.href} className="a01-contact-val" style={{ fontFamily: SANS, fontSize: 15.5, color: LIGHT, textDecoration: "none" }}>
                        <GenericEditableText sectionId={sectionId} field={row.field} value={row.value} tag="span" />
                      </a>
                    ) : (
                      <div className="a01-contact-val" style={{ fontFamily: SANS, fontSize: 15.5, color: LIGHT }}>
                        <GenericEditableText sectionId={sectionId} field={row.field} value={row.value} tag="span" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {(facebookUrl || instagramUrl) && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                {facebookUrl && (
                  <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50%", backgroundColor: ORANGE, color: DARK, textDecoration: "none", transition: "transform .2s ease, opacity .2s ease" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/></svg>
                  </a>
                )}
                {instagramUrl && (
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50%", backgroundColor: ORANGE, color: DARK, textDecoration: "none", transition: "transform .2s ease, opacity .2s ease" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1zm0 3.4a6.4 6.4 0 1 0 0 12.8 6.4 6.4 0 0 0 0-12.8zm0 10.6a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4zm6.6-10.9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>
                  </a>
                )}
              </div>
            )}

            {mapUrl && (
              <div style={{ borderRadius: 10, overflow: "hidden", height: 220, border: "1px solid rgba(255,255,255,0.12)" }}>
                <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0, display: "block" }} loading="lazy" />
              </div>
            )}
          </div>

          {/* Right: form */}
          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "clamp(28px,4vw,44px) clamp(24px,3vw,40px)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ fontFamily: SANS, fontSize: 22, fontWeight: 800, color: LIGHT, margin: "0 0 28px" }}>
              <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" />
            </h3>
            {status === "success" ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 6px 20px rgba(255,165,0,.4)" }}>
                  <svg width="26" height="20" viewBox="0 0 26 20" fill="none"><path d="M2 10L10 18L24 2" stroke="#111" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 17, fontWeight: 700, color: LIGHT, margin: "0 0 8px" }}>
                  <GenericEditableText sectionId={sectionId} field="successTitle" value={successTitle} tag="span" />
                </p>
                <p style={{ fontFamily: SANS, fontSize: 15, color: MUTED, margin: 0 }}>
                  <GenericEditableText sectionId={sectionId} field="successText" value={successText} tag="span" />
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <input className="a01-contact-input" style={inputStyle} placeholder={phName} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                <input className="a01-contact-input" style={inputStyle} type="tel" placeholder={phPhone} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                <input className="a01-contact-input" style={inputStyle} type="email" placeholder={phEmail} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                <textarea className="a01-contact-input" style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} placeholder={phMessage} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
                <button type="submit" disabled={status === "sending"} className="a01-contact-submit"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "15px 32px", backgroundColor: ORANGE, color: DARK, fontFamily: SANS, fontSize: 15, fontWeight: 800, border: "none", borderRadius: 6, cursor: status === "sending" ? "default" : "pointer", opacity: status === "sending" ? 0.7 : 1, boxShadow: "0 6px 18px rgba(255,165,0,.3)" }}>
                  {status === "sending" ? sendingText : (
                    <>
                      {submitText}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── autoservis-03-contact ─────────────────────────────────────────────────────
function ContactAutoservis03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const ORANGE = "#f97316";

  const taglineRaw = (content as Record<string, unknown>).tagline;
  const titleRaw   = (content as Record<string, unknown>).title;
  const tagline  = taglineRaw === undefined ? "Kontaktujte nás" : String(taglineRaw);
  const title    = titleRaw   === undefined ? "Objednejte se předem" : String(titleRaw);
  const showHeader = !!(tagline.trim() || title.trim());
  const note     = (content.note as string)         || "";
  const address  = (content.address as string)      || "";
  const phone    = (content.phone as string)        || "";
  const email    = (content.email as string)        || "";
  const hours    = (content.hours as string)        || "";
  const whatsapp = (content.whatsapp as string)     || "";
  const whatsappText = String(content.whatsappText ?? "Napsat na WhatsApp");
  const facebookUrl  = (content.facebookUrl as string)  || "";
  const instagramUrl = (content.instagramUrl as string) || "";
  const formTitle    = (content.formTitle as string)    || "Rezervace termínu";
  const formSubtitle = (content.formSubtitle as string) || "";
  const services = (content.services as string[])   || [];

  // Editovatelné labely / placeholdery
  const labelAddress = String(content.labelAddress ?? "Adresa");
  const labelPhone   = String(content.labelPhone   ?? "Telefon");
  const labelEmail   = String(content.labelEmail   ?? "E-mail");
  const labelHours   = String(content.labelHours   ?? "Provozní doba");
  const labelName    = String(content.labelName    ?? "Jméno a příjmení");
  const labelForm    = String(content.labelFormPhone ?? "Telefon");
  const labelEmailF  = String(content.labelFormEmail ?? "E-mail");
  const labelService = String(content.labelService ?? "Typ služby");
  const labelMessage = String(content.labelMessage ?? "Zpráva (nepovinné)");
  const phName    = String(content.phName    ?? "Jan Novák");
  const phPhone   = String(content.phPhone   ?? "+420 704 123 456");
  const phEmail   = String(content.phEmail   ?? "vas@email.cz");
  const phMessage = String(content.phMessage ?? "Popište problém nebo dotaz…");
  const servicePh = String(content.servicePlaceholder ?? "Vyberte službu…");
  const submitText  = String(content.submitText  ?? "Odeslat rezervaci");
  const successTitle = String(content.successTitle ?? "Rezervace odeslána!");
  const successText  = String(content.successText  ?? "Brzy se vám ozveme s potvrzením termínu.");

  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", service: "", message: "" });

  const secRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  const infoItems = [
    { icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
      ), field: "address", label: labelAddress, labelField: "labelAddress", value: address },
    { icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.47 2 2 0 0 1 3.62 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.09 6.09l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
        </svg>
      ), field: "phone", label: labelPhone, labelField: "labelPhone", value: phone, href: `tel:+420${phone.replace(/\s/g, "")}` },
    { icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
        </svg>
      ), field: "email", label: labelEmail, labelField: "labelEmail", value: email, href: `mailto:${email}` },
    { icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ), field: "hours", label: labelHours, labelField: "labelHours", value: hours },
  ];

  return (
    <section
      ref={secRef}
      id={(content.id as string) || "kontakt"}
      data-template="autoservis-03"
      className={`a03-ct${inView ? " a03-in" : ""}`}
    >
      <style>{`
        .a03-eyebrow { display: inline-flex; align-items: center; gap: 10px; font-family: 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif; font-size: 12.5px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: #f97316; margin-bottom: 14px; }
        .a03-eyebrow-bar { width: 26px; height: 2px; background: linear-gradient(to right,#f97316,#c2410c); border-radius: 2px; flex-shrink: 0; }

        .a03-ct { position: relative; background: #0d0d0d; padding: clamp(72px,9vw,110px) 24px; overflow: hidden; font-family: 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif; }
        .a03-ct-glow { position: absolute; top: -220px; right: -160px; width: 560px; height: 560px; background: radial-gradient(circle, rgba(249,115,22,0.09) 0%, transparent 65%); pointer-events: none; }
        .a03-ct-wrap { max-width: 1160px; margin: 0 auto; position: relative; }
        .a03-ct-head { text-align: center; max-width: 640px; margin: 0 auto clamp(40px,5vw,56px); }
        .a03-ct-h2 { font-family: 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif; font-size: clamp(1.8rem,3.4vw,2.7rem); font-weight: 800; color: #ffffff; letter-spacing: -0.5px; line-height: 1.15; margin: 0; }
        .a03-ct-note { font-size: 15px; line-height: 1.7; color: #9ca3af; margin: 14px 0 0; }
        .a03-ct-grid { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: clamp(32px,5vw,64px); align-items: start; }
        .a03-ct-info { display: flex; flex-direction: column; gap: 24px; opacity: 0; transform: translateY(24px); transition: opacity .6s ease, transform .6s ease; }
        .a03-ct.a03-in .a03-ct-info { opacity: 1; transform: none; }
        .a03-ct-info-item { display: flex; align-items: flex-start; gap: 16px; }
        .a03-ct-info-icon { width: 46px; height: 46px; border-radius: 12px; background: rgba(249,115,22,0.12); color: #f97316; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .a03-ct-info-label { font-size: 12px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase; color: #6b7280; margin-bottom: 4px; }
        .a03-ct-info-val { font-size: 15.5px; font-weight: 600; color: #e5e7eb; line-height: 1.5; }
        .a03-ct-info-link { text-decoration: none; transition: color .2s; }
        .a03-ct-info-link:hover { color: #f97316; }
        .a03-ct-wa { display: inline-flex; align-items: center; gap: 10px; align-self: flex-start; margin-top: 4px; padding: 12px 22px; border-radius: 999px; border: 1px solid #2c2c2c; background: #141414; color: #22c55e; font-size: 14px; font-weight: 700; text-decoration: none; transition: border-color .2s, transform .2s; }
        .a03-ct-wa:hover { border-color: rgba(34,197,94,0.5); transform: translateY(-2px); }
        .a03-ct-social { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
        .a03-ct-soc { display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 999px; border: 1px solid #2c2c2c; background: #141414; color: #f97316; text-decoration: none; transition: border-color .2s, transform .2s; }
        .a03-ct-soc:hover { border-color: rgba(249,115,22,0.5); transform: translateY(-2px); }
        .a03-ct-form { background: #141414; border: 1px solid #232323; border-radius: 20px; padding: clamp(26px,3.4vw,38px); opacity: 0; transform: translateY(24px); transition: opacity .6s ease .12s, transform .6s ease .12s; }
        .a03-ct.a03-in .a03-ct-form { opacity: 1; transform: none; }
        .a03-ct-form-title { font-family: 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif; font-size: 20px; font-weight: 800; color: #ffffff; margin: 0 0 6px; letter-spacing: -0.2px; }
        .a03-ct-form-sub { font-size: 14px; color: #9ca3af; margin: 0 0 20px; line-height: 1.6; }
        .a03-ct-fields { display: flex; flex-direction: column; gap: 16px; margin-top: 14px; }
        .a03-ct-label { display: block; font-size: 12.5px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #9ca3af; margin-bottom: 7px; }
        .a03-ct-input { width: 100%; box-sizing: border-box; background: #0d0d0d; border: 1px solid #2c2c2c; border-radius: 11px; color: #ffffff; font-family: 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif; font-size: 14.5px; padding: 13px 15px; outline: none; transition: border-color .2s, box-shadow .2s; }
        .a03-ct-input::placeholder { color: #6b7280; }
        .a03-ct-input:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
        select.a03-ct-input { appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%23f97316' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 15px center; }
        .a03-ct-submit { position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 9px; background: linear-gradient(to right,#f97316,#ea6c08); color: #0a0a0a; font-family: 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif; font-size: 15px; font-weight: 800; letter-spacing: 0.4px; border: 0; cursor: pointer; padding: 15px 28px; border-radius: 999px; margin-top: 6px; transition: transform .2s, box-shadow .25s; }
        .a03-ct-submit:hover { transform: translateY(-2px); box-shadow: 0 14px 34px rgba(249,115,22,0.35); }
        .a03-ct-success { text-align: center; padding: 34px 10px 22px; }
        .a03-ct-success-ic { width: 62px; height: 62px; border-radius: 50%; background: rgba(34,197,94,0.14); color: #22c55e; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .a03-ct-success-t { font-size: 18px; font-weight: 800; color: #ffffff; margin: 0 0 6px; }
        .a03-ct-success-s { font-size: 14px; color: #9ca3af; margin: 0; }
        @media (max-width: 900px) { .a03-ct-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div aria-hidden="true" className="a03-ct-glow" />
      <div className="a03-ct-wrap">
        {showHeader && (
          <div className="a03-ct-head">
            {tagline.trim() && (
              <span className="a03-eyebrow">
                <span aria-hidden="true" className="a03-eyebrow-bar" />
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </span>
            )}
            {title.trim() && (
              <h2 className="a03-ct-h2" style={{ whiteSpace: "pre-line" }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {note && (
              <p className="a03-ct-note">
                <GenericEditableText sectionId={sectionId} field="note" value={note} tag="span" />
              </p>
            )}
          </div>
        )}

        <div className="a03-ct-grid">
          {/* Left: contact info */}
          <div className="a03-ct-info">
            {infoItems.map((item, i) => (
              <div key={i} className="a03-ct-info-item">
                <div className="a03-ct-info-icon">{item.icon}</div>
                <div>
                  <div className="a03-ct-info-label">
                    <GenericEditableText sectionId={sectionId} field={item.labelField} value={item.label} tag="span" />
                  </div>
                  {item.href
                    ? <a href={item.href} className="a03-ct-info-val a03-ct-info-link"><GenericEditableText sectionId={sectionId} field={item.field} value={item.value} tag="span" /></a>
                    : <div className="a03-ct-info-val"><GenericEditableText sectionId={sectionId} field={item.field} value={item.value} tag="span" /></div>
                  }
                </div>
              </div>
            ))}

            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="a03-ct-wa">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.555 4.122 1.527 5.857L0 24l6.27-1.502A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.81 9.81 0 0 1-5.001-1.366l-.36-.213-3.718.89.929-3.62-.234-.372A9.808 9.808 0 0 1 2.182 12C2.182 6.579 6.579 2.182 12 2.182S21.818 6.579 21.818 12 17.421 21.818 12 21.818z"/>
                </svg>
                <GenericEditableText sectionId={sectionId} field="whatsappText" value={whatsappText} tag="span" />
              </a>
            )}

            {(facebookUrl || instagramUrl) && (
              <div className="a03-ct-social">
                {facebookUrl && (
                  <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="a03-ct-soc">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/></svg>
                  </a>
                )}
                {instagramUrl && (
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="a03-ct-soc">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1zm0 3.4a6.4 6.4 0 1 0 0 12.8 6.4 6.4 0 0 0 0-12.8zm0 10.6a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4zm6.6-10.9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right: booking form */}
          <div className="a03-ct-form">
            <h3 className="a03-ct-form-title">
              <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" />
            </h3>
            {formSubtitle && (
              <p className="a03-ct-form-sub">
                <GenericEditableText sectionId={sectionId} field="formSubtitle" value={formSubtitle} tag="span" />
              </p>
            )}

            {sent ? (
              <div className="a03-ct-success">
                <div className="a03-ct-success-ic">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p className="a03-ct-success-t">{successTitle}</p>
                <p className="a03-ct-success-s">{successText}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="a03-ct-fields">
                <div>
                  <label className="a03-ct-label"><GenericEditableText sectionId={sectionId} field="labelName" value={labelName} tag="span" /></label>
                  <input type="text" placeholder={phName} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="a03-ct-input" />
                </div>
                <div>
                  <label className="a03-ct-label"><GenericEditableText sectionId={sectionId} field="labelFormPhone" value={labelForm} tag="span" /></label>
                  <input type="tel" placeholder={phPhone} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="a03-ct-input" />
                </div>
                <div>
                  <label className="a03-ct-label"><GenericEditableText sectionId={sectionId} field="labelFormEmail" value={labelEmailF} tag="span" /></label>
                  <input type="email" placeholder={phEmail} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="a03-ct-input" />
                </div>

                {services.length > 0 && (
                  <div>
                    <label className="a03-ct-label"><GenericEditableText sectionId={sectionId} field="labelService" value={labelService} tag="span" /></label>
                    <select value={form.service} onChange={e => setForm(p => ({ ...p, service: e.target.value }))} className="a03-ct-input" style={{ color: form.service ? "#fff" : "#6b7280" }}>
                      <option value="">{servicePh}</option>
                      {services.map((s, i) => <option key={i} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label className="a03-ct-label"><GenericEditableText sectionId={sectionId} field="labelMessage" value={labelMessage} tag="span" /></label>
                  <textarea rows={3} placeholder={phMessage} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className="a03-ct-input" style={{ resize: "vertical" }} />
                </div>

                <button type="submit" className="a03-ct-submit">
                  <GenericEditableText sectionId={sectionId} field="submitText" value={submitText} tag="span" style={{ position: "relative", zIndex: 1 }} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactDental01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const TEAL  = "#14a2a8";
  const DARK  = "#1c2335";
  const MUTED = "#6b7280";
  const SURF  = "#f7f9f9";
  const FONT  = "'Montserrat', 'Arial', sans-serif";

  const kicker       = String(content.kicker       ?? "Kontakt");
  const heading      = String(content.heading      ?? "Kontaktujte nás");
  const phone        = String(content.phone        ?? "+420 704 123 456");
  const email        = String(content.email        ?? "info@demo.cz");
  const address      = String(content.address      ?? "Ukázková 123, Praha 1");
  const hours        = String(content.hours        ?? "Po–Pá 8:00–18:00");
  const ctaText      = String(content.ctaText      ?? "Objednat se online");
  const bookingEmail = String(content.bookingEmail ?? content.ctaHref ?? "rezervace@demo.cz");

  return (
    <section
      id="kontakt"
      data-section-type="contact"
      data-variant="dental-01-contact"
      style={{ backgroundColor: SURF, fontFamily: FONT, padding: "clamp(64px,8vw,100px) 0" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px,5vw,60px)" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(40px,6vw,64px)" }}>
          <span style={{ display: "inline-block", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: TEAL, marginBottom: 12 }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </span>
          <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", fontWeight: 800, color: DARK, margin: 0, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <div aria-hidden style={{ width: 48, height: 3, background: TEAL, borderRadius: 2, margin: "18px auto 0" }} />
        </div>

        {/* 2-col: info cards + booking CTA */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(340px,100%),1fr))", gap: "clamp(24px,4vw,48px)", alignItems: "start" }}>

          {/* Info cards */}
          <div style={{ display: "grid", gap: 16 }}>
            {[
              { icon: <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill={TEAL}/>, label: "Telefon", href: `tel:${phone.replace(/\s/g,"")}`, field: "phone", value: phone },
              { icon: <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" fill={TEAL}/>, label: "E-mail", href: `mailto:${email}`, field: "email", value: email },
              { icon: <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill={TEAL}/>, label: "Adresa", href: undefined, field: "address", value: address },
              { icon: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z" fill={TEAL}/>, label: "Ordinační hodiny", href: undefined, field: "hours", value: hours },
            ].map(({ icon, label, href, field, value }) => (
              <div key={field} style={{ background: "#fff", borderRadius: 12, padding: "22px 24px", display: "flex", alignItems: "center", gap: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <span style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", background: `${TEAL}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>{icon}</svg>
                </span>
                <div>
                  <div style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: 3 }}>{label}</div>
                  {href ? (
                    <a href={href} style={{ fontSize: "1rem", fontWeight: 700, color: DARK, textDecoration: "none" }}>
                      <GenericEditableText sectionId={sectionId} field={field} value={value} tag="span" />
                    </a>
                  ) : (
                    <span style={{ fontSize: "1rem", fontWeight: 700, color: DARK }}>
                      <GenericEditableText sectionId={sectionId} field={field} value={value} tag="span" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Booking CTA card */}
          <div style={{ background: DARK, borderRadius: 16, padding: "clamp(32px,5vw,48px) clamp(24px,4vw,40px)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20, boxShadow: "0 8px 32px rgba(28,35,53,0.18)" }}>
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden>
              <circle cx="26" cy="26" r="25" fill={`${TEAL}22`} />
              <path d="M26 11c-3.2 0-5.8 1.3-7.5 3.4C16.8 12.3 14.2 11 11 11 7.1 11 4 14.7 4 19.5c0 4.5 2.1 8.5 4.8 11.8C11.5 34.6 13.7 41 14.8 43c.5 1.6 1.6 1.6 2.1 0 .9-2.7 2.2-5.4 3.2-7 .5-.9 1.6-1.6 3.2-1.6s2.7.7 3.2 1.6c1 1.6 2.3 4.3 3.2 7 .5 1.6 1.6 1.6 2.1 0 1.1-2 3.3-8.4 6-11.7C40.9 28 43 24 43 19.5 43 14.7 39.9 11 36 11c-3.2 0-5.8 1.3-7.5 3.4C26.8 12.3 26 11 26 11z" fill={TEAL}/>
            </svg>

            <div>
              <h3 style={{ fontSize: "clamp(1.15rem,2.5vw,1.5rem)", fontWeight: 800, color: "#fff", margin: "0 0 12px", lineHeight: 1.2 }}>Objednejte se online</h3>
              <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.6 }}>
                Napište nám e-mail a my vás objednáme na nejbližší volný termín.
              </p>
            </div>

            <a
              href={`mailto:${bookingEmail}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 36px", backgroundColor: TEAL, color: "#fff", fontFamily: FONT, fontSize: "0.92rem", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", borderRadius: 10, textDecoration: "none", transition: "opacity 0.18s", width: "100%", justifyContent: "center" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>

            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>
              <GenericEditableText sectionId={sectionId} field="bookingEmail" value={bookingEmail} tag="span" />
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

// ── ortho-01-contact ──────────────────────────────────────────────────────────
// Porcelain V3 „Kde nás najdete": wash bg, 2 pobočkové porcelain karty
// (city/address/zip/phone/email/hours[]) s hairline řádky hodin + teal CTA.
function ContactOrtho01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  type Hour  = { days: string; time: string };
  type Branch = { city: string; address: string; zip: string; phone: string; email: string; hours: Hour[] };

  const title    = String(content.title   ?? "Kde nás najdete");
  const kicker   = String(content.kicker  ?? "Jsme v Praze a v Brně");
  const ctaText  = String(content.ctaText ?? "Objednat se online");
  const ctaHrefRaw = String(content.ctaHref ?? "/#konzultace");
  const ctaHref = (!tenantSlug || !ctaHrefRaw.startsWith("/"))
    ? ctaHrefRaw
    : `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${ctaHrefRaw === "/" ? "" : ctaHrefRaw}`;
  const branches = (content.branches as Branch[]) ?? [];

  return (
    <section id="kontakt" data-section-type="contact" data-variant="ortho-01-contact" className="o01c-section">
      <style>{`
        .o01c-section {
          background: #E9F4F1;
          padding: clamp(3.5rem, 8vw, 6.5rem) 0;
          font-family: 'Outfit', sans-serif;
        }
        .o01c-inner { max-width: 76rem; margin: 0 auto; padding: 0 clamp(1.25rem, 4vw, 2.5rem); }
        .o01c-head { text-align: center; margin-bottom: clamp(2.2rem, 5vw, 3.4rem); }
        .o01c-eyebrow {
          display: flex; align-items: center; justify-content: center; gap: 0.7rem;
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.16em;
          text-transform: uppercase; color: var(--color-primary, #0F766E); margin: 0 0 1rem;
        }
        .o01c-eyebrow::before { content: ""; width: 28px; height: 2px; background: var(--color-primary, #0F766E); }
        .o01c-title {
          font-family: 'Young Serif', serif; font-weight: 400;
          font-size: clamp(1.9rem, 3.4vw, 2.6rem); color: var(--color-text, #14201E);
          line-height: 1.12; margin: 0 0 1.6rem; text-wrap: balance;
        }
        .o01c-cta {
          display: inline-flex; align-items: center; gap: 0.55rem;
          padding: 0.9rem 1.8rem; border-radius: 9999px;
          background: var(--color-primary, #0F766E); color: #fff;
          font-size: 0.98rem; font-weight: 600; text-decoration: none;
          box-shadow: 0 10px 24px -12px rgba(15,118,110,0.5);
          transition: background 0.25s, transform 0.25s;
        }
        .o01c-cta:hover { background: var(--color-accent, #0B5D57); transform: translateY(-2px); }
        .o01c-grid {
          display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: clamp(1.4rem, 3vw, 2.2rem); max-width: 60rem; margin: 0 auto;
        }
        .o01c-card {
          background: var(--color-surface, #ffffff); border-radius: 20px;
          border: 1px solid var(--color-border, #E4E7E3);
          padding: clamp(1.7rem, 3.5vw, 2.4rem);
          box-shadow: 0 24px 48px -32px rgba(20,32,30,0.25);
        }
        .o01c-city {
          font-family: 'Young Serif', serif; font-weight: 400; font-size: 1.45rem;
          color: var(--color-text, #14201E); margin: 0 0 0.35rem;
        }
        .o01c-addr { font-size: 0.95rem; color: var(--color-text-muted, #5F6B68); line-height: 1.6; margin: 0 0 1.1rem; }
        .o01c-links { display: flex; flex-direction: column; gap: 0.35rem; margin: 0 0 1.3rem; }
        .o01c-links a {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-size: 0.96rem; font-weight: 600; color: var(--color-primary, #0F766E);
          text-decoration: none;
        }
        .o01c-links a:hover { text-decoration: underline; }
        .o01c-hours { border-top: 1px solid var(--color-border, #E4E7E3); }
        .o01c-hour {
          display: flex; align-items: baseline; justify-content: space-between; gap: 1rem;
          padding: 0.6rem 0; border-bottom: 1px solid var(--color-border, #E4E7E3);
          font-size: 0.92rem;
        }
        .o01c-hour-days { color: var(--color-text-muted, #5F6B68); font-weight: 500; }
        .o01c-hour-time { color: var(--color-text, #14201E); font-weight: 600; white-space: nowrap; }
        @media (max-width: 760px) { .o01c-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div className="o01c-inner">
        <div className="o01c-head">
          <p className="o01c-eyebrow">
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 className="o01c-title" style={{ fontFamily: "'Young Serif', serif", color: "var(--color-text, #14201E)" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <a href={ctaHref} data-btn="primary" className="o01c-cta">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
        <div className="o01c-grid">
          {branches.map((b, i) => (
            <div className="o01c-card" key={i}>
              <h3 className="o01c-city" style={{ fontFamily: "'Young Serif', serif", color: "var(--color-text, #14201E)" }}>
                <GenericEditableText sectionId={sectionId} field={`branches.${i}.city`} value={b.city ?? ""} tag="span" />
              </h3>
              <p className="o01c-addr">
                <GenericEditableText sectionId={sectionId} field={`branches.${i}.address`} value={b.address ?? ""} tag="span" />
                {", "}
                <GenericEditableText sectionId={sectionId} field={`branches.${i}.zip`} value={b.zip ?? ""} tag="span" />
              </p>
              <div className="o01c-links">
                {b.phone && (
                  <a href={`tel:${b.phone.replace(/\s/g, "")}`}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <GenericEditableText sectionId={sectionId} field={`branches.${i}.phone`} value={b.phone ?? ""} tag="span" />
                  </a>
                )}
                {b.email && (
                  <a href={`mailto:${b.email}`}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg>
                    <GenericEditableText sectionId={sectionId} field={`branches.${i}.email`} value={b.email ?? ""} tag="span" />
                  </a>
                )}
              </div>
              <div className="o01c-hours">
                {(b.hours ?? []).map((h, j) => (
                  <div className="o01c-hour" key={j}>
                    <span className="o01c-hour-days">
                      <GenericEditableText sectionId={sectionId} field={`branches.${i}.hours.${j}.days`} value={h.days ?? ""} tag="span" />
                    </span>
                    <span className="o01c-hour-time">
                      <GenericEditableText sectionId={sectionId} field={`branches.${i}.hours.${j}.time`} value={h.time ?? ""} tag="span" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── ortho-02-contact ──────────────────────────────────────────────────────────
function ContactOrtho02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const BEIGE = "#B7B3A5";
  const DARK  = "#1a1a1a";
  const MUTED = "#777";
  const GOLD  = "#b39f6b";
  const FONT  = "'Raleway', 'Helvetica Neue', Arial, sans-serif";
  const FONT_B = "'Open Sans', 'Raleway', Arial, sans-serif";

  const eyebrowRaw = (content as Record<string,unknown>).subheading;
  const titleRaw   = (content as Record<string,unknown>).heading;
  const bodyRaw    = (content as Record<string,unknown>).body;
  const eyebrow  = eyebrowRaw === undefined ? "Kontakt" : String(eyebrowRaw);
  const title    = titleRaw   === undefined ? "Těšíme se na vaši návštěvu" : String(titleRaw);
  const body     = bodyRaw    === undefined ? "Napište nám nebo zavolejte — rádi vám poradíme a domluvíme termín." : String(bodyRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || body.trim());

  const phone       = String(content.phone       ?? "+420 222 333 444");
  const email       = String(content.email       ?? "info@harmonyortho.cz");
  const address     = String(content.address     ?? "Vinohradská 48, 120 00 Praha 2");
  const hours       = String(content.hours       ?? "Po–Pá 8:00–18:00");
  const ctaText     = String(content.ctaText     ?? "Objednat se online");
  const bookingHref = String(content.bookingHref ?? "#");
  const mapLat      = String(content.mapLat      ?? "50.0755");
  const mapLng      = String(content.mapLng      ?? "14.4378");

  const phoneLabel   = String((content as Record<string,unknown>).phoneLabel   ?? "Telefon");
  const emailLabel   = String((content as Record<string,unknown>).emailLabel   ?? "E-mail");
  const addressLabel = String((content as Record<string,unknown>).addressLabel ?? "Adresa kliniky");
  const hoursLabel   = String((content as Record<string,unknown>).hoursLabel   ?? "Ordinační hodiny");

  const mapSrc = `https://maps.google.com/maps?q=${mapLat},${mapLng}&z=15&output=embed`;

  const infoCards = [
    { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.08 4.18 2 2 0 015 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>, label: phoneLabel, field: "phoneLabel", value: phone, valueField: "phone", href: `tel:${phone.replace(/\s/g, "")}` },
    { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label: emailLabel, field: "emailLabel", value: email, valueField: "email", href: `mailto:${email}` },
    { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>, label: addressLabel, field: "addressLabel", value: address, valueField: "address", href: null },
    { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: hoursLabel, field: "hoursLabel", value: hours, valueField: "hours", href: null },
  ];

  return (
    <section
      id="kontakt"
      data-template="ortho-02"
      style={{ backgroundColor: "#fff", fontFamily: FONT }}
    >
      <div style={{ backgroundColor: "#f7f6f3", padding: "clamp(72px, 9vw, 110px) 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)" }}>
          {showHeader && (
            <div style={{ textAlign: "center", marginBottom: "clamp(48px, 6vw, 72px)" }}>
              <p style={{ fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD, marginBottom: 16 }}>
                <GenericEditableText sectionId={sectionId} field="subheading" value={eyebrow} tag="span" />
              </p>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.4rem)", fontWeight: 300, color: DARK, margin: "0 auto 16px", lineHeight: 1.3, maxWidth: 700 }}>
                <GenericEditableText sectionId={sectionId} field="heading" value={title} tag="span" />
              </h2>
              <p style={{ fontSize: "clamp(0.9rem, 1.2vw, 1.02rem)", color: MUTED, margin: 0, maxWidth: 520, marginLeft: "auto", marginRight: "auto", fontFamily: FONT_B, lineHeight: 1.7 }}>
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            </div>
          )}

          <div className="o02-ct-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "clamp(12px, 2vw, 20px)", marginBottom: "clamp(40px, 5vw, 64px)" }}>
            {infoCards.map((card, i) => (
              <div key={i} className="o02-ct-card" style={{
                backgroundColor: "#ffffff",
                border: "1px solid #edeae5",
                borderRadius: 6,
                padding: "clamp(24px, 3vw, 36px) clamp(16px, 2vw, 24px)",
                textAlign: "center",
                transition: "transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease",
              }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>{card.icon}</div>
                <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: BEIGE, margin: "0 0 8px", fontFamily: FONT }}>
                  <GenericEditableText sectionId={sectionId} field={card.field} value={card.label} tag="span" />
                </p>
                {card.href ? (
                  <a href={card.href} style={{ fontSize: "clamp(0.88rem, 1.1vw, 0.98rem)", fontWeight: 600, color: DARK, textDecoration: "none", fontFamily: FONT, transition: "color 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.color = GOLD; }}
                    onMouseLeave={e => { e.currentTarget.style.color = DARK; }}
                  >
                    <GenericEditableText sectionId={sectionId} field={card.valueField} value={card.value} tag="span" />
                  </a>
                ) : (
                  <p style={{ fontSize: "clamp(0.88rem, 1.1vw, 0.98rem)", fontWeight: 600, color: DARK, margin: 0, lineHeight: 1.5, fontFamily: FONT }}>
                    <GenericEditableText sectionId={sectionId} field={card.valueField} value={card.value} tag="span" />
                  </p>
                )}
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <a
              href={bookingHref}
              className="o02-ct-cta"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 36px",
                backgroundColor: GOLD,
                color: "#ffffff",
                fontFamily: FONT,
                fontSize: "0.82rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
                borderRadius: 999,
                textDecoration: "none",
                transition: "background-color 0.3s, transform 0.3s, box-shadow 0.3s",
              }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </div>

      <div style={{ width: "100%", height: "clamp(300px, 35vw, 480px)", overflow: "hidden" }}>
        <iframe
          src={mapSrc}
          width="100%" height="100%"
          style={{ border: 0, display: "block", filter: "grayscale(20%) saturate(0.9)" }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          title="Mapa kliniky"
        />
      </div>
    </section>
  );
}

/* ─── ContactLawyer01 ─────────────────────────────────────────── */
function ContactLawyer01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY    = "#141760";
  const CRIMSON = "#a70336";
  const HEADING = "'Raleway','Montserrat','Helvetica Neue',Arial,sans-serif";
  const BODY    = "'Open Sans','Helvetica Neue',Arial,sans-serif";

  const eyebrowRaw = content.eyebrow;
  const titleRaw   = content.title;
  const eyebrow  = eyebrowRaw === undefined ? "Kontakt" : String(eyebrowRaw);
  const title    = titleRaw   === undefined ? "Kontaktujte nás" : String(titleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim());
  const offices = Array.isArray(content.offices) ? content.offices as Array<Record<string, string>> : [];

  const formTitle  = String(content.formTitle  ?? "Napište nám");
  const nameLabel  = String(content.nameLabel  ?? "Jméno a příjmení");
  const emailLabel = String(content.emailLabel ?? "E-mailová adresa");
  const phoneLabel = String(content.phoneLabel ?? "Telefon");
  const msgLabel   = String(content.messageLabel ?? "Zpráva");
  const submitText = String(content.submitText ?? "Odeslat zprávu");
  const labels = [nameLabel, emailLabel, phoneLabel];
  const labelFields = ["nameLabel", "emailLabel", "phoneLabel"];

  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("l01ct-on"); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="kontakt"
      data-template="lawyer-01"
      data-variant="lawyer-01-contact"
      style={{ backgroundColor: "#f5f6f9", padding: "clamp(72px,9vw,110px) 0", opacity: 1 }}
    >
      <style>{`
        .l01ct-rise{opacity:0;transform:translateY(22px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1);}
        .l01ct-on .l01ct-rise{opacity:1;transform:translateY(0);}
        .l01ct-office{position:relative;background:#fff;padding:26px 24px;border-top:3px solid ${CRIMSON};box-shadow:0 2px 14px rgba(20,23,96,.07);transition:transform .28s cubic-bezier(.2,.7,.2,1),box-shadow .28s ease;overflow:hidden;}
        .l01ct-office::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:${NAVY};transform:scaleX(0);transform-origin:left;transition:transform .34s cubic-bezier(.4,0,.2,1);}
        .l01ct-office:hover{transform:translateY(-4px);box-shadow:0 18px 40px rgba(20,23,96,.14);}
        .l01ct-office:hover::before{transform:scaleX(1);}
        .l01ct-tel{color:${NAVY};transition:color .2s ease;}
        .l01ct-office:hover .l01ct-tel{color:${CRIMSON};}
        .l01ct-mail{color:${CRIMSON};transition:opacity .2s ease;}
        .l01ct-mail:hover{opacity:.7;}
        .l01ct-input{width:100%;padding:12px 15px;font-family:${BODY};font-size:.92rem;border:1px solid #e2e5ec;border-radius:2px;outline:none;box-sizing:border-box;color:#1a1a1a;background:#fff;transition:border-color .2s ease,box-shadow .2s ease;}
        .l01ct-input:focus{border-color:${NAVY};box-shadow:0 0 0 3px rgba(20,23,96,.12);}
        .l01ct-submit{position:relative;padding:14px 0;background:${NAVY};color:#fff;font-family:${BODY};font-size:.92rem;font-weight:700;border:none;border-radius:2px;cursor:pointer;letter-spacing:.05em;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;gap:9px;transition:transform .2s ease,box-shadow .24s ease;box-shadow:0 8px 20px rgba(20,23,96,.2);}
        .l01ct-submit::before{content:"";position:absolute;inset:0;background:${CRIMSON};transform:translateX(-101%);transition:transform .34s cubic-bezier(.4,0,.2,1);z-index:0;}
        .l01ct-submit > *{position:relative;z-index:1;}
        .l01ct-submit:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(167,3,54,.3);}
        .l01ct-submit:hover::before{transform:translateX(0);}
        .l01ct-submit svg{transition:transform .3s ease;}
        .l01ct-submit:hover svg{transform:translateX(4px);}
        @media (max-width: 900px) {
          .l01-contact-outer { grid-template-columns: 1fr !important; }
          .l01-contact-grid  { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 560px) {
          .l01-contact-grid  { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 32px" }}>
        {/* Header */}
        {showHeader && (
          <div className="l01ct-rise" style={{ marginBottom: 52 }}>
            {eyebrow.trim() && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span style={{ display: "block", width: 30, height: 2, background: CRIMSON }} />
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span"
                  style={{ fontFamily: BODY, fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.2em", textTransform: "uppercase", color: CRIMSON }} />
              </div>
            )}
            {title.trim() && (
              <h2 style={{ fontFamily: HEADING, fontSize: "clamp(1.8rem,3vw,2.6rem)", fontWeight: 700, color: NAVY, margin: 0, lineHeight: 1.14, letterSpacing: "-0.01em" }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
          </div>
        )}

        {/* 2-col: offices grid left, form right */}
        <div className="l01-contact-outer" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px,5vw,72px)", alignItems: "start" }}>

          {/* Offices */}
          <div className="l01ct-rise l01-contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {offices.map((o, i) => (
              <div key={i} className="l01ct-office">
                <p style={{ fontFamily: HEADING, fontSize: "1.05rem", fontWeight: 700, color: NAVY, margin: "0 0 10px" }}>
                  <GenericEditableText sectionId={sectionId} field={`offices.${i}.city`} value={o.city ?? ""} tag="span" />
                </p>
                <p style={{ fontFamily: BODY, fontSize: "0.85rem", color: "#4b5563", margin: "0 0 10px", lineHeight: 1.55 }}>
                  <GenericEditableText sectionId={sectionId} field={`offices.${i}.address`} value={o.address ?? ""} tag="span" />
                </p>
                <a href={`tel:${(o.phone ?? "").replace(/\s/g, "")}`} className="l01ct-tel" style={{ fontFamily: BODY, fontSize: "0.85rem", textDecoration: "none", display: "block", marginBottom: 3, fontWeight: 600 }}>
                  <GenericEditableText sectionId={sectionId} field={`offices.${i}.phone`} value={o.phone ?? ""} tag="span" />
                </a>
                <a href={`mailto:${o.email ?? ""}`} className="l01ct-mail" style={{ fontFamily: BODY, fontSize: "0.85rem", textDecoration: "none" }}>
                  <GenericEditableText sectionId={sectionId} field={`offices.${i}.email`} value={o.email ?? ""} tag="span" />
                </a>
              </div>
            ))}
          </div>

          {/* Contact form */}
          <div className="l01ct-rise" style={{ backgroundColor: "#fff", borderRadius: 2, padding: "clamp(28px,3vw,42px)", boxShadow: "0 6px 30px rgba(20,23,96,0.09)", borderTop: `3px solid ${NAVY}` }}>
            <h3 style={{ fontFamily: HEADING, fontSize: "1.25rem", fontWeight: 700, color: NAVY, margin: "0 0 26px" }}>
              <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" />
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              {labels.map((label, i) => (
                <div key={i}>
                  <label style={{ fontFamily: BODY, fontSize: "0.74rem", fontWeight: 700, color: "#6b7280", letterSpacing: "0.09em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                    <GenericEditableText sectionId={sectionId} field={labelFields[i]} value={label} tag="span" />
                  </label>
                  <input type={i === 1 ? "email" : i === 2 ? "tel" : "text"} className="l01ct-input" />
                </div>
              ))}
              <div>
                <label style={{ fontFamily: BODY, fontSize: "0.74rem", fontWeight: 700, color: "#6b7280", letterSpacing: "0.09em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  <GenericEditableText sectionId={sectionId} field="messageLabel" value={msgLabel} tag="span" />
                </label>
                <textarea rows={4} className="l01ct-input" style={{ resize: "vertical" }} />
              </div>
              <button type="submit" className="l01ct-submit">
                <GenericEditableText sectionId={sectionId} field="submitText" value={submitText} tag="span" />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Stavba-01 Contact ────────────────────────────────────────────────────────
function ContactStavba01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const ORANGE = "#FF6F0D";
  const DARK   = "#1a1a1a";
  const GRAY   = "#6b6b6b";
  const FONT   = "'Inter', sans-serif";

  const taglineRaw = content.tagline;
  const titleRaw   = content.title;
  const tagline   = taglineRaw === undefined ? "Napište nebo zavolejte" : String(taglineRaw);
  const title     = titleRaw   === undefined ? "Domluvme si\nkonzultaci" : String(titleRaw);
  const showHeader = !!(tagline.trim() || title.trim());
  const formTitle = String(content.formTitle ?? "Nezávazná poptávka");
  const address   = String(content.address   ?? "");
  const phone     = String(content.phone     ?? "");
  const email     = String(content.email     ?? "");
  const hours     = String(content.hours     ?? "");
  const mapEmbed  = String(content.mapEmbedUrl ?? "");

  const phoneLabel = String(content.phoneLabel ?? "Telefon");
  const emailLabel = String(content.emailLabel ?? "E-mail");
  const addressLabel = String(content.addressLabel ?? "Adresa");
  const hoursLabel = String(content.hoursLabel ?? "Provozní doba");
  const namePlaceholder = String(content.namePlaceholder ?? "Vaše jméno");
  const phonePlaceholder = String(content.phonePlaceholder ?? "Telefon");
  const messagePlaceholder = String(content.messagePlaceholder ?? "Popište váš projekt nebo dotaz…");
  const submitText = String(content.submitText ?? "Odeslat poptávku");
  const sentTitle = String(content.sentTitle ?? "Zpráva odeslána!");
  const sentText = String(content.sentText ?? "Ozveme se Vám co nejdříve.");

  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  const secRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const sec = secRef.current;
    if (!sec) return;
    const els = Array.from(sec.querySelectorAll<HTMLElement>(".s01-ct-reveal"));
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { (e.target as HTMLElement).classList.add("s01-ct-vis"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const InfoItem = ({ icon, label, value, href, field, labelField }: { icon: React.ReactNode; label: string; value: string; href?: string; field: string; labelField: string }) => (
    <div className="s01-ct-info" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <div className="s01-ct-info-ic" style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 10, backgroundColor: "rgba(255,111,13,0.10)", display: "flex", alignItems: "center", justifyContent: "center", color: ORANGE }}>
        {icon}
      </div>
      <div>
        <GenericEditableText sectionId={sectionId} field={labelField} value={label} tag="div"
          style={{ color: GRAY, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3 }} />
        {href ? (
          <a href={href} style={{ color: DARK, fontSize: "0.95rem", fontWeight: 600, textDecoration: "none" }}>
            <GenericEditableText sectionId={sectionId} field={field} value={value} tag="span" />
          </a>
        ) : (
          <div style={{ color: DARK, fontSize: "0.95rem", fontWeight: 600, whiteSpace: "pre-line" }}>
            <GenericEditableText sectionId={sectionId} field={field} value={value} tag="span" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section ref={secRef} id={String(content.id ?? "kontakt")} style={{ backgroundColor: "#ffffff", fontFamily: FONT, padding: "clamp(64px,9vw,112px) 0" }} data-template="stavba-01">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        <div className="stavba-contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>

          {/* Left — info */}
          <div className="s01-ct-reveal">
            {showHeader && tagline.trim() && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ display: "block", width: 30, height: 3, backgroundColor: ORANGE, borderRadius: 2 }} />
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="p"
                  style={{ color: ORANGE, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }} />
              </div>
            )}
            {showHeader && title.trim() && (
              <h2 style={{ color: DARK, fontSize: "clamp(26px,3.5vw,44px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 40px", whiteSpace: "pre-line" }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {phone && <InfoItem field="phone" labelField="phoneLabel" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12.25 19.79 19.79 0 0 1 1.17 3.63 2 2 0 0 1 3.15 1.45h3a2 2 0 0 1 2 1.72c.12.97.33 1.93.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.88.37 1.84.58 2.81.7A2 2 0 0 1 21 16.92z"/></svg>} label={phoneLabel} value={phone} href={`tel:+420${phone.replace(/\s/g,"")}`} />}
              {email && <InfoItem field="email" labelField="emailLabel" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>} label={emailLabel} value={email} href={`mailto:${email}`} />}
              {address && <InfoItem field="address" labelField="addressLabel" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>} label={addressLabel} value={address} />}
              {hours && <InfoItem field="hours" labelField="hoursLabel" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>} label={hoursLabel} value={hours} />}
            </div>

            {/* Optional map */}
            {mapEmbed && (
              <div style={{ marginTop: 32, borderRadius: 14, overflow: "hidden", border: "1px solid #ececec", aspectRatio: "16/9" }}>
                <iframe src={mapEmbed} title="Mapa" width="100%" height="100%" style={{ border: 0, display: "block" }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            )}
          </div>

          {/* Right — form */}
          <div className="s01-ct-reveal s01-ct-reveal-2" style={{ backgroundColor: "#f8f7f4", borderRadius: 16, padding: 40 }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "rgba(255,111,13,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: ORANGE }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <h3 style={{ color: DARK, fontFamily: FONT, fontWeight: 700, fontSize: "1.1rem", margin: "0 0 8px" }}>
                  <GenericEditableText sectionId={sectionId} field="sentTitle" value={sentTitle} tag="span" />
                </h3>
                <p style={{ color: GRAY, fontSize: "0.9rem", margin: 0 }}>
                  <GenericEditableText sectionId={sectionId} field="sentText" value={sentText} tag="span" />
                </p>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true); }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h3 style={{ color: DARK, fontFamily: FONT, fontWeight: 700, fontSize: "1.1rem", margin: "0 0 8px" }}>
                  <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" />
                </h3>
                <input type="text" className="s01-ct-input" placeholder={namePlaceholder} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                  style={{ padding: "12px 14px", borderRadius: 8, border: "1px solid #e0e0e0", fontFamily: FONT, fontSize: "0.9rem", color: DARK, backgroundColor: "#fff", outline: "none" }} />
                <input type="tel" className="s01-ct-input" placeholder={phonePlaceholder} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  style={{ padding: "12px 14px", borderRadius: 8, border: "1px solid #e0e0e0", fontFamily: FONT, fontSize: "0.9rem", color: DARK, backgroundColor: "#fff", outline: "none" }} />
                <textarea className="s01-ct-input" placeholder={messagePlaceholder} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4}
                  style={{ padding: "12px 14px", borderRadius: 8, border: "1px solid #e0e0e0", fontFamily: FONT, fontSize: "0.9rem", color: DARK, backgroundColor: "#fff", resize: "vertical", outline: "none" }} />
                <button type="submit" className="s01-ct-submit" style={{ padding: "14px 0", backgroundColor: ORANGE, color: "#fff", fontFamily: FONT, fontSize: "0.95rem", fontWeight: 700, border: "none", borderRadius: 8, cursor: "pointer", marginTop: 4, boxShadow: "0 4px 16px rgba(255,111,13,0.28)" }}>
                  <GenericEditableText sectionId={sectionId} field="submitText" value={submitText} tag="span" />
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
      <style>{`
        @media (max-width: 768px) { .stavba-contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }
      `}</style>
    </section>
  );
}
// ── legal-02-contact ─────────────────────────────────────────────────────────
// ── elektro-01-contact ────────────────────────────────────────────────────────
// Tmavé #1b1b1b bg, červený kicker, 2-col: info vlevo + formulář vpravo
// ─────────────────────────────────────────────────────────────────────────────
function ContactElektro01({ content, sectionId, isAdmin: _isAdmin, tenantSlug: _tenantSlug }: { content: Record<string, unknown>; sectionId: number; isAdmin: boolean; tenantSlug?: string }) {
  const RED   = "#dd0808";
  const DARK  = "#1b1b1b";
  const WHITE = "#ffffff";
  const FONT  = "'Montserrat', sans-serif";
  const BODY  = "'Roboto', sans-serif";

  const kickerRaw = (content as Record<string, unknown>).kicker;
  const titleRaw  = (content as Record<string, unknown>).title;
  const kicker    = kickerRaw === undefined ? "Spojte se s námi" : String(kickerRaw);
  const title     = titleRaw  === undefined ? "Domluvte si konzultaci" : String(titleRaw);
  const showHeader = !!(kicker.trim() || title.trim());
  const formTitle   = String(content.formTitle   ?? "Popište Váš projekt");
  const phone       = String(content.phone       ?? "704 123 456");
  const email       = String(content.email       ?? "info@demo.cz");
  const address     = String(content.address     ?? "Ukázková 123, 110 00 Praha 1");
  const hours       = String(content.hours       ?? "Po–Pá 8:00–18:00");
  const phoneLabel  = String((content as Record<string, unknown>).phoneLabel  ?? "Telefon");
  const emailLabel  = String((content as Record<string, unknown>).emailLabel  ?? "E-mail");
  const addressLabel = String((content as Record<string, unknown>).addressLabel ?? "Adresa");
  const hoursLabel  = String((content as Record<string, unknown>).hoursLabel  ?? "Pracovní doba");
  const submitText  = String(content.submitText  ?? "Odeslat poptávku");
  const sentMsg     = String((content as Record<string, unknown>).sentMsg ?? "Děkujeme za zprávu. Ozveme se co nejdříve!");

  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });

  const PhoneSvg = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
  const MailSvg = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
  const PinSvg = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>
    </svg>
  );
  const ClockSvg = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );

  const infoItems = [
    { icon: <PhoneSvg />, label: phoneLabel, val: phone, field: "phone", labelField: "phoneLabel" },
    { icon: <MailSvg />,  label: emailLabel,  val: email, field: "email", labelField: "emailLabel" },
    { icon: <PinSvg />,   label: addressLabel, val: address, field: "address", labelField: "addressLabel" },
    { icon: <ClockSvg />, label: hoursLabel,  val: hours, field: "hours", labelField: "hoursLabel" },
  ];

  return (
    <section id="kontakt" data-template="elektro-01"
      style={{ backgroundColor: DARK, fontFamily: FONT, padding: "clamp(64px,9vw,110px) 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>

        {showHeader && (
          <div style={{ marginBottom: 52 }}>
            {kicker.trim() && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{ width: 28, height: 2, background: RED, display: "block" }} />
                <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span"
                  style={{ color: RED, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" }} />
              </div>
            )}
            {title.trim() && (
              <h2 style={{ color: WHITE, fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 800, margin: 0, lineHeight: 1.12, fontFamily: FONT }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 60 }} className="e01-contact-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {infoItems.map(({ icon, label, val, field, labelField }) => (
              <div key={field} className="e01-contact-item" style={{ display: "flex", gap: 16, alignItems: "flex-start", transition: "transform 0.2s ease" }}>
                <div style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid rgba(221,8,8,0.3)`, flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <GenericEditableText sectionId={sectionId} field={labelField} value={label} tag="div"
                    style={{ color: RED, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4, fontFamily: FONT }} />
                  <div style={{ color: "rgba(255,255,255,0.88)", fontSize: "0.95rem", fontWeight: 500, fontFamily: BODY }}>
                    <GenericEditableText sectionId={sectionId} field={field} value={val} tag="span" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: "rgba(255,255,255,0.04)", padding: "40px 36px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ color: WHITE, fontSize: "1.15rem", fontWeight: 700, margin: "0 0 28px", fontFamily: FONT }}>
              <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" />
            </h3>
            {sent ? (
              <p style={{ color: RED, fontWeight: 600, fontSize: "1rem", fontFamily: BODY }}>
                <GenericEditableText sectionId={sectionId} field="sentMsg" value={sentMsg} tag="span" />
              </p>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true); }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <input placeholder="Jméno a příjmení" required value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="e01-input"
                  style={{ width: "100%", padding: "13px 16px", borderRadius: 0, border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.05)", color: WHITE, fontFamily: BODY, fontSize: "0.9rem", outline: "none", boxSizing: "border-box", transition: "border-color 0.25s ease" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="e01-form-row">
                  <input placeholder="Telefon" value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="e01-input"
                    style={{ width: "100%", padding: "13px 16px", borderRadius: 0, border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.05)", color: WHITE, fontFamily: BODY, fontSize: "0.9rem", outline: "none", boxSizing: "border-box", transition: "border-color 0.25s ease" }} />
                  <input placeholder="E-mail" type="email" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="e01-input"
                    style={{ width: "100%", padding: "13px 16px", borderRadius: 0, border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.05)", color: WHITE, fontFamily: BODY, fontSize: "0.9rem", outline: "none", boxSizing: "border-box", transition: "border-color 0.25s ease" }} />
                </div>
                <textarea placeholder="Popište Vaši zakázku nebo dotaz" rows={5} required value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className="e01-input"
                  style={{ width: "100%", padding: "13px 16px", borderRadius: 0, border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.05)", color: WHITE, fontFamily: BODY, fontSize: "0.9rem", outline: "none", boxSizing: "border-box", resize: "vertical", transition: "border-color 0.25s ease" }} />
                <button type="submit" className="e01-hero-cta"
                  style={{ backgroundColor: RED, color: WHITE, border: "none", fontFamily: FONT, fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", padding: "15px 0", borderRadius: 0, cursor: "pointer", transition: "background 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <GenericEditableText sectionId={sectionId} field="submitText" value={submitText} tag="span" />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactLegal02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c = content as Record<string, unknown>;
  const NAVY   = "#143171";
  const BOLD   = "'bw_gradualbold', 'Montserrat', Georgia, serif";
  const REG    = "'Open Sans', Georgia, serif";

  const eyebrowRaw  = c.tagline;
  const titleRaw    = c.title;
  const subtitleRaw = c.subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Kontakt" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Pojďme to vyřešit společně" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Napište nebo zavolejte. První konzultaci poskytujeme zdarma — odpovídáme do 24 hodin." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());

  const phone   = String(c.phone   ?? "226 555 800");
  const email   = String(c.email   ?? "info@dolezal-partneri.cz");
  const address = String(c.address ?? "Revoluční 15, 110 00 Praha 1");
  const hours   = String(c.hours   ?? "Po–Pá 8:30–18:00");
  const phoneLabel   = String(c.phoneLabel   ?? "Telefon");
  const emailLabel   = String(c.emailLabel   ?? "E-mail");
  const addressLabel = String(c.addressLabel ?? "Adresa");
  const hoursLabel   = String(c.hoursLabel   ?? "Otevírací doba");
  const nameFieldLabel = String(c.nameFieldLabel ?? "Jméno a příjmení");
  const emailFieldLabel = String(c.emailFieldLabel ?? "E-mailová adresa");
  const phoneFieldLabel = String(c.phoneFieldLabel ?? "Telefon");
  const msgFieldLabel = String(c.msgFieldLabel ?? "Zpráva");
  const submitText = String(c.submitText ?? "Odeslat zprávu");
  const successTitle = String(c.successTitle ?? "Zpráva odeslána");
  const successText  = String(c.successText  ?? "Děkujeme, ozveme se vám do 24 hodin.");
  const linkedin = String(c.linkedin ?? "");
  const facebook = String(c.facebook ?? "");
  const instagram = String(c.instagram ?? "");

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 800));
    setSending(false);
    setSent(true);
  };

  const PhoneIco = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1 .37 1.94.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.87.33 1.81.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>);
  const MailIco = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>);
  const PinIco = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);
  const ClockIco = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>);

  return (
    <section id="kontakt" data-template="legal-02" style={{ backgroundColor: "#ECEFF4", padding: "clamp(72px,9vw,120px) 0" }}>
      <style>{`
        @font-face { font-family:'bw_gradualbold'; src:url('/templates/legal-02/bwgradual-bold-webfont.woff2') format('woff2'); font-display:swap; }
        .l02c-card { background:#DCDFEB; padding: clamp(40px,6vw,96px); }
        .l02c-grid { display:flex; gap: clamp(40px,6vw,80px); }
        .l02c-label { font-family:${BOLD}; font-size:12px; letter-spacing:0.08em; color:${NAVY}; opacity:0.6; display:block; margin-bottom:7px; text-transform:uppercase; }
        @media (max-width:900px){ .l02c-grid { flex-direction:column; } .l02c-form { width:100% !important; } .l02c-outer { padding-left:24px !important; padding-right:24px !important; } }
      `}</style>

      <div className="l02c-outer" style={{ maxWidth: 1440, margin: "0 auto", padding: "0 80px", boxSizing: "border-box" }}>
        <div className="l02c-card">
          <div className="l02c-grid">

            {/* Left — info */}
            <div style={{ flex: 1 }}>
              {showHeader && (
                <>
                  {eyebrow.trim() && (
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                      <span style={{ width: 40, height: 2, background: "#EB5C2E", display: "block" }} />
                      <GenericEditableText sectionId={sectionId} field="tagline" value={eyebrow} tag="p"
                        style={{ fontFamily: BOLD, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", color: "#EB5C2E", margin: 0 }} />
                    </div>
                  )}
                  {title.trim() && (
                    <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2"
                      style={{ fontFamily: BOLD, fontSize: "clamp(30px,3.4vw,44px)", lineHeight: 1.12, fontWeight: 400, color: NAVY, margin: "0 0 20px", letterSpacing: "-0.01em" }} />
                  )}
                  {subtitle.trim() && (
                    <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p"
                      style={{ fontFamily: REG, fontSize: 18, lineHeight: 1.6, color: NAVY, margin: "0 0 44px", opacity: 0.85 }} />
                  )}
                </>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div className="l02c-row">
                  <span className="l02c-ico"><PhoneIco /></span>
                  <div>
                    <GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="p" style={{ fontFamily: BOLD, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: NAVY, opacity: 0.55, margin: "0 0 4px" }} />
                    <p className="l02c-val" style={{ margin: 0, fontFamily: REG, fontSize: 18 }}><a href={`tel:${phone.replace(/\s/g, "")}`}><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" /></a></p>
                  </div>
                </div>
                <div className="l02c-row">
                  <span className="l02c-ico"><MailIco /></span>
                  <div>
                    <GenericEditableText sectionId={sectionId} field="emailLabel" value={emailLabel} tag="p" style={{ fontFamily: BOLD, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: NAVY, opacity: 0.55, margin: "0 0 4px" }} />
                    <p className="l02c-val" style={{ margin: 0, fontFamily: REG, fontSize: 18 }}><a href={`mailto:${email}`}><GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" /></a></p>
                  </div>
                </div>
                <div className="l02c-row">
                  <span className="l02c-ico"><PinIco /></span>
                  <div>
                    <GenericEditableText sectionId={sectionId} field="addressLabel" value={addressLabel} tag="p" style={{ fontFamily: BOLD, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: NAVY, opacity: 0.55, margin: "0 0 4px" }} />
                    <GenericEditableText sectionId={sectionId} field="address" value={address} tag="p" style={{ margin: 0, fontFamily: REG, fontSize: 18, color: NAVY }} />
                  </div>
                </div>
                <div className="l02c-row">
                  <span className="l02c-ico"><ClockIco /></span>
                  <div>
                    <GenericEditableText sectionId={sectionId} field="hoursLabel" value={hoursLabel} tag="p" style={{ fontFamily: BOLD, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: NAVY, opacity: 0.55, margin: "0 0 4px" }} />
                    <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="p" style={{ margin: 0, fontFamily: REG, fontSize: 18, color: NAVY }} />
                  </div>
                </div>
              </div>

              {(linkedin || facebook || instagram) && (
                <div style={{ display: "flex", gap: 12, marginTop: 36 }}>
                  {linkedin && <a className="l02c-social" href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.24 8h4.5v13H.24V8zm7.98 0h4.31v1.78h.06c.6-1.14 2.07-2.34 4.26-2.34 4.56 0 5.4 3 5.4 6.9V21h-4.5v-6.16c0-1.47-.03-3.36-2.05-3.36-2.05 0-2.37 1.6-2.37 3.25V21h-4.5V8z"/></svg></a>}
                  {facebook && <a className="l02c-social" href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/></svg></a>}
                  {instagram && <a className="l02c-social" href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>}
                </div>
              )}
            </div>

            {/* Right — form */}
            <div className="l02c-form" style={{ width: "50%", flexShrink: 0 }}>
              {sent ? (
                <div style={{ background: "#fff", padding: "56px 40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                  <span style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(235,92,46,0.12)", color: "#EB5C2E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
                  </span>
                  <GenericEditableText sectionId={sectionId} field="successTitle" value={successTitle} tag="h3" style={{ fontFamily: BOLD, fontSize: 24, color: NAVY, margin: 0 }} />
                  <GenericEditableText sectionId={sectionId} field="successText" value={successText} tag="p" style={{ fontFamily: REG, fontSize: 16, color: "#6b7280", margin: 0 }} />
                </div>
              ) : (
                <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <GenericEditableText sectionId={sectionId} field="nameFieldLabel" value={nameFieldLabel} tag="label" className="l02c-label" />
                    <input className="l02c-input" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <GenericEditableText sectionId={sectionId} field="emailFieldLabel" value={emailFieldLabel} tag="label" className="l02c-label" />
                      <input className="l02c-input" type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div>
                      <GenericEditableText sectionId={sectionId} field="phoneFieldLabel" value={phoneFieldLabel} tag="label" className="l02c-label" />
                      <input className="l02c-input" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <GenericEditableText sectionId={sectionId} field="msgFieldLabel" value={msgFieldLabel} tag="label" className="l02c-label" />
                    <textarea className="l02c-textarea" rows={5} required value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
                  </div>
                  <button type="submit" className="l02c-submit" disabled={sending}
                    style={{ fontFamily: BOLD, fontSize: 15, letterSpacing: "0.04em" }}>
                    <GenericEditableText sectionId={sectionId} field="submitText" value={sending ? "Odesílám…" : submitText} tag="span" />
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

// ─── STAVBA-03 CONTACT ────────────────────────────────────────────────────────
function ContactStavba03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const ORANGE = "#fa7d19";
  const DARK = "#1b1a1a";
  const FONT = "'Roboto', sans-serif";

  const kicker = (content.kicker as string) ?? "Kontakt";
  const heading = (content.heading as string) ?? "Napište nám nebo zavolejte";
  const phone = (content.phone as string) ?? "704 123 456";
  const email = (content.email as string) ?? "info@demo.cz";
  const address = (content.address as string) ?? "Ukázková 123, 110 00 Praha 1";
  const hours = (content.hours as string) ?? "Po–Pá 8:00–17:00";
  const ico = (content.ico as string) ?? "";
  const formHeading = (content.formHeading as string) ?? "Nezávazná poptávka";
  const submitText = (content.submitText as string) ?? "Odeslat poptávku";
  const phoneLabel   = (content.phoneLabel   as string) ?? "Telefon";
  const emailLabel   = (content.emailLabel   as string) ?? "E-mail";
  const addressLabel = (content.addressLabel as string) ?? "Adresa";
  const hoursLabel   = (content.hoursLabel   as string) ?? "Provozní hodiny";
  const icoLabel     = (content.icoLabel     as string) ?? "IČO";
  const namePlaceholder    = (content.namePlaceholder    as string) ?? "Jméno a příjmení *";
  const phonePlaceholder   = (content.phonePlaceholder   as string) ?? "Telefon *";
  const emailPlaceholder   = (content.emailPlaceholder   as string) ?? "E-mail";
  const messagePlaceholder = (content.messagePlaceholder as string) ?? "Popište vaši zakázku…";
  const mapEmbed = (content.mapEmbed as string) ?? "";
  const successTitle = (content.successTitle as string) ?? "Poptávka odeslána!";
  const successText  = (content.successText  as string) ?? "Ozveme se vám do 24 hodin.";

  const [sent, setSent] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", phone: "", email: "", message: "" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 900));
    setSending(false);
    setSent(true);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "13px 16px", border: "1px solid #333",
    background: "#2a2828", color: "#fff", fontSize: 14, fontFamily: FONT,
    borderRadius: 0, outline: "none", boxSizing: "border-box",
  };

  return (
    <section id="kontakt" style={{ background: DARK, padding: "90px 0", fontFamily: FONT }} data-template="stavba-03">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: ORANGE, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>
            <span aria-hidden="true" style={{ width: 24, height: 2, background: ORANGE }} />
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            <span aria-hidden="true" style={{ width: 24, height: 2, background: ORANGE }} />
          </div>
          <h2 style={{ fontFamily: FONT, color: "#fff", fontSize: "clamp(26px,3.2vw,40px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.15, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <div style={{ width: 48, height: 3, background: ORANGE, borderRadius: 2, margin: "18px auto 0" }} />
        </div>

        {/* 2-col */}
        <div className="stavba03-contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 60, alignItems: "start" }}>

          {/* Left — info */}
          <div>
            {/* Contact items */}
            {[
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
                label: phoneLabel, labelField: "phoneLabel", value: phone, field: "phone", href: `tel:${phone.replace(/\s/g, "")}`,
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                label: emailLabel, labelField: "emailLabel", value: email, field: "email", href: `mailto:${email}`,
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                label: addressLabel, labelField: "addressLabel", value: address, field: "address", href: undefined,
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                label: hoursLabel, labelField: "hoursLabel", value: hours, field: "hours", href: undefined,
              },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 16, marginBottom: 28 }}>
                <div style={{ width: 44, height: 44, background: "#fff1e6", borderRadius: 0, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <p style={{ color: "#999", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 4px" }}><GenericEditableText sectionId={sectionId} field={item.labelField} value={item.label} tag="span" /></p>
                  {item.href ? (
                    <a href={item.href} style={{ color: "#fff", fontSize: "0.95rem", fontWeight: 500, textDecoration: "none" }}>
                      <GenericEditableText sectionId={sectionId} field={item.field} value={item.value} tag="span" />
                    </a>
                  ) : (
                    <p style={{ color: "#fff", fontSize: "0.95rem", fontWeight: 500, margin: 0 }}>
                      <GenericEditableText sectionId={sectionId} field={item.field} value={item.value} tag="span" />
                    </p>
                  )}
                </div>
              </div>
            ))}

            {ico && (
              <p style={{ color: "#666", fontSize: 13, marginTop: 16 }}>
                <GenericEditableText sectionId={sectionId} field="icoLabel" value={icoLabel} tag="span" />: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" />
              </p>
            )}
          </div>

          {/* Right — form */}
          <div style={{ background: "#242222", padding: "40px 36px" }}>
            <h3 style={{ fontFamily: FONT, color: "#fff", fontSize: "1.25rem", fontWeight: 700, margin: "0 0 28px", borderBottom: `2px solid ${ORANGE}`, paddingBottom: 14 }}>
              <GenericEditableText sectionId={sectionId} field="formHeading" value={formHeading} tag="span" />
            </h3>

            {sent ? (
              <div style={{ padding: "32px 0", textAlign: "center" }}>
                <div style={{ width: 56, height: 56, background: "#fff1e6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem", margin: "0 0 8px" }}><GenericEditableText sectionId={sectionId} field="successTitle" value={successTitle} tag="span" /></p>
                <p style={{ color: "#999", fontSize: "0.9rem", margin: 0 }}><GenericEditableText sectionId={sectionId} field="successText" value={successText} tag="span" /></p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="stavba03-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <input name="name" className="st03-form-input" placeholder={namePlaceholder} required value={form.name} onChange={handleChange} style={inputStyle} />
                  <input name="phone" className="st03-form-input" placeholder={phonePlaceholder} required value={form.phone} onChange={handleChange} style={inputStyle} />
                </div>
                <input name="email" type="email" className="st03-form-input" placeholder={emailPlaceholder} value={form.email} onChange={handleChange} style={inputStyle} />
                <textarea name="message" className="st03-form-input" placeholder={messagePlaceholder} rows={5} value={form.message} onChange={handleChange} style={{ ...inputStyle, resize: "vertical" }} />
                <button type="submit" disabled={sending} className="st03-form-submit" style={{
                  background: ORANGE, color: "#fff", border: "none", padding: "15px 32px",
                  fontSize: 14, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
                  cursor: sending ? "not-allowed" : "pointer", opacity: sending ? 0.7 : 1,
                  fontFamily: FONT, marginTop: 4,
                }}>
                  {sending ? "Odesílám..." : <GenericEditableText sectionId={sectionId} field="submitText" value={submitText} tag="span" />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
        {mapEmbed && (
          <div style={{ marginTop: 56, position: "relative", height: 340, overflow: "hidden", border: "1px solid #333" }}>
            <iframe src={mapEmbed} title="Mapa" width="100%" height="100%" style={{ border: 0, filter: "grayscale(0.25) contrast(1.05)" }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        )}
      <style>{`
        @media (max-width: 860px) {
          .stavba03-contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .stavba03-form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── stavba-02-contact ─────────────────────────────────────────────────────────
// Luxe redesign — cream bg, conditional eyebrow+H2, info blocks with icon badges,
// white form card with focus-glow inputs + brown submit with arrow.
// ─────────────────────────────────────────────────────────────────────────────
function ContactStavba02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const BROWN = "#674832";
  const DARK  = "#3D2516";
  const MUTED = "#7A6454";
  const GOLD  = "#C4956A";
  const CREAM = "#EDE9E3";
  const FONT  = "'Roboto', sans-serif";

  const sectionId2 = String(content.id      ?? "poptavka");
  const kickerRaw   = (content as Record<string, unknown>).kicker;
  const titleRaw    = (content as Record<string, unknown>).title;
  const subtitleRaw = (content as Record<string, unknown>).subtitle;
  const kicker   = kickerRaw   === undefined ? "Nezávazná poptávka" : String(kickerRaw);
  const title    = titleRaw    === undefined ? "Kontaktujte nás" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "" : String(subtitleRaw);
  const showHeader = !!(kicker.trim() || title.trim() || subtitle.trim());
  const phone      = String(content.phone   ?? "");
  const email      = String(content.email   ?? "");
  const address    = String(content.address ?? "");
  const ctaText    = String(content.ctaText ?? "Odeslat poptávku");
  const phoneLabel = String(content.phoneLabel ?? "Telefon");
  const emailLabel = String(content.emailLabel ?? "E-mail");
  const addressLabel = String(content.addressLabel ?? "Adresa");
  const nameFieldLabel  = String(content.nameFieldLabel  ?? "Jméno");
  const phoneFieldLabel = String(content.phoneFieldLabel ?? "Telefon");
  const emailFieldLabel = String(content.emailFieldLabel ?? "E-mail");
  const msgFieldLabel   = String(content.msgFieldLabel   ?? "Zpráva");

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", border: "1px solid #D4C9BE", borderRadius: 8,
    fontFamily: FONT, fontSize: "0.9rem", color: DARK, backgroundColor: "#fff",
    outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = { display: "block", color: MUTED, fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 };

  const InfoBlock = ({ icon, label, field, labelField, value, href }: { icon: React.ReactNode; label: string; field: string; labelField: string; value: string; href?: string }) => (
    <div className="s02-contact-info" style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
      <span className="s02-contact-badge" style={{ width: 42, height: 42, borderRadius: 11, backgroundColor: BROWN, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <div>
        <GenericEditableText sectionId={sectionId} field={labelField} value={label} tag="div" style={{ color: MUTED, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3, fontWeight: 600 }} />
        {href ? (
          <a href={href} style={{ color: DARK, fontSize: "0.96rem", fontWeight: 600, textDecoration: "none" }}>
            <GenericEditableText sectionId={sectionId} field={field} value={value} tag="span" />
          </a>
        ) : (
          <GenericEditableText sectionId={sectionId} field={field} value={value} tag="span" style={{ color: DARK, fontSize: "0.96rem", fontWeight: 600 }} />
        )}
      </div>
    </div>
  );

  return (
    <section id={sectionId2} style={{ backgroundColor: CREAM, fontFamily: FONT, padding: "clamp(64px, 8vw, 100px) 0" }} data-template="stavba-02">
      <div style={{ maxWidth: 1220, margin: "0 auto", padding: "0 clamp(16px,4vw,36px)" }}>
        <div className="s02-contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "clamp(40px, 6vw, 72px)", alignItems: "start" }}>

          {/* Left — info */}
          <div>
            {showHeader && (
              <>
                {kicker.trim() && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 11, marginBottom: 16 }}>
                    <span aria-hidden="true" style={{ width: 26, height: 2, background: GOLD, borderRadius: 2 }} />
                    <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" style={{ fontFamily: FONT, color: BROWN, fontSize: "0.74rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" }} />
                  </div>
                )}
                {title.trim() && (
                  <h2 style={{ fontFamily: FONT, color: DARK, fontSize: "clamp(24px, 3.2vw, 40px)", fontWeight: 700, lineHeight: 1.16, letterSpacing: "-0.02em", margin: "0 0 14px" }}>
                    <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
                  </h2>
                )}
                {subtitle.trim() && (
                  <p style={{ fontFamily: FONT, color: MUTED, fontSize: "0.98rem", lineHeight: 1.7, margin: "0 0 28px", maxWidth: 420 }}>
                    <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
                  </p>
                )}
              </>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: showHeader ? 8 : 0 }}>
              {phone && (
                <InfoBlock icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12.25 19.79 19.79 0 0 1 1.17 3.63 2 2 0 0 1 3.15 1.45h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"/></svg>} label={phoneLabel} labelField="phoneLabel" field="phone" value={phone} href={`tel:${phone.replace(/\s/g, "")}`} />
              )}
              {email && (
                <InfoBlock icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>} label={emailLabel} labelField="emailLabel" field="email" value={email} href={`mailto:${email}`} />
              )}
              {address && (
                <InfoBlock icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>} label={addressLabel} labelField="addressLabel" field="address" value={address} />
              )}
            </div>
          </div>

          {/* Right — form card */}
          <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: "clamp(28px, 4vw, 44px)", boxShadow: "0 10px 44px rgba(45,26,15,0.11)", border: "1px solid rgba(103,72,50,0.08)" }}>
            <form onSubmit={e => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="s02-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <GenericEditableText sectionId={sectionId} field="nameFieldLabel" value={nameFieldLabel} tag="label" style={labelStyle} />
                  <input type="text" placeholder="Vaše jméno" className="s02-input" style={inputStyle} />
                </div>
                <div>
                  <GenericEditableText sectionId={sectionId} field="phoneFieldLabel" value={phoneFieldLabel} tag="label" style={labelStyle} />
                  <input type="tel" placeholder="+420 xxx xxx xxx" className="s02-input" style={inputStyle} />
                </div>
              </div>
              <div>
                <GenericEditableText sectionId={sectionId} field="emailFieldLabel" value={emailFieldLabel} tag="label" style={labelStyle} />
                <input type="email" placeholder="vas@email.cz" className="s02-input" style={inputStyle} />
              </div>
              <div>
                <GenericEditableText sectionId={sectionId} field="msgFieldLabel" value={msgFieldLabel} tag="label" style={labelStyle} />
                <textarea placeholder="Popište, co potřebujete zrekonstruovat..." rows={4} className="s02-input" style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <button type="submit" className="s02-hero-cta" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, backgroundColor: BROWN, color: "#fff", fontFamily: FONT, fontSize: "0.9rem", fontWeight: 700, padding: "14px 28px", border: "none", borderRadius: 8, cursor: "pointer", marginTop: 4, boxShadow: "0 8px 22px rgba(103,72,50,0.24)" }}>
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                <svg className="s02-hero-cta-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .s02-contact-grid { grid-template-columns: 1fr !important; }
          .s02-form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function ContactInstala01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const YELLOW = "#FFC527";
  const DARK   = "#1e293b";
  const FONT   = "'Outfit', sans-serif";

  const kickerRaw   = content.kicker;
  const titleRaw    = content.title;
  const subtitleRaw = content.subtitle;
  const kicker   = kickerRaw   === undefined ? "Kontakt" : String(kickerRaw);
  const title    = titleRaw    === undefined ? "Ozvěte se nám" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Jsme tu pro vás v pracovní dny i o víkendech při havarijních situacích." : String(subtitleRaw);
  const phone    = String(content.phone   ?? "+420 602 987 654");
  const email    = String(content.email   ?? "servis@demo.cz");
  const address  = String(content.address ?? "Vinohradská 42, 120 00 Praha 2");
  const hours    = String(content.hours   ?? "Po–Pá 7:00–17:00");
  const mapLat   = Number(content.mapLat  ?? 50.0755);
  const mapLon   = Number(content.mapLon  ?? 14.4378);

  const showHeader = !!(kicker.trim() || title.trim() || subtitle.trim());

  const contactItems = [
    { label: "Telefon",        value: phone,   href: `tel:${phone.replace(/[^\d+]/g, "")}`, icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12.25 19.79 19.79 0 0 1 1.17 3.63 2 2 0 0 1 3.15 1.45h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"/>, field: "phone" },
    { label: "E-mail",         value: email,   href: `mailto:${email}`, icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>, field: "email" },
    { label: "Adresa",         value: address, href: undefined, icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>, field: "address" },
    { label: "Pracovní doba",  value: hours,   href: undefined, icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>, field: "hours" },
  ];

  return (
    <section id="kontakt" style={{ backgroundColor: "#ffffff", fontFamily: FONT, padding: "100px 0" }} data-template="instala-01-contact">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        {showHeader && (
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ width: 32, height: 2, backgroundColor: YELLOW, borderRadius: 2, display: "block" }} />
              <span style={{ fontSize: "13px", fontWeight: 600, textTransform: "uppercase", color: YELLOW, letterSpacing: "0.14em" }}>
                <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
              </span>
              <span style={{ width: 32, height: 2, backgroundColor: YELLOW, borderRadius: 2, display: "block" }} />
            </div>
            <h2 style={{ fontSize: "clamp(28px,3.2vw,44px)", fontWeight: 700, color: DARK, lineHeight: 1.15, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p style={{ fontSize: "17px", color: "#4b5563", maxWidth: 520, margin: "0 auto", lineHeight: 1.65 }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          </div>
        )}

        <div className="i01-contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 48, alignItems: "start" }}>
          {/* Left — contact info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {contactItems.map((item, i) => {
              const inner = (
                <div className="i01-contact-row" key={i} style={{
                  display: "flex", alignItems: "center", gap: 18,
                  padding: "20px 0",
                  borderBottom: i < contactItems.length - 1 ? "1px solid #f0f0f0" : "none",
                }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "rgba(255,197,39,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{item.icon}</svg>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 3px" }}>{item.label}</p>
                    <p style={{ fontSize: "17px", fontWeight: 600, color: DARK, margin: 0 }}>
                      <GenericEditableText sectionId={sectionId} field={item.field} value={item.value} tag="span" />
                    </p>
                  </div>
                </div>
              );
              return item.href ? (
                <a key={i} href={item.href} style={{ textDecoration: "none", color: "inherit" }}>{inner}</a>
              ) : (
                <React.Fragment key={i}>{inner}</React.Fragment>
              );
            })}

            {/* Emergency callout */}
            <div style={{
              marginTop: 24,
              background: DARK,
              borderRadius: 12,
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: YELLOW, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: "0 0 2px" }}>
                  <GenericEditableText sectionId={sectionId} field="emergencyTitle" value={String(content.emergencyTitle ?? "Havarijní servis 24/7")} tag="span" />
                </p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", margin: 0 }}>
                  <GenericEditableText sectionId={sectionId} field="emergencyText" value={String(content.emergencyText ?? "Volejte nonstop — přijedeme do 60 minut.")} tag="span" />
                </p>
              </div>
            </div>
          </div>

          {/* Right — map */}
          <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
            <iframe
              title="Mapa"
              width="100%"
              height="400"
              style={{ border: 0, display: "block" }}
              loading="lazy"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapLon - 0.008}%2C${mapLat - 0.005}%2C${mapLon + 0.008}%2C${mapLat + 0.005}&layer=mapnik&marker=${mapLat}%2C${mapLon}`}
            />
            <div style={{ padding: "14px 20px", backgroundColor: "#fafafa", display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── florist-01 Contact ──────────────────────────────────────────────────────
// ── florist-01-contact ────────────────────────────────────────────────────────
// Botanical Atelier Editorial luxe contact:
// - Warm ivory bg + editorial centered header (conditional)
// - 2-col split: LEFT 3 store cards s Georgia italic name + dotted-leader rows
//   (Adresa / Otevřeno / Telefon / E-mail) s olive-gold pulsating pin badge
// - RIGHT sticky Google Maps embed s olive-gold corner brackets frame
//   + Georgia italic caption "Náš hlavní ateliér — Veveří"
// - Bottom trust strip: dual CTA (call + write) s Georgia italic note
function ContactFlorist01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
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

  interface Store { name: string; address?: string; city?: string; hours?: string; phone?: string; email?: string; mapsUrl?: string; mapsLabel?: string; }

  const eyebrow    = String(content.eyebrow    ?? "06 · NAVŠTIVTE NÁS");
  const title      = String(content.title      ?? "Ateliér a dva showroomy v Brně");
  const kicker     = String(content.kicker     ?? "Přijďte si vybrat kytici osobně nebo si nechte poradit s jejím složením. Rádi vám otevřeme dveře ateliéru.");
  const mapCaption = String(content.mapCaption ?? "Náš hlavní ateliér — Veveří 42");
  const mapEyebrow = String(content.mapEyebrow ?? "OTEVŘENO PO–NE 8—20 H");
  const ctaCall    = String(content.ctaCall    ?? "+420 731 456 789");
  const ctaCallHref = String(content.ctaCallHref ?? "tel:+420731456789");
  const ctaWrite   = String(content.ctaWrite   ?? "atelier@petala.cz");
  const ctaWriteHref = String(content.ctaWriteHref ?? "mailto:atelier@petala.cz");
  const trustNote  = String(content.trustNote  ?? "Odpovídáme obvykle do jedné hodiny.");
  const mapEmbedUrl = String(content.mapEmbedUrl ?? "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d41861.90!2d16.5748!3d49.1951!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4712943ac03f5111%3A0x400af0f6614b1b0!2sBrno!5e0!3m2!1scs!2scz!4v1718000000001");
  const rawStores = (content.stores as Store[]) ?? [];
  const stores: Store[] = rawStores.length > 0 ? rawStores : [
    { name: "Atelier Petala — Veveří",        address: "Veveří 42",         city: "602 00 Brno-střed",   hours: "Po–Pá 8—20 · So–Ne 9—18", phone: "+420 731 456 789", email: "veveri@petala.cz",   mapsUrl: "https://maps.google.com/?q=Veveri+Brno" },
    { name: "Showroom Královo Pole",          address: "Palackého třída 55", city: "612 00 Brno 12",      hours: "Po–Pá 9—19 · So 9—14",    phone: "+420 732 456 780", email: "kralovopole@petala.cz", mapsUrl: "https://maps.google.com/?q=Palackeho+Kralovo+Pole+Brno" },
    { name: "Showroom Žabovřesky",            address: "Minská 12",          city: "616 00 Brno 16",      hours: "Po–Pá 9—19 · So 9—14",    phone: "+420 733 456 781", email: "zabovresky@petala.cz", mapsUrl: "https://maps.google.com/?q=Minska+Zabovresky+Brno" },
  ];

  const showHeader = !!(eyebrow.trim() || title.trim());

  return (
    <section id="kontakt" data-template="florist-01" className="f01ct" style={{ background: IVORY, fontFamily: INTER, padding: "96px 24px 108px" }}>
      <style>{`
        .f01ct-inner { max-width: 1280px; margin: 0 auto; }
        .f01ct-head { text-align:center; display:flex; flex-direction:column; align-items:center; gap:16px; margin-bottom: 64px; }
        .f01ct-eye { display:inline-flex; align-items:center; gap:14px; font-family:${INTER}; font-weight:500; font-size:11px; letter-spacing:0.34em; text-transform:uppercase; color:${MOSS}; }
        .f01ct-eye i { width:26px; height:1px; background:${GOLD}; display:inline-block; }
        .f01ct-eye em { color:${GOLD}; font-style:normal; font-size:10px; }
        .f01ct-h { font-family:${GEORGIA}; font-style:italic; font-weight:400; font-size:clamp(30px, 3.6vw, 46px); line-height:1.12; color:${INK}; margin:0; letter-spacing:-0.012em; max-width:760px; }
        .f01ct-k { font-family:${INTER}; font-weight:300; font-size:15px; line-height:1.7; color:${INK70}; max-width:600px; margin:0; }

        .f01ct-grid { display:grid; grid-template-columns: minmax(0, 1.05fr) 1fr; gap: 56px; align-items:flex-start; }

        /* LEFT stores */
        .f01ct-stores { display:flex; flex-direction:column; gap: 0; }
        .f01ct-store { padding: 32px 0; position:relative; }
        .f01ct-store + .f01ct-store { border-top: 1px solid ${GOLD}; }
        .f01ct-store:first-child { padding-top: 0; }
        .f01ct-store-head { display:flex; align-items:center; gap:16px; margin-bottom: 20px; }
        .f01ct-pin { position:relative; width:36px; height:36px; border-radius:50%; background:${IVORY2}; border:1px solid ${GOLD}; display:flex; align-items:center; justify-content:center; color:${MOSS}; flex-shrink:0; }
        .f01ct-pin::after { content:""; position:absolute; inset:-6px; border:1px solid ${GOLD}; border-radius:50%; opacity:0.5; animation: f01ctPulse 2.8s ease-out infinite; }
        @keyframes f01ctPulse { 0% { transform: scale(0.8); opacity: 0.6; } 100% { transform: scale(1.3); opacity: 0; } }
        .f01ct-store-name { font-family:${GEORGIA}; font-style:italic; font-weight:400; font-size:26px; color:${INK}; margin:0; letter-spacing:-0.008em; line-height:1.2; }

        .f01ct-rows { display:flex; flex-direction:column; gap: 12px; }
        .f01ct-row { display:grid; grid-template-columns: 96px 1fr auto; align-items:baseline; gap: 8px; }
        .f01ct-row-lbl { font-family:${INTER}; font-weight:500; font-size:10.5px; letter-spacing:0.28em; text-transform:uppercase; color:${INK70}; }
        .f01ct-row-dots { border-bottom: 1px dotted ${GOLD}; opacity:0.7; transform: translateY(-4px); }
        .f01ct-row-val { font-family:${GEORGIA}; font-style:italic; font-size:16px; color:${INK}; letter-spacing:-0.005em; text-align:right; text-decoration:none; transition: color 0.35s ease; }
        a.f01ct-row-val:hover { color:${MOSS}; }
        .f01ct-row-val em { font-style:normal; font-family:${INTER}; font-size:13px; color:${INK70}; margin-left: 6px; }

        .f01ct-nav { display:inline-flex; align-items:center; gap:10px; margin-top: 18px; padding: 8px 0; font-family:${INTER}; font-weight:500; font-size:12px; letter-spacing:0.24em; text-transform:uppercase; color:${MOSS}; text-decoration:none; position:relative; }
        .f01ct-nav::after { content:""; position:absolute; left:0; right:0; bottom:0; height:1px; background:${MOSS}; transform: scaleX(0.35); transform-origin: left; transition: transform 0.5s cubic-bezier(.6,.05,.35,1); }
        .f01ct-nav:hover::after { transform: scaleX(1); }
        .f01ct-nav .arr { transition: transform 0.4s ease; }
        .f01ct-nav:hover .arr { transform: translateX(4px); }

        /* RIGHT sticky map */
        .f01ct-map-wrap { position:sticky; top: 100px; }
        .f01ct-map-frame { position:relative; aspect-ratio: 4/5; overflow:hidden; background:${IVORY2}; }
        .f01ct-map-frame::before, .f01ct-map-frame::after,
        .f01ct-map-brk::before, .f01ct-map-brk::after {
          content:""; position:absolute; width:48px; height:48px; pointer-events:none; z-index:3;
          border: 0 solid ${GOLD};
        }
        .f01ct-map-frame::before { top:14px; left:14px; border-top-width:1px; border-left-width:1px; }
        .f01ct-map-frame::after  { bottom:14px; right:14px; border-bottom-width:1px; border-right-width:1px; }
        .f01ct-map-brk::before { top:14px; right:14px; border-top-width:1px; border-right-width:1px; }
        .f01ct-map-brk::after  { bottom:14px; left:14px; border-bottom-width:1px; border-left-width:1px; }
        .f01ct-map-frame iframe { width:100%; height:100%; border:0; display:block; filter: saturate(0.85) contrast(1.02); }
        .f01ct-map-cap { position:absolute; left:24px; right:24px; bottom:22px; z-index:2; display:flex; flex-direction:column; gap:6px; color:${IVORY}; background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(47,74,58,0.75) 100%); padding: 46px 20px 18px; margin: 0 -20px -22px; pointer-events:none; }
        .f01ct-map-cap-eye { font-family:${INTER}; font-weight:500; font-size:10px; letter-spacing:0.3em; text-transform:uppercase; color:rgba(250,247,242,0.8); }
        .f01ct-map-cap-txt { font-family:${GEORGIA}; font-style:italic; font-size:17px; letter-spacing:-0.005em; }

        /* Bottom trust strip */
        .f01ct-strip { margin-top: 64px; padding: 36px 40px; background: ${IVORY2}; border: 1px solid ${GOLD}; display:grid; grid-template-columns: 1fr auto auto; align-items:center; gap: 32px; position:relative; }
        .f01ct-strip::before { content:""; position:absolute; top:-1px; left:-1px; width:34px; height:34px; border-top: 2px solid ${MOSS}; border-left: 2px solid ${MOSS}; }
        .f01ct-strip::after { content:""; position:absolute; bottom:-1px; right:-1px; width:34px; height:34px; border-bottom: 2px solid ${MOSS}; border-right: 2px solid ${MOSS}; }
        .f01ct-strip-l { display:flex; flex-direction:column; gap: 6px; }
        .f01ct-strip-eye { font-family:${INTER}; font-weight:500; font-size:10.5px; letter-spacing:0.3em; text-transform:uppercase; color:${MOSS}; }
        .f01ct-strip-txt { font-family:${GEORGIA}; font-style:italic; font-size:20px; color:${INK}; letter-spacing:-0.005em; }
        .f01ct-strip-cta { position:relative; overflow:hidden; display:inline-flex; align-items:center; gap:10px; padding:13px 22px;
          background:${MOSS}; color:${IVORY}; font-family:${INTER}; font-weight:500; font-size:12.5px; letter-spacing:0.22em; text-transform:uppercase;
          text-decoration:none; border:1px solid ${MOSS}; transition:color 0.4s ease; }
        .f01ct-strip-cta::before { content:""; position:absolute; inset:0; background:${BLUSH}; transform:translateY(101%); transition:transform 0.5s cubic-bezier(.6,.05,.35,1); }
        .f01ct-strip-cta:hover { color:${MOSS}; }
        .f01ct-strip-cta:hover::before { transform:translateY(0); }
        .f01ct-strip-cta > * { position:relative; z-index:1; }
        .f01ct-strip-cta.alt { background:transparent; color:${MOSS}; }
        .f01ct-strip-cta.alt::before { background:${MOSS}; }
        .f01ct-strip-cta.alt:hover { color:${IVORY}; }

        @media(max-width:1024px){
          .f01ct-grid { grid-template-columns: 1fr; gap: 40px; }
          .f01ct-map-wrap { position: static; }
          .f01ct-map-frame { aspect-ratio: 16/10; max-width: 640px; margin: 0 auto; }
          .f01ct-strip { grid-template-columns: 1fr; text-align: left; }
        }
        @media(max-width:600px){
          .f01ct { padding: 64px 20px 76px; }
          .f01ct-row { grid-template-columns: 78px 1fr auto; }
          .f01ct-row-val { font-size: 14px; }
          .f01ct-store-name { font-size: 22px; }
          .f01ct-strip { padding: 26px 22px; }
          .f01ct-strip-txt { font-size: 17px; }
        }
      `}</style>

      <div className="f01ct-inner">
        {showHeader && (
          <header className="f01ct-head">
            <span className="f01ct-eye"><i /><em>✿</em>
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              <em>✿</em><i />
            </span>
            <h2 className="f01ct-h">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p className="f01ct-k">
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            </p>
          </header>
        )}

        <div className="f01ct-grid">
          <div className="f01ct-stores">
            {stores.map((store, i) => (
              <article key={i} className="f01ct-store">
                <header className="f01ct-store-head">
                  <span className="f01ct-pin" aria-hidden>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.3"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.3"/>
                    </svg>
                  </span>
                  <h3 className="f01ct-store-name">
                    <GenericEditableText sectionId={sectionId} field={`stores.${i}.name`} value={store.name} tag="span" />
                  </h3>
                </header>

                <div className="f01ct-rows">
                  <div className="f01ct-row">
                    <span className="f01ct-row-lbl">Adresa</span>
                    <span className="f01ct-row-dots" aria-hidden />
                    <span className="f01ct-row-val">
                      <GenericEditableText sectionId={sectionId} field={`stores.${i}.address`} value={store.address ?? ""} tag="span" />
                      {store.city && <em><GenericEditableText sectionId={sectionId} field={`stores.${i}.city`} value={store.city} tag="span" /></em>}
                    </span>
                  </div>
                  <div className="f01ct-row">
                    <span className="f01ct-row-lbl">Otevřeno</span>
                    <span className="f01ct-row-dots" aria-hidden />
                    <span className="f01ct-row-val">
                      <GenericEditableText sectionId={sectionId} field={`stores.${i}.hours`} value={store.hours ?? ""} tag="span" />
                    </span>
                  </div>
                  <div className="f01ct-row">
                    <span className="f01ct-row-lbl">Telefon</span>
                    <span className="f01ct-row-dots" aria-hidden />
                    <a className="f01ct-row-val" href={`tel:${(store.phone ?? "").replace(/\s+/g,"")}`}>
                      <GenericEditableText sectionId={sectionId} field={`stores.${i}.phone`} value={store.phone ?? ""} tag="span" />
                    </a>
                  </div>
                  {store.email && (
                    <div className="f01ct-row">
                      <span className="f01ct-row-lbl">E-mail</span>
                      <span className="f01ct-row-dots" aria-hidden />
                      <a className="f01ct-row-val" href={`mailto:${store.email}`}>
                        <GenericEditableText sectionId={sectionId} field={`stores.${i}.email`} value={store.email} tag="span" />
                      </a>
                    </div>
                  )}
                </div>

                {store.mapsUrl && (
                  <a href={store.mapsUrl} target="_blank" rel="noopener noreferrer" className="f01ct-nav">
                    <GenericEditableText sectionId={sectionId} field={`stores.${i}.mapsLabel`} value={store.mapsLabel ?? "Otevřít v Mapách"} tag="span" />
                    <span className="arr" aria-hidden>→</span>
                  </a>
                )}
              </article>
            ))}
          </div>

          <div className="f01ct-map-wrap">
            <div className="f01ct-map-frame">
              <span className="f01ct-map-brk" aria-hidden />
              {mapEmbedUrl && (
                <iframe src={mapEmbedUrl} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Mapa" />
              )}
              <figcaption className="f01ct-map-cap">
                <span className="f01ct-map-cap-eye">
                  <GenericEditableText sectionId={sectionId} field="mapEyebrow" value={mapEyebrow} tag="span" />
                </span>
                <span className="f01ct-map-cap-txt">
                  <GenericEditableText sectionId={sectionId} field="mapCaption" value={mapCaption} tag="span" />
                </span>
              </figcaption>
            </div>
          </div>
        </div>

        <div className="f01ct-strip">
          <div className="f01ct-strip-l">
            <span className="f01ct-strip-eye">RÁDI VÁM ODPOVÍME</span>
            <span className="f01ct-strip-txt">
              <GenericEditableText sectionId={sectionId} field="trustNote" value={trustNote} tag="span" />
            </span>
          </div>
          <a href={ctaCallHref} className="f01ct-strip-cta alt">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            <GenericEditableText sectionId={sectionId} field="ctaCall" value={ctaCall} tag="span" />
          </a>
          <a href={ctaWriteHref} className="f01ct-strip-cta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6h16v12H4z M4 6l8 6 8-6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            <GenericEditableText sectionId={sectionId} field="ctaWrite" value={ctaWrite} tag="span" />
          </a>
        </div>
      </div>
    </section>
  );
}


// ── catering-01-contact ───────────────────────────────────────────────────────
// Dark teal bg #1c373a, split: vlevo kontaktní info, vpravo formulář + kariéra CTA
// ─────────────────────────────────────────────────────────────────────────────
// ── catering-01-contact ──────────────────────────────────────────────────────
// Nordic Minimal Gastro:
// - Forest green bg, 2-col: left info + career strip, right form
// - Fraunces heading, Inter body, terracotta accents
// - Clean minimal inputs with bottom-border style
// ─────────────────────────────────────────────────────────────────────────────
function ContactCatering01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GREEN  = "#2d4a3e";
  const TERRA  = "#c4755b";
  const WARM   = "#f8f5f0";
  const STONE  = "#e8e2d8";
  const SERIF  = "'Fraunces', Georgia, serif";
  const SANS   = "'Inter', system-ui, sans-serif";

  const heading       = String(content.heading       ?? "Rádi se ozveme");
  const subheading    = String(content.subheading    ?? "Napište nám");
  const phone         = String(content.phone         ?? "");
  const email         = String(content.email         ?? "");
  const address       = String(content.address       ?? "");
  const namePH        = String(content.namePlaceholder    ?? "Jméno a příjmení");
  const phonePH       = String(content.phonePlaceholder   ?? "Telefon");
  const emailPH       = String(content.emailPlaceholder   ?? "Email");
  const messagePH     = String(content.messagePlaceholder ?? "Popište svou akci — termín, počet hostů…");
  const submitText    = String(content.submitText    ?? "Odeslat poptávku");
  const careerHeading = String(content.careerHeading ?? "");
  const careerText    = String(content.careerText    ?? "");
  const careerCta     = String(content.careerCta     ?? "Přidat se k týmu");

  const [status, setStatus] = useState<"idle"|"sending"|"ok"|"err">("idle");
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    await new Promise(r => setTimeout(r, 900));
    setStatus("ok");
  }

  return (
    <section
      id="kontakt"
      data-template="catering-01"
      data-variant="catering-01-contact"
      style={{ background: GREEN, padding: "6rem 0 7rem" }}
    >
      <style>{`
        .ct1ct-wrap{max-width:1200px;margin:0 auto;padding:0 1.5rem;display:flex;flex-direction:column;gap:3rem}
        .ct1ct-kicker{font-family:${SANS};font-size:.65rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:${TERRA};margin-bottom:.8rem}
        .ct1ct-title{font-family:${SERIF};font-weight:300;font-style:italic;font-size:clamp(1.8rem,3.5vw,2.8rem);color:${WARM};margin:0 0 2rem;letter-spacing:-.01em}
        .ct1ct-info{display:flex;flex-direction:column;gap:1.2rem;margin-bottom:1.5rem}
        .ct1ct-item{display:flex;align-items:center;gap:.8rem}
        .ct1ct-icon{flex-shrink:0;width:36px;height:36px;border-radius:50%;border:1px solid rgba(232,226,216,.2);display:flex;align-items:center;justify-content:center;color:${TERRA};transition:border-color .2s}
        .ct1ct-item:hover .ct1ct-icon{border-color:${TERRA}}
        .ct1ct-item-label{font-family:${SANS};font-size:.6rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:rgba(248,245,240,.35);margin:0 0 .15rem}
        .ct1ct-item-val{font-family:${SANS};font-size:.9rem;color:${WARM};margin:0;text-decoration:none;transition:color .2s}
        a.ct1ct-item-val:hover{color:${TERRA}}
        .ct1ct-form{display:flex;flex-direction:column;gap:1rem}
        .ct1ct-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
        .ct1ct-input,.ct1ct-textarea{width:100%;box-sizing:border-box;background:transparent;border:none;border-bottom:1px solid rgba(232,226,216,.25);padding:.8rem 0;font-family:${SANS};font-size:.9rem;color:${WARM};outline:none;transition:border-color .25s;border-radius:0;-webkit-appearance:none}
        .ct1ct-input::placeholder,.ct1ct-textarea::placeholder{color:rgba(248,245,240,.3)}
        .ct1ct-input:focus,.ct1ct-textarea:focus{border-bottom-color:${TERRA}}
        .ct1ct-textarea{min-height:6rem;resize:vertical}
        .ct1ct-submit{align-self:flex-start;margin-top:.5rem;background:${TERRA};border:none;cursor:pointer;padding:.8rem 2.2rem;font-family:${SANS};font-size:.72rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#fff;border-radius:999px;transition:background .25s,transform .25s}
        .ct1ct-submit:hover{background:#b0634a;transform:translateY(-2px)}
        .ct1ct-submit:disabled{opacity:.5;cursor:not-allowed}
        .ct1ct-ok{font-family:${SANS};font-size:.9rem;color:${TERRA};margin-top:.4rem}
        .ct1ct-career{margin-top:2rem;padding:1.8rem 2rem;border:1px solid rgba(232,226,216,.15);border-radius:8px}
        .ct1ct-career-h{font-family:${SERIF};font-style:italic;font-size:1.1rem;color:${WARM};margin:0 0 .6rem;font-weight:300}
        .ct1ct-career-p{font-family:${SANS};font-size:.85rem;line-height:1.7;color:rgba(248,245,240,.55);margin:0 0 1rem}
        .ct1ct-career-cta{display:inline-flex;align-items:center;border:1px solid ${TERRA};padding:.6rem 1.6rem;font-family:${SANS};font-size:.68rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:${TERRA};text-decoration:none;border-radius:999px;transition:background .25s,color .25s}
        .ct1ct-career-cta:hover{background:${TERRA};color:#fff}
        @media(min-width:900px){
          .ct1ct-wrap{flex-direction:row;align-items:flex-start;gap:5%}
          .ct1ct-left{flex:0 0 40%}
          .ct1ct-right{flex:1}
        }
      `}</style>

      <div className="ct1ct-wrap">
        <div className="ct1ct-left">
          <div className="ct1ct-kicker">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </div>
          <h2 className="ct1ct-title">
            <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
          </h2>
          <div className="ct1ct-info">
            {phone && (
              <div className="ct1ct-item">
                <span className="ct1ct-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </span>
                <div>
                  <p className="ct1ct-item-label">Telefon</p>
                  <a href={`tel:${phone.replace(/\s/g,"")}`} className="ct1ct-item-val">
                    <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                  </a>
                </div>
              </div>
            )}
            {email && (
              <div className="ct1ct-item">
                <span className="ct1ct-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                <div>
                  <p className="ct1ct-item-label">Email</p>
                  <a href={`mailto:${email}`} className="ct1ct-item-val">
                    <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                  </a>
                </div>
              </div>
            )}
            {address && (
              <div className="ct1ct-item">
                <span className="ct1ct-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </span>
                <div>
                  <p className="ct1ct-item-label">Adresa</p>
                  <p className="ct1ct-item-val">
                    <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="ct1ct-right">
          {status === "ok" ? (
            <p className="ct1ct-ok">Děkujeme! Ozveme se co nejdříve.</p>
          ) : (
            <form className="ct1ct-form" onSubmit={handleSubmit}>
              <div className="ct1ct-row">
                <input className="ct1ct-input" name="name" placeholder={namePH} value={form.name} onChange={handleChange} required />
                <input className="ct1ct-input" name="phone" placeholder={phonePH} value={form.phone} onChange={handleChange} />
              </div>
              <input className="ct1ct-input" name="email" type="email" placeholder={emailPH} value={form.email} onChange={handleChange} required />
              <textarea className="ct1ct-textarea" name="message" placeholder={messagePH} value={form.message} onChange={handleChange} />
              <button className="ct1ct-submit" type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Odesílám…" : submitText}
              </button>
            </form>
          )}

          {careerHeading && (
            <div className="ct1ct-career">
              <h3 className="ct1ct-career-h">
                <GenericEditableText sectionId={sectionId} field="careerHeading" value={careerHeading} tag="span" />
              </h3>
              {careerText && (
                <p className="ct1ct-career-p">
                  <GenericEditableText sectionId={sectionId} field="careerText" value={careerText} tag="span" />
                </p>
              )}
              <a href="#" className="ct1ct-career-cta">
                <GenericEditableText sectionId={sectionId} field="careerCta" value={careerCta} tag="span" />
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── sweet-01 Locations — Pâtisserie editorial branch cards + contact info ──
// Cream #fdf6ee bg, gold dotted-leader rows, cocoa #2b1810 form card,
// Fraunces italic titles, cherry red pin badges, gold corner brackets
// ─────────────────────────────────────────────────────────────────────────────
function LocationsSweet01({
  content,
  sectionId,
}: {
  content: Record<string, unknown>;
  sectionId: number;
}) {
  interface Branch { name: string; address: string; hours: string; phone: string; mapUrl?: string; }
  const kicker   = String(content.kicker   ?? "NAVŠTIVTE NÁS");
  const title    = String(content.title    ?? "Kde nás najdete");
  const subtitle = String(content.subtitle ?? "Těšíme se na vaši návštěvu v kterékoli z našich poboček.");
  const email    = String(content.email    ?? "atelier@cukrarna-eliska.cz");
  const phone    = String(content.phone    ?? "+420 704 123 456");
  const branches = (content.branches as Branch[]) ?? [
    { name: "Vinohrady", address: "Vinohradská 42, Praha 2", hours: "Po–Ne 8:00–20:00", phone: "+420 704 123 456", mapUrl: "https://maps.google.com" },
    { name: "Letná", address: "Letenské nám. 8, Praha 7", hours: "Po–Pá 7:30–19:00, So–Ne 9:00–18:00", phone: "+420 704 123 457", mapUrl: "https://maps.google.com" },
    { name: "Karlín", address: "Křižíkova 65, Praha 8", hours: "Po–Ne 8:00–20:00", phone: "+420 704 123 458", mapUrl: "https://maps.google.com" },
  ];

  const RED    = "#E2001A";
  const CREAM  = "#fdf6ee";
  const COCOA  = "#2b1810";
  const GOLD   = "#c8a568";
  const FONT_D = "'Fraunces', 'Playfair Display', Georgia, serif";
  const FONT_B = "'Inter', 'Helvetica Neue', Arial, sans-serif";

  const showHeader = !!(kicker || title);

  return (
    <section data-template="sweet-01" style={{ background: CREAM, padding: "100px 0 110px", position: "relative" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap" />
      <style>{`
        .sw01-loc-wrap { max-width: 1240px; margin: 0 auto; padding: 0 clamp(24px, 5vw, 60px); }
        .sw01-loc-hd { text-align: center; margin-bottom: 64px; }
        .sw01-loc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .sw01-loc-card { background: #fff; padding: 36px 32px; position: relative; transition: transform 0.4s cubic-bezier(.4,0,.2,1), box-shadow 0.4s; }
        .sw01-loc-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(43,24,16,0.1); }
        .sw01-loc-card-brackets { position: absolute; inset: -1px; pointer-events: none; }
        .sw01-loc-card-brackets::before, .sw01-loc-card-brackets::after { content: ""; position: absolute; width: 28px; height: 28px; border: 0 solid ${GOLD}; transition: width 0.4s, height 0.4s; }
        .sw01-loc-card-brackets::before { top: 0; left: 0; border-top-width: 1.5px; border-left-width: 1.5px; }
        .sw01-loc-card-brackets::after  { bottom: 0; right: 0; border-bottom-width: 1.5px; border-right-width: 1.5px; }
        .sw01-loc-card:hover .sw01-loc-card-brackets::before,
        .sw01-loc-card:hover .sw01-loc-card-brackets::after { width: 36px; height: 36px; }
        .sw01-loc-pin { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: ${RED}; margin-bottom: 20px; }
        .sw01-loc-name { font-family: ${FONT_D}; font-style: italic; font-weight: 500; font-size: 22px; color: ${COCOA}; margin: 0 0 20px; }
        .sw01-loc-row { display: flex; align-items: baseline; gap: 0; margin-bottom: 14px; }
        .sw01-loc-label { font-family: ${FONT_B}; font-weight: 600; font-size: 10.5px; letter-spacing: 0.2em; text-transform: uppercase; color: ${GOLD}; white-space: nowrap; flex-shrink: 0; }
        .sw01-loc-dots { flex: 1; border-bottom: 1px dashed ${GOLD}44; margin: 0 10px; min-width: 20px; align-self: end; margin-bottom: 3px; }
        .sw01-loc-val { font-family: ${FONT_B}; font-weight: 400; font-size: 14px; color: rgba(43,24,16,0.75); text-align: right; flex-shrink: 0; max-width: 60%; }
        .sw01-loc-val a { color: rgba(43,24,16,0.75); text-decoration: none; transition: color 0.2s; }
        .sw01-loc-val a:hover { color: ${RED}; }
        .sw01-loc-map { display: inline-flex; align-items: center; gap: 6px; font-family: ${FONT_B}; font-weight: 600; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: ${RED}; text-decoration: none; margin-top: 8px; transition: gap 0.3s; }
        .sw01-loc-map:hover { gap: 10px; }
        .sw01-loc-contact { margin-top: 64px; padding: 42px 0 0; border-top: 1px solid ${GOLD}33; display: flex; justify-content: center; gap: 56px; flex-wrap: wrap; }
        .sw01-loc-ci { display: flex; align-items: center; gap: 14px; }
        .sw01-loc-ci-icon { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid ${GOLD}55; flex-shrink: 0; }
        .sw01-loc-ci-text { font-family: ${FONT_B}; font-size: 15px; color: ${COCOA}; }
        .sw01-loc-ci-text a { color: ${COCOA}; text-decoration: none; transition: color 0.2s; }
        .sw01-loc-ci-text a:hover { color: ${RED}; }
        .sw01-loc-ci-label { font-family: ${FONT_B}; font-weight: 600; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: ${GOLD}; margin-bottom: 2px; }
        @media(max-width: 900px) {
          .sw01-loc-grid { grid-template-columns: 1fr 1fr; }
        }
        @media(max-width: 600px) {
          .sw01-loc-grid { grid-template-columns: 1fr; max-width: 420px; margin: 0 auto; }
          .sw01-loc-contact { flex-direction: column; align-items: center; gap: 24px; }
        }
      `}</style>

      <div className="sw01-loc-wrap">
        {showHeader && (
          <div className="sw01-loc-hd">
            {kicker && (
              <p style={{ fontFamily: FONT_B, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.32em", textTransform: "uppercase", color: RED, margin: "0 0 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
                <span style={{ width: 24, height: 1.5, background: RED, display: "inline-block" }} />
                <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
                <span style={{ width: 24, height: 1.5, background: RED, display: "inline-block" }} />
              </p>
            )}
            {title && (
              <h2 style={{ fontFamily: FONT_D, fontStyle: "italic", fontWeight: 500, fontSize: "clamp(30px, 3.8vw, 46px)", color: COCOA, margin: "0 0 14px", lineHeight: 1.12 }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {subtitle && (
              <p style={{ fontFamily: FONT_B, fontWeight: 400, fontSize: 15, color: "rgba(43,24,16,0.55)", margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
            <svg aria-hidden viewBox="0 0 160 10" style={{ width: 120, height: 8, margin: "20px auto 0", display: "block" }}>
              <path d="M0 5 Q 8 0 16 5 T 32 5 T 48 5 T 64 5 T 80 5 T 96 5 T 112 5 T 128 5 T 144 5 T 160 5" fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.5" />
            </svg>
          </div>
        )}

        <div className="sw01-loc-grid">
          {branches.map((b, i) => (
            <div key={i} className="sw01-loc-card">
              <div className="sw01-loc-card-brackets" aria-hidden />

              {/* Pin badge */}
              <div className="sw01-loc-pin">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>

              <h3 className="sw01-loc-name">
                <GenericEditableText sectionId={sectionId} field={`branches.${i}.name`} value={b.name} tag="span" />
              </h3>

              {/* Dotted-leader rows */}
              <div className="sw01-loc-row">
                <span className="sw01-loc-label">Adresa</span>
                <span className="sw01-loc-dots" />
                <span className="sw01-loc-val">
                  <GenericEditableText sectionId={sectionId} field={`branches.${i}.address`} value={b.address} tag="span" />
                </span>
              </div>

              <div className="sw01-loc-row">
                <span className="sw01-loc-label">Otevřeno</span>
                <span className="sw01-loc-dots" />
                <span className="sw01-loc-val">
                  <GenericEditableText sectionId={sectionId} field={`branches.${i}.hours`} value={b.hours} tag="span" />
                </span>
              </div>

              <div className="sw01-loc-row">
                <span className="sw01-loc-label">Telefon</span>
                <span className="sw01-loc-dots" />
                <span className="sw01-loc-val">
                  <a href={`tel:${(b.phone || "").replace(/\s/g, "")}`}>
                    <GenericEditableText sectionId={sectionId} field={`branches.${i}.phone`} value={b.phone} tag="span" />
                  </a>
                </span>
              </div>

              {b.mapUrl && (
                <a href={b.mapUrl} target="_blank" rel="noopener noreferrer" className="sw01-loc-map">
                  Navigovat
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Global contact strip */}
        {(email || phone) && (
          <div className="sw01-loc-contact">
            {phone && (
              <div className="sw01-loc-ci">
                <span className="sw01-loc-ci-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>
                </span>
                <div>
                  <p className="sw01-loc-ci-label">Telefon</p>
                  <p className="sw01-loc-ci-text" style={{ margin: 0 }}>
                    <a href={`tel:${phone.replace(/\s/g, "")}`}>
                      <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                    </a>
                  </p>
                </div>
              </div>
            )}
            {email && (
              <div className="sw01-loc-ci">
                <span className="sw01-loc-ci-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>
                </span>
                <div>
                  <p className="sw01-loc-ci-label">E-mail</p>
                  <p className="sw01-loc-ci-text" style={{ margin: 0 }}>
                    <a href={`mailto:${email}`}>
                      <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── autoskola-01 Contact — Road Editorial Motion ────────────────────────────
// Midnight ink bg, 2-col: dark glass form card left, contact info right
// with dashed road-lane leader dots, yellow corner brackets, orange focus glow
// ─────────────────────────────────────────────────────────────────────────────
function ContactAutoskola01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const heading    = String(content.heading    ?? "Napište nám");
  const subheading = String(content.subheading ?? "Rádi odpovíme na dotazy ohledně kurzů, termínů i cen.");
  const phone      = String(content.phone      ?? "777 888 999");
  const email      = String(content.email      ?? "info@drivecz.cz");
  const address    = String(content.address    ?? "Hlavní 47, 602 00 Brno");
  const hours      = String(content.hours      ?? "Po–Pá 8:00–17:00, So 9:00–12:00");
  const ctaText    = String(content.ctaText    ?? "Odeslat dotaz");
  const ff         = (content.formFields as Record<string, string>) ?? {};

  const INK    = "#0f172a";
  const INK2   = "#1a2540";
  const BONE   = "#fafaf7";
  const ORANGE = "#f16823";
  const YELLOW = "#ffce00";
  const SLATE  = "#94a3b8";
  const FONT_D = "'Space Grotesk', 'Inter', sans-serif";
  const FONT_B = "'Inter Tight', 'Inter', sans-serif";

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "13px 16px", fontFamily: FONT_B, fontSize: 14,
    border: `1px solid ${SLATE}25`, borderRadius: 0, outline: "none",
    backgroundColor: `${BONE}08`, color: BONE, boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const InfoRow = ({ icon, label, text, field }: { icon: React.ReactNode; label: string; text: string; field: string }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 0", borderBottom: `1px dashed ${SLATE}15` }}>
      <div style={{ flexShrink: 0, width: 40, height: 40, backgroundColor: `${ORANGE}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      <div style={{ paddingTop: 2 }}>
        <div style={{ fontFamily: FONT_B, fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: SLATE, marginBottom: 3 }}>{label}</div>
        <div style={{ fontFamily: FONT_B, fontSize: "0.9rem", color: BONE, lineHeight: 1.5 }}>
          <GenericEditableText sectionId={sectionId} field={field} value={text} tag="span" />
        </div>
      </div>
    </div>
  );

  const ic = (path: React.ReactNode) => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{path}</svg>
  );

  return (
    <section data-template="autoskola-01" id={String(sectionId)} className="as01-contact" style={{ backgroundColor: INK, padding: "96px clamp(24px, 6vw, 80px)", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 0, borderTop: `2px dashed ${ORANGE}40` }} aria-hidden="true" />

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ width: 32, height: 0, borderTop: `2px dashed ${ORANGE}` }} aria-hidden="true" />
            <span style={{ fontFamily: FONT_B, fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: ORANGE }}>Kontakt</span>
            <span style={{ width: 32, height: 0, borderTop: `2px dashed ${ORANGE}` }} aria-hidden="true" />
          </div>
          <h2 style={{ fontFamily: FONT_D, fontWeight: 700, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: BONE, margin: "0 0 10px", letterSpacing: "-0.01em" }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <p style={{ fontFamily: FONT_B, fontWeight: 400, fontSize: "1rem", color: SLATE, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
          </p>
        </div>

        {/* 2-col grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px, 5vw, 64px)", alignItems: "start" }}>

          {/* Form — dark glass card */}
          <div style={{ backgroundColor: INK2, border: `1px solid ${SLATE}15`, padding: "36px 32px", position: "relative" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" style={{ position: "absolute", top: 10, right: 10, opacity: 0.25 }}>
              <path d="M18 0 H12 M18 0 V6" stroke={YELLOW} strokeWidth="1.5"/>
            </svg>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" style={{ position: "absolute", bottom: 10, left: 10, opacity: 0.25 }}>
              <path d="M0 18 H6 M0 18 V12" stroke={YELLOW} strokeWidth="1.5"/>
            </svg>

            <form onSubmit={e => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input type="text" placeholder={ff.namePlaceholder ?? "Jméno a příjmení"} className="as01-input" style={inputStyle} />
              <input type="email" placeholder={ff.emailPlaceholder ?? "Váš e-mail"} className="as01-input" style={inputStyle} />
              <input type="tel" placeholder={ff.phonePlaceholder ?? "Telefon (nepovinné)"} className="as01-input" style={inputStyle} />
              <textarea placeholder={ff.messagePlaceholder ?? "Napište nám — dotaz, zájem o kurz, termín..."} rows={5} className="as01-input" style={{ ...inputStyle, resize: "vertical" }} />
              <button type="submit" className="as01-contact-submit"
                style={{ padding: "13px 28px", backgroundColor: YELLOW, color: INK, fontFamily: FONT_D, fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", border: "none", cursor: "pointer", transition: "background-color 0.2s, transform 0.15s", alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8 }}>
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </form>
          </div>

          {/* Info — right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <InfoRow
              icon={ic(<><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.36 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></>)}
              label="Telefon" text={phone} field="phone"
            />
            <InfoRow
              icon={ic(<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>)}
              label="E-mail" text={email} field="email"
            />
            <InfoRow
              icon={ic(<><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></>)}
              label="Adresa" text={address} field="address"
            />
            <InfoRow
              icon={ic(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>)}
              label="Otevírací doba" text={hours} field="hours"
            />

            {/* Response time badge */}
            <div style={{ marginTop: 24, backgroundColor: `${ORANGE}12`, borderLeft: `3px solid ${ORANGE}`, padding: "18px 20px" }}>
              <p style={{ fontFamily: FONT_D, fontWeight: 700, fontSize: "0.9rem", color: BONE, margin: "0 0 4px" }}>Rychlá odpověď</p>
              <p style={{ fontFamily: FONT_B, fontWeight: 400, fontSize: "0.83rem", color: SLATE, margin: 0, lineHeight: 1.6 }}>
                Na vaše dotazy odpovídáme zpravidla do jednoho pracovního dne.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .as01-contact > div > div[style*="grid"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── edu-01-contact ────────────────────────────────────────────────────────────
// Split layout: vlevo info (telefon, email, adresa, hodiny, status),
// vpravo formulář (jméno, email, zpráva, odeslat). Navy/blue téma.
// ─────────────────────────────────────────────────────────────────────────────
function ContactEdu01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY = "#132339";
  const BLUE = "#0059df";
  const FONT = "'Libre Franklin', Arial, sans-serif";

  const eyebrow    = String(content.eyebrow    ?? "Kontakt");
  const heading    = String(content.heading    ?? "Ozvěte se nám");
  const subheading = String(content.subheading ?? "Zanechte nám zprávu a ozveme se vám nejpozději do druhého pracovního dne.");
  const phone      = String(content.phone      ?? "+420 775 100 200");
  const email      = String(content.email      ?? "info@akademiaplus.cz");
  const address    = String(content.address    ?? "Veveří 12, 602 00 Brno");
  const hours      = String(content.hours      ?? "Po–Pá 8:00–19:00 · So 9:00–13:00");
  const status     = String(content.status     ?? "Právě přijímáme nové studenty!");
  const phoneLabel   = String(content.phoneLabel   ?? "Telefon");
  const emailLabel   = String(content.emailLabel   ?? "E-mail");
  const addressLabel = String(content.addressLabel ?? "Adresa");
  const hoursLabel   = String(content.hoursLabel   ?? "Otevírací doba");
  const formTitle    = String(content.formTitle    ?? "Napište nám");
  const nameLabel    = String(content.nameLabel    ?? "Jméno");
  const formEmailLabel = String(content.formEmailLabel ?? "E-mail");
  const subjectLabel = String(content.subjectLabel ?? "Předmět / zájem");
  const messageLabel = String(content.messageLabel ?? "Zpráva");
  const submitLabel  = String(content.submitLabel  ?? "Odeslat zprávu");
  const formNote     = String(content.formNote     ?? "Odpovídáme do 24 hodin. Nezávazně a zdarma.");
  const namePlaceholder    = String(content.namePlaceholder    ?? "Jana Nováková");
  const emailPlaceholder   = String(content.emailPlaceholder   ?? "jana@email.cz");
  const subjectPlaceholder = String(content.subjectPlaceholder ?? "Příprava na maturitu z matematiky");
  const messagePlaceholder = String(content.messagePlaceholder ?? "Popište nám, s čím potřebujete pomoci…");

  const infos = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      ),
      label: phoneLabel, labelField: "phoneLabel", value: phone, field: "phone", href: `tel:${phone.replace(/\s/g, "")}`,
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
      ),
      label: emailLabel, labelField: "emailLabel", value: email, field: "email", href: `mailto:${email}`,
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
        </svg>
      ),
      label: addressLabel, labelField: "addressLabel", value: address, field: "address", href: undefined,
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>
      ),
      label: hoursLabel, labelField: "hoursLabel", value: hours, field: "hours", href: undefined,
    },
  ];

  const secRef = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .edu01ct{padding:100px 40px;background:#fff;font-family:${FONT};}
        .edu01ct-inner{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:start;}
        /* LEFT info */
        .edu01ct-left,.edu01ct-form{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease;}
        .edu01ct-left.in{opacity:1;transform:translateY(0);}
        .edu01ct-form.in{opacity:1;transform:translateY(0);transition-delay:.12s;}
        .edu01ct-eyebrow{display:inline-flex;align-items:center;gap:8px;color:${BLUE};font-size:12px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:12px;}
        .edu01ct-eyebrow::before{content:'';width:22px;height:1.5px;background:${BLUE};opacity:.5;}
        .edu01ct-left h2{font-family:${FONT};font-size:clamp(1.8rem,3vw,2.6rem);font-weight:800;color:${NAVY};margin:0 0 12px;letter-spacing:-0.04em;line-height:1.15;}
        .edu01ct-sub{font-size:15px;color:#6b7280;line-height:1.7;margin:0 0 36px;}
        .edu01ct-status{display:inline-flex;align-items:center;gap:8px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:40px;padding:8px 16px;font-size:13px;font-weight:600;color:#15803d;margin-bottom:36px;}
        .edu01ct-status-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 0 rgba(34,197,94,.5);animation:edu01ctpulse 2s ease-in-out infinite;}
        @keyframes edu01ctpulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(34,197,94,.5);}50%{opacity:0.5;box-shadow:0 0 0 6px rgba(34,197,94,0);}}
        .edu01ct-infos{display:flex;flex-direction:column;gap:18px;}
        .edu01ct-info{display:flex;align-items:flex-start;gap:14px;padding:6px;border-radius:12px;transition:background .2s ease;}
        .edu01ct-info:hover{background:#f7f9fd;}
        .edu01ct-info-icon{width:42px;height:42px;border-radius:11px;background:#f3f6fb;color:${BLUE};display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .25s ease,color .25s ease,transform .25s ease;}
        .edu01ct-info:hover .edu01ct-info-icon{background:${BLUE};color:#fff;transform:scale(1.06);}
        .edu01ct-info-label{font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;}
        .edu01ct-info-val{font-size:14px;font-weight:600;color:${NAVY};text-decoration:none;transition:color .2s;}
        .edu01ct-info-val:hover{color:${BLUE};}
        /* RIGHT form */
        .edu01ct-form{background:linear-gradient(160deg,#f3f6fb 0%,#eef3fb 100%);border-radius:20px;padding:40px 36px;border:1px solid #e8eef7;}
        .edu01ct-form h3{font-family:${FONT};font-size:20px;font-weight:700;color:${NAVY};margin:0 0 24px;}
        .edu01ct-field{margin-bottom:16px;}
        .edu01ct-field label{display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;}
        .edu01ct-field input,.edu01ct-field textarea{width:100%;box-sizing:border-box;padding:12px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-family:${FONT};font-size:14px;color:${NAVY};background:#fff;outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
        .edu01ct-field input:focus,.edu01ct-field textarea:focus{border-color:${BLUE};box-shadow:0 0 0 4px rgba(0,89,223,.1);}
        .edu01ct-field textarea{resize:vertical;min-height:120px;}
        .edu01ct-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .edu01ct-btn{width:100%;padding:15px;background:${BLUE};color:#fff;font-family:${FONT};font-size:15px;font-weight:700;border:none;border-radius:62px;cursor:pointer;box-shadow:0 8px 22px rgba(0,89,223,.28);transition:background 0.2s,transform 0.2s,box-shadow .25s;margin-top:8px;}
        .edu01ct-btn:hover{background:#0032b2;transform:translateY(-2px);box-shadow:0 12px 30px rgba(0,89,223,.4);}
        .edu01ct-note{font-size:12px;color:#9ca3af;text-align:center;margin-top:12px;}
        @media(max-width:900px){
          .edu01ct-inner{grid-template-columns:1fr;gap:48px;}
          .edu01ct{padding:72px 24px;}
          .edu01ct-row{grid-template-columns:1fr;}
          .edu01ct-form{padding:28px 24px;}
        }
        @media(prefers-reduced-motion:reduce){.edu01ct-left,.edu01ct-form{opacity:1!important;transform:none!important;}}
      `}</style>

      <section id={String(sectionId)} className="edu01ct" data-template="edu-01-contact" ref={secRef}>
        <div className="edu01ct-inner">
          {/* LEFT — contact info */}
          <div className={`edu01ct-left${vis ? " in" : ""}`}>
            <span className="edu01ct-eyebrow">
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </span>
            <h2>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            <p className="edu01ct-sub">
              <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
            </p>
            <div className="edu01ct-status">
              <span className="edu01ct-status-dot" />
              <GenericEditableText sectionId={sectionId} field="status" value={status} tag="span" />
            </div>
            <div className="edu01ct-infos">
              {infos.map((info, i) => (
                <div key={i} className="edu01ct-info">
                  <div className="edu01ct-info-icon">{info.icon}</div>
                  <div>
                    <div className="edu01ct-info-label">
                      <GenericEditableText sectionId={sectionId} field={info.labelField} value={info.label} tag="span" />
                    </div>
                    {info.href ? (
                      <a href={info.href} className="edu01ct-info-val">
                        <GenericEditableText sectionId={sectionId} field={info.field} value={info.value} tag="span" />
                      </a>
                    ) : (
                      <div className="edu01ct-info-val">
                        <GenericEditableText sectionId={sectionId} field={info.field} value={info.value} tag="span" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — form */}
          <div className={`edu01ct-form${vis ? " in" : ""}`}>
            <h3>
              <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" />
            </h3>
            <div className="edu01ct-row">
              <div className="edu01ct-field">
                <label><GenericEditableText sectionId={sectionId} field="nameLabel" value={nameLabel} tag="span" /></label>
                <input type="text" placeholder={namePlaceholder} />
              </div>
              <div className="edu01ct-field">
                <label><GenericEditableText sectionId={sectionId} field="formEmailLabel" value={formEmailLabel} tag="span" /></label>
                <input type="email" placeholder={emailPlaceholder} />
              </div>
            </div>
            <div className="edu01ct-field">
              <label><GenericEditableText sectionId={sectionId} field="subjectLabel" value={subjectLabel} tag="span" /></label>
              <input type="text" placeholder={subjectPlaceholder} />
            </div>
            <div className="edu01ct-field">
              <label><GenericEditableText sectionId={sectionId} field="messageLabel" value={messageLabel} tag="span" /></label>
              <textarea placeholder={messagePlaceholder} />
            </div>
            <button className="edu01ct-btn" type="button">
              <GenericEditableText sectionId={sectionId} field="submitLabel" value={submitLabel} tag="span" />
            </button>
            <p className="edu01ct-note">
              <GenericEditableText sectionId={sectionId} field="formNote" value={formNote} tag="span" />
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── kids-01-contact ───────────────────────────────────────────────────── */
function ContactKids01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const heading            = String((content as any).heading            ?? "Chcete vědět více?");
  const subheading         = String((content as any).subheading         ?? "Zanechte nám na sebe kontakt — spojíme se s vámi!");
  const ctaText            = String((content as any).ctaText            ?? "KONTAKTUJTE NÁS");
  const ctaHref            = String((content as any).ctaHref            ?? "mailto:info@demo.cz");
  const contactLabel       = String((content as any).contactLabel       ?? "Kontakt");
  const pricingHeading     = String((content as any).pricingHeading     ?? "Cena kroužku");
  const pricingItems       = ((content as any).pricingItems   as Array<{ location: string; price: string }>) ?? [];
  const locationsHeading   = String((content as any).locationsHeading   ?? "5 unikátních lokalit");
  const locationsSubheading= String((content as any).locationsSubheading?? "");
  const locations          = ((content as any).locations      as string[]) ?? [];
  const email              = String((content as any).email              ?? "");
  const phone              = String((content as any).phone              ?? "");
  const address            = String((content as any).address            ?? "");

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
  const BLUE   = "#009BDE";
  const DARK   = "#1a2a1a";
  const FONT   = "'Gotham Rounded', 'Nunito', 'Trebuchet MS', sans-serif";
  const YELLOW = "#ffc107";

  return (
    <section
      ref={sRef}
      id={`section-${sectionId}`}
      style={{ background: GREEN, padding: "80px 24px 96px", fontFamily: FONT }}
    >
      <style>{`
        .k01con-fade {
          opacity: 0; transform: translateY(24px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .k01con-fade.vis { opacity: 1; transform: translateY(0); }
        .k01con-card {
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 28px 28px 24px;
          border: 1px solid rgba(255,255,255,0.18);
          transition: background 0.25s ease, transform 0.25s ease;
        }
        .k01con-card:hover {
          background: rgba(255,255,255,0.16);
          transform: translateY(-3px);
        }
        .k01con-cta {
          display: inline-block;
          background: ${YELLOW};
          color: #1a1a1a;
          font-family: ${FONT};
          font-weight: 800;
          font-size: 0.95rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 16px 40px;
          border-radius: 4px;
          text-decoration: none;
          margin-top: 28px;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .k01con-cta:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 18px rgba(255,193,7,0.45);
        }
        .k01con-info-link {
          color: ${LGREEN};
          text-decoration: none;
          font-weight: 600;
          transition: opacity 0.2s ease;
        }
        .k01con-info-link:hover { opacity: 0.75; }
        @media (max-width: 768px) {
          .k01con-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Heading */}
        <div className={`k01con-fade${vis ? " vis" : ""}`} style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, margin: "0 0 12px" }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "1.05rem", margin: 0, lineHeight: 1.65 }}>
            <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
          </p>
          <div>
            <a href={ctaHref} data-btn="primary" className="k01con-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>

        {/* Cards row */}
        <div className="k01con-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>

          {/* Pricing */}
          <div className={`k01con-card k01con-fade${vis ? " vis" : ""}`} style={{ transitionDelay: vis ? "100ms" : "0ms" }}>
            <h3 style={{ color: LGREEN, fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 16px" }}>
              <GenericEditableText sectionId={sectionId} field="pricingHeading" value={pricingHeading} tag="span" />
            </h3>
            {pricingItems.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                <span style={{ color: "#fff", fontSize: "0.9rem" }}>
                  <GenericEditableText sectionId={sectionId} field={`pricingItems.${i}.location`} value={p.location} tag="span" />
                </span>
                <span style={{ color: LGREEN, fontWeight: 700, fontSize: "0.9rem" }}>
                  <GenericEditableText sectionId={sectionId} field={`pricingItems.${i}.price`} value={p.price} tag="span" />
                </span>
              </div>
            ))}
          </div>

          {/* Locations */}
          <div className={`k01con-card k01con-fade${vis ? " vis" : ""}`} style={{ transitionDelay: vis ? "200ms" : "0ms" }}>
            <h3 style={{ color: LGREEN, fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 8px" }}>
              <GenericEditableText sectionId={sectionId} field="locationsHeading" value={locationsHeading} tag="span" />
            </h3>
            {locationsSubheading && (
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.8rem", margin: "0 0 14px", lineHeight: 1.5 }}>
                <GenericEditableText sectionId={sectionId} field="locationsSubheading" value={locationsSubheading} tag="span" />
              </p>
            )}
            {locations.map((loc, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <span style={{ color: LGREEN, fontWeight: 700, fontSize: "1rem" }}>📍</span>
                <span style={{ color: "#fff", fontSize: "0.88rem" }}>
                  <GenericEditableText sectionId={sectionId} field={`locations.${i}`} value={loc} tag="span" />
                </span>
              </div>
            ))}
          </div>

          {/* Contact info */}
          <div className={`k01con-card k01con-fade${vis ? " vis" : ""}`} style={{ transitionDelay: vis ? "300ms" : "0ms" }}>
            <h3 style={{ color: LGREEN, fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 16px" }}>
              <GenericEditableText sectionId={sectionId} field="contactLabel" value={contactLabel} tag="span" />
            </h3>
            {phone && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ color: LGREEN }}>📞</span>
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="k01con-info-link">
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              </div>
            )}
            {email && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ color: LGREEN }}>✉️</span>
                <a href={`mailto:${email}`} className="k01con-info-link">
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              </div>
            )}
            {address && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ color: LGREEN, flexShrink: 0 }}>🏢</span>
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.88rem", lineHeight: 1.5 }}>
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── vet-01-contact ────────────────────────────────────────────────────────────
// Bílé bg, teal kicker + Forum H2, 2-col:
//   vlevo info karty (tel/email/adresa/hodiny) s teal ikonami
//   vpravo teal bg CTA karta + mailto odkaz
// ─────────────────────────────────────────────────────────────────────────────
function ContactVet01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const kickerRaw  = content.kicker;
  const headingRaw = content.heading;
  const kicker       = kickerRaw  === undefined ? "Kontakt" : String(kickerRaw);
  const heading      = headingRaw === undefined ? "Přijďte nás navštívit" : String(headingRaw);
  const showHeader   = !!(kicker.trim() || heading.trim());
  const phone        = String(content.phone        ?? "");
  const email        = String(content.email        ?? "");
  const address      = String(content.address      ?? "");
  const hours        = String(content.hours        ?? "");
  const hoursNote    = String(content.hoursNote    ?? "");
  const phoneLabel   = String(content.phoneLabel   ?? "Zavolejte nám");
  const emailLabel   = String(content.emailLabel   ?? "Napište nám");
  const addressLabel = String(content.addressLabel ?? "Kde nás najdete");
  const hoursLabel   = String(content.hoursLabel   ?? "Otevírací doba");
  const ctaText      = String(content.ctaText      ?? "Napsat e-mail");
  const ctaHref      = String(content.ctaHref      ?? `mailto:${email}`);
  const callLabel    = String(content.callLabel    ?? "Zavolat");
  const ctaCardTitle = String(content.ctaCardTitle ?? "Máte dotaz nebo chcete objednat mazlíčka?");
  const ctaCardBody  = String(content.ctaCardBody  ?? "Neváhejte nás kontaktovat. Rádi odpovíme na vaše otázky a pomůžeme s objednáním termínu.");
  const mapSrc       = String(content.mapSrc       ?? "https://www.openstreetmap.org/export/embed.html?bbox=16.590%2C49.188%2C16.624%2C49.202&layer=mapnik&marker=49.195%2C16.607");

  const TEAL   = "#0d7486";
  const PRIMARY= "#286C7E";
  const TEAL_L = "#42aaba";
  const DARK   = "#1a2c33";
  const FONT_H = "'Forum', 'Georgia', serif";
  const FONT_B = "'Roboto Condensed', 'Roboto', sans-serif";

  const InfoCard = ({ icon, label, children }: { icon: React.ReactNode; label: React.ReactNode; children: React.ReactNode }) => (
    <div className="v01con-card">
      <span className="v01con-badge" aria-hidden="true">{icon}</span>
      <div>
        <p className="v01con-card-label">{label}</p>
        <div className="v01con-card-val">{children}</div>
      </div>
    </div>
  );

  return (
    <section
      id="kontakt"
      data-template="vet-01-contact"
      style={{ background: "linear-gradient(180deg,#f4fafb,#fff)", padding: "clamp(64px,8vw,104px) clamp(20px,5vw,40px)" }}
    >
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Forum&family=Roboto+Condensed:wght@400;500;700&display=swap" />
      <style>{`
        .v01con-inner { max-width: 1160px; margin: 0 auto; }
        .v01con-header { text-align:center; margin-bottom: 52px; }
        .v01con-kicker { display:inline-flex; align-items:center; gap:9px; font-family: ${FONT_B}; font-size: 13px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${TEAL}; margin: 0 0 14px; }
        .v01con-kicker svg { color:${TEAL_L}; }
        .v01con-heading { font-family: ${FONT_H}; font-weight: 400; font-size: clamp(2rem,3.4vw,2.9rem); color: ${DARK}; margin: 0 0 16px; line-height:1.12; }
        .v01con-rule { width:60px; height:3px; background:linear-gradient(90deg,${TEAL},${TEAL_L}); border-radius:2px; margin:0 auto; }
        .v01con-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: stretch; }
        @media (max-width: 820px) { .v01con-grid { grid-template-columns: 1fr; } }
        .v01con-cards { display:flex; flex-direction:column; gap:14px; }
        .v01con-card { display:flex; gap:16px; align-items:flex-start; background:#fff; border:1px solid #e4eef1; border-radius:14px; padding:20px 22px; transition:transform 0.28s cubic-bezier(.4,0,.2,1), box-shadow 0.28s, border-color 0.28s; }
        .v01con-card:hover { transform:translateY(-3px); box-shadow:0 12px 30px rgba(13,116,134,0.13); border-color:#cfe6ec; }
        .v01con-badge { width:46px; height:46px; border-radius:13px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:linear-gradient(140deg,#e6f3f5,#d4e9ee); color:${TEAL}; transition:background 0.3s, color 0.3s, transform 0.34s cubic-bezier(.34,1.4,.64,1); }
        .v01con-card:hover .v01con-badge { background:linear-gradient(140deg,${TEAL},${PRIMARY}); color:#fff; transform:rotate(-6deg) scale(1.06); }
        .v01con-card-label { font-family:${FONT_B}; font-size:12px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:${TEAL_L}; margin:0 0 5px; }
        .v01con-card-val { font-family:${FONT_B}; font-size:16px; color:${DARK}; line-height:1.5; }
        .v01con-card-note { font-size:13.5px; color:#7a9ba6; margin-top:3px; }
        .v01con-link { color:${TEAL}; text-decoration:none; transition:color 0.2s; }
        .v01con-link:hover { color:${PRIMARY}; text-decoration:underline; }
        /* CTA card */
        .v01con-cta-card { position:relative; overflow:hidden; background:linear-gradient(150deg,${TEAL},${PRIMARY}); border-radius:20px; padding:44px 40px; display:flex; flex-direction:column; gap:18px; box-shadow:0 18px 44px rgba(13,116,134,0.28); }
        .v01con-cta-card h3 { font-family:${FONT_H}; font-size:1.7rem; font-weight:400; color:#fff; margin:0; line-height:1.2; position:relative; z-index:1; }
        .v01con-cta-card p  { font-family:${FONT_B}; font-size:15.5px; color:rgba(255,255,255,0.85); line-height:1.65; margin:0; position:relative; z-index:1; }
        .v01con-cta-btns { display:flex; flex-wrap:wrap; gap:12px; margin-top:8px; position:relative; z-index:1; }
        .v01con-cta-btn { display:inline-flex; align-items:center; gap:9px; padding:14px 28px; background:#fff; color:${TEAL}; font-family:${FONT_B}; font-size:16px; font-weight:600; text-decoration:none; border-radius:50px; transition:transform 0.26s, box-shadow 0.26s; }
        .v01con-cta-btn:hover { transform:translateY(-2px); box-shadow:0 10px 24px rgba(0,0,0,0.2); }
        .v01con-cta-btn.ghost { background:rgba(255,255,255,0.12); color:#fff; border:1.5px solid rgba(255,255,255,0.5); }
        .v01con-cta-btn.ghost:hover { background:rgba(255,255,255,0.2); }
        .v01con-cta-paw { position:absolute; right:-24px; bottom:-24px; width:180px; height:180px; fill:#fff; opacity:0.08; transform:rotate(-16deg); pointer-events:none; }
        /* Map */
        .v01con-map { margin-top:28px; border-radius:18px; overflow:hidden; border:1px solid #e4eef1; box-shadow:0 10px 30px rgba(13,116,134,0.1); line-height:0; }
        .v01con-map iframe { width:100%; height:340px; border:0; display:block; filter:grayscale(0.15); }
      `}</style>

      <div className="v01con-inner">
        {showHeader && (
          <div className="v01con-header">
            <p className="v01con-kicker">
              <svg width="15" height="15" viewBox="0 0 60 60" fill="currentColor" aria-hidden="true"><circle cx="18" cy="14" r="6"/><circle cx="30" cy="9" r="6"/><circle cx="42" cy="14" r="6"/><ellipse cx="30" cy="34" rx="13" ry="11"/><circle cx="23" cy="45" r="5"/><circle cx="37" cy="45" r="5"/></svg>
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            </p>
            <h2 className="v01con-heading">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            <div className="v01con-rule" />
          </div>
        )}

        <div className="v01con-grid">
          {/* Info karty vlevo */}
          <div className="v01con-cards">
            {phone && (
              <InfoCard label={<GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span" />} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.15a16 16 0 006.94 6.94l1.51-1.51a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>}>
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="v01con-link">
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              </InfoCard>
            )}
            {email && (
              <InfoCard label={<GenericEditableText sectionId={sectionId} field="emailLabel" value={emailLabel} tag="span" />} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}>
                <a href={`mailto:${email}`} className="v01con-link">
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              </InfoCard>
            )}
            {address && (
              <InfoCard label={<GenericEditableText sectionId={sectionId} field="addressLabel" value={addressLabel} tag="span" />} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>}>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </InfoCard>
            )}
            {hours && (
              <InfoCard label={<GenericEditableText sectionId={sectionId} field="hoursLabel" value={hoursLabel} tag="span" />} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>}>
                <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
                {hoursNote && (
                  <div className="v01con-card-note">
                    <GenericEditableText sectionId={sectionId} field="hoursNote" value={hoursNote} tag="span" />
                  </div>
                )}
              </InfoCard>
            )}
          </div>

          {/* CTA karta vpravo */}
          <div className="v01con-cta-card">
            <svg className="v01con-cta-paw" viewBox="0 0 60 60" aria-hidden="true"><circle cx="18" cy="14" r="6"/><circle cx="30" cy="9" r="6"/><circle cx="42" cy="14" r="6"/><ellipse cx="30" cy="34" rx="13" ry="11"/><circle cx="23" cy="45" r="5"/><circle cx="37" cy="45" r="5"/></svg>
            <h3><GenericEditableText sectionId={sectionId} field="ctaCardTitle" value={ctaCardTitle} tag="span" /></h3>
            <p><GenericEditableText sectionId={sectionId} field="ctaCardBody" value={ctaCardBody} tag="span" /></p>
            <div className="v01con-cta-btns">
              <a href={ctaHref} className="v01con-cta-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>
              {phone && (
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="v01con-cta-btn ghost">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.15a16 16 0 006.94 6.94l1.51-1.51a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  <GenericEditableText sectionId={sectionId} field="callLabel" value={callLabel} tag="span" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="v01con-map">
          <iframe src={mapSrc} title="Mapa — poloha kliniky" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>
    </section>
  );
}


// ── pethotel-01-contact ───────────────────────────────────────────────────────
// 2-col: left brown info card, right form card. Pill submit, rounded, warm.
// ─────────────────────────────────────────────────────────────────────────────
function ContactPethotel01({
  content,
  sectionId,
}: {
  content: Record<string, unknown>;
  sectionId: number;
}) {
  const eyebrowRaw  = (content as Record<string,unknown>).eyebrow;
  const titleRaw    = (content as Record<string,unknown>).heading;
  const subtitleRaw = (content as Record<string,unknown>).subheading;
  const eyebrow  = eyebrowRaw  === undefined ? "Kontakt" : String(eyebrowRaw);
  const heading  = titleRaw    === undefined ? "Rezervujte místo pro vašeho mazlíčka" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Kapacita je omezená — napište nám co nejdříve" : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || heading.trim() || subtitle.trim());

  const phone      = String(content.phone      ?? "736 456 789");
  const email      = String(content.email      ?? "info@tlapkuvraj.cz");
  const address    = String(content.address    ?? "Luční 18, 602 00 Brno-Žabovřesky");
  const hours      = String(content.hours      ?? "Po–Pá 7:00–19:00, So–Ne 8:00–17:00");
  const formNote   = String(content.formNote   ?? "Odpovídáme zpravidla do 4 hodin.");
  const infoTitle  = String(content.infoTitle  ?? "Kde nás najdete");
  const formTitle  = String(content.formTitle  ?? "Rezervační formulář");
  const submitLabel= String(content.submitLabel ?? "Odeslat rezervaci");
  const successTitle = String(content.successTitle ?? "Odesláno!");
  const successText  = String(content.successText ?? "Ozveme se vám co nejdříve.");

  const BROWN  = "#712419";
  const RED    = "#D6123D";
  const CREAM  = "#fff5ee";
  const BEIGE  = "#EEDEC3";
  const FONT   = "'Quicksand', Arial, sans-serif";

  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", dog: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <>
      <style>{`
        .ph01ct { background:${CREAM}; padding:100px 0; font-family:${FONT}; }
        .ph01ct-inner { max-width:1100px; margin:0 auto; padding:0 32px; }
        .ph01ct-header { text-align:center; margin-bottom:56px; }
        .ph01ct-eyebrow { font-family:${FONT}; font-size:13px; font-weight:700; color:${RED}; text-transform:uppercase; letter-spacing:0.14em; margin:0 0 12px; }
        .ph01ct-h2 { color:${BROWN}; font-size:clamp(26px,3.2vw,42px); font-weight:800; margin:0 0 10px; font-family:${FONT}; line-height:1.18; }
        .ph01ct-sub { color:#a08070; font-size:17px; font-weight:500; margin:0; }
        .ph01ct-cols { display:grid; grid-template-columns:1fr 1fr; gap:32px; align-items:start; }
        @media(max-width:768px){ .ph01ct-cols { grid-template-columns:1fr; gap:28px; } }

        .ph01ct-info { background:${BROWN}; border-radius:24px; padding:44px 36px; color:#fff; }
        .ph01ct-info-title { font-size:20px; font-weight:800; margin:0 0 32px; font-family:${FONT}; }
        .ph01ct-row { display:flex; align-items:flex-start; gap:14px; margin-bottom:22px; transition:transform .2s ease; }
        .ph01ct-row:hover { transform:translateX(4px); }
        .ph01ct-row:last-child { margin-bottom:0; }
        .ph01ct-row-icon { width:40px; height:40px; border-radius:12px; background:rgba(255,255,255,0.12); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .ph01ct-row-text { font-size:15.5px; font-weight:600; line-height:1.5; }
        .ph01ct-row-text a { color:#fff; text-decoration:none; }
        .ph01ct-row-text a:hover { text-decoration:underline; }

        .ph01ct-form-wrap { background:#fff; border-radius:24px; padding:44px 36px; box-shadow:0 6px 28px rgba(113,36,25,0.09); }
        .ph01ct-form-title { font-size:20px; font-weight:800; color:${BROWN}; margin:0 0 28px; font-family:${FONT}; }
        .ph01ct-field { margin-bottom:16px; }
        .ph01ct-label { display:block; font-size:13px; font-weight:700; color:${BROWN}; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px; font-family:${FONT}; }
        .ph01ct-input,.ph01ct-textarea { width:100%; box-sizing:border-box; padding:13px 16px; border:2px solid ${BEIGE}; border-radius:12px; font-family:${FONT}; font-size:15px; font-weight:500; color:${BROWN}; background:${CREAM}; transition:border-color .25s ease,box-shadow .25s ease; outline:none; }
        .ph01ct-input:focus,.ph01ct-textarea:focus { border-color:${RED}; box-shadow:0 0 0 3px rgba(214,18,61,0.1); }
        .ph01ct-textarea { min-height:90px; resize:vertical; }
        .ph01ct-note { display:flex; align-items:center; gap:8px; font-size:13px; color:#a08070; font-weight:500; margin-bottom:20px; }
        .ph01ct-submit { width:100%; padding:16px; background:${RED}; color:#fff; border:none; border-radius:50px; font-family:${FONT}; font-size:16px; font-weight:700; cursor:pointer; transition:background .25s ease,transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .25s ease; box-shadow:0 6px 20px rgba(214,18,61,0.3); }
        .ph01ct-submit:hover { background:#b80d32; transform:translateY(-2px); box-shadow:0 10px 28px rgba(214,18,61,0.4); }
        .ph01ct-success { text-align:center; padding:40px 0; }
        .ph01ct-success-icon { font-size:48px; margin-bottom:16px; }
        .ph01ct-success h3 { color:${BROWN}; font-size:22px; font-weight:800; margin:0 0 8px; font-family:${FONT}; }
        .ph01ct-success p { color:#a08070; font-size:15px; font-weight:500; margin:0; }
      `}</style>

      <section className="ph01ct" data-template="pethotel-01-contact" id="kontakt">
        <div className="ph01ct-inner">

          {showHeader && (
            <div className="ph01ct-header">
              {eyebrow.trim() && (
                <p className="ph01ct-eyebrow">
                  <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
                </p>
              )}
              {heading.trim() && (
                <h2 className="ph01ct-h2">
                  <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
                </h2>
              )}
              {subtitle.trim() && (
                <p className="ph01ct-sub">
                  <GenericEditableText sectionId={sectionId} field="subheading" value={subtitle} tag="span" />
                </p>
              )}
            </div>
          )}

          <div className="ph01ct-cols">
            {/* Info card */}
            <div className="ph01ct-info">
              <p className="ph01ct-info-title">
                <GenericEditableText sectionId={sectionId} field="infoTitle" value={infoTitle} tag="span" />
              </p>

              {phone && (
                <div className="ph01ct-row">
                  <span className="ph01ct-row-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.12 1.2 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.45-.45a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/></svg>
                  </span>
                  <div className="ph01ct-row-text">
                    <a href={`tel:${phone.replace(/\s/g, "")}`}>
                      <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                    </a>
                  </div>
                </div>
              )}

              {email && (
                <div className="ph01ct-row">
                  <span className="ph01ct-row-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
                  </span>
                  <div className="ph01ct-row-text">
                    <a href={`mailto:${email}`}>
                      <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                    </a>
                  </div>
                </div>
              )}

              {address && (
                <div className="ph01ct-row">
                  <span className="ph01ct-row-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                  </span>
                  <div className="ph01ct-row-text">
                    <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                  </div>
                </div>
              )}

              {hours && (
                <div className="ph01ct-row">
                  <span className="ph01ct-row-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  </span>
                  <div className="ph01ct-row-text">
                    <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="ph01ct-form-wrap">
              {sent ? (
                <div className="ph01ct-success">
                  <div className="ph01ct-success-icon">🐾</div>
                  <h3><GenericEditableText sectionId={sectionId} field="successTitle" value={successTitle} tag="span" /></h3>
                  <p><GenericEditableText sectionId={sectionId} field="successText" value={successText} tag="span" /></p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <p className="ph01ct-form-title">
                    <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" />
                  </p>

                  <div className="ph01ct-field">
                    <label className="ph01ct-label"><GenericEditableText sectionId={sectionId} field="labelName" value={String(content.labelName ?? "Vaše jméno")} tag="span" /></label>
                    <input type="text" className="ph01ct-input" placeholder="Jana Nováková" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>

                  <div className="ph01ct-field">
                    <label className="ph01ct-label"><GenericEditableText sectionId={sectionId} field="labelPhone" value={String(content.labelPhone ?? "Telefon")} tag="span" /></label>
                    <input type="tel" className="ph01ct-input" placeholder="604 000 000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                  </div>

                  <div className="ph01ct-field">
                    <label className="ph01ct-label"><GenericEditableText sectionId={sectionId} field="labelDog" value={String(content.labelDog ?? "Jméno a plemeno pejska")} tag="span" /></label>
                    <input type="text" className="ph01ct-input" placeholder="Rek, labradorský retrívr" value={form.dog} onChange={(e) => setForm({ ...form, dog: e.target.value })} />
                  </div>

                  <div className="ph01ct-field">
                    <label className="ph01ct-label"><GenericEditableText sectionId={sectionId} field="labelMessage" value={String(content.labelMessage ?? "Zpráva")} tag="span" /></label>
                    <textarea className="ph01ct-textarea" placeholder="Termín, typ pobytu, dotazy..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                  </div>

                  <div className="ph01ct-note">
                    <svg width="16" height="16" viewBox="0 0 60 60" fill={RED} aria-hidden="true" style={{opacity:.6,flexShrink:0}}>
                      <circle cx="18" cy="14" r="6"/><circle cx="30" cy="9" r="6"/><circle cx="42" cy="14" r="6"/>
                      <ellipse cx="30" cy="34" rx="13" ry="11"/><circle cx="23" cy="44" r="5"/><circle cx="37" cy="44" r="5"/>
                    </svg>
                    <GenericEditableText sectionId={sectionId} field="formNote" value={formNote} tag="span" />
                  </div>

                  <button type="submit" className="ph01ct-submit">
                    <GenericEditableText sectionId={sectionId} field="submitLabel" value={submitLabel} tag="span" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


function ContactGrooming01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GOLD  = "#d0aa57";
  const DARK  = "#101417";
  const FONT  = "'Hanken Grotesk', 'Inter', sans-serif";

  const eyebrowRaw = (content as Record<string, unknown>).kicker;
  const titleRaw   = (content as Record<string, unknown>).heading;
  const subRaw     = (content as Record<string, unknown>).subheading;
  const kicker     = eyebrowRaw === undefined ? "Napište nám" : String(eyebrowRaw);
  const heading    = titleRaw   === undefined ? "Rezervace" : String(titleRaw);
  const subheading = subRaw      === undefined ? "Objednejte svého mazlíčka online — ozveme se vám co nejdříve." : String(subRaw);
  const showHeader = !!(kicker.trim() || heading.trim() || subheading.trim());
  const phone      = String(content.phone      ?? "");
  const email      = String(content.email      ?? "");
  const address    = String(content.address    ?? "");
  const hours      = String(content.hours      ?? "");
  const nameLabel  = String(content.nameLabel  ?? "Jméno a příjmení");
  const emailLabel = String(content.emailLabel ?? "E-mail");
  const phoneLabel = String(content.phoneLabel ?? "Telefon");
  const msgLabel   = String(content.msgLabel   ?? "Zpráva / preferovaný termín");
  const submitLabel  = String(content.submitLabel  ?? "Odeslat rezervaci");
  const successText  = String(content.successText  ?? "Zpráva odeslána! Ozveme se vám co nejdříve.");

  type Social = { icon?: string; label?: string; href?: string };
  const socials = (content.socials as Social[]) ?? [];

  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  return (
    <section id="kontakt" data-template="grooming-01-contact" style={{ background: DARK, fontFamily: FONT }}>
      <div className="gr01ct-wrap">
        {/* Left — info */}
        <div className="gr01ct-left">
          <svg className="gr01ct-paw" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><ellipse cx="16" cy="21" rx="8.5" ry="6.5"/><ellipse cx="8.5" cy="14" rx="3.2" ry="4.2"/><ellipse cx="23.5" cy="14" rx="3.2" ry="4.2"/><ellipse cx="12.5" cy="11" rx="2.3" ry="3"/><ellipse cx="19.5" cy="11" rx="2.3" ry="3"/></svg>
          {showHeader && (
            <>
              <p className="gr01ct-kicker">
                <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
              </p>
              <h2 className="gr01ct-h2">
                <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
              </h2>
              <p className="gr01ct-sub">
                <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
              </p>
            </>
          )}
          <div className="gr01ct-info">
            {phone && (
              <div className="gr01ct-row">
                <span className="gr01ct-ico">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 13.5 19.79 19.79 0 0 1 1 4.82 2 2 0 0 1 3 2.67h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.92z"/></svg>
                </span>
                <span className="gr01ct-val">
                  <a href={`tel:${phone.replace(/\s/g,"")}`}>
                    <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                  </a>
                </span>
              </div>
            )}
            {email && (
              <div className="gr01ct-row">
                <span className="gr01ct-ico">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </span>
                <span className="gr01ct-val">
                  <a href={`mailto:${email}`}>
                    <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                  </a>
                </span>
              </div>
            )}
            {address && (
              <div className="gr01ct-row">
                <span className="gr01ct-ico">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </span>
                <span className="gr01ct-val">
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                </span>
              </div>
            )}
            {hours && (
              <div className="gr01ct-row">
                <span className="gr01ct-ico">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </span>
                <span className="gr01ct-val">
                  <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
                </span>
              </div>
            )}
          </div>
          {socials.length > 0 && (
            <div className="gr01ct-social">
              {socials.map((s, i) => (
                <a key={i} href={s.href ?? "#"} target="_blank" rel="noopener noreferrer" aria-label={s.label ?? s.icon ?? ""}>
                  {s.icon === "facebook" ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={GOLD}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
        {/* Right — form */}
        <div className="gr01ct-right">
          {sent ? (
            <div className="gr01ct-success">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill={GOLD}/><path d="M14 24l7 7 13-13" stroke={DARK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <p><GenericEditableText sectionId={sectionId} field="successText" value={successText} tag="span" /></p>
            </div>
          ) : (
            <form
              className="gr01ct-form"
              onSubmit={e => { e.preventDefault(); setSent(true); }}
            >
              <label className="gr01ct-field">
                <span className="gr01ct-label"><GenericEditableText sectionId={sectionId} field="nameLabel" value={nameLabel} tag="span" /></span>
                <input className="gr01ct-input" type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </label>
              <label className="gr01ct-field">
                <span className="gr01ct-label"><GenericEditableText sectionId={sectionId} field="emailLabel" value={emailLabel} tag="span" /></span>
                <input className="gr01ct-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </label>
              <label className="gr01ct-field">
                <span className="gr01ct-label"><GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span" /></span>
                <input className="gr01ct-input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </label>
              <label className="gr01ct-field">
                <span className="gr01ct-label"><GenericEditableText sectionId={sectionId} field="msgLabel" value={msgLabel} tag="span" /></span>
                <textarea className="gr01ct-input gr01ct-textarea" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
              </label>
              <button type="submit" className="gr01ct-submit">
                <GenericEditableText sectionId={sectionId} field="submitLabel" value={submitLabel} tag="span" />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── ucetni-01-contact ───────────────────────────────────────────────────────
// 1:1 ucetnictvispravne.cz section fa483bd + contact info
// - Full-width bg img (contact-bg.png, cover) + dark overlay 0.5
// - padding 6rem; max-width 1320px
// - 2-col: left = white H2 + lead + yellow CTA; right = 2×2 info cards
function ContactUcetni01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const YELLOW = "#FFB500";
  const FONT   = "'Space Grotesk', 'Inter', Arial, sans-serif";

  const title   = String(content.title   ?? "Kontaktujte nás");
  const lead    = String(content.lead    ?? "Rádi vám pomůžeme s vedením účetnictví nebo daňovým poradenstvím. Napište nám nebo zavolejte.");
  const ctaText = String(content.ctaText ?? "Začít spolupráci");
  const ctaHref = String(content.ctaHref ?? "#kontakt");
  const phone   = String(content.phone   ?? "+420 704 123 456");
  const email   = String(content.email   ?? "email@demo.cz");
  const address = String(content.address ?? "Ukázková 123, 110 00 Praha 1");
  const hours   = String(content.hours   ?? "Po–Pá 9:00–18:00");

  const info = [
    { icon: "📞", label: "Telefon", value: phone, field: "phone" },
    { icon: "✉️", label: "E-mail",  value: email,   field: "email" },
    { icon: "📍", label: "Adresa",  value: address, field: "address" },
    { icon: "🕐", label: "Hodiny",  value: hours,   field: "hours" },
  ];

  return (
    <section id="kontakt" style={{ position: "relative", padding: "6rem 0", fontFamily: FONT, overflow: "hidden" }}>
      {/* bg image */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url('/templates/ucetni-01/contact-bg.png')",
        backgroundSize: "cover", backgroundPosition: "center",
        zIndex: 0,
      }} aria-hidden="true" />
      {/* dark overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1 }} aria-hidden="true" />

      <style>{`
        .uc01ct-inner {
          position: relative; z-index: 2;
          max-width: 1320px; margin: 0 auto; padding: 0 20px;
          display: flex; align-items: flex-start; gap: 60px;
        }
        .uc01ct-left { flex: 0 0 45%; min-width: 0; }
        .uc01ct-right { flex: 1; min-width: 0; }
        .uc01ct-h2 {
          font-family: ${FONT}; font-size: 3rem; font-weight: 400;
          color: #ffffff; margin: 0 0 20px; line-height: 1.2;
        }
        .uc01ct-lead {
          font-family: ${FONT}; font-size: 1rem; color: rgba(255,255,255,0.85);
          margin: 0 0 36px; line-height: 1.65;
        }
        .uc01ct-cta {
          display: inline-flex; align-items: center; padding: 16px 24px;
          background: ${YELLOW}; color: #000000;
          font-family: ${FONT}; font-size: 1rem; font-weight: 500;
          text-decoration: none; border-radius: 8px; border: 1px solid ${YELLOW};
          transition: background 0.2s; white-space: nowrap;
        }
        .uc01ct-cta:hover { background: #e6a300; border-color: #e6a300; }
        .uc01ct-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
        }
        .uc01ct-card {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px; padding: 20px 20px;
          backdrop-filter: blur(6px);
          display: flex; flex-direction: column; gap: 6px;
        }
        .uc01ct-card-icon { font-size: 1.5rem; line-height: 1; }
        .uc01ct-card-label {
          font-family: ${FONT}; font-size: 0.78rem; font-weight: 500;
          color: ${YELLOW}; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .uc01ct-card-value {
          font-family: ${FONT}; font-size: 0.95rem; color: #ffffff; line-height: 1.4;
        }
        @media (max-width: 900px) {
          .uc01ct-inner { flex-direction: column; gap: 40px; }
          .uc01ct-left, .uc01ct-right { flex: none; width: 100%; }
          .uc01ct-h2 { font-size: 2rem; }
        }
        @media (max-width: 600px) {
          .uc01ct-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="uc01ct-inner">
        {/* Left */}
        <div className="uc01ct-left">
          <h2 className="uc01ct-h2">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p className="uc01ct-lead">
            <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
          </p>
          <a href={ctaHref} data-btn="primary" className="uc01ct-cta">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

        {/* Right — 2×2 info cards */}
        <div className="uc01ct-right">
          <div className="uc01ct-grid">
            {info.map((item, i) => (
              <div key={i} className="uc01ct-card">
                <span className="uc01ct-card-icon">{item.icon}</span>
                <span className="uc01ct-card-label">{item.label}</span>
                <span className="uc01ct-card-value">
                  <GenericEditableText sectionId={sectionId} field={item.field} value={item.value} tag="span" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── ucetni-02-contact ─────────────────────────────────────────────────────────
// grantex.cz style: dark green #004835 bg, 2-col info + white form card
// Left: gold overline, white H2 + lead, gold-icon contact items
// Right: white card with form, gold submit button
// ─────────────────────────────────────────────────────────────────────────────
function ContactUcetni02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GREEN  = "#004835";
  const GREEN2 = "#003828";
  const GOLD   = "#bca160";
  const WHITE  = "#ffffff";
  const FONT_H = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const FONT_B = "'Open Sans', Arial, sans-serif";

  const eyebrowRaw = (content as Record<string, unknown>).eyebrow;
  const titleRaw   = (content as Record<string, unknown>).title;
  const leadRaw    = (content as Record<string, unknown>).lead;
  const eyebrow = eyebrowRaw === undefined ? "Kontaktujte nás" : String(eyebrowRaw);
  const title   = titleRaw   === undefined ? "Pojďme se sejít" : String(titleRaw);
  const lead    = leadRaw    === undefined ? "Rádi vám pomůžeme s daňovým poradenstvím nebo vedením účetnictví." : String(leadRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || lead.trim());

  const phone     = String(content.phone     ?? "+420 704 123 456");
  const email     = String(content.email     ?? "email@demo.cz");
  const address   = String(content.address   ?? "Ukázková 123, 110 00 Praha 1");
  const hours     = String(content.hours     ?? "Po–Pá: 9:00–16:00");
  const formTitle = String(content.formTitle ?? "Zdarma konzultace");

  // editable labels / form copy
  const phoneLabel   = String(content.phoneLabel   ?? "Telefon");
  const emailLabel   = String(content.emailLabel   ?? "E-mail");
  const addressLabel = String(content.addressLabel ?? "Adresa");
  const hoursLabel   = String(content.hoursLabel   ?? "Otevírací doba");
  const nameFieldLabel = String(content.nameFieldLabel ?? "Jméno");
  const emailFieldLabel = String(content.emailFieldLabel ?? "E-mail");
  const phoneFieldLabel = String(content.phoneFieldLabel ?? "Telefon");
  const messageFieldLabel = String(content.messageFieldLabel ?? "Zpráva");
  const submitLabel  = String(content.submitLabel  ?? "Odeslat zprávu");
  const formNote     = String(content.formNote     ?? "Odpovíme do 24 hodin. Konzultace je zcela zdarma.");
  const namePlaceholder = String(content.namePlaceholder ?? "Jan Novák");
  const emailPlaceholder = String(content.emailPlaceholder ?? "jan@email.cz");
  const phonePlaceholder = String(content.phonePlaceholder ?? "+420 000 000 000");
  const messagePlaceholder = String(content.messagePlaceholder ?? "Stručně popište váš záměr nebo dotaz...");

  const iconPhone = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.61 5.07 2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10.7a16 16 0 0 0 6.29 6.29l1.06-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 18.3z"/></svg>`;
  const iconMail  = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
  const iconPin   = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  const iconClock = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

  const infoItems = [
    { icon: iconPhone, label: phoneLabel,   labelField: "phoneLabel",   value: phone,   field: "phone" },
    { icon: iconMail,  label: emailLabel,   labelField: "emailLabel",   value: email,   field: "email" },
    { icon: iconPin,   label: addressLabel, labelField: "addressLabel", value: address, field: "address" },
    { icon: iconClock, label: hoursLabel,   labelField: "hoursLabel",   value: hours,   field: "hours" },
  ];

  return (
    <>
      <style>{`
        .ucn02ct-section {
          position: relative;
          background:
            radial-gradient(120% 100% at 85% 15%, #016047 0%, ${GREEN} 50%, ${GREEN2} 100%);
          padding: 100px 24px;
          font-family: ${FONT_B};
          overflow: hidden;
        }
        .ucn02ct-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(188,161,96,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(188,161,96,0.045) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }
        .ucn02ct-inner {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: start;
        }
        .ucn02ct-left-col { animation: ucn02Up 0.75s cubic-bezier(.22,.61,.36,1) both; }
        .ucn02ct-info-item { transition: transform 0.3s ease; }
        .ucn02ct-info-item:hover { transform: translateX(5px); }
        .ucn02ct-info-icon { transition: background 0.3s ease, border-color 0.3s ease; }
        .ucn02ct-info-item:hover .ucn02ct-info-icon { background: rgba(188,161,96,0.18); border-color: ${GOLD}; }
        /* Left info side */
        .ucn02ct-overline {
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
        .ucn02ct-overline-bar {
          display: inline-block; width: 28px; height: 2px; background: ${GOLD};
        }
        .ucn02ct-h2 {
          font-family: ${FONT_H};
          font-size: clamp(1.7rem, 2.8vw, 2.4rem);
          font-weight: 700;
          color: ${WHITE};
          line-height: 1.15;
          margin: 0 0 20px 0;
        }
        .ucn02ct-lead {
          font-size: 1rem;
          color: rgba(255,255,255,0.72);
          line-height: 1.75;
          margin: 0 0 44px 0;
          max-width: 460px;
        }
        .ucn02ct-info-list { display: flex; flex-direction: column; gap: 22px; }
        .ucn02ct-info-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .ucn02ct-info-icon {
          width: 44px; height: 44px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(188,161,96,0.3);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ucn02ct-info-text { display: flex; flex-direction: column; gap: 2px; }
        .ucn02ct-info-label {
          font-family: ${FONT_H};
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: ${GOLD};
        }
        .ucn02ct-info-value {
          font-size: 0.95rem;
          font-weight: 500;
          color: ${WHITE};
        }
        /* Right form card */
        .ucn02ct-card {
          background: ${WHITE};
          border-radius: 12px;
          padding: 44px 40px;
          border-top: 3px solid ${GOLD};
          box-shadow: 0 30px 70px rgba(0,0,0,0.28);
          animation: ucn02Up 0.75s cubic-bezier(.22,.61,.36,1) 0.12s both;
        }
        .ucn02ct-card-title {
          font-family: ${FONT_H};
          font-size: 1.15rem;
          font-weight: 700;
          color: ${GREEN};
          margin: 0 0 28px 0;
        }
        .ucn02ct-form { display: flex; flex-direction: column; gap: 16px; }
        .ucn02ct-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .ucn02ct-field { display: flex; flex-direction: column; gap: 5px; }
        .ucn02ct-label {
          font-family: ${FONT_H};
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: #2d3d38;
          text-transform: uppercase;
        }
        .ucn02ct-input, .ucn02ct-textarea {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #d8e8e3;
          border-radius: 6px;
          font-family: ${FONT_B};
          font-size: 0.9rem;
          color: #1a2a25;
          background: #f9fcfb;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .ucn02ct-input:focus, .ucn02ct-textarea:focus {
          border-color: ${GREEN};
          background: ${WHITE};
          box-shadow: 0 0 0 3px rgba(0,72,53,0.08);
        }
        .ucn02ct-textarea { resize: vertical; min-height: 110px; }
        .ucn02ct-submit {
          position: relative;
          width: 100%;
          padding: 16px;
          background: ${GOLD};
          color: ${WHITE};
          font-family: ${FONT_H};
          font-size: 0.875rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          overflow: hidden;
          box-shadow: 0 10px 24px rgba(188,161,96,0.28);
          transition: background 0.3s ease, transform 0.3s cubic-bezier(.4,0,.2,1), box-shadow 0.3s ease;
          margin-top: 4px;
        }
        .ucn02ct-submit::before {
          content: "";
          position: absolute;
          top: 0; left: -120%;
          width: 55%; height: 100%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,0.5), transparent);
          transition: left 0.6s ease;
        }
        .ucn02ct-submit:hover { background: #a9904d; transform: translateY(-2px); box-shadow: 0 16px 30px rgba(188,161,96,0.4); }
        .ucn02ct-submit:hover::before { left: 130%; }
        .ucn02ct-note {
          font-size: 0.75rem;
          color: #8a9e99;
          text-align: center;
        }
        @media (max-width: 960px) {
          .ucn02ct-inner { grid-template-columns: 1fr; gap: 48px; }
          .ucn02ct-section { padding: 64px 20px; }
        }
        @media (max-width: 500px) {
          .ucn02ct-row { grid-template-columns: 1fr; }
          .ucn02ct-card { padding: 28px 20px; }
        }
      `}</style>

      <section id="kontakt" className="ucn02ct-section" data-template="ucetni-02-contact">
        <div className="ucn02ct-inner">

          {/* Left: info */}
          <div className="ucn02ct-left-col">
            {showHeader && (
              <>
                {eyebrow.trim() && (
                  <div className="ucn02ct-overline">
                    <span className="ucn02ct-overline-bar" aria-hidden />
                    <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
                  </div>
                )}
                {title.trim() && (
                  <h2 className="ucn02ct-h2">
                    <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
                  </h2>
                )}
                {lead.trim() && (
                  <p className="ucn02ct-lead">
                    <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
                  </p>
                )}
              </>
            )}
            <div className="ucn02ct-info-list">
              {infoItems.map((item, i) => (
                <div key={i} className="ucn02ct-info-item">
                  <div className="ucn02ct-info-icon" dangerouslySetInnerHTML={{ __html: item.icon }} />
                  <div className="ucn02ct-info-text">
                    <span className="ucn02ct-info-label">
                      <GenericEditableText sectionId={sectionId} field={item.labelField} value={item.label} tag="span" />
                    </span>
                    <span className="ucn02ct-info-value">
                      <GenericEditableText sectionId={sectionId} field={item.field} value={item.value} tag="span" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div className="ucn02ct-card">
            <div className="ucn02ct-card-title">
              <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" />
            </div>
            <div className="ucn02ct-form">
              <div className="ucn02ct-row">
                <div className="ucn02ct-field">
                  <label className="ucn02ct-label">
                    <GenericEditableText sectionId={sectionId} field="nameFieldLabel" value={nameFieldLabel} tag="span" />
                  </label>
                  <input type="text" className="ucn02ct-input" placeholder={namePlaceholder} />
                </div>
                <div className="ucn02ct-field">
                  <label className="ucn02ct-label">
                    <GenericEditableText sectionId={sectionId} field="emailFieldLabel" value={emailFieldLabel} tag="span" />
                  </label>
                  <input type="email" className="ucn02ct-input" placeholder={emailPlaceholder} />
                </div>
              </div>
              <div className="ucn02ct-field">
                <label className="ucn02ct-label">
                  <GenericEditableText sectionId={sectionId} field="phoneFieldLabel" value={phoneFieldLabel} tag="span" />
                </label>
                <input type="tel" className="ucn02ct-input" placeholder={phonePlaceholder} />
              </div>
              <div className="ucn02ct-field">
                <label className="ucn02ct-label">
                  <GenericEditableText sectionId={sectionId} field="messageFieldLabel" value={messageFieldLabel} tag="span" />
                </label>
                <textarea className="ucn02ct-textarea" placeholder={messagePlaceholder} />
              </div>
              <button type="button" className="ucn02ct-submit">
                <GenericEditableText sectionId={sectionId} field="submitLabel" value={submitLabel} tag="span" />
              </button>
              <p className="ucn02ct-note">
                <GenericEditableText sectionId={sectionId} field="formNote" value={formNote} tag="span" />
              </p>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

// ── ucetni-03-contact ─────────────────────────────────────────────────────────
// gpf.cz DNA LUXE: #f8f8f8 bg, 2-col: left info (green eyebrow + hairlines,
// H2, lead, 4 info items w/ icon hover slide) + right white form card (green
// top-accent, focus glow, submit shimmer). Montserrat/Open Sans · conditional
// header · full editability · IntersectionObserver entrance.
// ─────────────────────────────────────────────────────────────────────────────
function ContactUcetni03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const DARK   = "#002000";
  const GREEN  = "#8ec63f";
  const GREEN2 = "#4caf50";
  const FONT_H = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const FONT_B = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  const eyebrowRaw    = (content as Record<string, unknown>).eyebrow;
  const headingRaw    = (content as Record<string, unknown>).heading;
  const subheadingRaw = (content as Record<string, unknown>).subheading;
  const eyebrow    = eyebrowRaw    === undefined ? "Kontakt" : String(eyebrowRaw);
  const heading    = headingRaw    === undefined ? "Pojďme probrat vaši situaci" : String(headingRaw);
  const subheading = subheadingRaw === undefined ? "Napište nám nebo zavolejte. Poradíme vám nebo rovnou zajistíme nabídku šitou na míru." : String(subheadingRaw);
  const showHeader = !!(eyebrow.trim() || heading.trim() || subheading.trim());

  const title     = String(content.title   ?? heading);
  const lead      = String(content.lead    ?? subheading);
  const phone     = String(content.phone   ?? "+420 704 123 456");
  const emailVal  = String(content.email   ?? "email@demo.cz");
  const address   = String(content.address ?? "Ukázková 123, 110 00 Praha 1");
  const hours     = String(content.hours   ?? "Po–Pá 9:00–18:00");

  const cardTitle     = String(content.formCardTitle   ?? "Napište nám");
  const nameLabel     = String(content.formNameLabel   ?? "Jméno");
  const emailLabel    = String(content.formEmailLabel  ?? "E-mail");
  const phoneLabel    = String(content.formPhoneLabel  ?? "Telefon");
  const messageLabel  = String(content.formMessageLabel ?? "Zpráva");
  const submitLabel   = String(content.formSubmitLabel ?? "Odeslat zprávu");
  const noteText      = String(content.formNote        ?? "Odpovíme do 24 hodin. Konzultace je zcela zdarma.");

  const infoPhoneLabel   = String(content.infoPhoneLabel   ?? "Telefon");
  const infoEmailLabel   = String(content.infoEmailLabel   ?? "E-mail");
  const infoAddressLabel = String(content.infoAddressLabel ?? "Adresa");
  const infoHoursLabel   = String(content.infoHoursLabel   ?? "Otevírací doba");

  const SVG_PHONE   = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${GREEN}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.61 5.07 2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10.7a16 16 0 0 0 6.29 6.29l1.06-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 18.3z"/></svg>`;
  const SVG_MAIL    = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${GREEN}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
  const SVG_PIN     = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${GREEN}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  const SVG_CLOCK   = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${GREEN}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

  const infoItems = [
    { icon: SVG_PHONE, label: infoPhoneLabel,   value: phone,    field: "phone",   labelField: "infoPhoneLabel" },
    { icon: SVG_MAIL,  label: infoEmailLabel,   value: emailVal, field: "email",   labelField: "infoEmailLabel" },
    { icon: SVG_PIN,   label: infoAddressLabel,  value: address,  field: "address", labelField: "infoAddressLabel" },
    { icon: SVG_CLOCK, label: infoHoursLabel,    value: hours,    field: "hours",   labelField: "infoHoursLabel" },
  ];

  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("ucn03ct-visible"); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .ucn03ct-section {
          background: #f8f8f8;
          padding: 88px 40px;
          font-family: ${FONT_B};
          position: relative;
          overflow: hidden;
        }
        .ucn03ct-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: start;
        }

        /* ── conditional header ── */
        .ucn03ct-header {
          max-width: 1200px;
          margin: 0 auto 56px;
          text-align: center;
        }
        .ucn03ct-header-ey {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          font-family: ${FONT_H};
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: ${GREEN};
          margin-bottom: 14px;
        }
        .ucn03ct-header-ey::before,
        .ucn03ct-header-ey::after {
          content: "";
          width: 32px;
          height: 1.5px;
          background: linear-gradient(90deg, ${GREEN}, transparent);
        }
        .ucn03ct-header-ey::after {
          background: linear-gradient(270deg, ${GREEN}, transparent);
        }
        .ucn03ct-header-h2 {
          font-family: ${FONT_H};
          font-size: clamp(1.7rem, 2.8vw, 2.3rem);
          font-weight: 800;
          color: ${DARK};
          line-height: 1.15;
          margin: 0 0 14px 0;
        }
        .ucn03ct-header-lead {
          font-size: 1rem;
          color: #737b79;
          line-height: 1.7;
          max-width: 560px;
          margin: 0 auto;
        }

        /* ── left info column ── */
        .ucn03ct-kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: ${FONT_H};
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: ${GREEN};
          margin-bottom: 12px;
        }
        .ucn03ct-kicker::before {
          content: "";
          width: 28px;
          height: 1.5px;
          background: ${GREEN};
        }
        .ucn03ct-h2 {
          font-family: ${FONT_H};
          font-size: clamp(1.7rem, 2.8vw, 2.3rem);
          font-weight: 800;
          color: ${DARK};
          line-height: 1.15;
          margin: 0 0 20px 0;
        }
        .ucn03ct-lead {
          font-size: 1rem;
          color: #737b79;
          line-height: 1.7;
          margin: 0 0 40px 0;
        }
        .ucn03ct-info-list { display: flex; flex-direction: column; gap: 20px; }
        .ucn03ct-info-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 10px 12px;
          border-radius: 10px;
          transition: background 0.3s, transform 0.3s;
        }
        .ucn03ct-info-item:hover {
          background: rgba(142,198,63,0.06);
          transform: translateX(4px);
        }
        .ucn03ct-info-icon {
          width: 42px;
          height: 42px;
          background: #fff;
          border: 1.5px solid #e4e4e4;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .ucn03ct-info-item:hover .ucn03ct-info-icon {
          border-color: ${GREEN};
          box-shadow: 0 0 0 3px rgba(142,198,63,0.13);
        }
        .ucn03ct-info-text { display: flex; flex-direction: column; gap: 2px; }
        .ucn03ct-info-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #737b79;
        }
        .ucn03ct-info-value {
          font-size: 0.95rem;
          font-weight: 600;
          color: ${DARK};
        }

        /* ── right form card ── */
        .ucn03ct-card {
          background: #fff;
          border-radius: 16px;
          padding: 40px 36px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          position: relative;
          overflow: hidden;
        }
        .ucn03ct-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, ${GREEN}, ${GREEN2});
        }
        .ucn03ct-card-title {
          font-family: ${FONT_H};
          font-size: 1.15rem;
          font-weight: 700;
          color: ${DARK};
          margin: 0 0 24px 0;
        }
        .ucn03ct-form { display: flex; flex-direction: column; gap: 14px; }
        .ucn03ct-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .ucn03ct-field { display: flex; flex-direction: column; gap: 5px; }
        .ucn03ct-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #3c3d3d;
          letter-spacing: 0.3px;
        }
        .ucn03ct-input, .ucn03ct-textarea {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #e4e4e4;
          border-radius: 8px;
          font-family: ${FONT_B};
          font-size: 0.9rem;
          color: #3c3d3d;
          background: #fafafa;
          outline: none;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
          box-sizing: border-box;
        }
        .ucn03ct-input:focus, .ucn03ct-textarea:focus {
          border-color: ${GREEN};
          background: #fff;
          box-shadow: 0 0 0 3px rgba(142,198,63,0.12);
        }
        .ucn03ct-textarea { resize: vertical; min-height: 110px; }
        .ucn03ct-submit {
          width: 100%;
          padding: 14px;
          background: ${GREEN};
          color: ${DARK};
          font-family: ${FONT_H};
          font-size: 0.95rem;
          font-weight: 700;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.25s, transform 0.25s, box-shadow 0.25s;
          margin-top: 4px;
          position: relative;
          overflow: hidden;
        }
        .ucn03ct-submit::after {
          content: "";
          position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transition: none;
        }
        .ucn03ct-submit:hover {
          background: #9dd44a;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(142,198,63,0.3);
        }
        .ucn03ct-submit:hover::after {
          left: 100%;
          transition: left 0.6s ease;
        }
        .ucn03ct-note {
          font-size: 0.75rem;
          color: #aaa;
          text-align: center;
          margin-top: 8px;
        }

        /* ── entrance ── */
        .ucn03ct-left, .ucn03ct-card {
          opacity: 0;
          transform: translateY(32px);
        }
        .ucn03ct-visible .ucn03ct-left {
          animation: ucn03ctUp 0.7s ease-out forwards;
        }
        .ucn03ct-visible .ucn03ct-card {
          animation: ucn03ctUp 0.7s 0.15s ease-out forwards;
        }
        @keyframes ucn03ctUp {
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 960px) {
          .ucn03ct-inner { grid-template-columns: 1fr; gap: 48px; }
          .ucn03ct-section { padding: 64px 20px; }
        }
        @media (max-width: 500px) {
          .ucn03ct-row { grid-template-columns: 1fr; }
          .ucn03ct-card { padding: 28px 20px; }
        }
      `}</style>

      <section ref={sectionRef} className="ucn03ct-section" data-template="ucetni-03-contact" id="kontakt">

        {showHeader && (
          <div className="ucn03ct-header">
            {eyebrow.trim() && (
              <div className="ucn03ct-header-ey">
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              </div>
            )}
            {heading.trim() && (
              <h2 className="ucn03ct-header-h2">
                <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
              </h2>
            )}
            {subheading.trim() && (
              <p className="ucn03ct-header-lead">
                <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
              </p>
            )}
          </div>
        )}

        <div className="ucn03ct-inner">

          {/* Left: info */}
          <div className="ucn03ct-left">
            <span className="ucn03ct-kicker">
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </span>
            <h2 className="ucn03ct-h2">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p className="ucn03ct-lead">
              <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
            </p>
            <div className="ucn03ct-info-list">
              {infoItems.map((item, i) => (
                <div key={i} className="ucn03ct-info-item">
                  <div className="ucn03ct-info-icon" dangerouslySetInnerHTML={{ __html: item.icon }} />
                  <div className="ucn03ct-info-text">
                    <span className="ucn03ct-info-label">
                      <GenericEditableText sectionId={sectionId} field={item.labelField} value={item.label} tag="span" />
                    </span>
                    <span className="ucn03ct-info-value">
                      <GenericEditableText sectionId={sectionId} field={item.field} value={item.value} tag="span" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div className="ucn03ct-card">
            <div className="ucn03ct-card-title">
              <GenericEditableText sectionId={sectionId} field="formCardTitle" value={cardTitle} tag="span" />
            </div>
            <div className="ucn03ct-form">
              <div className="ucn03ct-row">
                <div className="ucn03ct-field">
                  <label className="ucn03ct-label">
                    <GenericEditableText sectionId={sectionId} field="formNameLabel" value={nameLabel} tag="span" />
                  </label>
                  <input type="text" className="ucn03ct-input" placeholder="Jan Novák" />
                </div>
                <div className="ucn03ct-field">
                  <label className="ucn03ct-label">
                    <GenericEditableText sectionId={sectionId} field="formEmailLabel" value={emailLabel} tag="span" />
                  </label>
                  <input type="email" className="ucn03ct-input" placeholder="jan@email.cz" />
                </div>
              </div>
              <div className="ucn03ct-field">
                <label className="ucn03ct-label">
                  <GenericEditableText sectionId={sectionId} field="formPhoneLabel" value={phoneLabel} tag="span" />
                </label>
                <input type="tel" className="ucn03ct-input" placeholder="+420 000 000 000" />
              </div>
              <div className="ucn03ct-field">
                <label className="ucn03ct-label">
                  <GenericEditableText sectionId={sectionId} field="formMessageLabel" value={messageLabel} tag="span" />
                </label>
                <textarea className="ucn03ct-textarea" placeholder="Stručně popište váš záměr nebo dotaz..." />
              </div>
              <button type="button" className="ucn03ct-submit">
                <GenericEditableText sectionId={sectionId} field="formSubmitLabel" value={submitLabel} tag="span" />
              </button>
              <p className="ucn03ct-note">
                <GenericEditableText sectionId={sectionId} field="formNote" value={noteText} tag="span" />
              </p>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

// ── ucetni-04-contact ──────────────────────────────────────────────────────────
// „Prosperita Finance" — contact LUXE. Cinematic navy gradient + gold hairline grid,
// 2-col: levý info panel (gold eyebrow, H2, 4 kontakty s gold ikonami + hover slide) +
// pravá bílá form karta (gold top-accent, focus glow, submit shimmer). Inter · plná editovatelnost.
// ──────────────────────────────────────────────────────────────────────────────
function ContactUcetni04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY   = "#1B3A6B";
  const NAVYDK = "#14294d";
  const GOLD   = "#C8923A";
  const WHITE  = "#FFFFFF";
  const FONT   = "'Inter', 'Helvetica Neue', Arial, sans-serif";

  const eyebrowRaw = (content as Record<string, unknown>).eyebrow;
  const headingRaw = (content as Record<string, unknown>).heading;
  const subheadingRaw = (content as Record<string, unknown>).subheading;
  const eyebrow    = eyebrowRaw    === undefined ? "Kontakt" : String(eyebrowRaw);
  const heading    = headingRaw    === undefined ? "Pojďme si promluvit" : String(headingRaw);
  const subheading = subheadingRaw === undefined ? "Úvodní konzultace je zcela zdarma a bez závazků. Stačí vyplnit formulář a ozveme se vám do 24 hodin." : String(subheadingRaw);
  const showHeader = !!(eyebrow.trim() || heading.trim() || subheading.trim());
  const phone      = String(content.phone      ?? "777 234 567");
  const email      = String(content.email      ?? "info@prosperita-finance.cz");
  const address    = String(content.address    ?? "Václavské náměstí 47, 110 00 Praha 1");
  const hours      = String(content.hours      ?? "Po–Pá 8:00–18:00, So 9:00–13:00");
  const infoPhoneLabel = String(content.infoPhoneLabel ?? "Zavolejte nám");
  const infoEmailLabel = String(content.infoEmailLabel ?? "Napište e-mail");
  const infoAddressLabel = String(content.infoAddressLabel ?? "Navštivte nás");
  const infoHoursLabel = String(content.infoHoursLabel ?? "Otevírací doba");
  const cardTitle  = String(content.formCardTitle ?? "Nezávazná poptávka");
  const nameLabel  = String(content.formNameLabel    ?? "Jméno a příjmení");
  const emailLabel = String(content.formEmailLabel   ?? "E-mailová adresa");
  const phoneLabel = String(content.formPhoneLabel   ?? "Telefonní číslo");
  const msgLabel   = String(content.formMessageLabel ?? "O čem chcete mluvit?");
  const submitText = String(content.formSubmitText   ?? "Chci konzultaci zdarma");
  const noteText   = String(content.formNote ?? "Odpovíme do 24 hodin. Konzultace je zcela zdarma a bez závazků.");

  const SVG_PHONE = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.61 5.07 2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10.7a16 16 0 0 0 6.29 6.29l1.06-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 18.3z"/></svg>`;
  const SVG_MAIL  = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
  const SVG_PIN   = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  const SVG_CLOCK = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

  const infoItems = [
    { icon: SVG_PHONE, label: infoPhoneLabel,   labelField: "infoPhoneLabel",   value: phone,   field: "phone",   href: `tel:${phone.replace(/\s/g, "")}` },
    { icon: SVG_MAIL,  label: infoEmailLabel,   labelField: "infoEmailLabel",   value: email,   field: "email",   href: `mailto:${email}` },
    { icon: SVG_PIN,   label: infoAddressLabel, labelField: "infoAddressLabel", value: address, field: "address", href: undefined },
    { icon: SVG_CLOCK, label: infoHoursLabel,   labelField: "infoHoursLabel",   value: hours,   field: "hours",   href: undefined },
  ];

  return (
    <>
      <style>{`
        .ucn04ct-section {
          position: relative; overflow: hidden; font-family: ${FONT};
          background: radial-gradient(120% 120% at 85% 10%, #26518f 0%, ${NAVY} 44%, ${NAVYDK} 100%);
          padding: clamp(64px, 8vw, 104px) clamp(20px, 5vw, 60px);
        }
        .ucn04ct-grid-bg { position: absolute; inset: 0; pointer-events: none; opacity: .5;
          background-image: linear-gradient(rgba(200,146,58,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(200,146,58,0.05) 1px, transparent 1px);
          background-size: 62px 62px; mask-image: radial-gradient(75% 75% at 30% 30%, #000, transparent 100%);
          -webkit-mask-image: radial-gradient(75% 75% at 30% 30%, #000, transparent 100%); }
        .ucn04ct-inner { position: relative; z-index: 2; max-width: 1160px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: clamp(44px,5vw,72px); align-items: center; }
        .ucn04ct-left { color: ${WHITE}; }
        .ucn04ct-eyebrow { display: inline-flex; align-items: center; gap: 9px; font-size: 12.5px; font-weight: 700;
          letter-spacing: .16em; text-transform: uppercase; color: ${GOLD}; margin: 0 0 16px; }
        .ucn04ct-eyebrow::before { content: ""; width: 26px; height: 1px; background: rgba(200,146,58,0.55); }
        .ucn04ct-h2 { font-family: ${FONT}; font-size: clamp(1.9rem, 3.2vw, 2.7rem); font-weight: 800; color: ${WHITE}; line-height: 1.12; letter-spacing: -0.03em; margin: 0 0 18px; }
        .ucn04ct-sub { font-size: 1rem; color: rgba(255,255,255,0.74); line-height: 1.7; margin: 0 0 40px; max-width: 460px; }
        .ucn04ct-info-list { display: flex; flex-direction: column; gap: 16px; }
        .ucn04ct-info-item { display: flex; align-items: center; gap: 16px; padding: 12px; border-radius: 12px;
          transition: background .3s, transform .3s; }
        .ucn04ct-info-item:hover { background: rgba(255,255,255,0.06); transform: translateX(4px); }
        .ucn04ct-info-icon { width: 46px; height: 46px; background: rgba(200,146,58,0.13); border: 1px solid rgba(200,146,58,0.28);
          border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background .3s; }
        .ucn04ct-info-item:hover .ucn04ct-info-icon { background: rgba(200,146,58,0.22); }
        .ucn04ct-info-text { display: flex; flex-direction: column; gap: 3px; }
        .ucn04ct-info-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: ${GOLD}; opacity: .85; }
        .ucn04ct-info-value { font-size: 0.98rem; font-weight: 500; color: ${WHITE}; text-decoration: none; }
        a.ucn04ct-info-value:hover { color: ${GOLD}; }
        .ucn04ct-card { position: relative; overflow: hidden; background: ${WHITE}; border-radius: 20px;
          padding: clamp(28px, 4vw, 44px); box-shadow: 0 30px 70px -20px rgba(0,0,0,0.44); }
        .ucn04ct-card::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, ${GOLD}, #e6b968); }
        .ucn04ct-card-title { font-size: 1.28rem; font-weight: 800; color: ${NAVY}; letter-spacing: -0.02em; margin: 0 0 24px; }
        .ucn04ct-form { display: flex; flex-direction: column; gap: 15px; }
        .ucn04ct-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .ucn04ct-field { display: flex; flex-direction: column; gap: 7px; }
        .ucn04ct-label { font-size: 0.78rem; font-weight: 600; color: #374151; letter-spacing: 0.2px; }
        .ucn04ct-input, .ucn04ct-textarea {
          width: 100%; padding: 13px 15px; border: 1.5px solid #E5E7EB; border-radius: 10px;
          font-family: ${FONT}; font-size: 0.92rem; color: #111827; background: #F8F9FB;
          outline: none; transition: border-color 0.25s, background 0.25s, box-shadow 0.25s; box-sizing: border-box;
        }
        .ucn04ct-input:focus, .ucn04ct-textarea:focus {
          border-color: ${GOLD}; background: #fff; box-shadow: 0 0 0 4px rgba(200,146,58,0.14);
        }
        .ucn04ct-textarea { resize: vertical; min-height: 108px; }
        .ucn04ct-submit {
          position: relative; overflow: hidden; width: 100%; padding: 15px; margin-top: 4px;
          background: ${GOLD}; color: ${WHITE}; font-family: ${FONT}; font-size: 0.98rem; font-weight: 700;
          border: none; border-radius: 999px; cursor: pointer; letter-spacing: 0.2px;
          box-shadow: 0 10px 26px rgba(200,146,58,0.3);
          transition: transform 0.3s cubic-bezier(.34,1.4,.5,1), box-shadow 0.3s;
        }
        .ucn04ct-submit::before { content: ""; position: absolute; top: 0; left: -120%; width: 60%; height: 100%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,0.5), transparent); transform: skewX(-18deg); }
        .ucn04ct-submit:hover { transform: translateY(-2px); box-shadow: 0 16px 34px rgba(200,146,58,0.44); }
        .ucn04ct-submit:hover::before { left: 130%; transition: left .7s ease; }
        .ucn04ct-note { font-size: 0.75rem; color: #9CA3AF; text-align: center; margin: 8px 0 0; line-height: 1.5; }
        @media (max-width: 900px) { .ucn04ct-inner { grid-template-columns: 1fr; gap: 48px; } }
        @media (max-width: 500px) {
          .ucn04ct-row { grid-template-columns: 1fr; }
          .ucn04ct-card { padding: 26px 20px; }
        }
      `}</style>

      <section className="ucn04ct-section" data-template="ucetni-04-contact" id="kontakt">
        <div className="ucn04ct-grid-bg" aria-hidden="true" />
        <div className="ucn04ct-inner">

          <div className="ucn04ct-left">
            {showHeader && (
              <>
                {eyebrow.trim() && (
                  <p className="ucn04ct-eyebrow">
                    <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
                  </p>
                )}
                {heading.trim() && (
                  <h2 className="ucn04ct-h2">
                    <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
                  </h2>
                )}
                {subheading.trim() && (
                  <p className="ucn04ct-sub">
                    <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
                  </p>
                )}
              </>
            )}
            <div className="ucn04ct-info-list">
              {infoItems.map((item, i) => (
                <div key={i} className="ucn04ct-info-item">
                  <div className="ucn04ct-info-icon" dangerouslySetInnerHTML={{ __html: item.icon }} />
                  <div className="ucn04ct-info-text">
                    <span className="ucn04ct-info-label">
                      <GenericEditableText sectionId={sectionId} field={item.labelField} value={item.label} tag="span" />
                    </span>
                    {item.href ? (
                      <a href={item.href} className="ucn04ct-info-value">
                        <GenericEditableText sectionId={sectionId} field={item.field} value={item.value} tag="span" />
                      </a>
                    ) : (
                      <span className="ucn04ct-info-value">
                        <GenericEditableText sectionId={sectionId} field={item.field} value={item.value} tag="span" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ucn04ct-card">
            <div className="ucn04ct-card-title">
              <GenericEditableText sectionId={sectionId} field="formCardTitle" value={cardTitle} tag="span" />
            </div>
            <div className="ucn04ct-form">
              <div className="ucn04ct-row">
                <div className="ucn04ct-field">
                  <label className="ucn04ct-label">
                    <GenericEditableText sectionId={sectionId} field="formNameLabel" value={nameLabel} tag="span" />
                  </label>
                  <input type="text" className="ucn04ct-input" placeholder="Jan Novák" />
                </div>
                <div className="ucn04ct-field">
                  <label className="ucn04ct-label">
                    <GenericEditableText sectionId={sectionId} field="formEmailLabel" value={emailLabel} tag="span" />
                  </label>
                  <input type="email" className="ucn04ct-input" placeholder="jan@email.cz" />
                </div>
              </div>
              <div className="ucn04ct-field">
                <label className="ucn04ct-label">
                  <GenericEditableText sectionId={sectionId} field="formPhoneLabel" value={phoneLabel} tag="span" />
                </label>
                <input type="tel" className="ucn04ct-input" placeholder="+420 000 000 000" />
              </div>
              <div className="ucn04ct-field">
                <label className="ucn04ct-label">
                  <GenericEditableText sectionId={sectionId} field="formMessageLabel" value={msgLabel} tag="span" />
                </label>
                <textarea className="ucn04ct-textarea" placeholder="Stručně popište váš záměr nebo dotaz..." />
              </div>
              <button type="button" className="ucn04ct-submit">
                <GenericEditableText sectionId={sectionId} field="formSubmitText" value={submitText} tag="span" />
              </button>
              <p className="ucn04ct-note">
                <GenericEditableText sectionId={sectionId} field="formNote" value={noteText} tag="span" />
              </p>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

// ─── instala-02 Contact ──────────────────────────────────────────────────────
function ContactInstala02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c = content as Record<string, unknown>;
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const kickerRaw = c.kicker as string | undefined;
  const titleRaw  = c.title  as string | undefined;
  const bodyRaw   = c.subtitle as string | undefined;
  const hasText = (v: unknown) => typeof v === "string" && v.trim() !== "";
  const showHeader = hasText(kickerRaw) || hasText(titleRaw) || hasText(bodyRaw);

  const kicker   = String(kickerRaw ?? "Kontakt a poptávka");
  const title    = String(titleRaw  ?? "Napište nám nebo zavolejte");
  const subtitle = String(bodyRaw   ?? "Obratem se ozveme s konkrétní nabídkou nebo si domluvíme nezávaznou konzultaci.");
  const phone    = String(c.phone    ?? "+420 704 123 456");
  const email    = String(c.email    ?? "info@demo.cz");
  const address  = String(c.address  ?? "Ukázková 123, 110 00 Praha 1");
  const hours    = String(c.hours    ?? "Po–Pá 7:00–17:00");
  const ico      = String(c.ico      ?? "12345678");
  const submitText = String(c.submitText ?? "Odeslat poptávku");
  const mapEmbed = String(c.mapEmbed ?? "");
  const mapSrc = mapEmbed || `https://www.openstreetmap.org/export/embed.html?bbox=14.40%2C50.07%2C14.44%2C50.09&layer=mapnik&marker=50.08%2C14.42`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 900));
    setSending(false);
    setSent(true);
  }

  const InfoRow = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="i2ct-info-row">
      <div className="i2ct-info-icon">{icon}</div>
      <div className="i2ct-info-body">{children}</div>
    </div>
  );

  return (
    <section
      id="kontakt"
      data-template="instala-02-contact"
      style={{ backgroundColor: "#111", fontFamily: "'Roboto', sans-serif", padding: "96px 0" }}
    >
      <div className="i2ct-outer">
        <div className="i2ct-grid">

          {/* ── Left: info panel ── */}
          <div>
            {showHeader && (
              <>
                <p className="i2ct-kicker">
                  <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
                </p>
                <h2 className="i2ct-h2">
                  <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
                </h2>
                <p className="i2ct-sub">
                  <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
                </p>
                <div className="i2ct-divider" />
              </>
            )}

            <InfoRow icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.09 6.09l1.11-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}>
              <div className="i2ct-info-label">Telefon</div>
              <a href={`tel:${phone.replace(/\s/g,"")}`} className="i2ct-info-phone">
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            </InfoRow>

            <InfoRow icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="22,6 12,13 2,6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}>
              <div className="i2ct-info-label">E-mail</div>
              <a href={`mailto:${email}`} className="i2ct-info-link">
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            </InfoRow>

            <InfoRow icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="10" r="3" stroke="white" strokeWidth="2"/></svg>}>
              <div className="i2ct-info-label">Adresa</div>
              <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
            </InfoRow>

            <InfoRow icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/><polyline points="12 6 12 12 16 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}>
              <div className="i2ct-info-label">Provozní doba</div>
              <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
            </InfoRow>

            <div className="i2ct-ico-box">
              IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" />
            </div>
          </div>

          {/* ── Right: form ── */}
          <div className="i2ct-form">
            {sent ? (
              <div className="i2ct-ok">
                <div className="i2ct-ok-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="i2ct-ok-title">Zpráva odeslána!</h3>
                <p className="i2ct-ok-sub">Ozveme se vám co nejdříve.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="i2ct-form-title">Nezávazná poptávka</p>
                <div className="i2ct-row">
                  <div className="i2ct-field">
                    <label className="i2ct-label">Jméno</label>
                    <input className="i2ct-input" type="text" placeholder="Vaše jméno" required />
                  </div>
                  <div className="i2ct-field">
                    <label className="i2ct-label">Telefon</label>
                    <input className="i2ct-input" type="tel" placeholder="+420 000 000 000" />
                  </div>
                </div>
                <div className="i2ct-field">
                  <label className="i2ct-label">E-mail</label>
                  <input className="i2ct-input" type="email" placeholder="vas@email.cz" required />
                </div>
                <div className="i2ct-field">
                  <label className="i2ct-label">Předmět</label>
                  <input className="i2ct-input" type="text" placeholder="Např. výměna kotle, havárie..." />
                </div>
                <div className="i2ct-field">
                  <label className="i2ct-label">Zpráva</label>
                  <textarea className="i2ct-input i2ct-textarea" placeholder="Popište váš požadavek..." required />
                </div>
                <button type="submit" className="i2ct-btn" disabled={sending}>
                  {sending ? "Odesílání…" : (
                    <>
                      <GenericEditableText sectionId={sectionId} field="submitText" value={submitText} tag="span" />
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

        {/* ── Map ── */}
        <div className="i2ct-map">
          <iframe
            src={mapSrc}
            width="100%" height="280" style={{ border: 0, borderRadius: 12 }}
            loading="lazy" title="Mapa provozovny"
          />
        </div>
      </div>
    </section>
  );
}

/* ─── ContactSolar02 ─── solar-02 Greenia poptávkový formulář (luxe dark) ── */
function ContactSolar02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const showHeader = content.showHeader !== false;
  const eyebrow    = String(content.eyebrow    ?? "Nezávazná poptávka");
  const title      = String(content.title      ?? "Spočítáme úspory přímo pro váš objekt");
  const subtitle   = String(content.subtitle   ?? "Vyplňte formulář a do 24 hodin vám zavoláme s nezávaznou kalkulací a odhadem návratnosti. Konzultace je vždy zdarma.");
  const phone      = String(content.phone      ?? "777 234 890");
  const email      = String(content.email      ?? "info@demo.cz");
  const address    = String(content.address    ?? "Brno · Praha · Ostrava");
  const submitText = String(content.submitText ?? "Odeslat poptávku");
  const badgeText  = String(content.badgeText  ?? "Odpovíme do 24 hodin");
  const usp1       = String(content.usp1       ?? "Nezávazná kalkulace zdarma");
  const usp2       = String(content.usp2       ?? "Vyřízení dotací zajistíme za vás");
  const usp3       = String(content.usp3       ?? "Bezplatná návštěva objektu");

  const [status, setStatus] = React.useState<"idle"|"sending"|"success"|"error">("idle");
  const [form, setForm] = React.useState({ name: "", company: "", phone: "", email: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    await new Promise(r => setTimeout(r, 900));
    setStatus("success");
  };

  return (
    <section className="s02ct" id="kontakt" data-template="solar-02">
      <div className="s02ct-glow" aria-hidden="true" />
      <svg className="s02ct-motif" viewBox="0 0 300 200" aria-hidden="true" preserveAspectRatio="none">
        <g stroke="rgba(121,196,79,0.15)" strokeWidth="0.6" fill="none">
          {Array.from({length: 10}).map((_, i) => <line key={`v${i}`} x1={i*30} y1="0" x2={i*30} y2="200" />)}
          {Array.from({length: 7}).map((_, i) => <line key={`h${i}`} x1="0" y1={i*30} x2="300" y2={i*30} />)}
        </g>
      </svg>

      <div className="s02ct-inner">
        {/* Left: info */}
        <div className="s02ct-info">
          {showHeader && (
            <>
              <div className="s02ct-eyebrow">
                <span className="s02ct-eyebrow-dot" aria-hidden="true" />
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              </div>
              <h2 className="s02ct-h2">
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
              <p className="s02ct-sub">
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            </>
          )}

          <div className="s02ct-badge">
            <span className="s02ct-badge-dot" aria-hidden="true" />
            <GenericEditableText sectionId={sectionId} field="badgeText" value={badgeText} tag="span" />
          </div>

          <ul className="s02ct-usps">
            {[usp1, usp2, usp3].map((u, i) => (
              <li key={i} className="s02ct-usp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8dd166" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <GenericEditableText sectionId={sectionId} field={`usp${i+1}`} value={u} tag="span" />
              </li>
            ))}
          </ul>

          <div className="s02ct-contacts">
            <a href={`tel:+420${phone.replace(/\s/g, "")}`} className="s02ct-item">
              <span className="s02ct-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.07 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
              </span>
              <span className="s02ct-item-body">
                <span className="s02ct-label">Telefon</span>
                <span className="s02ct-val">
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </span>
              </span>
            </a>
            <a href={`mailto:${email}`} className="s02ct-item">
              <span className="s02ct-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <span className="s02ct-item-body">
                <span className="s02ct-label">E-mail</span>
                <span className="s02ct-val">
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </span>
              </span>
            </a>
            <div className="s02ct-item s02ct-item-static">
              <span className="s02ct-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </span>
              <span className="s02ct-item-body">
                <span className="s02ct-label">Působíme</span>
                <span className="s02ct-val">
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: form card (glass) */}
        <div className="s02ct-form-wrap">
          <div className="s02ct-form">
            {status === "success" ? (
              <div className="s02ct-ok">
                <div className="s02ct-ok-badge" aria-hidden="true">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3 className="s02ct-ok-h3">Děkujeme za poptávku</h3>
                <p className="s02ct-ok-p">Ozveme se vám do 24 hodin s nezávaznou kalkulací.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="s02ct-row">
                  <div className="s02ct-field">
                    <label htmlFor="s02ct-name">Jméno a příjmení *</label>
                    <input id="s02ct-name" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Jan Novák" autoComplete="name" />
                  </div>
                  <div className="s02ct-field">
                    <label htmlFor="s02ct-company">Firma / Obec</label>
                    <input id="s02ct-company" value={form.company} onChange={e => setForm(f => ({...f, company: e.target.value}))} placeholder="ABC s.r.o." autoComplete="organization" />
                  </div>
                </div>
                <div className="s02ct-row">
                  <div className="s02ct-field">
                    <label htmlFor="s02ct-phone">Telefon *</label>
                    <input id="s02ct-phone" required type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+420 777 000 000" autoComplete="tel" />
                  </div>
                  <div className="s02ct-field">
                    <label htmlFor="s02ct-email">E-mail *</label>
                    <input id="s02ct-email" required type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="jan@firma.cz" autoComplete="email" />
                  </div>
                </div>
                <div className="s02ct-field">
                  <label htmlFor="s02ct-msg">Popis objektu a záměru</label>
                  <textarea id="s02ct-msg" value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} placeholder="Typ objektu, odhadovaná spotřeba, zájem o FVE / PPA / BESS…" />
                </div>
                <button type="submit" className="s02ct-btn" disabled={status === "sending"}>
                  <span className="s02ct-btn-label">
                    {status === "sending" ? "Odesílám…" : <GenericEditableText sectionId={sectionId} field="submitText" value={submitText} tag="span" />}
                  </span>
                  {status !== "sending" && (
                    <svg className="s02ct-btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  )}
                </button>
                <p className="s02ct-gdpr">Odesláním souhlasíte se zpracováním osobních údajů pro účely vyřízení poptávky.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── klempir-01-contact ────────────────────────────────────────────────────────
// Copper & Slate: paper bg; slate info panel (tel/email/oblast/hodiny s copper
// ikonami) + bílý formulář s reálným odesláním na /api/demo/:slug/contact.
function ContactKlempir01({ content, sectionId, tenantSlug }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string }) {
  const [status, setStatus] = React.useState<"idle" | "sending" | "ok" | "err">("idle");
  const kicker = String(content.kicker ?? "Kontakt");
  const title = String(content.title ?? "Ozvěte se — poradím a rychle vyjedu");
  const subtitle = String(content.subtitle ?? "Popište mi, co vaše střecha potřebuje. Ozvu se zpět do 24 hodin, u havárií ještě týž den.");
  const phone = String(content.phone ?? "+420 704 123 456");
  const email = String(content.email ?? "email@demo.cz");
  const address = String(content.address ?? "Brno a Jihomoravský kraj");
  const hours = String(content.hours ?? "Po–Pá 7:00–17:00, So 8:00–12:00");
  const formTitle = String(content.formTitle ?? "Napište mi");
  const ctaText = String(content.ctaText ?? "Odeslat zprávu");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    const payload = {
      sectionId,
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      message: String(fd.get("message") ?? ""),
    };
    try {
      const url = tenantSlug ? `/api/demo/${tenantSlug}/contact` : "/api/contact";
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setStatus(res.ok ? "ok" : "err");
    } catch {
      setStatus("err");
    }
  };

  const rows: Array<{ label: string; field: string; value: string; href?: string; icon: React.ReactNode }> = [
    { label: "Telefon", field: "phone", value: phone, href: `tel:${phone.replace(/\s/g, "")}`, icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/> },
    { label: "E-mail", field: "email", value: email, href: `mailto:${email}`, icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.8" fill="none"/><path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></> },
    { label: "Oblast působení", field: "address", value: address, icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.8" fill="none"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8" fill="none"/></> },
    { label: "Pracovní doba", field: "hours", value: hours, icon: <><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" fill="none"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/></> },
  ];

  return (
    <>
      <style>{`
        .k01co-section { background: #F5F3EF; padding: clamp(4rem, 8vw, 7rem) 0; font-family: 'Manrope', sans-serif; }
        .k01co-inner {
          max-width: 76rem; margin: 0 auto; padding: 0 clamp(1.25rem, 4vw, 2.5rem);
          display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: 1.2rem; align-items: stretch;
        }
        .k01co-panel { background: #14171A; border-radius: 6px; padding: clamp(1.9rem, 3.5vw, 2.8rem); }
        .k01co-kicker {
          display: inline-flex; align-items: center; gap: 0.6rem;
          font-size: 0.8rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
          color: #D98E55; margin-bottom: 1.1rem;
        }
        .k01co-kicker::before { content: ""; width: 26px; height: 2px; background: #B4622D; }
        .k01co-h2 {
          font-family: 'Fraunces', serif;
          font-size: clamp(1.5rem, 2.6vw, 2.1rem); font-weight: 600; color: #F7F4EF;
          margin: 0 0 0.8rem; line-height: 1.12; letter-spacing: -0.02em;
        }
        .k01co-sub { font-size: 0.93rem; color: rgba(247,244,239,0.65); line-height: 1.7; margin: 0 0 1.9rem; }
        .k01co-row { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.25rem; }
        .k01co-row:last-child { margin-bottom: 0; }
        .k01co-ico {
          width: 40px; height: 40px; border-radius: 4px; background: rgba(180,98,45,0.18);
          display: grid; place-items: center; flex-shrink: 0; color: #D98E55;
        }
        .k01co-label { font-size: 0.7rem; font-weight: 700; color: rgba(247,244,239,0.45); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px; }
        .k01co-val { font-size: 0.96rem; font-weight: 600; color: #F7F4EF; }
        .k01co-val a { color: #F7F4EF; text-decoration: none; }
        .k01co-val a:hover { color: #D98E55; }
        .k01co-form-wrap { background: #fff; border: 1px solid #E9E5DD; border-radius: 6px; padding: clamp(1.9rem, 3.5vw, 2.8rem); }
        .k01co-form-title {
          font-family: 'Fraunces', serif; font-size: 1.4rem; font-weight: 600; color: #191C1F; margin: 0 0 1.5rem; letter-spacing: -0.015em;
        }
        .k01co-form { display: flex; flex-direction: column; gap: 1.05rem; }
        .k01co-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .k01co-field label { font-size: 0.8rem; font-weight: 700; color: #23262A; display: block; margin-bottom: 0.36rem; }
        .k01co-field input, .k01co-field textarea {
          width: 100%; padding: 0.8rem 1rem; border: 1px solid #DDD8CE; border-radius: 4px; box-sizing: border-box;
          font-family: 'Manrope', sans-serif; font-size: 0.93rem; color: #191C1F; background: #FBFAF8; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .k01co-field input:focus, .k01co-field textarea:focus { border-color: #B4622D; box-shadow: 0 0 0 3px rgba(180,98,45,0.15); background: #fff; }
        .k01co-field textarea { min-height: 120px; resize: vertical; }
        .k01co-submit {
          width: 100%; padding: 1rem 2rem; border-radius: 4px; border: none;
          background: #B4622D; color: #fff; font-family: 'Manrope', sans-serif;
          font-size: 1rem; font-weight: 700; cursor: pointer; transition: background 0.25s;
        }
        .k01co-submit:hover:not(:disabled) { background: #8F4A1E; }
        .k01co-submit:disabled { opacity: 0.7; cursor: default; }
        .k01co-note { font-size: 0.78rem; color: #9B9F9F; text-align: center; margin: 0; }
        .k01co-success { background: #F1F7F1; border: 1px solid #BFDDBF; border-radius: 6px; padding: 1.6rem; text-align: center; }
        .k01co-success p { font-size: 0.95rem; color: #2F5B2F; font-weight: 600; margin: 0; }
        .k01co-error { margin: 0; font-size: 0.85rem; font-weight: 600; color: #A33A2A; text-align: center; }
        @media (max-width: 960px) { .k01co-inner { grid-template-columns: 1fr; } }
        @media (max-width: 520px) { .k01co-2col { grid-template-columns: 1fr; } }
      `}</style>

      <section className="k01co-section" id="kontakt" data-template="klempir-01-contact">
        <div className="k01co-inner">
          <div className="k01co-panel">
            <p className="k01co-kicker"><GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" /></p>
            <h2 className="k01co-h2"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p className="k01co-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>
            {rows.map((row) => (
              <div key={row.field} className="k01co-row">
                <span className="k01co-ico" aria-hidden="true"><svg width="17" height="17" viewBox="0 0 24 24">{row.icon}</svg></span>
                <div>
                  <div className="k01co-label">{row.label}</div>
                  <div className="k01co-val">
                    {row.href ? (
                      <a href={row.href}><GenericEditableText sectionId={sectionId} field={row.field} value={row.value} tag="span" /></a>
                    ) : (
                      <GenericEditableText sectionId={sectionId} field={row.field} value={row.value} tag="span" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="k01co-form-wrap">
            <h3 className="k01co-form-title"><GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" /></h3>
            {status === "ok" ? (
              <div className="k01co-success" role="status">
                <p>Zpráva odeslána! Ozvu se vám do 24 hodin, u havárií ještě dnes.</p>
              </div>
            ) : (
              <form className="k01co-form" onSubmit={handleSubmit}>
                <div className="k01co-2col">
                  <div className="k01co-field">
                    <label htmlFor={`k01-name-${sectionId}`}>Jméno *</label>
                    <input id={`k01-name-${sectionId}`} type="text" name="name" required autoComplete="name" placeholder="Jan Novák" />
                  </div>
                  <div className="k01co-field">
                    <label htmlFor={`k01-phone-${sectionId}`}>Telefon *</label>
                    <input id={`k01-phone-${sectionId}`} type="tel" name="phone" required autoComplete="tel" placeholder="+420 704 123 456" />
                  </div>
                </div>
                <div className="k01co-field">
                  <label htmlFor={`k01-email-${sectionId}`}>E-mail</label>
                  <input id={`k01-email-${sectionId}`} type="email" name="email" autoComplete="email" placeholder="jan@email.cz" />
                </div>
                <div className="k01co-field">
                  <label htmlFor={`k01-msg-${sectionId}`}>Popis zakázky *</label>
                  <textarea id={`k01-msg-${sectionId}`} name="message" required placeholder="Popište střechu a co potřebujete opravit — typ krytiny, rozsah, adresa…" />
                </div>
                <button type="submit" className="k01co-submit" disabled={status === "sending"}>
                  {status === "sending" ? "Odesílám…" : ctaText}
                </button>
                {status === "err" && <p className="k01co-error" role="alert">Odeslání se nepovedlo. Zkuste to znovu, nebo rovnou zavolejte.</p>}
                <p className="k01co-note">Odesláním souhlasíte se zpracováním osobních údajů za účelem vyřízení poptávky.</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}


// ── garden-01-contact ────────────────────────────────────────────────────────
// VYLEPŠENO: tmavý info panel #202714, gold accenty, formulář s green focus glow,
// conditional header, editovatelné labely, hover lift na contact items
// ─────────────────────────────────────────────────────────────────────────────
function ContactGarden01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const eyebrowRaw  = (content as Record<string,unknown>).eyebrow;
  const titleRaw    = (content as Record<string,unknown>).title;
  const subtitleRaw = (content as Record<string,unknown>).subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Kontakt" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Proměníme vaši představu v realitu" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Popište nám svůj záměr a ozveme se s nezávazným návrhem do 24 hodin." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());

  const phone      = String(content.phone      ?? "+420 602 841 773");
  const email      = String(content.email      ?? "studio@verde-zahrady.cz");
  const address    = String(content.address    ?? "Plzeň a Západní Čechy");
  const buttonText = String(content.buttonText ?? "Odeslat zprávu");
  const phoneLabel = String(content.phoneLabel ?? "Telefon");
  const emailLabel = String(content.emailLabel ?? "E-mail");
  const addressLabel = String(content.addressLabel ?? "Oblast působení");
  const nameLabel  = String(content.nameLabel  ?? "Jméno a příjmení");
  const telLabel   = String(content.telLabel   ?? "Telefon");
  const emailFormLabel = String(content.emailFormLabel ?? "E-mail");
  const msgLabel   = String(content.msgLabel   ?? "Vaše představa");
  const successText = String(content.successText ?? "Děkujeme! Ozveme se vám do 24 hodin.");

  const [sent, setSent] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 800);
  }

  const DARK   = "#202714";
  const GREEN  = "#6a961f";
  const GOLD   = "#bcba63";
  const WHITE  = "#ffffff";
  const FONT_H = "'Cardo', Georgia, serif";
  const FONT_B = "'Inter', Arial, sans-serif";

  return (
    <>
      <style>{`
        .g01c-section {
          background: #f7f6f2;
          padding: 6rem 2.5rem;
          position: relative;
        }
        .g01c-container { max-width: 1200px; margin: 0 auto; }
        .g01c-header { max-width: 600px; margin: 0 0 3rem 0; }
        .g01c-eyebrow {
          display: inline-flex; align-items: center; gap: 0.6rem;
          font-family: ${FONT_B}; font-size: 0.78rem; font-weight: 600;
          letter-spacing: 0.2em; text-transform: uppercase; color: ${GREEN};
          margin-bottom: 0.85rem;
        }
        .g01c-eyebrow-line { width: 32px; height: 1.5px; background: ${GREEN}; }
        .g01c-title {
          font-family: ${FONT_H};
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          font-weight: 400; color: ${DARK};
          margin: 0 0 0.75rem 0; line-height: 1.2;
        }
        .g01c-subtitle {
          font-family: ${FONT_B}; font-size: 1rem;
          color: #5a5a5a; margin: 0; line-height: 1.7;
        }
        .g01c-inner {
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 2.5rem;
          align-items: start;
        }

        /* Info panel — dark */
        .g01c-info {
          background: ${DARK};
          border-radius: 16px;
          padding: 2.5rem 2rem;
          display: flex; flex-direction: column; gap: 1.75rem;
        }
        .g01c-info-heading {
          font-family: ${FONT_H}; font-size: 1.3rem; font-weight: 400;
          color: ${WHITE}; margin: 0; line-height: 1.3;
        }
        .g01c-contact-items {
          display: flex; flex-direction: column; gap: 1.25rem;
        }
        .g01c-contact-item {
          display: flex; align-items: center; gap: 1rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          transition: padding-left 0.3s ease;
        }
        .g01c-contact-item:hover { padding-left: 0.5rem; }
        .g01c-contact-item:last-child { border-bottom: none; }
        .g01c-contact-icon {
          width: 42px; height: 42px; border-radius: 10px;
          background: rgba(106,150,31,0.15);
          display: flex; align-items: center; justify-content: center;
          color: ${GOLD}; flex-shrink: 0;
          transition: background 0.25s ease;
        }
        .g01c-contact-item:hover .g01c-contact-icon {
          background: ${GREEN}; color: ${WHITE};
        }
        .g01c-contact-text { display: flex; flex-direction: column; }
        .g01c-contact-label {
          font-family: ${FONT_B}; font-size: 0.7rem; font-weight: 600;
          color: rgba(255,255,255,0.45); text-transform: uppercase;
          letter-spacing: 0.12em; margin-bottom: 0.15rem;
        }
        .g01c-contact-value {
          font-family: ${FONT_B}; font-size: 0.95rem;
          color: ${WHITE}; font-weight: 500;
          text-decoration: none; transition: color 0.2s;
        }
        .g01c-contact-value:hover { color: ${GOLD}; }
        .g01c-info-leaf {
          margin-top: auto; opacity: 0.08; pointer-events: none;
          align-self: flex-end;
        }

        /* Form card */
        .g01c-form-card {
          background: ${WHITE};
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 8px 40px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.04);
        }
        .g01c-form-row {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .g01c-field {
          display: flex; flex-direction: column;
          margin-bottom: 1rem;
        }
        .g01c-field label {
          font-family: ${FONT_B}; font-size: 0.78rem; font-weight: 600;
          color: ${DARK}; margin-bottom: 0.4rem;
          letter-spacing: 0.03em;
        }
        .g01c-field input,
        .g01c-field textarea {
          font-family: ${FONT_B}; font-size: 0.95rem;
          color: ${DARK}; background: #f9f8f5;
          border: 1.5px solid #e0ddd5;
          border-radius: 8px; padding: 0.7rem 0.9rem;
          outline: none; resize: vertical;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
          width: 100%; box-sizing: border-box;
        }
        .g01c-field input:focus,
        .g01c-field textarea:focus {
          border-color: ${GREEN};
          background: ${WHITE};
          box-shadow: 0 0 0 3px rgba(106,150,31,0.12);
        }
        .g01c-submit {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
          background: ${GREEN}; color: ${WHITE};
          font-family: ${FONT_B}; font-size: 0.92rem; font-weight: 600;
          border: none; border-radius: 9999px;
          padding: 0.85rem 2rem; cursor: pointer;
          letter-spacing: 0.02em; width: 100%; margin-top: 0.5rem;
          box-shadow: 0 6px 20px rgba(106,150,31,0.25);
          transition: background 0.3s ease, transform 0.3s cubic-bezier(.22,.68,0,1.1), box-shadow 0.3s ease;
        }
        .g01c-submit:hover:not(:disabled) {
          background: #5a7e18; transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(106,150,31,0.4);
        }
        .g01c-submit:disabled { opacity: 0.7; cursor: default; }
        .g01c-success {
          text-align: center; padding: 3rem 1rem;
          font-family: ${FONT_H}; font-size: 1.3rem; color: ${GREEN};
          line-height: 1.5;
        }
        .g01c-success-icon {
          display: flex; align-items: center; justify-content: center;
          width: 56px; height: 56px; border-radius: 50%;
          background: rgba(106,150,31,0.1); color: ${GREEN};
          margin: 0 auto 1rem;
        }

        @media (max-width: 1023px) {
          .g01c-inner { grid-template-columns: 1fr; gap: 2rem; }
        }
        @media (max-width: 639px) {
          .g01c-section { padding: 4rem 1.25rem; }
          .g01c-form-card { padding: 1.5rem; }
          .g01c-form-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <section id="kontakt" className="g01c-section" data-template="garden-01">
        <div className="g01c-container">
          {showHeader && (
            <div className="g01c-header">
              {eyebrow.trim() && (
                <div className="g01c-eyebrow">
                  <span className="g01c-eyebrow-line" aria-hidden="true" />
                  <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
                </div>
              )}
              {title.trim() && (
                <GenericEditableText tag="h2" className="g01c-title" value={title} sectionId={sectionId} field="title" />
              )}
              {subtitle.trim() && (
                <GenericEditableText tag="p" className="g01c-subtitle" value={subtitle} sectionId={sectionId} field="subtitle" />
              )}
            </div>
          )}

          <div className="g01c-inner">
            {/* Dark info panel */}
            <div className="g01c-info">
              <GenericEditableText tag="p" className="g01c-info-heading" value={String(content.infoHeading ?? "Spojte se s námi")} sectionId={sectionId} field="infoHeading" />
              <div className="g01c-contact-items">
                <div className="g01c-contact-item">
                  <div className="g01c-contact-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v2.92z"/>
                    </svg>
                  </div>
                  <div className="g01c-contact-text">
                    <GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span" className="g01c-contact-label" />
                    <a href={`tel:${phone.replace(/\s/g,"")}`} className="g01c-contact-value">
                      <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                    </a>
                  </div>
                </div>
                <div className="g01c-contact-item">
                  <div className="g01c-contact-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div className="g01c-contact-text">
                    <GenericEditableText sectionId={sectionId} field="emailLabel" value={emailLabel} tag="span" className="g01c-contact-label" />
                    <a href={`mailto:${email}`} className="g01c-contact-value">
                      <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                    </a>
                  </div>
                </div>
                <div className="g01c-contact-item">
                  <div className="g01c-contact-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div className="g01c-contact-text">
                    <GenericEditableText sectionId={sectionId} field="addressLabel" value={addressLabel} tag="span" className="g01c-contact-label" />
                    <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" className="g01c-contact-value" />
                  </div>
                </div>
              </div>
              {/* decorative leaf */}
              <svg className="g01c-info-leaf" width="80" height="80" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ color: GOLD }}>
                <path d="M4 20C4 12 10 5 20 4C19 14 12 20 4 20Z"/>
              </svg>
            </div>

            {/* Form card */}
            <div className="g01c-form-card">
              {sent ? (
                <div className="g01c-success">
                  <div className="g01c-success-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <GenericEditableText sectionId={sectionId} field="successText" value={successText} tag="span" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="g01c-form-row">
                    <div className="g01c-field">
                      <label><GenericEditableText sectionId={sectionId} field="nameLabel" value={nameLabel} tag="span" /></label>
                      <input type="text" placeholder="Jan Novák" required />
                    </div>
                    <div className="g01c-field">
                      <label><GenericEditableText sectionId={sectionId} field="telLabel" value={telLabel} tag="span" /></label>
                      <input type="tel" placeholder="+420 000 000 000" />
                    </div>
                  </div>
                  <div className="g01c-field">
                    <label><GenericEditableText sectionId={sectionId} field="emailFormLabel" value={emailFormLabel} tag="span" /></label>
                    <input type="email" placeholder="vas@email.cz" required />
                  </div>
                  <div className="g01c-field">
                    <label><GenericEditableText sectionId={sectionId} field="msgLabel" value={msgLabel} tag="span" /></label>
                    <textarea placeholder="Popište vaši zahradu a co byste si přáli…" rows={5} required />
                  </div>
                  <button type="submit" className="g01c-submit" disabled={sending}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                      <path d="M4 20C4 12 10 5 20 4C19 14 12 20 4 20Z" fill="currentColor"/>
                    </svg>
                    <GenericEditableText sectionId={sectionId} field="buttonText" value={sending ? "Odesílám…" : buttonText} tag="span" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


// ── garden-02-contact ────────────────────────────────────────────────────────
function ContactGarden02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const eyebrowRaw  = (content as Record<string,unknown>).eyebrow;
  const titleRaw    = (content as Record<string,unknown>).title;
  const subtitleRaw = (content as Record<string,unknown>).subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Kontakt" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Domluvte si konzultaci" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Popište nám svůj záměr a ozveme se s nezávazným návrhem do 24 hodin." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());

  const phone      = String(content.phone      ?? "+420 775 234 567");
  const email      = String(content.email      ?? "info@edenpro.cz");
  const address    = String(content.address    ?? "Praha a Středočeský kraj");
  const buttonText = String(content.buttonText ?? "Odeslat poptávku");
  const phoneLabel = String(content.phoneLabel ?? "Telefon");
  const emailLabel = String(content.emailLabel ?? "E-mail");
  const addressLabel = String(content.addressLabel ?? "Oblast působení");
  const nameLabel  = String(content.nameLabel  ?? "Jméno a příjmení");
  const telLabel   = String(content.telLabel   ?? "Telefon");
  const emailFormLabel = String(content.emailFormLabel ?? "E-mail");
  const msgLabel   = String(content.msgLabel   ?? "Popište svůj záměr");
  const successText = String(content.successText ?? "Děkujeme! Ozveme se vám do 24 hodin.");
  const infoHeading = String(content.infoHeading ?? "Spojte se s námi");

  const [sent, setSent] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 800);
  }

  const GREEN = "#95c11f";
  const DARK  = "#1a2e05";
  const BG    = "#f5f5f0";

  return (
    <>
      <style>{`
        .g02c-section {
          background: ${BG};
          padding: 6rem 2.5rem;
          position: relative;
        }
        .g02c-container { max-width: 1200px; margin: 0 auto; }
        .g02c-header { max-width: 600px; margin: 0 0 3rem 0; }
        .g02c-eyebrow {
          display: inline-flex; align-items: center; gap: 0.6rem;
          font-family: 'Inter', Arial, sans-serif; font-size: 0.78rem; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase; color: ${GREEN};
          margin-bottom: 0.85rem;
        }
        .g02c-eyebrow::before {
          content: ''; display: inline-block; width: 8px; height: 8px;
          border-radius: 50%; background: ${GREEN}; flex-shrink: 0;
        }
        .g02c-title {
          font-family: 'Inter', Arial, sans-serif;
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          font-weight: 800; color: ${DARK};
          margin: 0 0 0.75rem 0; line-height: 1.15;
          letter-spacing: -0.02em;
        }
        .g02c-subtitle {
          font-family: 'Inter', Arial, sans-serif; font-size: 1rem;
          color: #5a5a5a; margin: 0; line-height: 1.7;
        }
        .g02c-inner {
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 2.5rem;
          align-items: start;
        }

        /* Info panel — dark green */
        .g02c-info {
          background: ${DARK};
          border-radius: 16px;
          padding: 2.5rem 2rem;
          display: flex; flex-direction: column; gap: 1.75rem;
          position: relative; overflow: hidden;
        }
        .g02c-info::after {
          content: ''; position: absolute; bottom: -40px; right: -40px;
          width: 200px; height: 200px; border-radius: 50%;
          background: radial-gradient(circle, rgba(149,193,31,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .g02c-info-heading {
          font-family: 'Inter', Arial, sans-serif; font-size: 1.2rem; font-weight: 700;
          color: #ffffff; margin: 0; line-height: 1.3;
        }
        .g02c-contact-items {
          display: flex; flex-direction: column; gap: 1.25rem;
        }
        .g02c-contact-item {
          display: flex; align-items: center; gap: 1rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          transition: padding-left 0.3s ease;
        }
        .g02c-contact-item:hover { padding-left: 0.5rem; }
        .g02c-contact-item:last-child { border-bottom: none; }
        .g02c-contact-icon {
          width: 42px; height: 42px; border-radius: 10px;
          background: rgba(149,193,31,0.15);
          display: flex; align-items: center; justify-content: center;
          color: ${GREEN}; flex-shrink: 0;
          transition: background 0.25s ease, color 0.25s ease;
        }
        .g02c-contact-item:hover .g02c-contact-icon {
          background: ${GREEN}; color: #ffffff;
        }
        .g02c-contact-text { display: flex; flex-direction: column; }
        .g02c-contact-label {
          font-family: 'Inter', Arial, sans-serif; font-size: 0.7rem; font-weight: 600;
          color: rgba(255,255,255,0.45); text-transform: uppercase;
          letter-spacing: 0.12em; margin-bottom: 0.15rem;
        }
        .g02c-contact-value {
          font-family: 'Inter', Arial, sans-serif; font-size: 0.95rem;
          color: #ffffff; font-weight: 500;
          text-decoration: none; transition: color 0.2s;
        }
        .g02c-contact-value:hover { color: ${GREEN}; }
        .g02c-info-leaf {
          margin-top: auto; opacity: 0.06; pointer-events: none;
          align-self: flex-end; position: relative; z-index: 1;
        }

        /* Form card */
        .g02c-form-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 8px 40px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.04);
        }
        .g02c-form-row {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .g02c-field {
          display: flex; flex-direction: column;
          margin-bottom: 1rem;
        }
        .g02c-field label {
          font-family: 'Inter', Arial, sans-serif; font-size: 0.78rem; font-weight: 600;
          color: ${DARK}; margin-bottom: 0.4rem;
          letter-spacing: 0.03em;
        }
        .g02c-field input,
        .g02c-field textarea {
          font-family: 'Inter', Arial, sans-serif; font-size: 0.95rem;
          color: ${DARK}; background: #fafaf6;
          border: 1.5px solid #e0ddd5;
          border-radius: 8px; padding: 0.7rem 0.9rem;
          outline: none; resize: vertical;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
          width: 100%; box-sizing: border-box;
        }
        .g02c-field input:focus,
        .g02c-field textarea:focus {
          border-color: ${GREEN};
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(149,193,31,0.14);
        }
        .g02c-submit {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
          background: ${GREEN}; color: #ffffff;
          font-family: 'Inter', Arial, sans-serif; font-size: 0.92rem; font-weight: 700;
          border: none; border-radius: 9999px;
          padding: 0.85rem 2rem; cursor: pointer;
          letter-spacing: 0.02em; width: 100%; margin-top: 0.5rem;
          box-shadow: 0 6px 20px rgba(149,193,31,0.25);
          transition: background 0.3s ease, transform 0.3s cubic-bezier(.22,.68,0,1.1), box-shadow 0.3s ease;
        }
        .g02c-submit:hover:not(:disabled) {
          background: #7aa31a; transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(149,193,31,0.4);
        }
        .g02c-submit:disabled { opacity: 0.7; cursor: default; }
        .g02c-success {
          text-align: center; padding: 3rem 1rem;
          font-family: 'Inter', Arial, sans-serif; font-size: 1.2rem; color: ${GREEN};
          font-weight: 700; line-height: 1.5;
        }
        .g02c-success-icon {
          display: flex; align-items: center; justify-content: center;
          width: 56px; height: 56px; border-radius: 50%;
          background: rgba(149,193,31,0.1); color: ${GREEN};
          margin: 0 auto 1rem;
        }

        @media (max-width: 1023px) {
          .g02c-inner { grid-template-columns: 1fr; gap: 2rem; }
        }
        @media (max-width: 639px) {
          .g02c-section { padding: 4rem 1.25rem; }
          .g02c-form-card { padding: 1.5rem; }
          .g02c-form-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <section id="kontakt" className="g02c-section" data-template="garden-02">
        <div className="g02c-container">
          {showHeader && (
            <div className="g02c-header">
              {eyebrow.trim() && (
                <div className="g02c-eyebrow">
                  <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
                </div>
              )}
              {title.trim() && (
                <GenericEditableText tag="h2" className="g02c-title" value={title} sectionId={sectionId} field="title" />
              )}
              {subtitle.trim() && (
                <GenericEditableText tag="p" className="g02c-subtitle" value={subtitle} sectionId={sectionId} field="subtitle" />
              )}
            </div>
          )}

          <div className="g02c-inner">
            <div className="g02c-info">
              <GenericEditableText tag="p" className="g02c-info-heading" value={infoHeading} sectionId={sectionId} field="infoHeading" />
              <div className="g02c-contact-items">
                <div className="g02c-contact-item">
                  <div className="g02c-contact-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v2.92z"/>
                    </svg>
                  </div>
                  <div className="g02c-contact-text">
                    <GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span" className="g02c-contact-label" />
                    <a href={`tel:${phone.replace(/\s/g,"")}`} className="g02c-contact-value">
                      <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                    </a>
                  </div>
                </div>
                <div className="g02c-contact-item">
                  <div className="g02c-contact-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div className="g02c-contact-text">
                    <GenericEditableText sectionId={sectionId} field="emailLabel" value={emailLabel} tag="span" className="g02c-contact-label" />
                    <a href={`mailto:${email}`} className="g02c-contact-value">
                      <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                    </a>
                  </div>
                </div>
                <div className="g02c-contact-item">
                  <div className="g02c-contact-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div className="g02c-contact-text">
                    <GenericEditableText sectionId={sectionId} field="addressLabel" value={addressLabel} tag="span" className="g02c-contact-label" />
                    <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" className="g02c-contact-value" />
                  </div>
                </div>
              </div>
              <svg className="g02c-info-leaf" width="80" height="80" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ color: GREEN }}>
                <path d="M4 20C4 12 10 5 20 4C19 14 12 20 4 20Z"/>
              </svg>
            </div>

            <div className="g02c-form-card">
              {sent ? (
                <div className="g02c-success">
                  <div className="g02c-success-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <GenericEditableText sectionId={sectionId} field="successText" value={successText} tag="span" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="g02c-form-row">
                    <div className="g02c-field">
                      <label><GenericEditableText sectionId={sectionId} field="nameLabel" value={nameLabel} tag="span" /></label>
                      <input type="text" placeholder="Jan Novák" required />
                    </div>
                    <div className="g02c-field">
                      <label><GenericEditableText sectionId={sectionId} field="telLabel" value={telLabel} tag="span" /></label>
                      <input type="tel" placeholder="+420 000 000 000" />
                    </div>
                  </div>
                  <div className="g02c-field">
                    <label><GenericEditableText sectionId={sectionId} field="emailFormLabel" value={emailFormLabel} tag="span" /></label>
                    <input type="email" placeholder="vas@email.cz" required />
                  </div>
                  <div className="g02c-field">
                    <label><GenericEditableText sectionId={sectionId} field="msgLabel" value={msgLabel} tag="span" /></label>
                    <textarea placeholder="Popište svůj záměr — velikost zahrady, terén, přání…" rows={5} required />
                  </div>
                  <button type="submit" className="g02c-submit" disabled={sending}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                      <path d="M4 20C4 12 10 5 20 4C19 14 12 20 4 20Z" fill="currentColor"/>
                    </svg>
                    <GenericEditableText sectionId={sectionId} field="buttonText" value={sending ? "Odesílám…" : buttonText} tag="span" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ── clean-02-contact ──────────────────────────────────────────────────────────
// Arctic Editorial: ink info panel + bílý formulář; reálné odeslání na
// /api/demo/:slug/contact (fallback /api/contact) se stavy sending/success/error.
function ContactClean02({ content, sectionId, tenantSlug, isAdmin: _isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const [status, setStatus] = React.useState<"idle" | "sending" | "ok" | "err">("idle");
  const eyebrow = String(content.eyebrow ?? "Nezávazná poptávka");
  const title   = String(content.title ?? "Připravíme vám cenovou nabídku");
  const sub     = String(content.subtitle ?? "Na zprávy i hovory reagujeme bez zbytečných prodlev. S námi se domluvíte rychle a jasně.");
  const phone   = String(content.phone ?? "+420 704 123 456");
  const email   = String(content.email ?? "email@demo.cz");
  const address = String(content.address ?? "Ukázková 123, 110 00 Praha 1");
  const hours   = String(content.openingHours ?? "Po–Pá 8:00–16:00");
  const services = (content.services as string[]) ?? [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    const payload = {
      sectionId,
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      service: String(fd.get("service") ?? ""),
      message: String(fd.get("message") ?? ""),
    };
    try {
      const url = tenantSlug ? `/api/demo/${tenantSlug}/contact` : "/api/contact";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok ? "ok" : "err");
    } catch {
      setStatus("err");
    }
  };

  return (
    <>
      <style>{`
        .c02co-section { background: var(--color-bg, #F4F6F9); padding: clamp(4rem, 8vw, 7rem) 0; font-family: 'Onest',sans-serif; }
        .c02co-inner {
          max-width: 76rem; margin: 0 auto; padding: 0 clamp(1.25rem, 4vw, 2.5rem);
          display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: 1.3rem; align-items: stretch;
        }
        .c02co-panel {
          background: var(--color-secondary, #0B1526); border-radius: 20px; padding: clamp(1.9rem, 3.5vw, 2.9rem);
          display: flex; flex-direction: column;
        }
        .c02co-kicker {
          display: inline-flex; align-items: center; gap: .55rem;
          font-size: .8rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
          color: #6E9BFF; margin-bottom: 1.1rem;
        }
        .c02co-kicker::before { content: ''; width: 22px; height: 2px; background: #6E9BFF; border-radius: 2px; }
        .c02co-h2 {
          font-family: 'Bricolage Grotesque',sans-serif;
          font-size: clamp(1.5rem, 2.6vw, 2.1rem); font-weight: 750; color: #fff;
          margin: 0 0 .8rem; line-height: 1.15; letter-spacing: -0.025em;
        }
        .c02co-sub { font-size: .93rem; color: #9AA7BC; line-height: 1.68; margin: 0 0 2rem; }
        .c02co-divider { border: none; border-top: 1px solid rgba(255,255,255,.12); margin: 0 0 1.8rem; }
        .c02co-row { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.3rem; }
        .c02co-row:last-child { margin-bottom: 0; }
        .c02co-icon-box {
          width: 40px; height: 40px; border-radius: 12px; background: rgba(110,155,255,.14);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .c02co-icon-box svg { width: 17px; height: 17px; color: #6E9BFF; }
        .c02co-row-label { font-size: .7rem; font-weight: 700; color: #64738C; text-transform: uppercase; letter-spacing: .09em; margin-bottom: 2px; }
        .c02co-row-val { font-size: .95rem; font-weight: 600; color: #fff; }
        .c02co-row-val a { color: #fff; text-decoration: none; }
        .c02co-row-val a:hover { color: #6E9BFF; }
        .c02co-form-wrap { background: #fff; border: 1px solid var(--color-border, #E7EBF2); border-radius: 20px; padding: clamp(1.9rem, 3.5vw, 2.9rem); }
        .c02co-form-title {
          font-family: 'Bricolage Grotesque',sans-serif;
          font-size: 1.4rem; font-weight: 750; letter-spacing: -0.02em; color: var(--color-secondary, #0B1526); margin: 0 0 1.6rem;
        }
        .c02co-form { display: flex; flex-direction: column; gap: 1.1rem; }
        .c02co-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .c02co-field label { font-size: .8rem; font-weight: 700; color: #22304A; display: block; margin-bottom: .38rem; letter-spacing: .01em; }
        .c02co-field input, .c02co-field select, .c02co-field textarea {
          width: 100%; padding: .82rem 1rem; border: 1px solid #D6DEEA; border-radius: 12px; box-sizing: border-box;
          font-family: 'Onest',sans-serif; font-size: .93rem; color: var(--color-secondary, #0B1526); background: #FAFBFD; outline: none;
          transition: border-color .2s, box-shadow .2s, background .2s;
        }
        .c02co-field input:focus, .c02co-field select:focus, .c02co-field textarea:focus {
          border-color: var(--color-primary, #1B5BFF); box-shadow: 0 0 0 3px rgba(27,91,255,.14); background: #fff;
        }
        .c02co-field textarea { min-height: 112px; resize: vertical; }
        .c02co-submit {
          width: 100%; padding: 1rem 2rem; border-radius: 9999px; border: none;
          background: var(--color-primary, #1B5BFF); color: #fff;
          font-family: 'Onest',sans-serif; font-size: 1rem; font-weight: 700; cursor: pointer;
          transition: background .25s, transform .2s;
          box-shadow: 0 14px 30px -14px rgba(27,91,255,.55);
        }
        .c02co-submit:hover:not(:disabled) { background: var(--color-accent, #0E44D6); transform: translateY(-1px); }
        .c02co-submit:disabled { opacity: .7; cursor: default; }
        .c02co-note { font-size: .78rem; color: #98A4B8; text-align: center; margin: 0; }
        .c02co-success { background: #F0FBF5; border: 1px solid #B9E7CD; border-radius: 14px; padding: 1.6rem; text-align: center; }
        .c02co-success-icon {
          width: 44px; height: 44px; border-radius: 50%; background: #16A34A; color: #fff;
          display: grid; place-items: center; margin: 0 auto .7rem; font-size: 1.3rem;
        }
        .c02co-success p { font-size: .95rem; color: #14532D; font-weight: 600; margin: 0; }
        .c02co-error { margin: 0; font-size: .85rem; font-weight: 600; color: #B91C1C; text-align: center; }
        @media (max-width: 960px) { .c02co-inner { grid-template-columns: 1fr; } }
        @media (max-width: 520px) { .c02co-row2 { grid-template-columns: 1fr; } .c02co-form-wrap { padding: 1.6rem 1.2rem; } }
        @media (prefers-reduced-motion: reduce) { .c02co-submit { transition: none; } }
      `}</style>
      <section className="c02co-section" id="kontakt" data-template="clean-02-contact">
        <div className="c02co-inner">
          {/* Left: info panel */}
          <div className="c02co-panel">
            <p className="c02co-kicker"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="c02co-h2"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p className="c02co-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={sub} tag="span" /></p>
            <hr className="c02co-divider" />
            <div className="c02co-row">
              <div className="c02co-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.41 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.4a16 16 0 0 0 6 6l.76-.76a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div>
                <div className="c02co-row-label">Telefon</div>
                <div className="c02co-row-val"><a href={`tel:${phone.replace(/\s/g,"")}`}><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" /></a></div>
              </div>
            </div>
            <div className="c02co-row">
              <div className="c02co-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div>
                <div className="c02co-row-label">E-mail</div>
                <div className="c02co-row-val"><a href={`mailto:${email}`}><GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" /></a></div>
              </div>
            </div>
            <div className="c02co-row">
              <div className="c02co-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div>
                <div className="c02co-row-label">Adresa</div>
                <div className="c02co-row-val"><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></div>
              </div>
            </div>
            <div className="c02co-row">
              <div className="c02co-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <div className="c02co-row-label">Provozní doba</div>
                <div className="c02co-row-val"><GenericEditableText sectionId={sectionId} field="openingHours" value={hours} tag="span" /></div>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="c02co-form-wrap">
            <h3 className="c02co-form-title"><GenericEditableText sectionId={sectionId} field="formTitle" value={String(content.formTitle ?? "Poptat úklid")} tag="span" /></h3>
            {status === "ok" ? (
              <div className="c02co-success" role="status">
                <div className="c02co-success-icon" aria-hidden="true">✓</div>
                <p>Poptávka odeslána! Ozveme se vám do 24 hodin v pracovní dny.</p>
              </div>
            ) : (
              <form className="c02co-form" onSubmit={handleSubmit}>
                <div className="c02co-row2">
                  <div className="c02co-field">
                    <label htmlFor={`c02-name-${sectionId}`}>Jméno a příjmení *</label>
                    <input id={`c02-name-${sectionId}`} type="text" name="name" required autoComplete="name" placeholder="Jan Novák" />
                  </div>
                  <div className="c02co-field">
                    <label htmlFor={`c02-phone-${sectionId}`}>Telefonní číslo *</label>
                    <input id={`c02-phone-${sectionId}`} type="tel" name="phone" required autoComplete="tel" placeholder="+420 704 123 456" />
                  </div>
                </div>
                <div className="c02co-field">
                  <label htmlFor={`c02-email-${sectionId}`}>E-mail *</label>
                  <input id={`c02-email-${sectionId}`} type="email" name="email" required autoComplete="email" placeholder="jan@firma.cz" />
                </div>
                {services.length > 0 && (
                  <div className="c02co-field">
                    <label htmlFor={`c02-service-${sectionId}`}>Typ poptávky</label>
                    <select id={`c02-service-${sectionId}`} name="service">
                      {services.map((s, i) => <option key={i} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                <div className="c02co-field">
                  <label htmlFor={`c02-msg-${sectionId}`}>Zpráva</label>
                  <textarea id={`c02-msg-${sectionId}`} name="message" placeholder="Popište prostor, který potřebujete uklidit — velikost, frekvenci, případné zvláštní požadavky…" />
                </div>
                <button type="submit" className="c02co-submit" disabled={status === "sending"}>
                  {status === "sending" ? "Odesílám…" : "Odeslat poptávku"}
                </button>
                {status === "err" && <p className="c02co-error" role="alert">Odeslání se nepovedlo. Zkuste to prosím znovu, nebo nám zavolejte.</p>}
                <p className="c02co-note">Odesláním souhlasíte se zpracováním osobních údajů za účelem vyřízení poptávky.</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// ── arbo-01-contact ───────────────────────────────────────────────────────────
// 1:1 lesarb.cz:
// - Dark green #15472a bg, 2-col desktop: left info / right white form card
// - Left: white heading, phone, email, address with icon masks, instagram link
// - Right: jméno+telefon row, email, zpráva, GDPR checkbox, submit
// ─────────────────────────────────────────────────────────────────────────────
function ContactArbo01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const [form, setForm]     = useState({ name: "", email: "", phone: "", message: "", gdpr: false });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  const siteName  = String(content.siteName  ?? "Demo Arborist s.r.o.");
  const phone     = String(content.phone     ?? "+420 704 123 456");
  const email     = String(content.email     ?? "email@demo.cz");
  const address   = String(content.address   ?? "Ukázková 123\n110 00 Praha 1");
  const instagram = String(content.instagram ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.gdpr) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sectionId }),
      });
      setStatus(res.ok ? "ok" : "err");
    } catch {
      setStatus("err");
    }
  };

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <style>{`
        .arbo01-ct {
          background: #15472a;
          padding: 5rem 1.5rem;
          font-family: "AlanSans","Inter",system-ui,sans-serif;
        }
        .arbo01-ct-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          align-items: start;
        }
        @media (min-width: 960px) {
          .arbo01-ct-inner { grid-template-columns: 1fr 1fr; }
        }
        .arbo01-ct-info { color: #fff; display: flex; flex-direction: column; gap: 1.5rem; }
        .arbo01-ct-heading {
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          font-weight: 700; color: #fff; margin: 0; line-height: 1.15;
        }
        .arbo01-ct-name { font-size: 1rem; font-weight: 600; color: #62D76A; margin: 0; }
        .arbo01-ct-detail {
          display: flex; align-items: flex-start; gap: 0.75rem;
          font-size: 0.95rem; color: rgba(255,255,255,0.85);
          line-height: 1.5; text-decoration: none;
        }
        .arbo01-ct-detail:hover { color: #fff; }
        .arbo01-ct-icon {
          width: 20px; height: 20px; flex-shrink: 0; margin-top: 1px;
          background-color: #62D76A;
          -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
          -webkit-mask-size: contain; mask-size: contain;
          -webkit-mask-position: center; mask-position: center;
        }
        .arbo01-ct-icon-phone {
          -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z'/%3E%3C/svg%3E");
          mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z'/%3E%3C/svg%3E");
        }
        .arbo01-ct-icon-mail {
          -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z'/%3E%3C/svg%3E");
          mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z'/%3E%3C/svg%3E");
        }
        .arbo01-ct-icon-pin {
          -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E");
          mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E");
        }
        .arbo01-ct-form-wrap { background: #fff; border-radius: 12px; padding: 2rem; }
        .arbo01-ct-form { display: flex; flex-direction: column; gap: 1rem; }
        .arbo01-ct-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 500px) { .arbo01-ct-row { grid-template-columns: 1fr; } }
        .arbo01-ct-field { display: flex; flex-direction: column; gap: 0.35rem; }
        .arbo01-ct-label { font-size: 0.8rem; font-weight: 600; color: #051d35; letter-spacing: 0.03em; }
        .arbo01-ct-input, .arbo01-ct-textarea {
          padding: 0.65rem 0.875rem;
          border: 1.5px solid #dde3ea;
          border-radius: 6px;
          font-size: 0.9rem; color: #051d35;
          font-family: inherit; background: #fff;
          transition: border-color 0.15s;
          width: 100%; box-sizing: border-box;
        }
        .arbo01-ct-input:focus, .arbo01-ct-textarea:focus { outline: none; border-color: #009739; }
        .arbo01-ct-textarea { resize: vertical; min-height: 110px; }
        .arbo01-ct-gdpr {
          display: flex; align-items: flex-start; gap: 0.6rem;
          font-size: 0.8rem; color: #6b7a8d; line-height: 1.45; cursor: pointer;
        }
        .arbo01-ct-gdpr input { margin-top: 2px; accent-color: #009739; flex-shrink: 0; }
        .arbo01-ct-submit {
          background: #009739; color: #fff; border: none; border-radius: 6px;
          font-size: 0.95rem; font-weight: 700; padding: 0.8rem 1.5rem;
          cursor: pointer; font-family: inherit; transition: background 0.2s; align-self: flex-start;
        }
        .arbo01-ct-submit:hover:not(:disabled) { background: #15472a; }
        .arbo01-ct-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .arbo01-ct-msg { font-size: 0.875rem; font-weight: 600; padding: 0.5rem 0; }
        .arbo01-ct-msg-ok  { color: #009739; }
        .arbo01-ct-msg-err { color: #c0392b; }
      `}</style>

      <section className="arbo01-ct" id={String(sectionId)} data-template="arbo-01-contact">
        <div className="arbo01-ct-inner">
          {/* Left: info */}
          <div className="arbo01-ct-info">
            <h2 className="arbo01-ct-heading">Nezávazná poptávka</h2>
            <p className="arbo01-ct-name">
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </p>
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="arbo01-ct-detail">
              <span className="arbo01-ct-icon arbo01-ct-icon-phone" aria-hidden="true" />
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
            <a href={`mailto:${email}`} className="arbo01-ct-detail">
              <span className="arbo01-ct-icon arbo01-ct-icon-mail" aria-hidden="true" />
              <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
            </a>
            <div className="arbo01-ct-detail">
              <span className="arbo01-ct-icon arbo01-ct-icon-pin" aria-hidden="true" />
              <span style={{ whiteSpace: "pre-line" }}>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </span>
            </div>
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="arbo01-ct-detail">
                <span style={{ fontSize: "0.85rem", color: "#62D76A", fontWeight: 700 }}>Instagram →</span>
              </a>
            )}
          </div>

          {/* Right: form */}
          <div className="arbo01-ct-form-wrap">
            {status === "ok" ? (
              <p className="arbo01-ct-msg arbo01-ct-msg-ok">✓ Zpráva odeslána! Ozveme se co nejdříve.</p>
            ) : (
              <form className="arbo01-ct-form" onSubmit={handleSubmit} noValidate>
                <div className="arbo01-ct-row">
                  <div className="arbo01-ct-field">
                    <label className="arbo01-ct-label">Jméno *</label>
                    <input className="arbo01-ct-input" required value={form.name} onChange={e => set("name", e.target.value)} placeholder="Jan Novák" />
                  </div>
                  <div className="arbo01-ct-field">
                    <label className="arbo01-ct-label">Telefon</label>
                    <input className="arbo01-ct-input" type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+420 700 000 000" />
                  </div>
                </div>
                <div className="arbo01-ct-field">
                  <label className="arbo01-ct-label">E-mail *</label>
                  <input className="arbo01-ct-input" type="email" required value={form.email} onChange={e => set("email", e.target.value)} placeholder="vas@email.cz" />
                </div>
                <div className="arbo01-ct-field">
                  <label className="arbo01-ct-label">Zpráva *</label>
                  <textarea className="arbo01-ct-textarea" required value={form.message} onChange={e => set("message", e.target.value)} placeholder="Popište prosím vaši poptávku…" />
                </div>
                <label className="arbo01-ct-gdpr">
                  <input type="checkbox" checked={form.gdpr} onChange={e => set("gdpr", e.target.checked)} required />
                  Souhlasím se zpracováním osobních údajů pro účely odpovědi na mou poptávku.
                </label>
                {status === "err" && <p className="arbo01-ct-msg arbo01-ct-msg-err">Nepodařilo se odeslat. Zkuste to znovu.</p>}
                <button className="arbo01-ct-submit" type="submit" disabled={status === "sending" || !form.gdpr}>
                  {status === "sending" ? "Odesílám…" : "Odeslat poptávku"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// ── hotel-01-contact ──────────────────────────────────────────────────────────
function ContactHotel01({ content, sectionId, isAdmin }: { content: Record<string, unknown>; sectionId: number; isAdmin: boolean }) {
  const c                = (content ?? {}) as Record<string, any>;
  const showHeader       = c.showHeader !== false;
  const eyebrow          = c.eyebrow          ?? "Kontakt";
  const title            = c.title            ?? "Těšíme se na vás";
  const titleAccent      = c.titleAccent      ?? "vás";
  const subtitle         = c.subtitle         ?? "";
  const phone            = c.phone            ?? "";
  const phone2           = c.phone2           ?? "";
  const email            = c.email            ?? "";
  const emailReservation = c.emailReservation ?? "";
  const address          = c.address          ?? "";
  const city             = c.city             ?? "";
  const hours            = c.hours            ?? "";
  const mapUrl           = c.mapUrl           ?? "";

  const [form, setForm]     = useState({ name: "", email: "", checkin: "", checkout: "", guests: "", message: "", gdpr: false });
  const [status, setStatus] = useState<"idle"|"sending"|"ok"|"err">("idle");

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdmin) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId, ...form }),
      });
      setStatus(res.ok ? "ok" : "err");
    } catch {
      setStatus("err");
    }
  };

  const renderTitle = () => {
    if (!titleAccent || !title.includes(titleAccent)) {
      return <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />;
    }
    const parts = title.split(titleAccent);
    return (
      <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span">
        <>{parts[0]}<em className="h01ct-accent">{titleAccent}</em>{parts.slice(1).join(titleAccent)}</>
      </GenericEditableText>
    );
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Poppins:wght@300;400;500&display=swap" />
      <style>{`
        .h01ct {
          background: #1e1a16;
          padding: clamp(80px,10vw,140px) clamp(20px,5vw,80px);
          font-family: 'Poppins', sans-serif;
          position: relative; overflow: hidden;
        }
        .h01ct::before {
          content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 1px; height: 60px; background: linear-gradient(180deg, #a98763, transparent);
        }
        .h01ct-header {
          max-width: 1200px; margin: 0 auto 64px; text-align: center;
        }
        .h01ct-eyebrow {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic; font-weight: 400;
          font-size: 13px; letter-spacing: 0.28em; text-transform: uppercase;
          color: #d4b088; margin: 0 0 20px;
          display: inline-flex; align-items: center; gap: 18px;
        }
        .h01ct-eyebrow::before, .h01ct-eyebrow::after {
          content: ''; display: inline-block; width: 32px; height: 1px; background: #a98763;
        }
        .h01ct-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(30px,4vw,52px); font-weight: 400; color: #fff;
          margin: 0 0 18px; line-height: 1.15;
        }
        .h01ct-accent { font-style: italic; color: #d4b088; }
        .h01ct-subtitle {
          font-size: 15.5px; color: rgba(255,255,255,.65); font-weight: 300;
          max-width: 560px; margin: 0 auto; line-height: 1.8;
        }
        .h01ct-grid {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1.4fr; gap: 72px; align-items: start;
        }

        .h01ct-info { display: flex; flex-direction: column; gap: 0; }
        .h01ct-info-block {
          padding: 26px 0; border-bottom: 1px solid rgba(169,135,99,.2);
          display: flex; gap: 18px; align-items: flex-start;
        }
        .h01ct-info-block:first-child { padding-top: 0; }
        .h01ct-info-icon {
          width: 42px; height: 42px; flex-shrink: 0;
          background: rgba(169,135,99,.12); border: 1px solid rgba(169,135,99,.35);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center; color: #d4b088;
          margin-top: 2px;
        }
        .h01ct-info-label {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic; font-weight: 400;
          font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
          color: #d4b088; margin: 0 0 6px;
        }
        .h01ct-info-val {
          font-size: 15px; color: rgba(255,255,255,.82); font-weight: 300; margin: 0;
          line-height: 1.6;
        }
        .h01ct-info-val a { color: rgba(255,255,255,.82); text-decoration: none; transition: color .3s; }
        .h01ct-info-val a:hover { color: #d4b088; }

        .h01ct-form {
          background: rgba(255,255,255,.04); backdrop-filter: blur(8px);
          padding: 44px; border: 1px solid rgba(169,135,99,.2);
        }
        .h01ct-form-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic; font-size: 24px; font-weight: 400; color: #fff;
          margin: 0 0 8px;
        }
        .h01ct-form-sub {
          font-size: 13px; color: rgba(255,255,255,.5); font-weight: 300;
          margin: 0 0 32px;
        }
        .h01ct-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .h01ct-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
        .h01ct-field label {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic; font-weight: 400;
          font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(212,176,136,.75);
        }
        .h01ct-field input, .h01ct-field textarea, .h01ct-field select {
          font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 300;
          border: 1px solid rgba(169,135,99,.25); background: rgba(255,255,255,.03);
          color: #fff; padding: 12px 16px; outline: none; resize: none;
          transition: border-color 0.3s, background 0.3s;
        }
        .h01ct-field input::placeholder, .h01ct-field textarea::placeholder {
          color: rgba(255,255,255,.3);
        }
        .h01ct-field input:focus, .h01ct-field textarea:focus {
          border-color: #a98763; background: rgba(169,135,99,.06);
        }
        .h01ct-gdpr {
          display: flex; gap: 10px; align-items: flex-start;
          font-size: 12px; color: rgba(255,255,255,.55); font-weight: 300;
          margin-bottom: 22px; cursor: pointer;
        }
        .h01ct-gdpr input { margin-top: 3px; flex-shrink: 0; accent-color: #a98763; }
        .h01ct-submit {
          position: relative; overflow: hidden;
          width: 100%; background: transparent; color: #fff;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase;
          padding: 16px; border: 1px solid #a98763; cursor: pointer;
          transition: color .35s;
        }
        .h01ct-submit::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg,#a98763,#c4a274);
          transform: translateY(101%);
          transition: transform .55s cubic-bezier(.22,.68,0,1.1); z-index: 0;
        }
        .h01ct-submit:hover:not(:disabled)::before { transform: translateY(0); }
        .h01ct-submit > span { position: relative; z-index: 1; }
        .h01ct-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .h01ct-ok {
          text-align: center; padding: 32px 0; font-size: 17px;
          color: #d4b088; font-family: 'Playfair Display', Georgia, serif; font-style: italic;
        }
        .h01ct-err { font-size: 13px; color: #e8665d; margin-bottom: 12px; }

        @media (max-width: 900px) {
          .h01ct-grid { grid-template-columns: 1fr; gap: 44px; }
          .h01ct-form { padding: 28px 22px; }
          .h01ct-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="h01ct" id="kontakt" data-template="hotel-01-contact">
        {showHeader && (
          <div className="h01ct-header">
            <div className="h01ct-eyebrow">
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </div>
            <h2 className="h01ct-title">{renderTitle()}</h2>
            {subtitle && (
              <p className="h01ct-subtitle">
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
          </div>
        )}

        <div className="h01ct-grid">
          <div className="h01ct-info">
            {phone && (
              <div className="h01ct-info-block">
                <div className="h01ct-info-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.7 16.94Z"/></svg>
                </div>
                <div>
                  <p className="h01ct-info-label">Telefon</p>
                  <p className="h01ct-info-val">
                    <a href={`tel:${phone.replace(/\s/g,"")}`}>
                      <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                    </a>
                    {phone2 && <><br /><a href={`tel:${phone2.replace(/\s/g,"")}`}><GenericEditableText sectionId={sectionId} field="phone2" value={phone2} tag="span" /></a></>}
                  </p>
                </div>
              </div>
            )}
            {(email || emailReservation) && (
              <div className="h01ct-info-block">
                <div className="h01ct-info-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <div>
                  <p className="h01ct-info-label">E-mail</p>
                  <p className="h01ct-info-val">
                    {email && <a href={`mailto:${email}`}><GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" /></a>}
                    {emailReservation && <><br /><a href={`mailto:${emailReservation}`}><GenericEditableText sectionId={sectionId} field="emailReservation" value={emailReservation} tag="span" /></a></>}
                  </p>
                </div>
              </div>
            )}
            {(address || city) && (
              <div className="h01ct-info-block">
                <div className="h01ct-info-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <p className="h01ct-info-label">Adresa</p>
                  <p className="h01ct-info-val">
                    <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                    {city && <><br /><GenericEditableText sectionId={sectionId} field="city" value={city} tag="span" /></>}
                    {mapUrl && <><br /><a href={mapUrl} target="_blank" rel="noopener noreferrer" style={{color:"#d4b088",fontSize:"13px",letterSpacing:"0.04em"}}>Zobrazit na mapě →</a></>}
                  </p>
                </div>
              </div>
            )}
            {hours && (
              <div className="h01ct-info-block">
                <div className="h01ct-info-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <p className="h01ct-info-label">Recepce</p>
                  <p className="h01ct-info-val">
                    <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="h01ct-form">
            {status === "ok" ? (
              <p className="h01ct-ok">Děkujeme za zprávu — brzy se ozveme.</p>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="h01ct-form-title">Rezervace & dotazy</p>
                <p className="h01ct-form-sub">Vyplňte krátký formulář a my se vám ozveme do 24 hodin.</p>
                <div className="h01ct-row">
                  <div className="h01ct-field">
                    <label>Jméno</label>
                    <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Vaše jméno" required />
                  </div>
                  <div className="h01ct-field">
                    <label>E-mail</label>
                    <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="vas@email.cz" required />
                  </div>
                </div>
                <div className="h01ct-row">
                  <div className="h01ct-field">
                    <label>Příjezd</label>
                    <input type="date" value={form.checkin} onChange={e => set("checkin", e.target.value)} />
                  </div>
                  <div className="h01ct-field">
                    <label>Odjezd</label>
                    <input type="date" value={form.checkout} onChange={e => set("checkout", e.target.value)} />
                  </div>
                </div>
                <div className="h01ct-field">
                  <label>Počet hostů</label>
                  <input type="number" min="1" value={form.guests} onChange={e => set("guests", e.target.value)} placeholder="2" />
                </div>
                <div className="h01ct-field">
                  <label>Zpráva</label>
                  <textarea rows={4} value={form.message} onChange={e => set("message", e.target.value)} placeholder="Vaše požadavky nebo dotazy…" />
                </div>
                <label className="h01ct-gdpr">
                  <input type="checkbox" checked={form.gdpr} onChange={e => set("gdpr", e.target.checked)} required />
                  Souhlasím se zpracováním osobních údajů pro účely vyřízení mé rezervace.
                </label>
                {status === "err" && <p className="h01ct-err">Nepodařilo se odeslat. Zkuste to znovu.</p>}
                <button className="h01ct-submit" type="submit" disabled={status === "sending" || !form.gdpr}>
                  <span>{status === "sending" ? "Odesílám…" : "Odeslat dotaz"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// ── malir-02-contact ──────────────────────────────────────────────────────────
function ContactMalir02({ content, sectionId, isAdmin }: { content: Record<string, unknown>; sectionId: number; isAdmin: boolean }) {
  const ORANGE  = "#ff914d";
  const DARK    = "#1a1a1a";
  const POPPINS = "'Poppins', sans-serif";

  const heading    = typeof content.heading    === "string" ? content.heading    : "Napište nám";
  const subheading = typeof content.subheading === "string" ? content.subheading : "Rádi vám odpovíme na jakékoli dotazy a připravíme nezávaznou nabídku.";
  const email      = typeof content.email      === "string" ? content.email      : "email@demo.cz";
  const phone      = typeof content.phone      === "string" ? content.phone      : "704 123 456";
  const address    = typeof content.address    === "string" ? content.address    : "Ukázková 123, 110 00 Praha 1";
  const hours      = typeof content.hours      === "string" ? content.hours      : "Po–Pá 9:00–18:00, So 9:00–14:00";

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", gdpr: false });
  const [status, setStatus] = useState<"idle"|"sending"|"ok"|"err">("idle");
  const [touched, setTouched] = useState(false);
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const errors = {
    name:  !form.name.trim(),
    email: !form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    gdpr:  !form.gdpr,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (hasErrors || isAdmin) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sectionId, ...form }) });
      setStatus(res.ok ? "ok" : "err");
    } catch { setStatus("err"); }
  };

  return (
    <>
      <style>{`
        .m02ct-section {
          background: #ffffff;
          padding: 0;
          border-top: 4px solid ${ORANGE};
        }
        .m02ct-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 40px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: start;
          box-sizing: border-box;
        }
        /* ── left: heading + info cards ── */
        .m02ct-kicker {
          font-family: ${POPPINS}; font-weight: 700; font-size: 11px;
          letter-spacing: 0.18em; text-transform: uppercase; color: ${ORANGE};
          margin: 0 0 16px;
        }
        .m02ct-h2 {
          font-family: ${POPPINS}; font-weight: 800;
          font-size: clamp(28px, 3vw, 42px); color: ${DARK};
          line-height: 1.15; letter-spacing: -0.02em; margin: 0 0 16px;
        }
        .m02ct-sub {
          font-family: ${POPPINS}; font-size: 15px; color: #777;
          line-height: 1.7; margin: 0 0 44px;
        }
        .m02ct-cards {
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
        }
        .m02ct-card {
          background: #f7f7f7; padding: 20px 22px;
          border-bottom: 3px solid transparent;
          transition: border-color 0.2s;
        }
        .m02ct-card:hover { border-color: ${ORANGE}; }
        .m02ct-card-icon { color: ${ORANGE}; margin-bottom: 10px; }
        .m02ct-card-label {
          font-family: ${POPPINS}; font-size: 10px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase; color: #aaa;
          margin: 0 0 4px;
        }
        .m02ct-card-val {
          font-family: ${POPPINS}; font-size: 14px; font-weight: 600; color: ${DARK};
          margin: 0; line-height: 1.4;
        }
        .m02ct-card-val a { color: ${DARK}; text-decoration: none; }
        .m02ct-card-val a:hover { color: ${ORANGE}; }
        /* ── right: form ── */
        .m02ct-form-box {
          background: ${DARK}; padding: 44px 40px;
        }
        .m02ct-form-title {
          font-family: ${POPPINS}; font-weight: 700; font-size: 20px; color: #fff;
          margin: 0 0 8px;
        }
        .m02ct-form-sub {
          font-family: ${POPPINS}; font-size: 13px; color: rgba(255,255,255,0.4);
          margin: 0 0 28px;
        }
        .m02ct-form { display: flex; flex-direction: column; gap: 12px; }
        .m02ct-row  { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; }
        .m02ct-form input:not([type="checkbox"]),
        .m02ct-form textarea {
          width: 100%; box-sizing: border-box;
          font-family: ${POPPINS}; font-size: 14px; color: #fff;
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,255,255,0.14);
          padding: 14px 16px; outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .m02ct-form input:not([type="checkbox"])::placeholder,
        .m02ct-form textarea::placeholder { color: rgba(255,255,255,0.28); }
        .m02ct-form input:not([type="checkbox"]):focus,
        .m02ct-form textarea:focus {
          border-color: ${ORANGE};
          background: rgba(255,255,255,0.1);
        }
        .m02ct-form textarea { resize: vertical; min-height: 110px; }
        .m02ct-field { display: flex; flex-direction: column; gap: 4px; }
        .m02ct-field-err {
          font-family: ${POPPINS}; font-size: 11px; color: #ff7070;
          display: flex; align-items: center; gap: 4px;
        }
        .m02ct-input-err { border-color: #ff7070 !important; }
        .m02ct-gdpr-wrap {
          display: flex; align-items: flex-start; gap: 10px;
        }
        .m02ct-gdpr-wrap input[type="checkbox"] {
          width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px;
          accent-color: ${ORANGE}; cursor: pointer;
          background: transparent; border: none; padding: 0;
        }
        .m02ct-gdpr-text {
          font-family: ${POPPINS}; font-size: 12px;
          color: rgba(255,255,255,0.4); line-height: 1.55; cursor: pointer;
        }
        .m02ct-gdpr-err { color: #ff7070 !important; }
        .m02ct-submit {
          background: ${ORANGE}; color: #fff; border: none; cursor: pointer;
          font-family: ${POPPINS}; font-weight: 700; font-size: 13px;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 16px 32px; width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: background 0.2s;
        }
        .m02ct-submit:hover { background: #e07a30; }
        .m02ct-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .m02ct-ok {
          font-family: ${POPPINS}; font-size: 16px; color: #7ee37e;
          font-weight: 600; text-align: center; padding: 32px 0;
        }
        .m02ct-send-err {
          font-family: ${POPPINS}; font-size: 13px; color: #ff7070; margin-top: 4px; text-align: center;
        }
        @media (max-width: 860px) {
          .m02ct-inner { grid-template-columns: 1fr; gap: 48px; padding: 56px 24px; }
          .m02ct-form-box { padding: 32px 24px; }
        }
        @media (max-width: 500px) {
          .m02ct-cards { grid-template-columns: 1fr; }
          .m02ct-row   { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="m02ct-section" id="kontakty" data-template="malir-02">
        <div className="m02ct-inner">

          {/* ── left ── */}
          <div>
            <p className="m02ct-kicker">Kontakt</p>
            <h2 className="m02ct-h2">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span">{heading}</GenericEditableText>
            </h2>
            <p className="m02ct-sub">
              <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span">{subheading}</GenericEditableText>
            </p>
            <div className="m02ct-cards">
              <div className="m02ct-card">
                <div className="m02ct-card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 13.6 19.79 19.79 0 0 1 1 4.82 2 2 0 0 1 2.98 2.6h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"/></svg>
                </div>
                <p className="m02ct-card-label">Telefon</p>
                <p className="m02ct-card-val"><a href={`tel:${phone.replace(/\s/g,"")}`}><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span">{phone}</GenericEditableText></a></p>
              </div>
              <div className="m02ct-card">
                <div className="m02ct-card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <p className="m02ct-card-label">E-mail</p>
                <p className="m02ct-card-val"><a href={`mailto:${email}`}><GenericEditableText sectionId={sectionId} field="email" value={email} tag="span">{email}</GenericEditableText></a></p>
              </div>
              <div className="m02ct-card">
                <div className="m02ct-card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <p className="m02ct-card-label">Adresa</p>
                <p className="m02ct-card-val"><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span">{address}</GenericEditableText></p>
              </div>
              <div className="m02ct-card">
                <div className="m02ct-card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <p className="m02ct-card-label">Pracovní doba</p>
                <p className="m02ct-card-val"><GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span">{hours}</GenericEditableText></p>
              </div>
            </div>
          </div>

          {/* ── right: form ── */}
          <div className="m02ct-form-box">
            <h3 className="m02ct-form-title">Poptávkový formulář</h3>
            <p className="m02ct-form-sub">Vyplňte formulář a ozveme se vám do 24 hodin.</p>
            {status === "ok" ? (
              <p className="m02ct-ok">✓ Zpráva odeslána! Ozveme se co nejdříve.</p>
            ) : (
              <form className="m02ct-form" onSubmit={submit} noValidate>
                <div className="m02ct-row">
                  <div className="m02ct-field">
                    <input
                      type="text"
                      placeholder="Jméno a příjmení"
                      value={form.name}
                      onChange={e => set("name", e.target.value)}
                      className={touched && errors.name ? "m02ct-input-err" : ""}
                    />
                    {touched && errors.name && <span className="m02ct-field-err">✱ Povinné pole</span>}
                  </div>
                  <input type="tel" placeholder="Telefon (nepovinné)" value={form.phone} onChange={e => set("phone", e.target.value)} />
                </div>
                <div className="m02ct-field">
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={form.email}
                    onChange={e => set("email", e.target.value)}
                    className={touched && errors.email ? "m02ct-input-err" : ""}
                  />
                  {touched && errors.email && <span className="m02ct-field-err">✱ Zadejte platný e-mail</span>}
                </div>
                <textarea placeholder="Typ práce, plocha, termín a další požadavky…" value={form.message} onChange={e => set("message", e.target.value)} />
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <input
                    type="checkbox"
                    id="m02ct-gdpr-cb"
                    checked={form.gdpr}
                    onChange={e => set("gdpr", e.target.checked)}
                    style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2, accentColor: ORANGE, cursor: "pointer" }}
                  />
                  <label
                    htmlFor="m02ct-gdpr-cb"
                    style={{
                      fontFamily: POPPINS, fontSize: 12, lineHeight: "1.55",
                      color: touched && errors.gdpr ? "#ff7070" : "rgba(255,255,255,0.4)",
                      cursor: "pointer",
                    }}
                  >
                    {touched && errors.gdpr && <span style={{ color: "#ff7070", marginRight: 4 }}>✱</span>}
                    Souhlasím se zpracováním osobních údajů pro účely vyřízení mé poptávky.
                  </label>
                </div>
                {status === "err" && <p className="m02ct-send-err">Nepodařilo se odeslat. Zkuste prosím znovu.</p>}
                <button type="submit" className="m02ct-submit" disabled={status === "sending"}>
                  {status === "sending" ? "Odesílám…" : <>Odeslat poptávku <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>
    </>
  );
}

// ── dj-01-contact ────────────────────────────────────────────────────────────
// LUXE REDESIGN (Neon Nocturne — vasdj.cz Awwwards edition):
// - Preserved: light bg + border-top + centered inline phone + email
// - Enhanced: warm off-white #f7f5f0, JBM eyebrow '05 / BOOKING', JBM micro-labels TEL/MAIL,
//   Space Grotesk numbers, gradient underline slide-in hover, orange dot separator between
// ──────────────────────────────────────────────────────────────────────────────
function ContactDj01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const ORANGE = "#f15a24";
  const AMBER  = "#ff8347";

  const eyebrow = String(content.eyebrow ?? "05 / BOOKING");
  const phone   = String(content.phone   ?? "+420 704 123 456");
  const email   = String(content.email   ?? "info@nokturn.cz");

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" />
      <style>{`
        @keyframes dj01c-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .dj01contact {
          position: relative;
          background: #f7f5f0;
          padding: 4.5rem 1.5rem 5rem;
          text-align: center;
          overflow: hidden;
        }
        .dj01contact::before, .dj01contact::after {
          content: "";
          position: absolute;
          left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(10,10,12,0.14) 50%, transparent 100%);
        }
        .dj01contact::before { top: 0; }
        .dj01contact::after  { bottom: 0; }
        .dj01contact-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.7rem;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-weight: 500;
          font-size: 0.75rem;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: rgba(10,10,12,0.55);
          margin: 0 0 2.5rem;
          animation: dj01c-in 700ms cubic-bezier(.2,.7,.2,1) 60ms both;
        }
        .dj01contact-eyebrow::before {
          content: "";
          display: inline-block;
          width: 8px; height: 8px;
          background: ${ORANGE};
          box-shadow: 0 0 12px rgba(241,90,36,0.5);
        }
        .dj01contact-inner {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 1.75rem 3.5rem;
        }
        .dj01contact-block {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          animation: dj01c-in 800ms cubic-bezier(.2,.7,.2,1) both;
        }
        .dj01contact-block:nth-child(1) { animation-delay: 180ms; }
        .dj01contact-block:nth-child(3) { animation-delay: 280ms; }
        .dj01contact-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.66rem;
          font-weight: 500;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: rgba(10,10,12,0.5);
        }
        .dj01contact a {
          position: relative;
          font-family: 'Space Grotesk', -apple-system, sans-serif;
          color: #0a0a0c;
          font-size: clamp(1.1rem, 1.9vw, 1.5rem);
          font-weight: 600;
          letter-spacing: 0.02em;
          text-decoration: none;
          padding: 0.25rem 0.15rem 0.5rem;
          transition: color 260ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01contact a::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 2px;
          width: 0;
          background: linear-gradient(90deg, ${ORANGE} 0%, ${AMBER} 100%);
          transition: width 320ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01contact a:hover { color: ${ORANGE}; }
        .dj01contact a:hover::after { width: 100%; }
        .dj01contact-dot {
          display: inline-block;
          width: 6px; height: 6px;
          background: ${ORANGE};
          box-shadow: 0 0 10px rgba(241,90,36,0.5);
          animation: dj01c-in 700ms cubic-bezier(.2,.7,.2,1) 260ms both;
        }
        @media (max-width: 640px) {
          .dj01contact { padding: 3.5rem 1.15rem 3.75rem; }
          .dj01contact-eyebrow { margin-bottom: 1.75rem; font-size: 0.68rem; letter-spacing: 0.28em; }
          .dj01contact-inner { flex-direction: column; gap: 1.5rem; }
          .dj01contact-dot { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .dj01contact-eyebrow, .dj01contact-block, .dj01contact-dot { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      <section className="dj01contact" id="kontakt" data-template="dj-01-contact">
        <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" className="dj01contact-eyebrow">
          {eyebrow}
        </GenericEditableText>
        <div className="dj01contact-inner">
          <span className="dj01contact-block">
            <span className="dj01contact-label">Tel</span>
            <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span">
              <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
            </GenericEditableText>
          </span>
          <span className="dj01contact-dot" aria-hidden />
          <span className="dj01contact-block">
            <span className="dj01contact-label">Mail</span>
            <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span">
              <a href={`mailto:${email}`}>{email}</a>
            </GenericEditableText>
          </span>
        </div>
      </section>
    </>
  );
}

// ── restaurant-04-contact ─────────────────────────────────────────────────────
// 2 lokace (Praha 5 + Praha 9), kontaktní formulář, tmavé pozadí #0d1f0a.
// ─────────────────────────────────────────────────────────────────────────────
function ContactRestaurant04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const tagline   = String(content.tagline   ?? "");
  const title     = String(content.title     ?? "");
  const body      = String(content.body      ?? "");
  const formTitle = String((content as any).formTitle ?? "Zanechte zprávu");
  const formSub   = String((content as any).formSubtitle ?? "Vyplňte formulář a my se vám ozveme.");
  const locations = ((content as any).locations as Array<{ name: string; address: string; city: string; phone?: string; email?: string; hours?: string }>) ?? [];
  const showHeader = !!(tagline.trim() || title.trim());

  const DARK  = "#0d1f0a";
  const SURF  = "#152d11";
  const RED   = "#c41c1c";
  const CREAM = "#f5f0e8";
  const MUTED = "#8fa889";
  const BORDER = "#1e3a1a";
  const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";
  const SANS  = "'Nunito Sans', 'Helvetica Neue', Arial, sans-serif";

  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const IconPin = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <path d="M8 1.5C5.79 1.5 4 3.29 4 5.5c0 3.25 4 8 4 8s4-4.75 4-8c0-2.21-1.79-4-4-4z" stroke={RED} strokeWidth="1.4" fill="none"/>
      <circle cx="8" cy="5.5" r="1.5" stroke={RED} strokeWidth="1.2"/>
    </svg>
  );
  const IconPhone = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <path d="M3 2h3l1 3-1.5 1.5a8 8 0 003 3L10 8l3 1v3a1 1 0 01-1 1C5.5 13 3 7.5 2 3a1 1 0 011-1z" stroke={RED} strokeWidth="1.3" fill="none" strokeLinejoin="round"/>
    </svg>
  );
  const IconMail = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <rect x="1.5" y="3.5" width="13" height="9" rx="1" stroke={RED} strokeWidth="1.3"/>
      <path d="M1.5 4.5l6.5 5 6.5-5" stroke={RED} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
  const IconClock = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <circle cx="8" cy="8" r="6" stroke={RED} strokeWidth="1.3"/>
      <path d="M8 5v3l2 2" stroke={RED} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );

  return (
    <section
      id="kontakt"
      data-template="restaurant-04"
      style={{ background: DARK, padding: "clamp(80px, 12vw, 140px) clamp(24px, 6vw, 80px)" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header — conditional */}
        {showHeader && (
          <div style={{ marginBottom: 60 }}>
            {tagline && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 16px" }}>
                <span style={{ width: 28, height: 1, background: RED }} />
                <p style={{
                  fontFamily: SANS, fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.22em", textTransform: "uppercase",
                  color: RED, margin: 0,
                }}>
                  <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
                </p>
              </div>
            )}
            {title && (
              <h2 style={{
                fontFamily: SERIF, fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 400,
                fontStyle: "italic", color: CREAM, margin: "0 0 20px", lineHeight: 1.1,
                whiteSpace: "pre-line",
              }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {body && (
              <p style={{ fontFamily: SANS, fontSize: 16, color: MUTED, lineHeight: 1.7, margin: 0, maxWidth: 560 }}>
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}
          </div>
        )}

        {/* 2-col: lokace + formulář */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px, 6vw, 80px)",
        }} className="r04-contact-grid">
          {/* Lokace */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {locations.map((loc, i) => (
              <div key={i} className="r04-loc-card" style={{
                background: SURF, border: `1px solid ${BORDER}`,
                borderRadius: 3, padding: "32px 28px",
                position: "relative", overflow: "hidden",
              }}>
                {/* Red top accent */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${RED}, ${RED}66)` }} />
                <h3 style={{
                  fontFamily: SERIF, fontSize: "clamp(17px, 2vw, 22px)", fontWeight: 400,
                  fontStyle: "italic", color: CREAM, margin: "0 0 20px",
                }}>
                  <GenericEditableText sectionId={sectionId} field={`locations.${i}.name`} value={loc.name} tag="span" />
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <IconPin />
                    <span style={{ fontFamily: SANS, fontSize: 14, color: MUTED, lineHeight: 1.5 }}>
                      <GenericEditableText sectionId={sectionId} field={`locations.${i}.address`} value={loc.address} tag="span" />
                      {", "}
                      <GenericEditableText sectionId={sectionId} field={`locations.${i}.city`} value={loc.city} tag="span" />
                    </span>
                  </div>
                  {loc.phone && (
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <IconPhone />
                      <a href={`tel:${loc.phone.replace(/\s/g, "")}`} className="r04-contact-link" style={{ fontFamily: SANS, fontSize: 14, color: MUTED, textDecoration: "none" }}>
                        <GenericEditableText sectionId={sectionId} field={`locations.${i}.phone`} value={loc.phone} tag="span" />
                      </a>
                    </div>
                  )}
                  {loc.email && (
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <IconMail />
                      <a href={`mailto:${loc.email}`} className="r04-contact-link" style={{ fontFamily: SANS, fontSize: 14, color: MUTED, textDecoration: "none" }}>
                        <GenericEditableText sectionId={sectionId} field={`locations.${i}.email`} value={loc.email} tag="span" />
                      </a>
                    </div>
                  )}
                  {loc.hours && (
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <IconClock />
                      <span style={{ fontFamily: SANS, fontSize: 14, color: MUTED, lineHeight: 1.5 }}>
                        <GenericEditableText sectionId={sectionId} field={`locations.${i}.hours`} value={loc.hours} tag="span" />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Formulář */}
          <div style={{
            background: SURF, border: `1px solid ${BORDER}`, borderRadius: 3,
            padding: "40px 36px", position: "relative", overflow: "hidden",
          }}>
            {/* Subtle red glow top-right */}
            <div style={{
              position: "absolute", top: -40, right: -40, width: 120, height: 120,
              background: `radial-gradient(circle, ${RED}18 0%, transparent 70%)`,
              borderRadius: "50%",
            }} />
            <h3 style={{
              fontFamily: SERIF, fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 400,
              fontStyle: "italic", color: CREAM, margin: "0 0 8px", position: "relative",
            }}>
              <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" />
            </h3>
            <p style={{ fontFamily: SANS, fontSize: 14, color: MUTED, margin: "0 0 32px", position: "relative" }}>
              <GenericEditableText sectionId={sectionId} field="formSubtitle" value={formSub} tag="span" />
            </p>

            {sent ? (
              <div style={{
                padding: "36px 24px", background: DARK, borderRadius: 3,
                textAlign: "center", border: `1px solid ${RED}44`,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: `${RED}22`, border: `1.5px solid ${RED}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px", color: RED, fontSize: 22,
                }}>✓</div>
                <p style={{ fontFamily: SANS, fontSize: 15, color: CREAM, margin: 0, lineHeight: 1.6 }}>
                  Zpráva odeslána. Ozveme se vám co nejdříve.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="r04-form-row">
                  <input type="text" placeholder="Vaše jméno" required className="r04-input" />
                  <input type="email" placeholder="E-mail" required className="r04-input" />
                </div>
                <input type="tel" placeholder="Telefon (nepovinné)" className="r04-input" />
                <textarea placeholder="Vaše zpráva nebo dotaz k rezervaci..." required rows={5} className="r04-input" style={{ resize: "vertical" }} />
                <button type="submit" className="r04-cta1" style={{
                  fontFamily: SANS, fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: CREAM, background: RED, border: "none",
                  borderRadius: 2, padding: "16px 36px",
                  cursor: "pointer", alignSelf: "flex-start",
                }}>
                  Odeslat zprávu
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── barber-dark contact ───────────────────────────────────────────────────────
// Dark #0a0a0a bg, 2-col: vlevo info + ikony, vpravo formulář
// Paleta: GOLD #C9A84C, text #F5F5F5, muted #A0A0A0
// ─────────────────────────────────────────────────────────────────────────────
function ContactBarberDark({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const [status, setStatus] = React.useState<"idle" | "sending" | "success" | "error">("idle");

  const title       = String(content.title       ?? "Přijďte nebo napište");
  const subtitle    = String(content.subtitle    ?? "Rádi vás uvítáme. Napište nám, zavolejte nebo nás navštivte osobně.");
  const address     = String(content.address     ?? "Náměstí Svobody 5, Brno");
  const phone       = String(content.phone       ?? "+420 602 456 789");
  const email       = String(content.email       ?? "info@bladeandco.cz");
  const labelName   = String(content.labelName   ?? "Jméno");
  const labelEmail  = String(content.labelEmail  ?? "E-mail");
  const labelMsg    = String(content.labelMsg    ?? "Zpráva");
  const labelBtn    = String(content.labelBtn    ?? "Odeslat zprávu");

  const GOLD   = "#C9A84C";
  const BG     = "#0a0a0a";
  const CARD   = "#111111";
  const BORDER = "rgba(201,168,76,0.18)";
  const TEXT   = "#F5F5F5";
  const MUTED  = "#A0A0A0";
  const SANS   = "var(--font-body, Inter, sans-serif)";
  const SERIF  = "var(--font-heading, Playfair Display, serif)";

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${BORDER}`,
    borderRadius: 4, padding: "13px 16px",
    color: TEXT, fontFamily: SANS, fontSize: "0.9rem",
    outline: "none", transition: "border-color 0.2s",
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    await new Promise(r => setTimeout(r, 800));
    setStatus("success");
  }

  const PinIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
  const PhoneIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
  const MailIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  );

  return (
    <section style={{ backgroundColor: BG, padding: "clamp(56px, 10vw, 100px) 24px" }} data-template="barber-01">
      <style>{`
        .bc-contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
        .bc-contact-item { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
        .bc-contact-icon { width: 44px; height: 44px; border-radius: 50%; border: 1px solid rgba(201,168,76,0.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .bc-input:focus { border-color: #C9A84C !important; }
        .bc-contact-form { padding: 48px 40px; }
        @media (max-width: 768px) { .bc-contact-grid { grid-template-columns: 1fr; gap: 40px; } }
        @media (max-width: 480px) { .bc-contact-form { padding: 28px 20px !important; } .bc-contact-item { gap: 12px; margin-bottom: 20px; } }
      `}</style>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Section kicker */}
        <div style={{ textAlign: "center", marginBottom: "clamp(40px, 6vw, 64px)" }}>
          <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, margin: "0 0 18px" }}>Kontakt</p>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 700, color: TEXT, margin: "0 0 16px", lineHeight: 1.15 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p style={{ fontFamily: SANS, fontSize: "0.95rem", color: MUTED, maxWidth: 520, margin: "0 auto" }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>

        <div className="bc-contact-grid">
          {/* Left — info */}
          <div>
            {/* Divider */}
            <div style={{ width: 40, height: 2, backgroundColor: GOLD, marginBottom: 40 }} />

            <div className="bc-contact-item">
              <div className="bc-contact-icon"><PinIcon /></div>
              <div>
                <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD, margin: "0 0 4px" }}>Adresa</p>
                <p style={{ fontFamily: SANS, fontSize: "0.95rem", color: TEXT, margin: 0, lineHeight: 1.5 }}>
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                </p>
              </div>
            </div>

            <div className="bc-contact-item">
              <div className="bc-contact-icon"><PhoneIcon /></div>
              <div>
                <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD, margin: "0 0 4px" }}>Telefon</p>
                <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ fontFamily: SANS, fontSize: "0.95rem", color: TEXT, textDecoration: "none" }}>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              </div>
            </div>

            <div className="bc-contact-item">
              <div className="bc-contact-icon"><MailIcon /></div>
              <div>
                <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD, margin: "0 0 4px" }}>E-mail</p>
                <a href={`mailto:${email}`} style={{ fontFamily: SANS, fontSize: "0.95rem", color: TEXT, textDecoration: "none" }}>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              </div>
            </div>

            {/* Decorative gold line */}
            <div style={{ marginTop: 48, padding: "28px 32px", border: `1px solid ${BORDER}`, borderLeft: `3px solid ${GOLD}`, borderRadius: 4 }}>
              <p style={{ fontFamily: SERIF, fontSize: "1.05rem", fontStyle: "italic", color: MUTED, margin: 0, lineHeight: 1.7 }}>
                "Každý zákazník si zaslouží ten nejlepší zážitek — od prvního kroku až po poslední detail."
              </p>
            </div>

            {/* Otevírací doba — embedded under quote */}
            {(() => {
              const openingHours = (content.openingHours as Array<{ day: string; hours: string }>) ?? [];
              if (!openingHours.length) return null;
              return (
                <div className="bc-contact-hours" style={{ marginTop: 36 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                    <span aria-hidden style={{ width: 32, height: 1, background: GOLD }} />
                    <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, margin: 0 }}>
                      Otevírací doba
                    </p>
                  </div>
                  {openingHours.map((h, i) => {
                    const isClosed = h.hours.toLowerCase().includes("zavřeno") || h.hours.toLowerCase().includes("closed");
                    return (
                      <div key={i} className="bc-hours-row" style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, position: "relative", gap: 12,
                      }}>
                        <span style={{ fontFamily: SANS, fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: isClosed ? "#555" : MUTED }}>
                          <GenericEditableText sectionId={sectionId} field={`openingHours.${i}.day`} value={h.day} tag="span" />
                        </span>
                        <span style={{ fontFamily: SANS, fontSize: "0.88rem", fontWeight: isClosed ? 400 : 600, color: isClosed ? "#444" : GOLD, letterSpacing: isClosed ? 0 : "0.04em", whiteSpace: "nowrap" }}>
                          <GenericEditableText sectionId={sectionId} field={`openingHours.${i}.hours`} value={h.hours} tag="span" />
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Right — form */}
          <div className="bc-contact-form" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
            {status === "success" ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", border: `2px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3 style={{ fontFamily: SERIF, fontSize: "1.4rem", color: TEXT, marginBottom: 12 }}>Zpráva odeslána</h3>
                <p style={{ fontFamily: SANS, fontSize: "0.9rem", color: MUTED }}>Ozveme se vám co nejdříve.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>
                    <GenericEditableText sectionId={sectionId} field="labelName" value={labelName} tag="span" />
                  </label>
                  <input type="text" placeholder="Vaše jméno" required className="bc-input" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>
                    <GenericEditableText sectionId={sectionId} field="labelEmail" value={labelEmail} tag="span" />
                  </label>
                  <input type="email" placeholder="vas@email.cz" required className="bc-input" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>
                    <GenericEditableText sectionId={sectionId} field="labelMsg" value={labelMsg} tag="span" />
                  </label>
                  <textarea placeholder="Vaše zpráva nebo dotaz k rezervaci..." required rows={5} className="bc-input" style={{ ...inputStyle, resize: "vertical" }} />
                </div>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  style={{
                    fontFamily: SANS, fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.18em", textTransform: "uppercase",
                    color: "#0a0a0a", background: GOLD, border: "none",
                    borderRadius: 4, padding: "16px 32px",
                    cursor: status === "sending" ? "not-allowed" : "pointer",
                    opacity: status === "sending" ? 0.7 : 1,
                    transition: "opacity 0.2s, background-color 0.2s",
                    alignSelf: "flex-start",
                  }}
                >
                  {status === "sending" ? "Odesílám…" : <GenericEditableText sectionId={sectionId} field="labelBtn" value={labelBtn} tag="span" />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── barber-04-contact ─────────────────────────────────────────────────────────
// Dark #0a0806, gold #d5b981, Bebas Neue H2, Lato body
// 2-col: left info (adresa/tel/email/hodiny + citát), right form v tmavé kartě
// ─────────────────────────────────────────────────────────────────────────────
function ContactBarber04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const [status, setStatus] = React.useState<"idle" | "sending" | "success" | "error">("idle");
  const headRef = React.useRef<HTMLDivElement>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const els = [headRef.current, gridRef.current].filter(Boolean) as HTMLElement[];
    const observers = els.map((el, i) => {
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          el.style.animationDelay = `${i * 0.14}s`;
          el.classList.add("b04c-vis");
          obs.disconnect();
        }
      }, { threshold: 0.12 });
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const title    = String(content.title    ?? "Rezervujte si termín");
  const subtitle = String(content.subtitle ?? "Navštivte nás osobně, zavolejte nebo napište — rádi vás uvítáme.");
  const address  = String(content.address  ?? "Náměstí Svobody 5, Brno");
  const phone    = String(content.phone    ?? "+420 602 456 789");
  const email    = String(content.email    ?? "info@boucekbarber.cz");
  const hoursRaw = content.hours;
  const hours = Array.isArray(hoursRaw)
    ? (hoursRaw as Array<{ day?: string; value?: string }>).map(h => `${h.day ?? ""} ${h.value ?? ""}`.trim()).join(" · ")
    : String(hoursRaw ?? "Po–Pá 9:00–19:00 · So 8:00–14:00");
  const labelName  = String(content.labelName  ?? "Jméno");
  const labelEmail = String(content.labelEmail ?? "E-mail");
  const labelMsg   = String(content.labelMsg   ?? "Zpráva");
  const labelBtn   = String(content.labelBtn   ?? "Odeslat zprávu");

  const BG      = "#0a0806";
  const CARD    = "#14110d";
  const GOLD    = "#d5b981";
  const GOLDDIM = "rgba(213,185,129,0.18)";
  const TEXT    = "#f5f0e8";
  const MUTED   = "#8a7f72";
  const TITLE   = "'Bebas Neue','Oswald',Impact,sans-serif";
  const BODY    = "'Lato','Inter',sans-serif";

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${GOLDDIM}`,
    borderRadius: 2, padding: "13px 16px",
    color: TEXT, fontFamily: BODY, fontSize: "0.9rem",
    outline: "none", transition: "border-color 0.2s",
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    await new Promise(r => setTimeout(r, 800));
    setStatus("success");
  }

  const PinIcon   = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);
  const PhoneIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>);
  const MailIcon  = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>);
  const ClockIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);

  const infoRows = [
    { icon: <PinIcon />,   label: "Adresa",  field: "address", value: address },
    { icon: <PhoneIcon />, label: "Telefon", field: "phone",   value: phone,  href: `tel:${phone.replace(/\s/g, "")}` },
    { icon: <MailIcon />,  label: "E-mail",  field: "email",   value: email,  href: `mailto:${email}` },
    { icon: <ClockIcon />, label: "Hodiny",  field: "hours",   value: hours },
  ] as { icon: React.ReactNode; label: string; field: string; value: string; href?: string }[];

  return (
    <section style={{ background: BG, padding: "clamp(72px,10vw,108px) 24px" }} data-template="barber-04">
      <style>{`
        @keyframes b04FadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        .b04c-reveal { opacity: 0; }
        .b04c-reveal.b04c-vis { animation: b04FadeUp 0.72s cubic-bezier(.22,.68,0,1.2) forwards; }
        .b04c-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
        .b04c-row  { display: flex; align-items: flex-start; gap: 20px; padding: 20px 0; border-bottom: 1px solid rgba(213,185,129,0.10); }
        .b04c-row:last-child { border-bottom: none; }
        .b04c-ico  { width: 38px; height: 38px; border-radius: 50%; border: 1px solid rgba(213,185,129,0.28); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
        .b04c-input:focus { border-color: #d5b981 !important; }
        @media (max-width: 820px) { .b04c-grid { grid-template-columns: 1fr; gap: 52px; } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {(content.showHeader !== false) && (
        <div ref={headRef} className="b04c-reveal" style={{ textAlign: "center", marginBottom: "clamp(48px,8vw,80px)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ height: 1, width: 40, background: GOLD }} />
            <span style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: GOLD }}>Kontakt</span>
            <div style={{ height: 1, width: 40, background: GOLD }} />
          </div>
          <h2 style={{ fontFamily: TITLE, fontSize: "clamp(48px,6vw,80px)", color: TEXT, letterSpacing: "0.08em", lineHeight: 1, margin: "0 0 18px", textTransform: "uppercase" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p style={{ fontFamily: BODY, fontSize: "0.95rem", color: MUTED, maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>
        )}

        <div ref={gridRef} className="b04c-grid b04c-reveal">
          <div>
            {infoRows.map(({ icon, label, field, value, href }) => (
              <div key={field} className="b04c-row">
                <div className="b04c-ico">{icon}</div>
                <div>
                  <p style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, margin: "0 0 5px" }}>{label}</p>
                  {href ? (
                    <a href={href} style={{ fontFamily: BODY, fontSize: "0.95rem", color: TEXT, textDecoration: "none", lineHeight: 1.6 }}>
                      <GenericEditableText sectionId={sectionId} field={field} value={value} tag="span" />
                    </a>
                  ) : (
                    <p style={{ fontFamily: BODY, fontSize: "0.95rem", color: TEXT, margin: 0, lineHeight: 1.6 }}>
                      <GenericEditableText sectionId={sectionId} field={field} value={value} tag="span" />
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div style={{ marginTop: 36, padding: "24px 28px", borderLeft: `2px solid ${GOLD}`, background: "rgba(213,185,129,0.04)" }}>
              <p style={{ fontFamily: BODY, fontSize: "0.9rem", fontStyle: "italic", color: MUTED, margin: 0, lineHeight: 1.8 }}>
                "Každý zákazník si zaslouží ten nejlepší zážitek — od prvního kroku až po poslední detail."
              </p>
            </div>
          </div>

          <div style={{ background: CARD, border: `1px solid ${GOLDDIM}`, padding: "clamp(28px,5vw,48px) clamp(24px,4vw,44px)" }}>
            {status === "success" ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", border: `1px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 style={{ fontFamily: TITLE, fontSize: "2rem", letterSpacing: "0.1em", color: TEXT, margin: "0 0 12px", textTransform: "uppercase" }}>Zpráva odeslána</h3>
                <p style={{ fontFamily: BODY, fontSize: "0.9rem", color: MUTED }}>Ozveme se vám co nejdříve.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                <div>
                  <label style={{ display: "block", fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>
                    <GenericEditableText sectionId={sectionId} field="labelName" value={labelName} tag="span" />
                  </label>
                  <input type="text" placeholder="Vaše jméno" required className="b04c-input" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>
                    <GenericEditableText sectionId={sectionId} field="labelEmail" value={labelEmail} tag="span" />
                  </label>
                  <input type="email" placeholder="vas@email.cz" required className="b04c-input" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>
                    <GenericEditableText sectionId={sectionId} field="labelMsg" value={labelMsg} tag="span" />
                  </label>
                  <textarea placeholder="Vaše zpráva nebo dotaz k rezervaci..." required rows={5} className="b04c-input" style={{ ...inputStyle, resize: "vertical" }} />
                </div>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  style={{
                    fontFamily: TITLE, fontSize: "1rem", letterSpacing: "0.18em", textTransform: "uppercase",
                    color: BG, background: GOLD, border: "none",
                    padding: "16px 40px", cursor: status === "sending" ? "not-allowed" : "pointer",
                    opacity: status === "sending" ? 0.7 : 1,
                    transition: "opacity 0.2s", alignSelf: "flex-start",
                  }}
                >
                  {status === "sending" ? "Odesílám…" : <GenericEditableText sectionId={sectionId} field="labelBtn" value={labelBtn} tag="span" />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


// ── arch-01-contact ───────────────────────────────────────────────────────────
// Minimal: white bg, black text, 2-col — left = heading + offices + phone/email,
// right = simple contact form. Helvetica Neue, no decoration.
// ─────────────────────────────────────────────────────────────────────────────
function ContactArch01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const headingRaw = content.heading;
  const heading    = headingRaw === undefined ? "Kontakt" : String(headingRaw);
  const showHeading = heading.trim().length > 0;
  const subheading = String(content.subheading ?? "");
  const email      = String(content.email      ?? "");
  const phone      = String(content.phone      ?? "");
  const phoneSecondary = String(content.phoneSecondary ?? "");
  const offices    = (content.offices as Array<{ name?: string; address?: string; city?: string }>) ?? [];
  const formFields = (content.formFields ?? {}) as { namePlaceholder?: string; emailPlaceholder?: string; messagePlaceholder?: string; submitText?: string };
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    await new Promise(r => setTimeout(r, 900));
    setStatus("done");
  }

  return (
    <>
      <style>{`
        .ar01cnt { padding: clamp(72px,10vw,120px) 40px; background: #fff; }
        .ar01cnt-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
        .ar01cnt-heading { font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; font-size: clamp(28px,3.5vw,44px); font-weight: 300; color: #000; letter-spacing: -0.5px; margin: 0 0 16px; }
        .ar01cnt-sub { font-size: 15px; line-height: 1.65; color: #6A737B; margin: 0 0 40px; }
        .ar01cnt-offices { display: flex; flex-direction: column; gap: 28px; margin-bottom: 36px; }
        .ar01cnt-office-name { font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #000; font-weight: 600; margin-bottom: 4px; }
        .ar01cnt-office-addr { font-size: 14px; color: #6A737B; line-height: 1.5; }
        .ar01cnt-detail { font-size: 14px; color: #2b2b2b; margin-bottom: 6px; }
        .ar01cnt-detail a { color: #000; text-decoration: none; border-bottom: 1px solid #e0e0e0; }
        .ar01cnt-detail a:hover { border-color: #000; }
        .ar01cnt-form { display: flex; flex-direction: column; gap: 16px; }
        .ar01cnt-input { width: 100%; border: 1px solid #e0e0e0; padding: 14px 16px; font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; font-size: 14px; color: #2b2b2b; outline: none; background: #fff; transition: border-color .2s; box-sizing: border-box; }
        .ar01cnt-input:focus { border-color: #000; }
        .ar01cnt-input::placeholder { color: #b0b0b0; }
        .ar01cnt-textarea { resize: vertical; min-height: 140px; }
        .ar01cnt-btn { display: inline-flex; align-items: center; gap: 12px; background: #000; color: #fff; border: none; padding: 15px 34px; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; cursor: pointer; font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; transition: background .3s, letter-spacing .5s cubic-bezier(0.16,1,0.3,1); align-self: flex-start; }
        .ar01cnt-btn:hover { background: #333; letter-spacing: 4px; }
        .ar01cnt-btn-arrow { display: inline-block; transform: translateX(-3px); transition: transform .45s cubic-bezier(0.16,1,0.3,1); }
        .ar01cnt-btn:hover .ar01cnt-btn-arrow { transform: translateX(3px); }
        .ar01cnt-detail a { position: relative; }
        .ar01cnt-success { font-size: 14px; color: #4caf50; padding: 12px 0; }
        @media (max-width: 768px) { .ar01cnt { padding: 56px 24px; } .ar01cnt-inner { grid-template-columns: 1fr; gap: 48px; } }
      `}</style>
      <section className="ar01cnt" data-template="arch-01-contact">
        <div className="ar01cnt-inner">
          <div>
            {showHeading && (
              <h2 className="ar01cnt-heading">
                <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
              </h2>
            )}
            {subheading && (
              <p className="ar01cnt-sub">
                <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
              </p>
            )}
            {offices.length > 0 && (
              <div className="ar01cnt-offices">
                {offices.map((o, i) => (
                  <div key={i}>
                    {o.name && <div className="ar01cnt-office-name"><GenericEditableText sectionId={sectionId} field={`offices.${i}.name`} value={o.name} tag="span" /></div>}
                    <div className="ar01cnt-office-addr">
                      {o.address && <><GenericEditableText sectionId={sectionId} field={`offices.${i}.address`} value={o.address} tag="span" /><br /></>}
                      {o.city && <GenericEditableText sectionId={sectionId} field={`offices.${i}.city`} value={o.city} tag="span" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {phone && (
              <div className="ar01cnt-detail">
                <a href={`tel:${phone.replace(/\s/g, "")}`}><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" /></a>
              </div>
            )}
            {phoneSecondary && (
              <div className="ar01cnt-detail">
                <a href={`tel:${phoneSecondary.replace(/\s/g, "")}`}><GenericEditableText sectionId={sectionId} field="phoneSecondary" value={phoneSecondary} tag="span" /></a>
              </div>
            )}
            {email && (
              <div className="ar01cnt-detail">
                <a href={`mailto:${email}`}><GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" /></a>
              </div>
            )}
          </div>
          <div>
            {status === "done" ? (
              <p className="ar01cnt-success">Zpráva odeslána. Ozveme se vám co nejdříve.</p>
            ) : (
              <form className="ar01cnt-form" onSubmit={handleSubmit}>
                <input className="ar01cnt-input" type="text" placeholder={formFields.namePlaceholder ?? "Vaše jméno"} required />
                <input className="ar01cnt-input" type="email" placeholder={formFields.emailPlaceholder ?? "Váš e-mail"} required />
                <textarea className="ar01cnt-input ar01cnt-textarea" placeholder={formFields.messagePlaceholder ?? "Váš vzkaz"} required />
                <button className="ar01cnt-btn" type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Odesílám…" : (formFields.submitText ?? "Odeslat")}
                  {status !== "sending" && <span className="ar01cnt-btn-arrow" aria-hidden="true">→</span>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// ── contact-peak-cut (aka barber-05) — Brutalist Atelier White ─────────────
function ContactPeakCut({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const OSWALD = "var(--font-oswald), 'Oswald', 'Bebas Neue', Impact, sans-serif";
  const MONO   = "var(--font-overpass-mono), 'Overpass Mono', 'JetBrains Mono', Menlo, monospace";
  const OVERPASS = "var(--font-overpass), 'Overpass', 'Inter', system-ui, sans-serif";
  const INK    = "#0a0a0a";
  const RED    = "#c41e3a";
  const eyebrowRaw  = content.eyebrow;
  const titleRaw    = content.title;
  const subtitleRaw = content.subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Kontakt" : String(eyebrowRaw);
  const titleStr = titleRaw    === undefined ? "Rezervujte si termín." : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Nejjednodušší cesta — online formulář nebo telefon. Reagujeme do 1 hodiny." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || titleStr.trim() || subtitle.trim());
  const phone   = String(content.phone ?? "");
  const phoneLabel = String(content.phoneLabel ?? "Telefon");
  const email   = String(content.email ?? "");
  const emailLabel = String(content.emailLabel ?? "E-mail");
  const address = String(content.address ?? "");
  const addressLabel = String(content.addressLabel ?? "Adresa");
  const hoursLabel = String(content.hoursLabel ?? "Otevírací doba");
  const hours = (content.hours as Array<{ day?: string; value?: string }>) ?? [];
  const ctaText = String(content.ctaText ?? "Objednat se online");
  const ctaHref = String(content.ctaHref ?? "#");
  const mapEmbed = String(content.mapEmbed ?? "");

  return (
    <section
      id="kontakt"
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: "#ffffff",
        padding: "clamp(72px, 9vw, 128px) clamp(24px, 5vw, 64px)",
        borderTop: "1px solid rgba(10,10,10,0.08)",
      }}
      data-template="peak-cut"
    >
      <div className="mx-auto" style={{ maxWidth: 1320 }}>
        {showHeader && (
          <div className="pc-cnt-head" style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: "clamp(24px, 4vw, 64px)",
            alignItems: "end",
            paddingBottom: "clamp(40px, 5vw, 64px)",
            borderBottom: `1px solid ${INK}`,
            marginBottom: "clamp(40px, 5vw, 64px)",
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
                  margin: 0, fontFamily: OSWALD, fontWeight: 700,
                  fontSize: "clamp(36px, 5.5vw, 72px)", lineHeight: 1.05,
                  letterSpacing: "0.01em", textTransform: "uppercase",
                  color: INK, maxWidth: "13ch",
                }}>
                  <GenericEditableText sectionId={sectionId} field="title" value={titleStr} tag="span" />
                </h2>
              )}
            </div>
            {subtitle.trim() && (
              <p style={{
                margin: 0, fontFamily: OVERPASS, fontWeight: 300,
                fontSize: "clamp(14px, 1.2vw, 17px)", lineHeight: 1.65,
                color: "rgba(10,10,10,0.7)", maxWidth: 460, justifySelf: "end",
              }}>
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
          </div>
        )}

        <div className="pc-cnt-grid" style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 5fr) minmax(0, 7fr)",
          gap: "clamp(32px, 5vw, 80px)",
          alignItems: "start",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {phone && (
              <div className="pc-cnt-row" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(10,10,10,0.5)" }}>
                  <GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span" />
                </span>
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="pc-cnt-link" style={{
                  fontFamily: OSWALD, fontWeight: 600, fontSize: "clamp(20px, 2vw, 28px)",
                  letterSpacing: "0.04em", color: INK, textDecoration: "none",
                  transition: "color 0.3s ease",
                }}>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              </div>
            )}
            {email && (
              <div className="pc-cnt-row" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(10,10,10,0.5)" }}>
                  <GenericEditableText sectionId={sectionId} field="emailLabel" value={emailLabel} tag="span" />
                </span>
                <a href={`mailto:${email}`} className="pc-cnt-link" style={{
                  fontFamily: OVERPASS, fontWeight: 400, fontSize: "clamp(15px, 1.3vw, 18px)",
                  color: INK, textDecoration: "none", transition: "color 0.3s ease",
                }}>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              </div>
            )}
            {address && (
              <div className="pc-cnt-row" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(10,10,10,0.5)" }}>
                  <GenericEditableText sectionId={sectionId} field="addressLabel" value={addressLabel} tag="span" />
                </span>
                <span style={{
                  fontFamily: OVERPASS, fontWeight: 400, fontSize: "clamp(15px, 1.3vw, 18px)",
                  lineHeight: 1.5, color: INK, whiteSpace: "pre-line",
                }}>
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                </span>
              </div>
            )}
            {hours.length > 0 && (
              <div className="pc-cnt-row" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(10,10,10,0.5)" }}>
                  <GenericEditableText sectionId={sectionId} field="hoursLabel" value={hoursLabel} tag="span" />
                </span>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  {hours.map((h, i) => (
                    <li key={`pc-h-${i}`} style={{
                      display: "flex", justifyContent: "space-between", gap: 16,
                      paddingBottom: 6, borderBottom: "1px solid rgba(10,10,10,0.08)",
                    }}>
                      <span style={{ fontFamily: OVERPASS, fontSize: 14, color: "rgba(10,10,10,0.75)" }}>
                        <GenericEditableText sectionId={sectionId} field={`hours.${i}.day`} value={h.day ?? ""} tag="span" />
                      </span>
                      <span style={{ fontFamily: MONO, fontSize: 13, color: INK, letterSpacing: "0.04em" }}>
                        <GenericEditableText sectionId={sectionId} field={`hours.${i}.value`} value={h.value ?? ""} tag="span" />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {ctaText && (
              <a
                href={ctaHref}
                className="pc-cnt-cta inline-flex items-center justify-center"
                style={{
                  marginTop: 16, alignSelf: "flex-start",
                  fontFamily: OSWALD, fontSize: 13, fontWeight: 600,
                  letterSpacing: "0.22em", textTransform: "uppercase",
                  padding: "18px 36px",
                  backgroundColor: RED, color: "#ffffff",
                  border: `1px solid ${RED}`, textDecoration: "none",
                  transition: "background-color 0.3s ease, transform 0.3s ease",
                }}
              >
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                <span aria-hidden="true" className="pc-cnt-cta-arrow" style={{ marginLeft: 12, transition: "transform 0.3s ease" }}>→</span>
              </a>
            )}
          </div>

          <div className="pc-cnt-map" style={{
            position: "relative",
            minHeight: 480,
            backgroundColor: "#f5f5f5",
            border: "1px solid rgba(10,10,10,0.08)",
            overflow: "hidden",
          }}>
            {mapEmbed ? (
              <iframe
                src={mapEmbed}
                title="Mapa"
                width="100%" height="100%"
                style={{ border: 0, filter: "grayscale(95%) contrast(1.05)", position: "absolute", inset: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "rgba(10,10,10,0.4)", fontFamily: MONO, fontSize: 12,
                letterSpacing: "0.22em", textTransform: "uppercase",
              }}>
                Mapa — vložte embed
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── rekonstrukce-01-contact ───────────────────────────────────────────────────
// Split: kontaktní info panel (osoba/tel/email/adresa/IČO/DIČ) + poptávkový formulář.
// Form POST → /api/demo/{slug}/contact, honeypot, success stav. Conditional header.
// ──────────────────────────────────────────────────────────────────────────────
function ContactRekonstrukce01({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const AMBER  = "#C2622B";
  const AMBER2 = "#A24E1F";
  const DARK   = "#1F1B17";
  const MUTED  = "#7A7066";
  const CREAM  = "#F2ECE3";
  const FONT   = "'Inter', sans-serif";

  const c = content as Record<string, unknown>;
  const eyebrowRaw = c.eyebrow, titleRaw = c.title, subtitleRaw = c.subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Kontakt" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Ozvěte se nám" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Připravíme vám nezávaznou nabídku na míru." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());

  const person  = String(c.person  ?? "Jan Novotný");
  const phone   = String(c.phone   ?? "705 123 456");
  const email   = String(c.email   ?? "info@demo.cz");
  const address = String(c.address ?? "Praha a Středočeský kraj, Česká republika");
  const ico     = String(c.ico ?? "01234567");
  const dic     = String(c.dic ?? "CZ01234567");
  const icoLabel = String(c.icoLabel ?? "IČO");
  const dicLabel = String(c.dicLabel ?? "DIČ");
  const formTitle = String(c.formTitle ?? "Nezávazná poptávka");
  const nameLabel = String(c.nameLabel ?? "Jméno");
  const emailLabel = String(c.emailLabel ?? "E-mail");
  const phoneLabel = String(c.phoneLabel ?? "Telefon");
  const messageLabel = String(c.messageLabel ?? "Zpráva");
  const submitText = String(c.submitText ?? "Odeslat poptávku");
  const sendingText = String(c.sendingText ?? "Odesílám…");
  const personKicker  = String(c.personKicker  ?? "Kontaktní osoba");
  const phoneKicker   = String(c.phoneKicker   ?? "Telefon");
  const emailKicker   = String(c.emailKicker   ?? "E-mail");
  const addressKicker = String(c.addressKicker ?? "Působnost");
  const successTitle = String(c.successTitle ?? "Poptávka odeslána!");
  const successText  = String(c.successText  ?? "Brzy se vám ozveme s nezávaznou nabídkou.");
  const successAgain = String(c.successAgain ?? "Odeslat další poptávku");
  const namePlaceholder    = String(c.namePlaceholder    ?? "Vaše jméno");
  const emailPlaceholder   = String(c.emailPlaceholder   ?? "vas@email.cz");
  const phonePlaceholder   = String(c.phonePlaceholder   ?? "+420");
  const messagePlaceholder = String(c.messagePlaceholder ?? "Popište nám váš projekt…");
  const telHref = `tel:+420${phone.replace(/\D/g, "")}`;

  const [name, setName] = useState("");
  const [em, setEm] = useState("");
  const [ph, setPh] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isAdmin || honeypot || !tenantSlug) return;
    setStatus("sending"); setErrorMsg("");
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/contact`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: em, phone: ph, message, website: honeypot }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) { setErrorMsg(json.error ?? "Nepodařilo se odeslat zprávu."); setStatus("error"); }
      else { setStatus("success"); setName(""); setEm(""); setPh(""); setMessage(""); }
    } catch { setErrorMsg("Nepodařilo se odeslat zprávu. Zkuste to znovu."); setStatus("error"); }
  }

  const InfoRow = ({ icon, kicker, kickerField, children }: { icon: React.ReactElement; kicker: string; kickerField: string; children: React.ReactNode }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
      <span style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 11, background: "linear-gradient(140deg,rgba(194,98,43,.14),rgba(162,78,31,.1))", color: AMBER2, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
      <div style={{ paddingTop: 3 }}>
        <div style={{ color: MUTED, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
          <GenericEditableText sectionId={sectionId} field={kickerField} value={kicker} tag="span" />
        </div>
        {children}
      </div>
    </div>
  );
  const IcoWrap = (p: React.SVGProps<SVGSVGElement>) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p} />;

  return (
    <section id="kontakt" style={{ backgroundColor: "#fff", fontFamily: FONT, padding: "clamp(60px,8vw,104px) 0", opacity: 1 }} data-template="rekonstrukce-01">
      <style>{`
        .rk01ct-wrap{max-width:1140px;margin:0 auto;padding:0 32px;display:grid;grid-template-columns:0.95fr 1.05fr;gap:clamp(36px,5vw,64px);align-items:start;}
        .rk01ct-input{width:100%;padding:13px 16px;border:1px solid ${CREAM};border-radius:12px;background:#FAF7F2;font-family:${FONT};font-size:.95rem;color:${DARK};outline:none;transition:border-color .2s ease,box-shadow .2s ease,background .2s ease;}
        .rk01ct-input:focus{border-color:${AMBER};background:#fff;box-shadow:0 0 0 3px rgba(194,98,43,.12);}
        .rk01ct-label{display:block;font-size:.82rem;font-weight:600;color:${DARK};margin:0 0 7px;}
        .rk01ct-submit{width:100%;display:inline-flex;align-items:center;justify-content:center;gap:9px;background:linear-gradient(140deg,${AMBER},${AMBER2});color:#fff;font-weight:700;font-size:.98rem;padding:15px 28px;border:none;border-radius:999px;cursor:pointer;box-shadow:0 8px 22px rgba(194,98,43,.34);transition:transform .2s ease,box-shadow .25s ease;}
        .rk01ct-submit:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(194,98,43,.5);}
        .rk01ct-submit:disabled{opacity:.6;cursor:default;transform:none;}
        .rk01ct-info a{color:${DARK};text-decoration:none;font-weight:600;transition:color .2s ease;}
        .rk01ct-info a:hover{color:${AMBER2};}
        @media(max-width:860px){.rk01ct-wrap{grid-template-columns:1fr;gap:40px;}}
      `}</style>
      <div className="rk01ct-wrap">
        <div className="rk01ct-info">
          {showHeader && (
            <>
              {eyebrow.trim() && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ display: "block", width: 30, height: 2, background: AMBER, borderRadius: 2 }} />
                  <span style={{ color: AMBER2, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
                  </span>
                </div>
              )}
              {title.trim() && (
                <h2 style={{ color: DARK, fontSize: "clamp(26px,3.6vw,42px)", fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.02em", margin: "0 0 12px" }}>
                  <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
                </h2>
              )}
              {subtitle.trim() && (
                <p style={{ color: MUTED, fontSize: "1.05rem", lineHeight: 1.6, margin: "0 0 32px", maxWidth: 420 }}>
                  <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
                </p>
              )}
            </>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <InfoRow kicker={personKicker} kickerField="personKicker" icon={<IcoWrap><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></IcoWrap>}>
              <div style={{ color: DARK, fontWeight: 700 }}><GenericEditableText sectionId={sectionId} field="person" value={person} tag="span" /></div>
            </InfoRow>
            <InfoRow kicker={phoneKicker} kickerField="phoneKicker" icon={<IcoWrap><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12.25 19.79 19.79 0 0 1 1.17 3.63 2 2 0 0 1 3.15 1.45h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></IcoWrap>}>
              <a href={telHref}><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" /></a>
            </InfoRow>
            <InfoRow kicker={emailKicker} kickerField="emailKicker" icon={<IcoWrap><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></IcoWrap>}>
              <a href={`mailto:${email}`}><GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" /></a>
            </InfoRow>
            <InfoRow kicker={addressKicker} kickerField="addressKicker" icon={<IcoWrap><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></IcoWrap>}>
              <div style={{ color: DARK, fontWeight: 500 }}><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></div>
            </InfoRow>
            <div style={{ display: "flex", gap: 24, marginTop: 4, paddingTop: 18, borderTop: `1px solid ${CREAM}`, fontSize: "0.86rem", color: MUTED }}>
              <span><GenericEditableText sectionId={sectionId} field="icoLabel" value={icoLabel} tag="span" />: <b style={{ color: DARK }}><GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" /></b></span>
              <span><GenericEditableText sectionId={sectionId} field="dicLabel" value={dicLabel} tag="span" />: <b style={{ color: DARK }}><GenericEditableText sectionId={sectionId} field="dic" value={dic} tag="span" /></b></span>
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", border: `1px solid ${CREAM}`, borderRadius: 20, padding: "clamp(26px,3vw,40px)", boxShadow: "0 20px 50px rgba(60,40,20,.08)" }}>
          <h3 style={{ color: DARK, fontSize: "1.3rem", fontWeight: 800, margin: "0 0 22px", letterSpacing: "-0.01em" }}>
            <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" />
          </h3>
          {status === "success" ? (
            <div style={{ textAlign: "center", padding: "34px 12px" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", margin: "0 auto 16px", background: "linear-gradient(140deg,rgba(194,98,43,.16),rgba(162,78,31,.12))", color: AMBER2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <p style={{ color: DARK, fontWeight: 700, fontSize: "1.1rem", margin: "0 0 6px" }}><GenericEditableText sectionId={sectionId} field="successTitle" value={successTitle} tag="span" /></p>
              <p style={{ color: MUTED, fontSize: "0.92rem", margin: "0 0 16px" }}><GenericEditableText sectionId={sectionId} field="successText" value={successText} tag="span" /></p>
              <button onClick={() => setStatus("idle")} style={{ background: "none", border: "none", color: AMBER2, fontWeight: 600, cursor: "pointer", textDecoration: "underline", fontSize: "0.9rem" }}><GenericEditableText sectionId={sectionId} field="successAgain" value={successAgain} tag="span" /></button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input type="text" name="website" value={honeypot} onChange={e => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }} />
              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <label className="rk01ct-label"><GenericEditableText sectionId={sectionId} field="nameLabel" value={nameLabel} tag="span" /></label>
                  <input className="rk01ct-input" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder={namePlaceholder} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label className="rk01ct-label"><GenericEditableText sectionId={sectionId} field="emailLabel" value={emailLabel} tag="span" /></label>
                    <input className="rk01ct-input" type="email" required value={em} onChange={e => setEm(e.target.value)} placeholder={emailPlaceholder} />
                  </div>
                  <div>
                    <label className="rk01ct-label"><GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span" /></label>
                    <input className="rk01ct-input" type="tel" value={ph} onChange={e => setPh(e.target.value)} placeholder={phonePlaceholder} />
                  </div>
                </div>
                <div>
                  <label className="rk01ct-label"><GenericEditableText sectionId={sectionId} field="messageLabel" value={messageLabel} tag="span" /></label>
                  <textarea className="rk01ct-input" required rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder={messagePlaceholder} style={{ resize: "vertical" }} />
                </div>
                {status === "error" && <p style={{ color: "#b91c1c", fontSize: "0.86rem", margin: 0 }}>{errorMsg}</p>}
                <button type="submit" className="rk01ct-submit" disabled={status === "sending"}>
                  {status === "sending" ? sendingText : <><GenericEditableText sectionId={sectionId} field="submitText" value={submitText} tag="span" /><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// ── contact-photo-01 ──────────────────────────────────────────────────────────
// Fotografka kontakt: cream editorial, 2-col (info+hodiny / formulář), Playfair, taupe accent
function ContactFloors01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const c = content as Record<string, unknown>;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const eyebrow   = String(c.eyebrow ?? "Napište nám");
  const title     = String(c.title ?? "Poradíme s výběrem i pokládkou");
  const lead      = String(c.lead ?? "Zanechte nám zprávu a ozveme se do 24 hodin, nebo se stavte v kterémkoli showroomu.");
  const nameLabel = String(c.nameLabel ?? "Jméno a příjmení");
  const emailLabel = String(c.emailLabel ?? "E-mail");
  const phoneLabel = String(c.phoneLabel ?? "Telefon");
  const msgLabel   = String(c.messageLabel ?? "Zpráva");
  const submitText = String(c.submitText ?? "Odeslat poptávku");
  const successText = String(c.successText ?? "Děkujeme! Ozveme se vám co nejdříve.");
  const asideTitle = String(c.asideTitle ?? "Spojte se s námi");
  const phoneVal   = String(c.phone ?? "+420 704 118 260");
  const emailVal   = String(c.email ?? "studio@parketo.cz");
  const hoursLabel = String(c.hoursLabel ?? "Otevírací doba");
  const hoursVal   = String(c.hoursVal ?? "Po–Pá 8:00–18:00 · So 9:00–13:00");
  const phoneRLabel = String(c.phoneRLabel ?? "Telefon");
  const emailRLabel = String(c.emailRLabel ?? "E-mail");
  const showroomsLabel = String(c.showroomsLabel ?? "Naše showroomy");
  const showrooms = (c.showrooms as string[]) ?? ["Praha – Západ", "Brno – Centrum", "Olomouc", "České Budějovice", "Liberec"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isAdmin) return;
    if (honeypot) return;
    if (!tenantSlug) return;
    setStatus("sending"); setErrorMsg("");
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message, website: honeypot }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) { setErrorMsg(json.error ?? "Nepodařilo se odeslat zprávu."); setStatus("error"); }
      else { setStatus("success"); setName(""); setEmail(""); setPhone(""); setMessage(""); }
    } catch { setErrorMsg("Nepodařilo se odeslat zprávu. Zkuste to znovu."); setStatus("error"); }
  }

  const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
  const PhoneIcon = () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>);
  const MailIcon = () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>);
  const ClockIcon = () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);

  return (
    <section data-template="floors-01" style={{ fontFamily: FONT }}>
      <div className="f01c-section">
        <div className="f01c-wrap">
          {/* Form */}
          <div>
            <span className="f01c-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></span>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2" className="f01c-title" />
            <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="p" className="f01c-lead" />
            {status === "success" ? (
              <p className="f01c-note ok" style={{ fontSize: 15 }}><GenericEditableText sectionId={sectionId} field="successText" value={successText} tag="span" /></p>
            ) : (
              <form className="f01c-form" onSubmit={handleSubmit}>
                <div className="f01c-field">
                  <label className="f01c-label"><GenericEditableText sectionId={sectionId} field="nameLabel" value={nameLabel} tag="span" /></label>
                  <input className="f01c-input" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="f01c-field">
                  <label className="f01c-label"><GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span" /></label>
                  <input className="f01c-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="f01c-field full">
                  <label className="f01c-label"><GenericEditableText sectionId={sectionId} field="emailLabel" value={emailLabel} tag="span" /></label>
                  <input className="f01c-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="f01c-field full">
                  <label className="f01c-label"><GenericEditableText sectionId={sectionId} field="messageLabel" value={msgLabel} tag="span" /></label>
                  <textarea className="f01c-textarea" value={message} onChange={(e) => setMessage(e.target.value)} required />
                </div>
                <input type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} aria-hidden="true" />
                <button type="submit" className="f01c-submit" disabled={status === "sending" || isAdmin}>
                  {status === "sending" ? "Odesílám…" : <GenericEditableText sectionId={sectionId} field="submitText" value={submitText} tag="span" />}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </button>
                {status === "error" && <p className="f01c-note err">{errorMsg}</p>}
              </form>
            )}
          </div>

          {/* Aside info */}
          <aside className="f01c-aside">
            <p className="f01c-aside-title"><GenericEditableText sectionId={sectionId} field="asideTitle" value={asideTitle} tag="span" /></p>
            <div className="f01c-row">
              <span className="f01c-ricon" aria-hidden="true"><PhoneIcon /></span>
              <div>
                <p className="f01c-rlabel"><GenericEditableText sectionId={sectionId} field="phoneRLabel" value={phoneRLabel} tag="span" /></p>
                <a className="f01c-rval" href={`tel:${phoneVal.replace(/\s/g, "")}`}><GenericEditableText sectionId={sectionId} field="phone" value={phoneVal} tag="span" /></a>
              </div>
            </div>
            <div className="f01c-row">
              <span className="f01c-ricon" aria-hidden="true"><MailIcon /></span>
              <div>
                <p className="f01c-rlabel"><GenericEditableText sectionId={sectionId} field="emailRLabel" value={emailRLabel} tag="span" /></p>
                <a className="f01c-rval" href={`mailto:${emailVal}`}><GenericEditableText sectionId={sectionId} field="email" value={emailVal} tag="span" /></a>
              </div>
            </div>
            <div className="f01c-row">
              <span className="f01c-ricon" aria-hidden="true"><ClockIcon /></span>
              <div>
                <p className="f01c-rlabel"><GenericEditableText sectionId={sectionId} field="hoursLabel" value={hoursLabel} tag="span" /></p>
                <p className="f01c-rval"><GenericEditableText sectionId={sectionId} field="hoursVal" value={hoursVal} tag="span" /></p>
              </div>
            </div>
            <p className="f01c-rlabel" style={{ marginTop: 18 }}><GenericEditableText sectionId={sectionId} field="showroomsLabel" value={showroomsLabel} tag="span" /></p>
            <div className="f01c-chips">
              {showrooms.map((s, i) => (
                <span key={i} className="f01c-chip"><GenericEditableText sectionId={sectionId} field={`showrooms.${i}`} value={s} tag="span">{s}</GenericEditableText></span>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function ContactPhoto01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const c = content as Record<string, unknown>;
  const eyebrowRaw  = c.eyebrow;
  const titleRaw    = c.title;
  const subtitleRaw = c.subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Rezervace" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Pojďme spolu naplánovat focení" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Napište mi pár řádků o tom, co byste si přáli. Ozvu se obvykle do jednoho dne." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());
  const phone   = String(c.phone   ?? "");
  const email   = String(c.email   ?? "");
  const address = String(c.address ?? "");
  const phoneLabel   = String(c.phoneLabel   ?? "Telefon");
  const emailLabel   = String(c.emailLabel   ?? "E-mail");
  const addressLabel = String(c.addressLabel ?? "Kde fotím");
  const hoursLabel   = String(c.hoursLabel   ?? "Kdy se ozvu");
  const hours        = String(c.hours        ?? "Po–Pá 9:00–18:00 · odpovídám i o víkendu");
  const nameLabel    = String(c.nameLabel    ?? "Vaše jméno");
  const emailFieldLabel = String(c.emailFieldLabel ?? "E-mail");
  const phoneFieldLabel = String(c.phoneFieldLabel ?? "Telefon");
  const messageLabel = String(c.messageLabel ?? "Vaše zpráva");
  const submitText   = String(c.submitText   ?? "Odeslat poptávku");
  const successText  = String(c.successText  ?? "Děkuji! Zpráva dorazila, brzy se ozvu.");

  const [name, setName] = useState("");
  const [emailV, setEmailV] = useState("");
  const [phoneV, setPhoneV] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isAdmin) return;
    if (honeypot) return;
    if (!tenantSlug) return;
    setStatus("sending"); setErrorMsg("");
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/contact`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: emailV, phone: phoneV, message, website: honeypot }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) { setErrorMsg(json.error ?? "Nepodařilo se odeslat zprávu."); setStatus("error"); }
      else { setStatus("success"); setName(""); setEmailV(""); setPhoneV(""); setMessage(""); }
    } catch { setErrorMsg("Nepodařilo se odeslat zprávu. Zkuste to znovu."); setStatus("error"); }
  }

  const infoRow = (label: string, labelField: string, value: string, valueField: string, href?: string) => (
    <div className="ph01ct-info-row">
      <GenericEditableText sectionId={sectionId} field={labelField} value={label} tag="p" className="ph01ct-info-label" />
      {href ? (
        <a href={href} className="ph01ct-info-value">
          <GenericEditableText sectionId={sectionId} field={valueField} value={value} tag="span" />
        </a>
      ) : (
        <GenericEditableText sectionId={sectionId} field={valueField} value={value} tag="p" className="ph01ct-info-value" />
      )}
    </div>
  );

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap" />
      <style>{`        .ph01ct { background: #faf6f1; padding: clamp(56px, 8vw, 104px) 5%; }
        .ph01ct-inner { max-width: 1120px; margin: 0 auto; display: grid; grid-template-columns: 0.85fr 1.15fr; gap: clamp(40px, 6vw, 84px); align-items: start; }
        .ph01ct-eyebrow { display: inline-flex; align-items: center; gap: 0.8em; font-family: 'Inter', system-ui, sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 0.24em; text-transform: uppercase; color: #8b7355; margin: 0 0 20px; }
        .ph01ct-eyebrow::before { content: ''; width: 30px; height: 1px; background: #c0bbad; display: inline-block; }
        .ph01ct-title { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(28px, 3.6vw, 42px); font-weight: 400; color: #1a1a1a; margin: 0 0 18px; line-height: 1.15; letter-spacing: -0.01em; }
        .ph01ct-sub { font-family: 'Inter', system-ui, sans-serif; font-size: clamp(15px, 1.5vw, 16.5px); line-height: 1.8; color: #6b6b6b; margin: 0 0 34px; max-width: 420px; }
        .ph01ct-info { display: flex; flex-direction: column; gap: 22px; }
        .ph01ct-info-row { display: flex; flex-direction: column; gap: 4px; }
        .ph01ct-info-label { font-family: 'Inter', system-ui, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #8b7355; margin: 0; }
        .ph01ct-info-value { font-family: 'Inter', system-ui, sans-serif; font-size: 15.5px; color: #1a1a1a; margin: 0; text-decoration: none; transition: color 0.3s ease; }
        a.ph01ct-info-value:hover { color: #8b7355; }
        .ph01ct-form { background: #fff; border: 1px solid #eae2d7; border-radius: 3px; padding: clamp(28px, 3vw, 42px); }
        .ph01ct-field { margin-bottom: 20px; }
        .ph01ct-field label { display: block; font-family: 'Inter', system-ui, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #8b7355; margin-bottom: 8px; }
        .ph01ct-field input, .ph01ct-field textarea {
          width: 100%; box-sizing: border-box;
          font-family: 'Inter', system-ui, sans-serif; font-size: 15px; color: #1a1a1a;
          background: #faf8f5; border: 1px solid #e4dccf; border-radius: 2px;
          padding: 13px 15px; outline: none; transition: border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
        }
        .ph01ct-field input:focus, .ph01ct-field textarea:focus { border-color: #8b7355; background: #fff; box-shadow: 0 0 0 3px rgba(139,115,85,0.1); }
        .ph01ct-field textarea { resize: vertical; min-height: 120px; }
        .ph01ct-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .ph01ct-submit {
          position: relative; overflow: hidden; width: 100%; margin-top: 4px;
          font-family: 'Inter', system-ui, sans-serif; font-size: 12px; font-weight: 500;
          letter-spacing: 0.16em; text-transform: uppercase; color: #fff; background: #1a1a1a;
          border: none; border-radius: 2px; padding: 16px; cursor: pointer;
          transition: color 0.45s cubic-bezier(.32,.72,0,1);
        }
        .ph01ct-submit::before { content: ''; position: absolute; inset: 0; background: #8b7355; transform: translateY(101%); transition: transform 0.5s cubic-bezier(.32,.72,0,1); z-index: 0; }
        .ph01ct-submit:hover::before { transform: translateY(0); }
        .ph01ct-submit:disabled { opacity: 0.6; cursor: default; }
        .ph01ct-submit span { position: relative; z-index: 1; }
        .ph01ct-note { font-family: 'Inter', system-ui, sans-serif; font-size: 13.5px; margin: 16px 0 0; }
        .ph01ct-note.ok { color: #4a7a4a; }
        .ph01ct-note.err { color: #a04040; }
        .ph01ct-hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
        @media (max-width: 860px) { .ph01ct-inner { grid-template-columns: 1fr; gap: 44px; } }
      `}</style>

      <section className="ph01ct" id="kontakt-form" data-template="photo-01-contact">
        <div className="ph01ct-inner">
          <div className="ph01ct-left">
            {showHeader && (
              <>
                {eyebrow.trim() && <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="p" className="ph01ct-eyebrow" />}
                {title.trim() && <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2" className="ph01ct-title" />}
                {subtitle.trim() && <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p" className="ph01ct-sub" />}
              </>
            )}
            <div className="ph01ct-info">
              {phone   && infoRow(phoneLabel,   "phoneLabel",   phone,   "phone",   `tel:${phone.replace(/\s/g, "")}`)}
              {email   && infoRow(emailLabel,   "emailLabel",   email,   "email",   `mailto:${email}`)}
              {address && infoRow(addressLabel, "addressLabel", address, "address")}
              {hours   && infoRow(hoursLabel,   "hoursLabel",   hours,   "hours")}
            </div>
          </div>

          <form className="ph01ct-form" onSubmit={handleSubmit}>
            <div className="ph01ct-field">
              <label htmlFor={`ph01ct-name-${sectionId}`}><GenericEditableText sectionId={sectionId} field="nameLabel" value={nameLabel} tag="span" /></label>
              <input id={`ph01ct-name-${sectionId}`} type="text" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
            </div>
            <div className="ph01ct-row2">
              <div className="ph01ct-field">
                <label htmlFor={`ph01ct-email-${sectionId}`}><GenericEditableText sectionId={sectionId} field="emailFieldLabel" value={emailFieldLabel} tag="span" /></label>
                <input id={`ph01ct-email-${sectionId}`} type="email" value={emailV} onChange={(e) => setEmailV(e.target.value)} required autoComplete="email" />
              </div>
              <div className="ph01ct-field">
                <label htmlFor={`ph01ct-phone-${sectionId}`}><GenericEditableText sectionId={sectionId} field="phoneFieldLabel" value={phoneFieldLabel} tag="span" /></label>
                <input id={`ph01ct-phone-${sectionId}`} type="tel" value={phoneV} onChange={(e) => setPhoneV(e.target.value)} autoComplete="tel" />
              </div>
            </div>
            <div className="ph01ct-field">
              <label htmlFor={`ph01ct-msg-${sectionId}`}><GenericEditableText sectionId={sectionId} field="messageLabel" value={messageLabel} tag="span" /></label>
              <textarea id={`ph01ct-msg-${sectionId}`} value={message} onChange={(e) => setMessage(e.target.value)} required />
            </div>
            <input className="ph01ct-hp" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} aria-hidden="true" />
            <button type="submit" className="ph01ct-submit" disabled={status === "sending"}>
              <span>{status === "sending" ? "Odesílám…" : submitText}</span>
            </button>
            {status === "success" && <p className="ph01ct-note ok">{successText}</p>}
            {status === "error" && <p className="ph01ct-note err">{errorMsg}</p>}
          </form>
        </div>
      </section>
    </>
  );
}


// ── malir-01-contact ──────────────────────────────────────────────────────────
function ContactMalir01({ content, sectionId, isAdmin }: { content: Record<string, unknown>; sectionId: number; isAdmin?: boolean }) {
  const AMBER  = "#E79B0E";
  const NAVY   = "#0F297B";
  const DARK   = "#0a0a0a";
  const WHITE  = "#ffffff";
  const FONT_H = "'Playfair Display', Georgia, serif";
  const FONT_B = "'Raleway', sans-serif";

  const heading    = String(content.heading ?? "Kontaktujte nás");
  const subheading = String(content.subheading ?? "Rádi vám připravíme nezávaznou cenovou nabídku.");
  const email      = String(content.email ?? "info@demo.cz");
  const phone      = String(content.phone ?? "704 123 456");
  const address    = String(content.address ?? "Ukázková 123, 110 00 Praha 1");
  const hours      = String(content.hours ?? "Po–Pá 8:00–17:00");
  const showHeader = content.showHeader !== false;

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", gdpr: false });
  const [status, setStatus] = useState<"idle"|"sending"|"ok"|"err">("idle");
  const [touched, setTouched] = useState(false);
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const errors = {
    name:  !form.name.trim(),
    email: !form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    gdpr:  !form.gdpr,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (hasErrors || isAdmin) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sectionId, ...form }) });
      setStatus(res.ok ? "ok" : "err");
    } catch { setStatus("err"); }
  };

  const infoCards = [
    { icon: "phone", label: "Telefon", value: phone, href: `tel:${phone.replace(/\s/g, "")}` },
    { icon: "email", label: "E-mail", value: email, href: `mailto:${email}` },
    { icon: "pin", label: "Adresa", value: address },
    { icon: "clock", label: "Pracovní doba", value: hours },
  ];

  const icons: Record<string, React.ReactElement> = {
    phone: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
    email: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>,
    pin:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    clock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box" as const,
    fontFamily: FONT_B, fontSize: 14, color: WHITE,
    background: `${WHITE}0a`, border: `1.5px solid ${WHITE}18`,
    padding: "14px 16px", borderRadius: 4, outline: "none",
    transition: "border-color 0.3s, background 0.3s",
  };

  return (
    <section data-template="malir-01" style={{ background: WHITE, padding: "clamp(48px, 8vw, 80px) 0 0" }}>
      {/* Section header (conditionally hidden on subpages) */}
      {showHeader && (
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto clamp(36px, 5vw, 56px)", padding: "0 30px" }}>
          <div className="m01ct-reveal" style={{ fontFamily: FONT_B, fontWeight: 600, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: AMBER, marginBottom: 12 }}>Kontakt</div>
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
            fontFamily: FONT_H, fontWeight: 700, fontSize: "clamp(26px, 3.5vw, 40px)", color: "#1a1a1a", lineHeight: 1.15, margin: "0 0 14px",
          }} />
          <div style={{ width: 48, height: 3, background: AMBER, borderRadius: 2, margin: "0 auto 16px" }} />
          <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="p" style={{
            fontFamily: FONT_B, fontSize: 15, lineHeight: 1.7, color: "#666", margin: 0,
          }} />
        </div>
      )}

      {/* 2-col layout: info + form */}
      <div className="m01ct-grid" style={{
        maxWidth: 1140, margin: "0 auto", padding: "0 30px clamp(48px, 8vw, 80px)",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px, 5vw, 64px)", alignItems: "start",
      }}>
        {/* Left: info cards */}
        <div>
          <div className="m01ct-reveal" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {infoCards.map((card, i) => (
              <div key={i} className="m01ct-card" style={{
                background: "#f8f7f5", padding: "22px 20px", borderRadius: 6,
                borderBottom: `3px solid transparent`, transition: "border-color 0.3s, transform 0.3s",
              }}>
                <div style={{ marginBottom: 10 }}>{icons[card.icon]}</div>
                <div style={{ fontFamily: FONT_B, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#aaa", marginBottom: 4 }}>
                  {card.label}
                </div>
                <div style={{ fontFamily: FONT_B, fontSize: 14, fontWeight: 600, color: "#1a1a1a", lineHeight: 1.4 }}>
                  {card.href ? (
                    <a href={card.href} style={{ color: "#1a1a1a", textDecoration: "none", transition: "color 0.3s" }}
                       onMouseOver={e => (e.currentTarget.style.color = AMBER)}
                       onMouseOut={e => (e.currentTarget.style.color = "#1a1a1a")}>
                      <GenericEditableText sectionId={sectionId} field={`contact.${card.icon}`} value={card.value} tag="span" />
                    </a>
                  ) : (
                    <GenericEditableText sectionId={sectionId} field={`contact.${card.icon}`} value={card.value} tag="span" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Map placeholder */}
          <div className="m01ct-reveal" style={{
            marginTop: 14, background: "#f0ede8", borderRadius: 6,
            height: 180, display: "flex", alignItems: "center", justifyContent: "center",
            color: "#aaa", fontSize: 13, fontFamily: FONT_B,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Mapa — k dispozici po propojení
          </div>
        </div>

        {/* Right: form */}
        <div className="m01ct-reveal" style={{
          background: DARK, padding: "clamp(32px, 4vw, 44px) clamp(24px, 3vw, 40px)",
          borderRadius: 6,
        }}>
          <div style={{ fontFamily: FONT_H, fontWeight: 700, fontSize: 20, color: WHITE, marginBottom: 6 }}>
            Nezávazná poptávka
          </div>
          <div style={{ fontFamily: FONT_B, fontSize: 13, color: `${WHITE}55`, marginBottom: 28 }}>
            Vyplňte formulář a ozveme se do 24 hodin.
          </div>

          {status === "ok" ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
              <div style={{ fontFamily: FONT_H, fontSize: 20, color: AMBER, marginBottom: 8 }}>Děkujeme!</div>
              <div style={{ fontFamily: FONT_B, fontSize: 14, color: `${WHITE}88` }}>Vaši zprávu jsme přijali a budeme vás kontaktovat.</div>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input placeholder="Jméno *" value={form.name} onChange={e => set("name", e.target.value)}
                  style={{ ...inputStyle, borderColor: touched && errors.name ? "#e74c3c" : `${WHITE}18` }}
                  onFocus={e => { e.currentTarget.style.borderColor = AMBER; e.currentTarget.style.background = `${WHITE}10`; }}
                  onBlur={e => { e.currentTarget.style.borderColor = touched && errors.name ? "#e74c3c" : `${WHITE}18`; e.currentTarget.style.background = `${WHITE}0a`; }}
                />
                <input placeholder="Telefon" value={form.phone} onChange={e => set("phone", e.target.value)}
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = AMBER; e.currentTarget.style.background = `${WHITE}10`; }}
                  onBlur={e => { e.currentTarget.style.borderColor = `${WHITE}18`; e.currentTarget.style.background = `${WHITE}0a`; }}
                />
              </div>
              <input type="email" placeholder="E-mail *" value={form.email} onChange={e => set("email", e.target.value)}
                style={{ ...inputStyle, borderColor: touched && errors.email ? "#e74c3c" : `${WHITE}18` }}
                onFocus={e => { e.currentTarget.style.borderColor = AMBER; e.currentTarget.style.background = `${WHITE}10`; }}
                onBlur={e => { e.currentTarget.style.borderColor = touched && errors.email ? "#e74c3c" : `${WHITE}18`; e.currentTarget.style.background = `${WHITE}0a`; }}
              />
              <textarea placeholder="Vaše zpráva…" value={form.message} onChange={e => set("message", e.target.value)}
                style={{ ...inputStyle, resize: "vertical" as const, minHeight: 110 }}
                onFocus={e => { e.currentTarget.style.borderColor = AMBER; e.currentTarget.style.background = `${WHITE}10`; }}
                onBlur={e => { e.currentTarget.style.borderColor = `${WHITE}18`; e.currentTarget.style.background = `${WHITE}0a`; }}
              />
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginTop: 4 }}>
                <input type="checkbox" checked={form.gdpr} onChange={e => set("gdpr", e.target.checked)}
                  style={{ accentColor: AMBER, marginTop: 3, width: 16, height: 16 }}
                />
                <span style={{ fontFamily: FONT_B, fontSize: 12, color: touched && errors.gdpr ? "#e74c3c" : `${WHITE}66`, lineHeight: 1.5 }}>
                  Souhlasím se zpracováním osobních údajů za účelem odpovědi na poptávku. *
                </span>
              </label>
              <button type="submit" disabled={status === "sending"} className="m01ct-submit" style={{
                marginTop: 8, fontFamily: FONT_B, fontWeight: 700, fontSize: 13,
                letterSpacing: "0.1em", textTransform: "uppercase" as const,
                background: AMBER, color: DARK, border: "none",
                padding: "16px 32px", borderRadius: 4, cursor: "pointer",
                transition: "background 0.3s, transform 0.2s",
              }}
                onMouseOver={e => { e.currentTarget.style.background = "#d08a0c"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseOut={e => { e.currentTarget.style.background = AMBER; e.currentTarget.style.transform = "none"; }}
              >
                {status === "sending" ? "Odesílám…" : "Odeslat poptávku"}
              </button>
              {status === "err" && (
                <div style={{ fontFamily: FONT_B, fontSize: 13, color: "#e74c3c", marginTop: 4 }}>
                  Odeslání se nezdařilo. Zkuste to prosím znovu.
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
 * eshop-02 "Modrý Košík" — kontaktní stránka.
 * Vlevo info karty (telefon/e-mail/adresa/otevírací doba),
 * vpravo demo formulář se success stavem.
 * ============================================================ */

function ContactEshop02({ content, sectionId }: {
  content: Record<string, unknown>;
  sectionId: number;
}) {
  const BLUE = "#1266cc";
  const ACCENT = "#f0803c";
  const DARK = "#142b45";
  const MUTED = "#64748b";
  const BORDER = "#e3e9f0";
  const SURFACE = "#f5f8fb";
  const SANS = "'Open Sans', 'Segoe UI', Arial, sans-serif";

  const phone = String(content.phone ?? "+420 777 123 456");
  const email = String(content.email ?? "info@modrykosik.cz");
  const address = String(content.address ?? "Skladová 12, 190 00 Praha 9");
  const hours = String(content.hours ?? "Po–Ne 8:00–20:00");
  const formTitle = content.formTitle === undefined ? "Napište nám" : String(content.formTitle);
  const formText = content.formText === undefined ? "Odpovídáme do 24 hodin, obvykle mnohem dřív." : String(content.formText);

  const [sent, setSent] = useState(false);

  const infoCard = (icon: React.ReactNode, label: string, labelField: string, value: string, valueField: string, href?: string) => (
    <div className="wc2ct-card">
      <span className="wc2ct-ico" aria-hidden>{icon}</span>
      <div>
        <GenericEditableText sectionId={sectionId} field={labelField} value={label} tag="span" className="wc2ct-label" />
        {href ? (
          <a href={href} className="wc2ct-value"><GenericEditableText sectionId={sectionId} field={valueField} value={value} tag="span" /></a>
        ) : (
          <GenericEditableText sectionId={sectionId} field={valueField} value={value} tag="span" className="wc2ct-value" />
        )}
      </div>
    </div>
  );

  return (
    <section className="wc2ct" data-variant="eshop-02-contact" id="kontakt">
      <style>{`
        .wc2ct { background: #fff; color: ${DARK}; font-family: ${SANS}; }
        .wc2ct-inner { max-width: 1280px; margin: 0 auto; padding: clamp(48px,6vw,84px) 24px; display: grid; grid-template-columns: minmax(0,5fr) minmax(0,7fr); gap: clamp(28px,4.5vw,64px); align-items: start; }
        @media (max-width: 900px) { .wc2ct-inner { grid-template-columns: 1fr; } }
        .wc2ct-cards { display: flex; flex-direction: column; gap: 12px; }
        .wc2ct-card { display: flex; align-items: center; gap: 14px; background: ${SURFACE}; border: 1px solid ${BORDER}; border-radius: 12px; padding: 16px 18px; transition: border-color .2s; }
        .wc2ct-card:hover { border-color: ${BLUE}; }
        .wc2ct-ico { flex-shrink: 0; width: 42px; height: 42px; border-radius: 11px; background: ${BLUE}; color: #fff; display: grid; place-items: center; }
        .wc2ct-label { display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: ${MUTED}; margin-bottom: 2px; }
        .wc2ct-value { display: block; font-size: 15.5px; font-weight: 700; color: ${DARK}; text-decoration: none; }
        a.wc2ct-value:hover { color: ${BLUE}; }
        .wc2ct-form-wrap { background: ${SURFACE}; border: 1px solid ${BORDER}; border-radius: 16px; padding: clamp(22px,3vw,34px); }
        .wc2ct-form-title { font-size: clamp(20px,2.2vw,26px); font-weight: 700; letter-spacing: -0.02em; margin: 0 0 6px; color: ${DARK}; }
        .wc2ct-form-text { font-size: 14px; color: ${MUTED}; margin: 0 0 20px; }
        .wc2ct-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        @media (max-width: 560px) { .wc2ct-row { grid-template-columns: 1fr; } }
        .wc2ct-input, .wc2ct-area { width: 100%; border: 1px solid ${BORDER}; border-radius: 9px; background: #fff; font-family: inherit; font-size: 14.5px; color: ${DARK}; padding: 12px 14px; outline: none; transition: border-color .2s, box-shadow .2s; }
        .wc2ct-input:focus, .wc2ct-area:focus { border-color: ${BLUE}; box-shadow: 0 0 0 3px rgba(18,102,204,0.12); }
        .wc2ct-area { min-height: 130px; resize: vertical; margin-bottom: 14px; }
        .wc2ct-submit { border: 0; cursor: pointer; font-family: inherit; font-size: 15px; font-weight: 700; color: #fff; background: ${BLUE}; border-radius: 9px; padding: 13px 30px; transition: background .2s, transform .15s; }
        .wc2ct-submit:hover { background: #0e51a3; transform: translateY(-1px); }
        .wc2ct-done { display: flex; align-items: center; gap: 12px; background: #e8f7ef; border: 1px solid #b5e5c9; border-radius: 12px; padding: 18px 20px; font-size: 15px; font-weight: 600; color: #14683a; }
        .wc2ct-done-ico { flex-shrink: 0; width: 34px; height: 34px; border-radius: 999px; background: #2ec573; display: grid; place-items: center; }
      `}</style>
      <div className="wc2ct-inner">
        <div className="wc2ct-cards">
          {infoCard(
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
            "Zákaznická linka", "phoneLabel", phone, "phone", `tel:${phone.replace(/\s/g, "")}`
          )}
          {infoCard(
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>,
            "E-mail", "emailLabel", email, "email", `mailto:${email}`
          )}
          {infoCard(
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
            "Sídlo a sklad", "addressLabel", address, "address"
          )}
          {infoCard(
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
            "Jsme vám k dispozici", "hoursLabel", hours, "hours"
          )}
        </div>
        <div className="wc2ct-form-wrap">
          <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="h2" className="wc2ct-form-title" />
          <GenericEditableText sectionId={sectionId} field="formText" value={formText} tag="p" className="wc2ct-form-text" />
          {sent ? (
            <div className="wc2ct-done" role="status">
              <span className="wc2ct-done-ico" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
              </span>
              Děkujeme za zprávu! Ozveme se co nejdřív.
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <div className="wc2ct-row">
                <input className="wc2ct-input" type="text" required placeholder="Vaše jméno" aria-label="Jméno" />
                <input className="wc2ct-input" type="email" required placeholder="Váš e-mail" aria-label="E-mail" />
              </div>
              <textarea className="wc2ct-area" required placeholder="S čím vám můžeme pomoci?" aria-label="Zpráva" />
              <button type="submit" className="wc2ct-submit">Odeslat zprávu</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// ── eshop-03-contact ────────────────────────────────────────────────────────────
// Shoptet Disco kontakt: flat info karty (radius 0, žlutý ikonový čtverec)
// vlevo + hranatý formulář s žlutým uppercase submitem vpravo. Nunito.
// ──────────────────────────────────────────────────────────────────────────────
function ContactEshop03({ content, sectionId }: {
  content: Record<string, unknown>;
  sectionId: number;
}) {
  const YELLOW = "#FFC500";
  const BLACK = "#000000";
  const MUTED = "#767676";
  const BORDER = "#e6e6e6";
  const SANS = "'Nunito', 'Segoe UI', Arial, sans-serif";

  const phone = String(content.phone ?? "+420 725 456 789");
  const email = String(content.email ?? "ahoj@kanarek.cz");
  const address = String(content.address ?? "Slunečná 8, 170 00 Praha 7");
  const hours = String(content.hours ?? "Po–Pá 8:00–18:00");
  const formTitle = content.formTitle === undefined ? "Napište nám" : String(content.formTitle);
  const formText = content.formText === undefined ? "Odpovídáme do 24 hodin, obvykle mnohem dřív." : String(content.formText);

  const [sent, setSent] = useState(false);

  const infoCard = (icon: React.ReactNode, label: string, labelField: string, value: string, valueField: string, href?: string) => (
    <div className="wc3ct-card">
      <span className="wc3ct-ico" aria-hidden>{icon}</span>
      <div>
        <GenericEditableText sectionId={sectionId} field={labelField} value={label} tag="span" className="wc3ct-label" />
        {href ? (
          <a href={href} className="wc3ct-value"><GenericEditableText sectionId={sectionId} field={valueField} value={value} tag="span" /></a>
        ) : (
          <GenericEditableText sectionId={sectionId} field={valueField} value={value} tag="span" className="wc3ct-value" />
        )}
      </div>
    </div>
  );

  return (
    <section className="wc3ct" data-variant="eshop-03-contact" id="kontakt">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" />
      <style>{`
        .wc3ct { background: #fff; color: ${BLACK}; font-family: ${SANS}; }
        .wc3ct-inner { max-width: 1280px; margin: 0 auto; padding: clamp(40px,5vw,72px) 20px; display: grid; grid-template-columns: minmax(0,5fr) minmax(0,7fr); gap: clamp(28px,4.5vw,64px); align-items: start; }
        @media (max-width: 900px) { .wc3ct-inner { grid-template-columns: 1fr; } }
        .wc3ct-cards { display: flex; flex-direction: column; gap: 12px; }
        .wc3ct-card { display: flex; align-items: center; gap: 14px; border: 1px solid ${BORDER}; padding: 16px 18px; transition: box-shadow .2s; }
        .wc3ct-card:hover { box-shadow: 0 0 10px rgba(0,0,0,0.12); }
        .wc3ct-ico { flex-shrink: 0; width: 46px; height: 46px; background: ${YELLOW}; color: ${BLACK}; display: grid; place-items: center; }
        .wc3ct-label { display: block; font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; color: ${MUTED}; margin-bottom: 2px; }
        .wc3ct-value { display: block; font-size: 16px; font-weight: 800; color: ${BLACK}; text-decoration: none; }
        a.wc3ct-value:hover { text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 3px; }
        .wc3ct-form-wrap { background: #f6f6f6; padding: clamp(22px,3vw,34px); }
        .wc3ct-form-title { font-size: clamp(22px,2.4vw,28px); font-weight: 900; letter-spacing: -0.01em; margin: 0 0 6px; color: ${BLACK}; }
        .wc3ct-form-text { font-size: 14.5px; color: ${MUTED}; margin: 0 0 20px; font-weight: 600; }
        .wc3ct-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        @media (max-width: 560px) { .wc3ct-row { grid-template-columns: 1fr; } }
        .wc3ct-input, .wc3ct-area { width: 100%; border: 1px solid ${BORDER}; border-radius: 0; background: #fff; font-family: inherit; font-size: 15px; color: ${BLACK}; padding: 13px 14px; outline: none; transition: box-shadow .2s; }
        .wc3ct-input:focus, .wc3ct-area:focus { box-shadow: 0 0 10px rgba(0,0,0,0.16); }
        .wc3ct-area { min-height: 130px; resize: vertical; margin-bottom: 14px; }
        .wc3ct-submit { border: 0; border-radius: 0; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; color: ${BLACK}; background: ${YELLOW}; padding: 15px 32px; transition: background .2s; }
        .wc3ct-submit:hover { background: #e6b200; }
        .wc3ct-done { display: flex; align-items: center; gap: 12px; background: #fff; border: 1px solid #3a800e; padding: 18px 20px; font-size: 15px; font-weight: 700; color: #3a800e; }
      `}</style>
      <div className="wc3ct-inner">
        <div className="wc3ct-cards">
          {infoCard(
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
            "Zákaznická linka", "phoneLabel", phone, "phone", `tel:${phone.replace(/\s/g, "")}`
          )}
          {infoCard(
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="0"/><path d="m22 7-10 6L2 7"/></svg>,
            "E-mail", "emailLabel", email, "email", `mailto:${email}`
          )}
          {infoCard(
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
            "Sídlo a sklad", "addressLabel", address, "address"
          )}
          {infoCard(
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
            "Jsme vám k dispozici", "hoursLabel", hours, "hours"
          )}
        </div>
        <div className="wc3ct-form-wrap">
          <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="h2" className="wc3ct-form-title" />
          <GenericEditableText sectionId={sectionId} field="formText" value={formText} tag="p" className="wc3ct-form-text" />
          {sent ? (
            <div className="wc3ct-done" role="status">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
              Děkujeme za zprávu! Ozveme se co nejdřív.
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <div className="wc3ct-row">
                <input className="wc3ct-input" type="text" required placeholder="Vaše jméno" aria-label="Jméno" />
                <input className="wc3ct-input" type="email" required placeholder="Váš e-mail" aria-label="E-mail" />
              </div>
              <textarea className="wc3ct-area" required placeholder="S čím vám můžeme pomoci?" aria-label="Zpráva" />
              <button type="submit" className="wc3ct-submit">Odeslat zprávu</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// ── eshop-04-contact ────────────────────────────────────────────────────────────
// Samba kontakt: info karty (radius 12, periwinkle kruhová ikona) vlevo +
// formulář na světlé kartě s periwinkle CTA vpravo. Raleway.
// ──────────────────────────────────────────────────────────────────────────────
function ContactEshop04({ content, sectionId }: {
  content: Record<string, unknown>;
  sectionId: number;
}) {
  const PERI = "#6883ba";
  const SANS = "'Raleway', 'Segoe UI', Arial, sans-serif";

  const phone = String(content.phone ?? "+420 731 222 333");
  const email = String(content.email ?? "dobryden@pastelka.cz");
  const address = String(content.address ?? "Květinová 21, 602 00 Brno");
  const hours = String(content.hours ?? "Po–Pá 9:00–17:00");
  const formTitle = content.formTitle === undefined ? "Napište nám" : String(content.formTitle);
  const formText = content.formText === undefined ? "Odpovídáme do 24 hodin, obvykle mnohem dřív." : String(content.formText);

  const [sent, setSent] = useState(false);

  const infoCard = (icon: React.ReactNode, label: string, labelField: string, value: string, valueField: string, href?: string) => (
    <div className="wc4ct-card">
      <span className="wc4ct-ico" aria-hidden>{icon}</span>
      <div>
        <GenericEditableText sectionId={sectionId} field={labelField} value={label} tag="span" className="wc4ct-label" />
        {href ? (
          <a href={href} className="wc4ct-value"><GenericEditableText sectionId={sectionId} field={valueField} value={value} tag="span" /></a>
        ) : (
          <GenericEditableText sectionId={sectionId} field={valueField} value={value} tag="span" className="wc4ct-value" />
        )}
      </div>
    </div>
  );

  return (
    <section className="wc4ct" data-variant="eshop-04-contact" id="kontakt">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800&display=swap" />
      <style>{`
        .wc4ct { background: #fff; color: #161616; font-family: ${SANS}; }
        .wc4ct-inner { max-width: 1280px; margin: 0 auto; padding: clamp(36px,4.5vw,64px) 20px; display: grid; grid-template-columns: minmax(0,5fr) minmax(0,7fr); gap: clamp(28px,4.5vw,64px); align-items: start; }
        @media (max-width: 900px) { .wc4ct-inner { grid-template-columns: 1fr; } }
        .wc4ct-cards { display: flex; flex-direction: column; gap: 12px; }
        .wc4ct-card { display: flex; align-items: center; gap: 14px; border: 1px solid #e8e8e8; border-radius: 12px; padding: 16px 18px; transition: box-shadow .25s; background: #fff; }
        .wc4ct-card:hover { box-shadow: 0 10px 30px rgba(22,22,22,0.08); }
        .wc4ct-ico { flex-shrink: 0; width: 46px; height: 46px; border-radius: 999px; background: ${PERI}; color: #fff; display: grid; place-items: center; }
        .wc4ct-label { display: block; font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #6f6f6f; margin-bottom: 2px; }
        .wc4ct-value { display: block; font-size: 15.5px; font-weight: 700; color: #161616; text-decoration: none; }
        a.wc4ct-value:hover { color: ${PERI}; }
        .wc4ct-form-wrap { background: #f9f9f9; border-radius: 12px; padding: clamp(22px,3vw,34px); }
        .wc4ct-form-title { font-size: clamp(22px,2.4vw,28px); font-weight: 800; margin: 0 0 6px; color: #161616; }
        .wc4ct-form-text { font-size: 14px; color: #6f6f6f; margin: 0 0 20px; }
        .wc4ct-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        @media (max-width: 560px) { .wc4ct-row { grid-template-columns: 1fr; } }
        .wc4ct-input, .wc4ct-area { width: 100%; border: 1px solid #e8e8e8; border-radius: 8px; background: #fff; font-family: inherit; font-size: 14.5px; color: #161616; padding: 13px 14px; outline: none; transition: border-color .2s, box-shadow .2s; }
        .wc4ct-input:focus, .wc4ct-area:focus { border-color: ${PERI}; box-shadow: 0 0 0 3px rgba(104,131,186,0.14); }
        .wc4ct-area { min-height: 130px; resize: vertical; margin-bottom: 14px; }
        .wc4ct-submit { border: 0; border-radius: 8px; cursor: pointer; font-family: inherit; font-size: 14.5px; font-weight: 600; color: #fff; background: ${PERI}; padding: 15px 32px; transition: background .25s; }
        .wc4ct-submit:hover { background: #566fa3; }
        .wc4ct-done { display: flex; align-items: center; gap: 12px; background: #fff; border: 1px solid ${PERI}; border-radius: 8px; padding: 18px 20px; font-size: 15px; font-weight: 600; color: ${PERI}; }
      `}</style>
      <div className="wc4ct-inner">
        <div className="wc4ct-cards">
          {infoCard(
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
            "Zákaznická linka", "phoneLabel", phone, "phone", `tel:${phone.replace(/\s/g, "")}`
          )}
          {infoCard(
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m22 7-10 6L2 7"/></svg>,
            "E-mail", "emailLabel", email, "email", `mailto:${email}`
          )}
          {infoCard(
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
            "Studio & sklad", "addressLabel", address, "address"
          )}
          {infoCard(
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
            "Jsme tu pro vás", "hoursLabel", hours, "hours"
          )}
        </div>
        <div className="wc4ct-form-wrap">
          <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="h2" className="wc4ct-form-title" />
          <GenericEditableText sectionId={sectionId} field="formText" value={formText} tag="p" className="wc4ct-form-text" />
          {sent ? (
            <div className="wc4ct-done" role="status">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
              Děkujeme za zprávu! Ozveme se co nejdřív.
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <div className="wc4ct-row">
                <input className="wc4ct-input" type="text" required placeholder="Vaše jméno" aria-label="Jméno" />
                <input className="wc4ct-input" type="email" required placeholder="Váš e-mail" aria-label="E-mail" />
              </div>
              <textarea className="wc4ct-area" required placeholder="S čím vám můžeme pomoci?" aria-label="Zpráva" />
              <button type="submit" className="wc4ct-submit">Odeslat zprávu</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════════════════════
 * eshop-05 "Hračkolandia" — Pre-footer contact strip
 * Pompo DNA: red strip, big watermark left, two centered rows
 * ═══════════════════════════════════════════════════════════ */

function ContactEshop05Prefooter({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const c = content as { helpLabel?: string; phone?: string; phoneNote?: string; email?: string; storesCount?: string; storesLabel?: string; storesHref?: string; shippingLabel?: string; siteMode?: string };
  const RED = "#ff3b5c";
  const YELLOW = "#ffc233";
  const SANS = "'Nunito Sans','Segoe UI',Arial,sans-serif";
  const resolve = (href: string) => resolveNavHref(href, String(c.siteMode ?? "multipage"), tenantSlug, isAdmin);

  return (
    <section data-variant="eshop-05-prefooter" style={{ fontFamily: SANS, background: `linear-gradient(100deg, #ff5570 0%, ${RED} 45%)`, position: "relative", overflow: "hidden", padding: "44px 0" }}>
      <style>{`
        .es05-pf-row { display: flex; align-items: center; justify-content: center; gap: 0; flex-wrap: wrap; position: relative; z-index: 1; }
        .es05-pf-cell { display: flex; align-items: center; gap: 12px; padding: 0 28px; color: #fff; text-decoration: none; }
        .es05-pf-cell + .es05-pf-cell { border-left: 1px solid rgba(255,255,255,0.3); }
        a.es05-pf-cell:hover .es05-pf-strong { text-decoration: underline; text-underline-offset: 3px; }
        .es05-pf-strong { font-size: 17px; font-weight: 900; }
        .es05-pf-note { font-size: 13px; font-weight: 600; opacity: 0.85; }
        @media (max-width: 760px) { .es05-pf-cell { border-left: none !important; padding: 8px 14px; } }
      `}</style>
      {/* Watermark star mark left */}
      <svg aria-hidden width="360" height="360" viewBox="0 0 24 24" fill="none" style={{ position: "absolute", left: -70, top: "50%", transform: "translateY(-50%) rotate(-10deg)", opacity: 0.14 }}>
        <path d="M12 2.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 8.2l5.4-.8L12 2.5z" fill="#fff"/>
      </svg>

      <div style={{ maxWidth: 1580, margin: "0 auto", padding: "0 14px" }}>
        {/* Row 1: Poradíme vám | phone | email */}
        <div className="es05-pf-row" style={{ marginBottom: 26 }}>
          {c.helpLabel && (
            <span className="es05-pf-cell">
              <span className="es05-pf-strong">{c.helpLabel}</span>
            </span>
          )}
          {c.phone && (
            <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="es05-pf-cell">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.88.36 1.74.7 2.56a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.82.34 1.68.57 2.56.7A2 2 0 0 1 22 16.92z"/></svg>
              <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
                <span className="es05-pf-strong">{c.phone}</span>
                {c.phoneNote && <span className="es05-pf-note">{c.phoneNote}</span>}
              </span>
            </a>
          )}
          {c.email && (
            <a href={`mailto:${c.email}`} className="es05-pf-cell">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              <span className="es05-pf-strong" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>{c.email}</span>
            </a>
          )}
        </div>

        {/* Row 2: stores badge | shipping */}
        <div className="es05-pf-row">
          {c.storesLabel && (
            <a href={resolve(c.storesHref ?? "/kontakt")} className="es05-pf-cell">
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px",
                background: "#fff", borderRadius: 10, transform: "rotate(-2deg)",
                boxShadow: "0 8px 20px rgba(14,27,44,0.18)",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={YELLOW} strokeWidth="2.4" strokeLinecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" fill={YELLOW} stroke="none"/><circle cx="12" cy="10" r="3" fill="#fff"/></svg>
                <span style={{ fontSize: 20, fontWeight: 1000 as unknown as number, color: "#0e1b2c" }}>{c.storesCount ?? ""}</span>
              </span>
              <span className="es05-pf-strong" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>{c.storesLabel}</span>
            </a>
          )}
          {c.shippingLabel && (
            <span className="es05-pf-cell">
              <span className="es05-pf-strong">{c.shippingLabel}</span>
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

// ── eshop-06-contact ────────────────────────────────────────────────────────────
// Kontakt (Ořeškárna): vlevo kontaktní údaje (telefon/e-mail/hodiny) + karty
// prodejen, vpravo formulář (POST /api/demo/{slug}/contact, honeypot, zelené CTA).
// Mobil: sloupce pod sebou.
function ContactEshop06({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const c = content as Record<string, unknown>;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const title = String(c.title ?? "Napište nám");
  const lead = String(c.lead ?? "");
  const phoneVal = String(c.phone ?? "");
  const emailVal = String(c.email ?? "");
  const hoursVal = String(c.hours ?? "");
  const storesLabel = String(c.storesLabel ?? "Naše prodejny");
  const stores = (c.stores as Array<{ city: string; address: string; hours?: string }>) ?? [];
  const submitText = String(c.submitText ?? "Odeslat zprávu");
  const successText = String(c.successText ?? "Děkujeme za zprávu! Ozveme se do jednoho pracovního dne.");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isAdmin || honeypot || !tenantSlug) return;
    setStatus("sending"); setErrorMsg("");
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message, website: honeypot }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) { setErrorMsg(json.error ?? "Nepodařilo se odeslat zprávu."); setStatus("error"); }
      else { setStatus("success"); setName(""); setEmail(""); setPhone(""); setMessage(""); }
    } catch { setErrorMsg("Nepodařilo se odeslat zprávu. Zkuste to znovu."); setStatus("error"); }
  }

  const CHARCOAL = "#1d1d1b";
  const MUTED = "#7a776f";
  const BORDER = "#eceae6";
  const HEAD = "'Archivo','Helvetica Neue',Arial,sans-serif";
  const SANS = "'Figtree','Segoe UI',Arial,sans-serif";

  return (
    <section data-variant="eshop-06-contact" style={{ fontFamily: SANS, background: "#fff", padding: "26px 0 46px" }}>
      <style>{`
        .es06c-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: clamp(28px, 5vw, 70px); align-items: start; }
        .es06c-row { display: flex; align-items: center; gap: 12px; padding: 9px 0; font-size: 15px; font-weight: 600; color: ${CHARCOAL}; }
        .es06c-row a { color: ${CHARCOAL}; text-decoration: none; }
        .es06c-row a:hover { text-decoration: underline; text-underline-offset: 3px; }
        .es06c-ic { width: 40px; height: 40px; border-radius: 50%; background: #f5f5f2; display: inline-flex; align-items: center; justify-content: center; color: ${CHARCOAL}; flex-shrink: 0; }
        .es06c-store { border: 1.5px solid ${BORDER}; border-radius: 14px; padding: 16px 18px; transition: border-color 0.15s, transform 0.15s; }
        .es06c-store:hover { border-color: ${CHARCOAL}; transform: translateY(-2px); }
        .es06c-label { display: block; font-family: ${HEAD}; font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em; color: ${CHARCOAL}; margin-bottom: 7px; }
        .es06c-input { width: 100%; height: 50px; border: 1.5px solid ${BORDER}; border-radius: 10px; background: #fff; padding: 0 16px; font-family: ${SANS}; font-size: 15px; font-weight: 500; color: ${CHARCOAL}; outline: none; transition: border-color 0.15s; }
        .es06c-input:focus { border-color: ${CHARCOAL}; }
        .es06c-textarea { width: 100%; min-height: 130px; border: 1.5px solid ${BORDER}; border-radius: 10px; background: #fff; padding: 13px 16px; font-family: ${SANS}; font-size: 15px; font-weight: 500; color: ${CHARCOAL}; outline: none; resize: vertical; transition: border-color 0.15s; }
        .es06c-textarea:focus { border-color: ${CHARCOAL}; }
        .es06c-btn { height: 52px; width: 100%; border: none; border-radius: 10px; background: linear-gradient(to bottom, #26b854, #1d9a44); color: #fff; font-family: ${HEAD}; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em; cursor: pointer; box-shadow: 0 2px 10px rgba(29,154,68,0.35); transition: filter 0.15s; }
        .es06c-btn:hover { filter: brightness(1.06); }
        .es06c-btn:disabled { opacity: 0.6; cursor: default; }
        @media (max-width: 860px) { .es06c-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px" }}>
        <div className="es06c-grid">
          <div>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2" style={{ fontFamily: HEAD, fontSize: "clamp(22px, 2.4vw, 30px)", fontWeight: 800, color: CHARCOAL, letterSpacing: "-0.02em", margin: "0 0 12px" }} />
            {lead && <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="p" style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.7, color: "#4c4a44", margin: "0 0 18px", maxWidth: 480 }} />}
            {phoneVal && (
              <div className="es06c-row">
                <span className="es06c-ic"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>
                <a href={`tel:${phoneVal.replace(/\s/g, "")}`}>{phoneVal}</a>
              </div>
            )}
            {emailVal && (
              <div className="es06c-row">
                <span className="es06c-ic"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg></span>
                <a href={`mailto:${emailVal}`}>{emailVal}</a>
              </div>
            )}
            {hoursVal && (
              <div className="es06c-row">
                <span className="es06c-ic"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span>
                <span>{hoursVal}</span>
              </div>
            )}
            {stores.length > 0 && (
              <>
                <h3 style={{ fontFamily: HEAD, fontSize: 15, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: CHARCOAL, margin: "26px 0 12px" }}>{storesLabel}</h3>
                <div style={{ display: "grid", gap: 12 }}>
                  {stores.map((s, i) => (
                    <div key={i} className="es06c-store">
                      <div style={{ fontFamily: HEAD, fontSize: 15, fontWeight: 800, color: CHARCOAL }}>{s.city}</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: MUTED, marginTop: 3 }}>{s.address}</div>
                      {s.hours && <div style={{ fontSize: 13, fontWeight: 600, color: "#188a49", marginTop: 5 }}>{s.hours}</div>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={{ background: "#f5f4f0", borderRadius: 16, padding: "clamp(22px, 3vw, 34px)" }}>
            {status === "success" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#188a49", fontSize: 15.5, fontWeight: 700, padding: "20px 0" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#21a95c"><circle cx="12" cy="12" r="11"/><path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {successText}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label className="es06c-label">Jméno a příjmení</label>
                    <input className="es06c-input" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="es06c-label">Telefon</label>
                    <input className="es06c-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <label className="es06c-label">E-mail</label>
                  <input className="es06c-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div style={{ marginTop: 14 }}>
                  <label className="es06c-label">Zpráva</label>
                  <textarea className="es06c-textarea" value={message} onChange={(e) => setMessage(e.target.value)} required />
                </div>
                <input type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} />
                {status === "error" && <p style={{ color: "#d0453e", fontSize: 13.5, fontWeight: 600, margin: "12px 0 0" }}>{errorMsg}</p>}
                <button type="submit" className="es06c-btn" disabled={status === "sending"} style={{ marginTop: 18 }}>
                  {status === "sending" ? "Odesílám…" : submitText}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── contact-bakery-01 (Kvásek & Káva — warm editorial contact) ────────────────
function ContactBakery01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const DARK = "#393939", MUTED = "#7a7168", ACCENT = "#8b6030";
  const SERIF = "'Josefin Sans', 'Helvetica Neue', sans-serif";
  const SANS = "'Metropolis', 'Inter', sans-serif";
  const c = content as Record<string, unknown>;

  const eyebrowRaw = c.eyebrow, titleRaw = c.title, subtitleRaw = c.subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Ozvěte se nám" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Přijďte na kávu" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Máte dotaz, přání k dortu nebo chcete rezervovat stůl? Napište nám — ozveme se ještě týž den." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());

  const address = String(c.address ?? "Kavčí Hory 8, Praha 4");
  const phone   = String(c.phone   ?? "+420 777 123 456");
  const email   = String(c.email   ?? "ahoj@kvasekakava.cz");
  const hoursTitle = String(c.hoursTitle ?? "Otevírací doba");
  const hours: string[] = Array.isArray(c.hours) ? (c.hours as string[]) : ["Po–Pá · 7:00–19:00", "So–Ne · 8:00–17:00"];
  const mapEmbed = String(c.mapEmbed ?? "https://www.openstreetmap.org/export/embed.html?bbox=14.40%2C50.04%2C14.44%2C50.06&layer=mapnik");
  const formTitle = String(c.formTitle ?? "Napište nám");
  const submitLabel = String(c.submitLabel ?? "Odeslat zprávu");

  const [name, setName] = useState(""); const [em, setEm] = useState("");
  const [ph, setPh] = useState(""); const [msg, setMsg] = useState("");
  const [hp, setHp] = useState(""); const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isAdmin || hp || !tenantSlug) return;
    setStatus("sending");
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/contact`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: em, phone: ph, message: msg, website: hp }),
      });
      if (!res.ok) { setStatus("error"); return; }
      setStatus("success"); setName(""); setEm(""); setPh(""); setMsg("");
    } catch { setStatus("error"); }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "13px 16px", fontFamily: SANS, fontSize: 15, color: DARK,
    background: "#ffffff", border: "1px solid #e6dccc", borderRadius: 2, outline: "none",
  };
  const labelStyle: React.CSSProperties = { fontFamily: SERIF, fontSize: 11, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: DARK, marginBottom: 8, display: "block" };

  return (
    <section data-template="bakery-01" style={{ backgroundColor: "#ffffff", fontFamily: SANS, padding: "clamp(56px, 8vw, 100px) 0" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 clamp(24px, 5vw, 60px)" }}>
        {showHeader && (
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto clamp(44px, 6vw, 64px)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <span style={{ display: "block", width: 30, height: 1, background: "#dcae7a" }} />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" style={{ fontFamily: SERIF, fontSize: "0.78rem", fontWeight: 400, letterSpacing: "0.24em", textTransform: "uppercase", color: ACCENT }} />
              <span style={{ display: "block", width: 30, height: 1, background: "#dcae7a" }} />
            </div>
            <h2 style={{ fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(1.7rem, 3.4vw, 2.6rem)", letterSpacing: "0.1em", textTransform: "uppercase", color: DARK, margin: "0 0 16px" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p style={{ fontSize: "clamp(0.95rem,1.3vw,1.05rem)", lineHeight: 1.8, color: MUTED, margin: 0 }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          </div>
        )}

        <div className="b01-contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "clamp(32px, 5vw, 64px)", alignItems: "start" }}>
          {/* Info + map */}
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 32 }}>
              <div>
                <GenericEditableText sectionId={sectionId} field="addressLabel" value={String(c.addressLabel ?? "Adresa")} tag="span" style={labelStyle} />
                <p style={{ margin: 0, fontSize: 15, color: MUTED }}><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></p>
              </div>
              <div>
                <GenericEditableText sectionId={sectionId} field="phoneLabel" value={String(c.phoneLabel ?? "Telefon")} tag="span" style={labelStyle} />
                <a className="b01-foot-link" href={`tel:${phone.replace(/\s/g,"")}`} style={{ fontSize: 15, color: MUTED, textDecoration: "none" }}><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" /></a>
              </div>
              <div>
                <GenericEditableText sectionId={sectionId} field="emailLabel" value={String(c.emailLabel ?? "E-mail")} tag="span" style={labelStyle} />
                <a className="b01-foot-link" href={`mailto:${email}`} style={{ fontSize: 15, color: MUTED, textDecoration: "none" }}><GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" /></a>
              </div>
              <div>
                <span style={labelStyle}><GenericEditableText sectionId={sectionId} field="hoursTitle" value={hoursTitle} tag="span" /></span>
                {hours.map((h, i) => (
                  <p key={i} style={{ margin: "0 0 4px", fontSize: 15, color: MUTED }}><GenericEditableText sectionId={sectionId} field={`hours.${i}`} value={h} tag="span" /></p>
                ))}
              </div>
            </div>
            <div style={{ border: "1px solid #e6dccc", overflow: "hidden" }}>
              <iframe src={mapEmbed} title="Mapa" style={{ width: "100%", height: 240, border: 0, display: "block", filter: "grayscale(0.3)" }} loading="lazy" />
            </div>
          </div>

          {/* Form */}
          <div style={{ background: "#f7f2ec", padding: "clamp(28px, 4vw, 48px)", border: "1px solid #e6dccc" }}>
            <h3 style={{ fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(1.2rem,2vw,1.6rem)", letterSpacing: "0.08em", textTransform: "uppercase", color: DARK, margin: "0 0 24px" }}>
              <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" />
            </h3>
            {status === "success" ? (
              <p style={{ fontSize: 15, color: ACCENT, lineHeight: 1.7 }}>
                <GenericEditableText sectionId={sectionId} field="successMsg" value={String(c.successMsg ?? "Děkujeme! Vaše zpráva dorazila, ozveme se co nejdřív.")} tag="span" />
              </p>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <input type="text" value={hp} onChange={e=>setHp(e.target.value)} tabIndex={-1} autoComplete="off" style={{ position:"absolute", left:"-9999px" }} aria-hidden />
                <div><GenericEditableText sectionId={sectionId} field="nameLabel" value={String(c.nameLabel ?? "Jméno")} tag="label" style={labelStyle} /><input required value={name} onChange={e=>setName(e.target.value)} style={inputStyle} className="b01-input" /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div><GenericEditableText sectionId={sectionId} field="emailFieldLabel" value={String(c.emailFieldLabel ?? "E-mail")} tag="label" style={labelStyle} /><input type="email" required value={em} onChange={e=>setEm(e.target.value)} style={inputStyle} className="b01-input" /></div>
                  <div><GenericEditableText sectionId={sectionId} field="phoneFieldLabel" value={String(c.phoneFieldLabel ?? "Telefon")} tag="label" style={labelStyle} /><input value={ph} onChange={e=>setPh(e.target.value)} style={inputStyle} className="b01-input" /></div>
                </div>
                <div><GenericEditableText sectionId={sectionId} field="messageLabel" value={String(c.messageLabel ?? "Zpráva")} tag="label" style={labelStyle} /><textarea required value={msg} onChange={e=>setMsg(e.target.value)} rows={5} style={{ ...inputStyle, resize: "vertical" }} className="b01-input" /></div>
                <button type="submit" disabled={status==="sending"} className="b01-btn-primary" style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", color: "#2a1f16", background: "#e7c9a0", border: "none", padding: "16px 34px", cursor: "pointer", alignSelf: "flex-start" }}>
                  <GenericEditableText sectionId={sectionId} field="submitLabel" value={submitLabel} tag="span" />
                </button>
                {status === "error" && <p style={{ fontSize: 14, color: "#b23", margin: 0 }}><GenericEditableText sectionId={sectionId} field="errorMsg" value={String(c.errorMsg ?? "Něco se pokazilo, zkuste to prosím znovu.")} tag="span" /></p>}
              </form>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 800px) { [data-template="bakery-01"] .b01-contact-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// ── artist-01-contact (Kontakt) ──────────────────────────────────────────────────
// Dvousloupec: kontaktní blok (management/booking/PR + social) vlevo, formulář
// vpravo (jméno, e-mail, předmět, zpráva, souhlas, odeslat). Award-level: input
// underline focus, garnet accents, hover na kontaktních řádcích.
// ─────────────────────────────────────────────────────────────────────────────
function ContactArtist01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const eyebrowRaw = (content as Record<string, unknown>).eyebrow;
  const titleRaw   = (content as Record<string, unknown>).title;
  const eyebrow = eyebrowRaw === undefined ? "Kontakt" : String(eyebrowRaw);
  const title   = titleRaw   === undefined ? "Napište mi" : String(titleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim());

  const intro = String(content.intro ?? "Pro nabídky koncertů, spolupráce a média se obracejte na můj tým. Fanouškovské vzkazy čtu ráda osobně.");

  const contacts = (content.contacts as Array<{ label: string; value: string; href?: string }>) ?? [
    { label: "Management & booking", value: "management@viktorielanska.cz", href: "mailto:management@viktorielanska.cz" },
    { label: "Média & PR", value: "media@viktorielanska.cz", href: "mailto:media@viktorielanska.cz" },
    { label: "Telefon (kancelář)", value: "+420 777 123 456", href: "tel:+420777123456" },
    { label: "Sídlo", value: "Dlouhá 12, 110 00 Praha 1" },
  ];

  const nameLabel    = String(content.nameLabel ?? "Jméno a příjmení");
  const emailLabel   = String(content.emailLabel ?? "E-mail");
  const subjectLabel = String(content.subjectLabel ?? "Předmět");
  const messageLabel = String(content.messageLabel ?? "Zpráva");
  const consentLabel = String(content.consentLabel ?? "Souhlasím se zpracováním osobních údajů.");
  const submitLabel  = String(content.submitLabel ?? "Odeslat zprávu");

  const facebook  = String(content.facebook ?? "https://facebook.com/demo");
  const instagram = String(content.instagram ?? "https://instagram.com/demo");
  const youtube   = String(content.youtube ?? "https://youtube.com/@demo");
  const spotify   = String(content.spotify ?? "https://open.spotify.com/artist/demo");
  const socialTitle = String(content.socialTitle ?? "Sledujte mě");

  const RED = "#9b1c31";
  const socials = [
    { href: facebook,  label: "Facebook",  path: "M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.25-1.5 1.55-1.5H17V4.6c-.3 0-1.3-.1-2.45-.1-2.4 0-4.05 1.47-4.05 4.17v2.33H7.8V14h2.7v8h3z" },
    { href: instagram, label: "Instagram", path: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zM17.5 6a1 1 0 1 1-1 1 1 1 0 0 1 1-1z" },
    { href: youtube,   label: "YouTube",   path: "M21.6 7.2s-.2-1.36-.8-1.96c-.76-.8-1.6-.8-2-.85C16 4.1 12 4.1 12 4.1s-4 0-6.8.24c-.4.05-1.24.05-2 .85-.6.6-.8 1.96-.8 1.96S2 8.8 2 10.4v1.5c0 1.6.2 3.2.2 3.2s.2 1.36.8 1.96c.76.8 1.76.77 2.2.86 1.6.15 6.8.2 6.8.2s4 0 6.8-.25c.4-.05 1.24-.05 2-.85.6-.6.8-1.96.8-1.96s.2-1.6.2-3.2v-1.5c0-1.6-.2-3.2-.2-3.2zM9.9 14.6V8.9l5.2 2.86-5.2 2.84z" },
    { href: spotify,   label: "Spotify",   path: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.42a.62.62 0 0 1-.86.2c-2.35-1.44-5.3-1.76-8.79-.96a.62.62 0 1 1-.28-1.22c3.8-.87 7.08-.5 9.72 1.12.3.18.39.57.21.86zm1.23-2.74a.78.78 0 0 1-1.07.26c-2.69-1.65-6.79-2.13-9.97-1.17a.78.78 0 1 1-.45-1.5c3.63-1.09 8.15-.55 11.24 1.34.37.23.49.71.25 1.07zm.11-2.85c-3.23-1.92-8.55-2.1-11.63-1.16a.94.94 0 1 1-.54-1.8c3.54-1.07 9.42-.86 13.13 1.34a.94.94 0 0 1-.96 1.62z" },
  ];

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Roboto:wght@300;400;500;700&display=swap" />
      <style>{`
        .ar01-ct { background: #fff; padding: 96px 40px; }
        .ar01-ct-wrap { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 72px; }
        .ar01-ct-eyebrow { display: block; font-family: 'Roboto', sans-serif; font-size: 13px; font-weight: 500; letter-spacing: .34em; text-transform: uppercase; color: ${RED}; margin-bottom: 14px; }
        .ar01-ct-title { font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: clamp(34px,4.4vw,52px); font-weight: 600; color: #14100e; margin: 0 0 18px; line-height: 1.03; }
        .ar01-ct-intro { font-family: 'Roboto', sans-serif; font-size: 16px; line-height: 28px; color: #4b423d; margin: 0 0 34px; }
        .ar01-ct-list { list-style: none; margin: 0 0 32px; padding: 0; }
        .ar01-ct-item { padding: 16px 0; border-top: 1px solid #ece3d6; }
        .ar01-ct-item:last-child { border-bottom: 1px solid #ece3d6; }
        .ar01-ct-label { font-family: 'Roboto', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: .16em; text-transform: uppercase; color: #9a8f84; margin-bottom: 5px; }
        .ar01-ct-value { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; font-weight: 500; color: #14100e; text-decoration: none; transition: color .3s linear; }
        a.ar01-ct-value:hover { color: ${RED}; }
        .ar01-ct-social-t { font-family: 'Roboto', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: .16em; text-transform: uppercase; color: #9a8f84; margin-bottom: 12px; }
        .ar01-ct-social { display: flex; gap: 14px; }
        .ar01-ct-social a { width: 42px; height: 42px; border-radius: 50%; background: #14100e; color: #fff; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: background-color .3s cubic-bezier(.32,.72,0,1), transform .35s cubic-bezier(.32,.72,0,1); }
        .ar01-ct-social a:hover { background: ${RED}; transform: translateY(-4px); }
        .ar01-ct-social svg { width: 18px; height: 18px; }
        .ar01-ct-form { background: #faf7f2; padding: 44px; border: 1px solid #ece3d6; }
        .ar01-ct-row { display: grid; grid-template-columns: 1fr 1fr; gap: 26px; }
        .ar01-ct-field { position: relative; margin-bottom: 26px; }
        .ar01-ct-field label { display: block; font-family: 'Roboto', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: .14em; text-transform: uppercase; color: #6b6258; margin-bottom: 8px; }
        .ar01-ct-field input, .ar01-ct-field textarea {
          width: 100%; box-sizing: border-box; background: transparent; border: none; border-bottom: 1.5px solid #d9cfc2;
          font-family: 'Roboto', sans-serif; font-size: 16px; color: #14100e; padding: 8px 0; outline: none;
          transition: border-color .35s cubic-bezier(.32,.72,0,1);
        }
        .ar01-ct-field textarea { resize: vertical; min-height: 110px; }
        .ar01-ct-field input:focus, .ar01-ct-field textarea:focus { border-bottom-color: ${RED}; }
        .ar01-ct-consent { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 26px; }
        .ar01-ct-consent input { margin-top: 3px; accent-color: ${RED}; }
        .ar01-ct-consent span { font-family: 'Roboto', sans-serif; font-size: 13px; line-height: 20px; color: #6b6258; }
        .ar01-ct-submit {
          position: relative; overflow: hidden; width: 100%;
          font-family: 'Roboto', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
          color: #fff; background: ${RED}; border: none; cursor: pointer; padding: 16px; border-radius: 50px;
          transition: box-shadow .4s cubic-bezier(.32,.72,0,1);
          box-shadow: 0 12px 26px -12px rgba(155,28,49,.7);
        }
        .ar01-ct-submit::before { content: ""; position: absolute; inset: 0; background: #14100e; transform: translateY(101%); transition: transform .45s cubic-bezier(.32,.72,0,1); }
        .ar01-ct-submit span { position: relative; z-index: 1; }
        .ar01-ct-submit:hover::before { transform: translateY(0); }
        @media (max-width: 900px) { .ar01-ct-wrap { grid-template-columns: 1fr; gap: 48px; max-width: 560px; } }
        @media (max-width: 560px) { .ar01-ct { padding: 64px 22px; } .ar01-ct-form { padding: 28px 22px; } .ar01-ct-row { grid-template-columns: 1fr; gap: 0; } }
      `}</style>

      <section className="ar01-ct" data-template="artist-01" id="kontakt">
        <div className="ar01-ct-wrap">
          <div className="ar01-ct-info">
            {showHeader && (
              <>
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" className="ar01-ct-eyebrow" />
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2" className="ar01-ct-title" />
              </>
            )}
            <GenericEditableText sectionId={sectionId} field="intro" value={intro} tag="p" className="ar01-ct-intro" />
            <ul className="ar01-ct-list">
              {contacts.map((ct, i) => (
                <li className="ar01-ct-item" key={i}>
                  <GenericEditableText sectionId={sectionId} field={`contacts.${i}.label`} value={String(ct.label)} tag="div" className="ar01-ct-label" />
                  {ct.href ? (
                    <a href={ct.href} className="ar01-ct-value"><GenericEditableText sectionId={sectionId} field={`contacts.${i}.value`} value={String(ct.value)} tag="span">{ct.value}</GenericEditableText></a>
                  ) : (
                    <GenericEditableText sectionId={sectionId} field={`contacts.${i}.value`} value={String(ct.value)} tag="div" className="ar01-ct-value" />
                  )}
                </li>
              ))}
            </ul>
            <div className="ar01-ct-social-t"><GenericEditableText sectionId={sectionId} field="socialTitle" value={socialTitle} tag="span">{socialTitle}</GenericEditableText></div>
            <div className="ar01-ct-social">
              {socials.map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener" aria-label={s.label}><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={s.path} /></svg></a>
              ))}
            </div>
          </div>

          <form className="ar01-ct-form" onSubmit={(e) => e.preventDefault()}>
            <div className="ar01-ct-row">
              <div className="ar01-ct-field">
                <label><GenericEditableText sectionId={sectionId} field="nameLabel" value={nameLabel} tag="span">{nameLabel}</GenericEditableText></label>
                <input type="text" name="name" autoComplete="name" />
              </div>
              <div className="ar01-ct-field">
                <label><GenericEditableText sectionId={sectionId} field="emailLabel" value={emailLabel} tag="span">{emailLabel}</GenericEditableText></label>
                <input type="email" name="email" autoComplete="email" />
              </div>
            </div>
            <div className="ar01-ct-field">
              <label><GenericEditableText sectionId={sectionId} field="subjectLabel" value={subjectLabel} tag="span">{subjectLabel}</GenericEditableText></label>
              <input type="text" name="subject" />
            </div>
            <div className="ar01-ct-field">
              <label><GenericEditableText sectionId={sectionId} field="messageLabel" value={messageLabel} tag="span">{messageLabel}</GenericEditableText></label>
              <textarea name="message" />
            </div>
            <label className="ar01-ct-consent">
              <input type="checkbox" />
              <GenericEditableText sectionId={sectionId} field="consentLabel" value={consentLabel} tag="span">{consentLabel}</GenericEditableText>
            </label>
            <button type="submit" className="ar01-ct-submit">
              <GenericEditableText sectionId={sectionId} field="submitLabel" value={submitLabel} tag="span">{submitLabel}</GenericEditableText>
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

// ══ PROOF (proof-01) — poptávkový formulář se success/error stavem ═════════════
function ContactProof01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const eyebrow  = String(content.eyebrow  ?? "Poptávka");
  const heading  = String(content.heading  ?? "Řekněte nám, co potřebujete");
  const subheading = String(content.subheading ?? "Ozveme se do 24 hodin s orientační cenou a nejbližším volným termínem. Nezávazně a zdarma.");
  const phone    = String(content.phone    ?? "+420 704 123 456");
  const email    = String(content.email    ?? "poptavka@demo.cz");
  const address  = String(content.address  ?? "Ukázková 123, 110 00 Praha 1");
  const hours    = String(content.hours    ?? "Po–Pá 8:00–18:00, So 9:00–14:00");
  const areaLabel = String(content.areaLabel ?? "Oblast působnosti");
  const area     = String(content.area ?? "Praha a Středočeský kraj do 40 km");
  const formTitle = String(content.formTitle ?? "Nezávazná poptávka");
  const nameLabel = String(content.nameLabel ?? "Jméno a příjmení");
  const phoneLabel = String(content.phoneLabel ?? "Telefon");
  const emailLabel = String(content.emailLabel ?? "E-mail");
  const messageLabel = String(content.messageLabel ?? "Popište, s čím vám můžeme pomoci");
  const consentLabel = String(content.consentLabel ?? "Souhlasím se zpracováním osobních údajů za účelem vyřízení poptávky.");
  const submitLabel = String(content.submitLabel ?? "Odeslat poptávku");
  const successTitle = String(content.successTitle ?? "Děkujeme, poptávka odešla.");
  const successBody  = String(content.successBody ?? "Ozveme se vám do 24 hodin. Pro urgentní zakázky nám rovnou zavolejte.");

  const [name, setName] = useState("");
  const [email2, setEmail2] = useState("");
  const [phone2, setPhone2] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isAdmin) return;
    if (honeypot) return;
    if (!consent) { setErrorMsg("Pro odeslání potvrďte souhlas se zpracováním údajů."); setStatus("error"); return; }
    if (!message.trim()) { setErrorMsg("Popište prosím, s čím vám můžeme pomoci."); setStatus("error"); return; }
    if (!tenantSlug) { setStatus("success"); return; }
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: email2, phone: phone2, message, website: honeypot }),
      });
      const json = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) { setErrorMsg(json.error ?? "Nepodařilo se odeslat poptávku."); setStatus("error"); }
      else { setStatus("success"); setName(""); setEmail2(""); setPhone2(""); setMessage(""); setConsent(false); }
    } catch {
      setErrorMsg("Nepodařilo se odeslat poptávku. Zkuste to znovu, nebo nám zavolejte.");
      setStatus("error");
    }
  }

  const infoRows: Array<{ icon: React.ReactNode; label: string; value: string; href?: string }> = [
    { label: phoneLabel, value: phone, href: `tel:${phone.replace(/\s/g, "")}`, icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/> },
    { label: emailLabel, value: email, href: `mailto:${email}`, icon: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/></> },
    { label: "Adresa", value: address, icon: <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></> },
    { label: "Provozní doba", value: hours, icon: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></> },
  ];

  return (
    <>
      <style>{`
        .pf01ct { --pf-accent:#C3352B; --pf-ink:#1B3A5C; --pf-muted:#6A6E78; --pf-border:#E5E1D8; --pf-surface:#fff;
          background:var(--pf-ink); color:#fff; font-family:var(--font-body, system-ui, -apple-system, sans-serif);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .pf01ct-inner { max-width:1180px; margin:0 auto; display:grid; grid-template-columns:0.9fr 1.1fr; gap:clamp(32px,5vw,64px); align-items:start; }
        .pf01ct .pf01-eyebrow{ font-size:.78rem; font-weight:800; letter-spacing:.16em; text-transform:uppercase; color:var(--pf-accent); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .pf01ct .pf01-eyebrow::before{ content:''; width:32px; height:2px; background:#F0A498; }
        .pf01ct-title { font-family:var(--font-heading, system-ui, sans-serif); color:#fff; font-size:clamp(1.8rem,3.4vw,2.6rem); font-weight:800; letter-spacing:-.02em; line-height:1.1; margin:0 0 14px; }
        .pf01ct-sub { font-size:1.02rem; color:rgba(255,255,255,.8); line-height:1.6; margin:0 0 30px; }
        .pf01ct-info { display:grid; gap:16px; margin-bottom:26px; }
        .pf01ct-row { display:flex; align-items:flex-start; gap:14px; }
        .pf01ct-row-ic { width:42px; height:42px; border-radius:6px; background:rgba(195,53,43,.16); color:var(--pf-accent); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .pf01ct-row-lbl { font-size:.76rem; letter-spacing:.06em; text-transform:uppercase; color:rgba(255,255,255,.72); }
        .pf01ct-row-val { font-weight:700; color:#fff; text-decoration:none; }
        a.pf01ct-row-val:hover { color:var(--pf-accent); }
        .pf01ct-area { border-top:1px solid rgba(255,255,255,.12); padding-top:20px; }
        .pf01ct-area-lbl { font-size:.76rem; letter-spacing:.06em; text-transform:uppercase; color:rgba(255,255,255,.72); margin:0 0 6px; }
        .pf01ct-area-val { font-weight:700; }
        .pf01ct-card { background:var(--pf-surface); border-radius:12px; padding:clamp(24px,3vw,36px); color:var(--pf-ink); box-shadow:0 14px 40px -22px rgba(0,0,0,.35); }
        .pf01ct-card-title { font-family:var(--font-heading, system-ui, sans-serif); color:var(--pf-ink); font-size:1.2rem; font-weight:800; letter-spacing:-.01em; margin:0 0 20px; }
        .pf01ct-field { margin-bottom:16px; }
        .pf01ct-field label { display:block; font-size:.82rem; font-weight:700; color:var(--pf-ink); margin-bottom:6px; }
        .pf01ct-field input, .pf01ct-field textarea { width:100%; padding:12px 14px; border:1.5px solid var(--pf-border); border-radius:10px; font-family:inherit; font-size:.96rem; color:var(--pf-ink); background:#fff; transition:border-color .18s, box-shadow .18s; }
        .pf01ct-field input:focus, .pf01ct-field textarea:focus { outline:none; border-color:var(--pf-accent); box-shadow:0 0 0 3px rgba(195,53,43,.15); }
        .pf01ct-field textarea { min-height:110px; resize:vertical; }
        .pf01ct-2col { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .pf01ct-consent { display:flex; align-items:flex-start; gap:9px; font-size:.85rem; color:var(--pf-muted); line-height:1.45; margin:4px 0 18px; }
        .pf01ct-consent input { margin-top:3px; accent-color:var(--pf-accent); flex-shrink:0; }
        .pf01ct-submit { width:100%; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:15px; background:var(--pf-accent); color:#fff; font-weight:700; font-size:1rem; border:none; border-radius:6px; cursor:pointer; font-family:inherit; transition:transform .2s, box-shadow .2s, filter .2s; }
        .pf01ct-submit:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 14px 28px -12px rgba(195,53,43,.7); }
        .pf01ct-submit:disabled { opacity:.6; cursor:not-allowed; }
        .pf01ct-err { background:#fdecea; color:#b3261e; border:1px solid #f5c6c2; border-radius:9px; padding:11px 14px; font-size:.88rem; margin-bottom:14px; }
        .pf01ct-hp { position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden; }
        .pf01ct-success { text-align:center; padding:24px 8px; }
        .pf01ct-success-ic { width:64px; height:64px; border-radius:50%; background:rgba(195,53,43,.12); color:var(--pf-accent); display:flex; align-items:center; justify-content:center; margin:0 auto 18px; }
        .pf01ct-success h3 { font-family:var(--font-heading, system-ui, sans-serif); color:var(--pf-ink); font-size:1.35rem; font-weight:800; margin:0 0 8px; }
        .pf01ct-success p { color:var(--pf-muted); line-height:1.6; margin:0; }
        @media (max-width:820px){ .pf01ct-inner{ grid-template-columns:1fr; } .pf01ct-2col{ grid-template-columns:1fr; } }
        @media (prefers-reduced-motion: reduce){ .pf01ct-submit,.pf01ct-field input,.pf01ct-field textarea{ transition:none; } }
      `}</style>
      <section className="pf01ct" data-template="proof-01" id="poptavka">
        <div className="pf01ct-inner">
          <div>
            <p className="pf01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="pf01ct-title"><GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" /></h2>
            <p className="pf01ct-sub"><GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" /></p>
            <div className="pf01ct-info">
              {infoRows.map((r, i) => (
                <div key={i} className="pf01ct-row">
                  <span className="pf01ct-row-ic">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{r.icon}</svg>
                  </span>
                  <span>
                    <span className="pf01ct-row-lbl" style={{ display: "block" }}>{r.label}</span>
                    {r.href
                      ? <a href={r.href} className="pf01ct-row-val">{r.value}</a>
                      : <span className="pf01ct-row-val">{r.value}</span>}
                  </span>
                </div>
              ))}
            </div>
            <div className="pf01ct-area">
              <p className="pf01ct-area-lbl"><GenericEditableText sectionId={sectionId} field="areaLabel" value={areaLabel} tag="span" /></p>
              <p className="pf01ct-area-val" style={{ margin: 0 }}><GenericEditableText sectionId={sectionId} field="area" value={area} tag="span" /></p>
            </div>
          </div>

          <div className="pf01ct-card">
            {status === "success" ? (
              <div className="pf01ct-success" role="status" aria-live="polite">
                <span className="pf01ct-success-ic">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                </span>
                <h3><GenericEditableText sectionId={sectionId} field="successTitle" value={successTitle} tag="span" /></h3>
                <p><GenericEditableText sectionId={sectionId} field="successBody" value={successBody} tag="span" /></p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h3 className="pf01ct-card-title"><GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" /></h3>
                {status === "error" && <div className="pf01ct-err" role="alert">{errorMsg}</div>}
                <div className="pf01ct-field">
                  <label htmlFor={`pf01-name-${sectionId}`}><GenericEditableText sectionId={sectionId} field="nameLabel" value={nameLabel} tag="span" /></label>
                  <input id={`pf01-name-${sectionId}`} type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
                </div>
                <div className="pf01ct-2col">
                  <div className="pf01ct-field">
                    <label htmlFor={`pf01-phone-${sectionId}`}><GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span" /></label>
                    <input id={`pf01-phone-${sectionId}`} type="tel" name="phone" value={phone2} onChange={(e) => setPhone2(e.target.value)} autoComplete="tel" />
                  </div>
                  <div className="pf01ct-field">
                    <label htmlFor={`pf01-email-${sectionId}`}><GenericEditableText sectionId={sectionId} field="emailLabel" value={emailLabel} tag="span" /></label>
                    <input id={`pf01-email-${sectionId}`} type="email" name="email" value={email2} onChange={(e) => setEmail2(e.target.value)} required autoComplete="email" />
                  </div>
                </div>
                <div className="pf01ct-field">
                  <label htmlFor={`pf01-msg-${sectionId}`}><GenericEditableText sectionId={sectionId} field="messageLabel" value={messageLabel} tag="span" /></label>
                  <textarea id={`pf01-msg-${sectionId}`} name="message" value={message} onChange={(e) => setMessage(e.target.value)} required />
                </div>
                <div className="pf01ct-hp" aria-hidden="true">
                  <label>Web<input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} /></label>
                </div>
                <label className="pf01ct-consent">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                  <GenericEditableText sectionId={sectionId} field="consentLabel" value={consentLabel} tag="span" />
                </label>
                <button type="submit" className="pf01ct-submit" disabled={status === "sending" || isAdmin}>
                  {status === "sending" ? "Odesílám…" : <GenericEditableText sectionId={sectionId} field="submitLabel" value={submitLabel} tag="span" />}
                  {status !== "sending" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// ══ SIGNAL — Swiss authority (signal-01) ══════════════════════════════════════
// Konzultace: charcoal panel s info řádky + bílá karta s formulářem (jméno,
// společnost, e-mail, telefon, select Co řešíte, zpráva, GDPR, honeypot).
function ContactSignal01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const eyebrow  = String(content.eyebrow  ?? "Konzultace");
  const heading  = String(content.heading  ?? "Rezervujte si 30 minut s partnerem");
  const subheading = String(content.subheading ?? "Popíšete situaci, my řekneme, jak bychom postupovali a co by to přineslo. Prvních 30 minut zdarma a bez závazku.");
  const phone    = String(content.phone    ?? "+420 704 123 456");
  const email    = String(content.email    ?? "poptavka@demo.cz");
  const address  = String(content.address  ?? "Ukázková 123, 110 00 Praha 1");
  const hours    = String(content.hours    ?? "Po–Pá 9:00–18:00");
  const icoLabel = String(content.icoLabel ?? "Fakturační údaje");
  const ico      = String(content.ico ?? "IČO 12345678 · vedeno u MS v Praze");
  const formTitle = String(content.formTitle ?? "Nezávazná konzultace");
  const nameLabel = String(content.nameLabel ?? "Jméno a příjmení");
  const companyLabel = String(content.companyLabel ?? "Společnost");
  const phoneLabel = String(content.phoneLabel ?? "Telefon");
  const emailLabel = String(content.emailLabel ?? "Pracovní e-mail");
  const topicLabel = String(content.topicLabel ?? "Co řešíte");
  const rawTopics = content.topics as string[] | undefined;
  const topics = rawTopics && rawTopics.length ? rawTopics : ["Strategie a růst", "Finance a controlling", "Compliance a právo", "Procesy a provoz", "Jiné"];
  const messageLabel = String(content.messageLabel ?? "Stručně popište situaci");
  const consentLabel = String(content.consentLabel ?? "Souhlasím se zpracováním osobních údajů za účelem vyřízení poptávky.");
  const submitLabel = String(content.submitLabel ?? "Rezervovat konzultaci");
  const successTitle = String(content.successTitle ?? "Děkujeme, poptávka odešla.");
  const successBody  = String(content.successBody ?? "Do 24 hodin se ozve partner odpovědný za vaši oblast a domluvíte si termín konzultace.");

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email2, setEmail2] = useState("");
  const [phone2, setPhone2] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isAdmin) return;
    if (honeypot) return;
    if (!consent) { setErrorMsg("Pro odeslání potvrďte souhlas se zpracováním údajů."); setStatus("error"); return; }
    if (!message.trim()) { setErrorMsg("Popište prosím stručně, co řešíte."); setStatus("error"); return; }
    if (!tenantSlug) { setStatus("success"); return; }
    setStatus("sending");
    setErrorMsg("");
    const composed = [
      topic ? `Co řešíme: ${topic}` : "",
      company ? `Společnost: ${company}` : "",
      "",
      message,
    ].filter((l, i) => l !== "" || i === 2).join("\n");
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: email2, phone: phone2, message: composed, website: honeypot }),
      });
      const json = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) { setErrorMsg(json.error ?? "Nepodařilo se odeslat poptávku."); setStatus("error"); }
      else { setStatus("success"); setName(""); setCompany(""); setEmail2(""); setPhone2(""); setTopic(""); setMessage(""); setConsent(false); }
    } catch {
      setErrorMsg("Nepodařilo se odeslat poptávku. Zkuste to znovu, nebo nám zavolejte.");
      setStatus("error");
    }
  }

  const infoRows: Array<{ icon: React.ReactNode; label: string; value: string; href?: string }> = [
    { label: "Telefon", value: phone, href: `tel:${phone.replace(/\s/g, "")}`, icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/> },
    { label: "E-mail", value: email, href: `mailto:${email}`, icon: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/></> },
    { label: "Kancelář", value: address, icon: <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></> },
    { label: "K zastižení", value: hours, icon: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></> },
  ];

  return (
    <>
      <style>{`
        .sg01ct { --sg-accent:#2563EB; --sg-accent-lt:#6EA8FE; --sg-ink:#101418; --sg-muted:#5B6472; --sg-border:#E3E7EB;
          background:var(--sg-ink); color:#fff; font-family:var(--font-body, system-ui, -apple-system, sans-serif);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .sg01ct-inner { max-width:1180px; margin:0 auto; display:grid; grid-template-columns:0.9fr 1.1fr; gap:clamp(32px,5vw,64px); align-items:start; }
        .sg01ct .sg01-eyebrow{ font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.76rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--sg-accent-lt); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .sg01ct .sg01-eyebrow::before{ content:''; width:32px; height:2px; background:var(--sg-accent-lt); }
        .sg01ct-title { font-family:var(--font-heading, system-ui, sans-serif); color:#fff; font-size:clamp(1.8rem,3.4vw,2.6rem); font-weight:600; letter-spacing:.01em; line-height:1.1; margin:0 0 14px; }
        .sg01ct-sub { font-size:1.02rem; color:rgba(255,255,255,.8); line-height:1.6; margin:0 0 30px; }
        .sg01ct-info { display:grid; gap:16px; margin-bottom:26px; }
        .sg01ct-row { display:flex; align-items:flex-start; gap:14px; }
        .sg01ct-row-ic { width:42px; height:42px; border-radius:6px; background:rgba(37,99,235,.2); color:var(--sg-accent-lt); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .sg01ct-row-lbl { font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.72rem; letter-spacing:.08em; text-transform:uppercase; color:rgba(255,255,255,.72); }
        .sg01ct-row-val { font-weight:700; color:#fff; text-decoration:none; }
        a.sg01ct-row-val:hover { color:var(--sg-accent-lt); }
        .sg01ct-ico { border-top:1px solid rgba(255,255,255,.12); padding-top:20px; }
        .sg01ct-ico-lbl { font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.72rem; letter-spacing:.08em; text-transform:uppercase; color:rgba(255,255,255,.72); margin:0 0 6px; }
        .sg01ct-ico-val { font-weight:700; }
        .sg01ct-card { background:#fff; border-radius:12px; padding:clamp(24px,3vw,36px); color:var(--sg-ink); box-shadow:0 14px 40px -22px rgba(0,0,0,.35); }
        .sg01ct-card-title { font-family:var(--font-heading, system-ui, sans-serif); color:var(--sg-ink); font-size:1.22rem; font-weight:600; letter-spacing:.01em; margin:0 0 20px; }
        .sg01ct-field { margin-bottom:16px; }
        .sg01ct-field label { display:block; font-size:.82rem; font-weight:700; color:var(--sg-ink); margin-bottom:6px; }
        .sg01ct-field input, .sg01ct-field textarea, .sg01ct-field select { width:100%; padding:12px 14px; border:1.5px solid var(--sg-border); border-radius:8px; font-family:inherit; font-size:.96rem; color:var(--sg-ink); background:#fff; transition:border-color .18s, box-shadow .18s; }
        .sg01ct-field input:focus, .sg01ct-field textarea:focus, .sg01ct-field select:focus { outline:none; border-color:var(--sg-accent); box-shadow:0 0 0 3px rgba(37,99,235,.15); }
        .sg01ct-field textarea { min-height:110px; resize:vertical; }
        .sg01ct-field select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%235B6472' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; cursor:pointer; }
        .sg01ct-2col { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .sg01ct-consent { display:flex; align-items:flex-start; gap:9px; font-size:.85rem; color:var(--sg-muted); line-height:1.45; margin:4px 0 18px; }
        .sg01ct-consent input { margin-top:3px; accent-color:var(--sg-accent); flex-shrink:0; }
        .sg01ct-submit { width:100%; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:15px; background:var(--sg-accent); color:#fff; font-weight:700; font-size:1rem; border:none; border-radius:6px; cursor:pointer; font-family:inherit; transition:transform .2s, box-shadow .2s, filter .2s; }
        .sg01ct-submit:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 14px 28px -12px rgba(37,99,235,.7); }
        .sg01ct-submit:disabled { opacity:.6; cursor:not-allowed; }
        .sg01ct-err { background:#fdecea; color:#b3261e; border:1px solid #f5c6c2; border-radius:8px; padding:11px 14px; font-size:.88rem; margin-bottom:14px; }
        .sg01ct-hp { position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden; }
        .sg01ct-success { text-align:center; padding:24px 8px; }
        .sg01ct-success-ic { width:64px; height:64px; border-radius:50%; background:rgba(37,99,235,.12); color:var(--sg-accent); display:flex; align-items:center; justify-content:center; margin:0 auto 18px; }
        .sg01ct-success h3 { font-family:var(--font-heading, system-ui, sans-serif); color:var(--sg-ink); font-size:1.35rem; font-weight:600; margin:0 0 8px; }
        .sg01ct-success p { color:var(--sg-muted); line-height:1.6; margin:0; }
        @media (max-width:820px){ .sg01ct-inner{ grid-template-columns:1fr; } .sg01ct-2col{ grid-template-columns:1fr; } }
        @media (prefers-reduced-motion: reduce){ .sg01ct-submit,.sg01ct-field input,.sg01ct-field textarea{ transition:none; } }
      `}</style>
      <section className="sg01ct" data-template="signal-01" id="konzultace">
        <div className="sg01ct-inner">
          <div>
            <p className="sg01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="sg01ct-title"><GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" /></h2>
            <p className="sg01ct-sub"><GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" /></p>
            <div className="sg01ct-info">
              {infoRows.map((r, i) => (
                <div key={i} className="sg01ct-row">
                  <span className="sg01ct-row-ic">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{r.icon}</svg>
                  </span>
                  <span>
                    <span className="sg01ct-row-lbl" style={{ display: "block" }}>{r.label}</span>
                    {r.href
                      ? <a href={r.href} className="sg01ct-row-val">{r.value}</a>
                      : <span className="sg01ct-row-val">{r.value}</span>}
                  </span>
                </div>
              ))}
            </div>
            <div className="sg01ct-ico">
              <p className="sg01ct-ico-lbl"><GenericEditableText sectionId={sectionId} field="icoLabel" value={icoLabel} tag="span" /></p>
              <p className="sg01ct-ico-val" style={{ margin: 0 }}><GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" /></p>
            </div>
          </div>

          <div className="sg01ct-card">
            {status === "success" ? (
              <div className="sg01ct-success" role="status" aria-live="polite">
                <span className="sg01ct-success-ic">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                </span>
                <h3><GenericEditableText sectionId={sectionId} field="successTitle" value={successTitle} tag="span" /></h3>
                <p><GenericEditableText sectionId={sectionId} field="successBody" value={successBody} tag="span" /></p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h3 className="sg01ct-card-title"><GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" /></h3>
                {status === "error" && <div className="sg01ct-err" role="alert">{errorMsg}</div>}
                <div className="sg01ct-2col">
                  <div className="sg01ct-field">
                    <label htmlFor={`sg01-name-${sectionId}`}><GenericEditableText sectionId={sectionId} field="nameLabel" value={nameLabel} tag="span" /></label>
                    <input id={`sg01-name-${sectionId}`} type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
                  </div>
                  <div className="sg01ct-field">
                    <label htmlFor={`sg01-company-${sectionId}`}><GenericEditableText sectionId={sectionId} field="companyLabel" value={companyLabel} tag="span" /></label>
                    <input id={`sg01-company-${sectionId}`} type="text" name="company" value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" />
                  </div>
                </div>
                <div className="sg01ct-2col">
                  <div className="sg01ct-field">
                    <label htmlFor={`sg01-email-${sectionId}`}><GenericEditableText sectionId={sectionId} field="emailLabel" value={emailLabel} tag="span" /></label>
                    <input id={`sg01-email-${sectionId}`} type="email" name="email" value={email2} onChange={(e) => setEmail2(e.target.value)} required autoComplete="email" />
                  </div>
                  <div className="sg01ct-field">
                    <label htmlFor={`sg01-phone-${sectionId}`}><GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span" /></label>
                    <input id={`sg01-phone-${sectionId}`} type="tel" name="phone" value={phone2} onChange={(e) => setPhone2(e.target.value)} autoComplete="tel" />
                  </div>
                </div>
                <div className="sg01ct-field">
                  <label htmlFor={`sg01-topic-${sectionId}`}><GenericEditableText sectionId={sectionId} field="topicLabel" value={topicLabel} tag="span" /></label>
                  <select id={`sg01-topic-${sectionId}`} name="topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
                    <option value="">— Vyberte oblast —</option>
                    {topics.map((t, i) => (
                      <option key={i} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="sg01ct-field">
                  <label htmlFor={`sg01-msg-${sectionId}`}><GenericEditableText sectionId={sectionId} field="messageLabel" value={messageLabel} tag="span" /></label>
                  <textarea id={`sg01-msg-${sectionId}`} name="message" value={message} onChange={(e) => setMessage(e.target.value)} required />
                </div>
                <div className="sg01ct-hp" aria-hidden="true">
                  <label>Web<input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} /></label>
                </div>
                <label className="sg01ct-consent">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                  <GenericEditableText sectionId={sectionId} field="consentLabel" value={consentLabel} tag="span" />
                </label>
                <button type="submit" className="sg01ct-submit" disabled={status === "sending" || isAdmin}>
                  {status === "sending" ? "Odesílám…" : <GenericEditableText sectionId={sectionId} field="submitLabel" value={submitLabel} tag="span" />}
                  {status !== "sending" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
