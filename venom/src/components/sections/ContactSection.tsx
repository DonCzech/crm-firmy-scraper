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

export function ContactSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  if (variant === "ananda-01-contact") {
    return <ContactAnanda01 content={content} sectionId={sectionId} />;
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
    return <ContactTattoo03 content={content} sectionId={sectionId} />;
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
    return <ContactRestaurant01 content={content} sectionId={sectionId} />;
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
  if (variant === "ortho-01-contact")      return <ContactOrtho01 content={content} sectionId={sectionId} />;
  if (variant === "ortho-02-contact")      return <ContactOrtho02 content={content} sectionId={sectionId} />;
  if (variant === "lawyer-01-contact")     return <ContactLawyer01 content={content} sectionId={sectionId} />;
  if (variant === "stavba-03-contact")     return <ContactStavba03 content={content} sectionId={sectionId} />;
  if (variant === "stavba-02-contact")     return <ContactStavba02 content={content} sectionId={sectionId} />;
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
  if (variant === "klempir-01-contact")   return <ContactKlempir01 content={content} sectionId={sectionId} />;
  if (variant === "garden-01-contact")    return <ContactGarden01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "clean-02-contact")     return <ContactClean02  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "hotel-01-contact")     return <ContactHotel01  content={content} sectionId={sectionId} isAdmin={isAdmin} />;
  if (variant === "arbo-01-contact")      return <ContactArbo01   content={content} sectionId={sectionId} />;
  if (variant === "malir-02-contact")     return <ContactMalir02  content={content} sectionId={sectionId} isAdmin={isAdmin} />;
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
  const email      = String(content.email      ?? "studio@sohonails.cz");
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
// Dark BG #0A0A0A, 2-col: vlevo info (section-label + H2 + popis + 4 items)
// vpravo mapa iframe nebo šedý placeholder, contact-item: ikona 40×40 + label + value
// ─────────────────────────────────────────────────────────────────────────────
function ContactMassage01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const heading     = String(content.heading     ?? "Kde nás najdete");
  const description = String(content.description ?? "");
  const address     = String(content.address     ?? "");
  const phone       = String(content.phone       ?? "");
  const email       = String(content.email       ?? "");
  const hours       = String(content.hours       ?? "");
  const mapEmbedUrl = String(content.mapEmbedUrl ?? "");

  const BG        = "#0A0A0A";
  const SURFACE   = "#141414";
  const BORDER    = "#2A2520";
  const GOLD      = "#C9A962";
  const TEXT      = "#F5F0E8";
  const SECONDARY = "#A09888";
  const MUTED     = "#6A6058";
  const FONT      = "'Inter', sans-serif";
  const SERIF     = "'Cormorant Garamond', serif";

  const items = [
    {
      label: "Adresa",
      value: address,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
      ),
    },
    {
      label: "Telefon",
      value: phone,
      href: `tel:${phone.replace(/\s/g, "")}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      ),
    },
    {
      label: "E-mail",
      value: email,
      href: `mailto:${email}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
    },
    {
      label: "Otevírací doba",
      value: hours,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
  ].filter(item => item.value);

  return (
    <section
      id="kontakt"
      style={{ backgroundColor: BG, padding: "100px 80px" }}
      data-template="massage-01"
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, maxWidth: 1280, margin: "0 auto" }}>
        {/* Vlevo — info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          <p style={{ display: "inline-flex", alignItems: "center", gap: 8, color: GOLD, fontFamily: FONT, fontSize: 11, fontWeight: 500, letterSpacing: 3, textTransform: "uppercase", margin: 0 }}>
            <span style={{ display: "inline-block", width: 6, height: 6, background: GOLD, borderRadius: "50%" }} />
            Kontakt
          </p>
          <h2 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, color: TEXT, lineHeight: 1.1, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          {description && (
            <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 300, color: SECONDARY, lineHeight: 1.7, margin: 0 }}>
              <GenericEditableText sectionId={sectionId} field="description" value={description} tag="span" />
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{
                  width: 40, height: 40, flexShrink: 0,
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: GOLD,
                }}>
                  {item.icon}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <p style={{ fontFamily: FONT, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: MUTED, margin: 0 }}>
                    {item.label}
                  </p>
                  <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT, margin: 0 }}>
                    {item.href ? (
                      <a href={item.href} style={{ color: TEXT, textDecoration: "none" }}>
                        <GenericEditableText sectionId={sectionId} field={item.label.toLowerCase()} value={item.value} tag="span" />
                      </a>
                    ) : (
                      <GenericEditableText sectionId={sectionId} field={item.label.toLowerCase()} value={item.value} tag="span" />
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vpravo — mapa */}
        <div style={{ minHeight: 400, background: SURFACE, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
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
            <div style={{ width: "100%", height: "100%", minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: MUTED }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="40" height="40">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <p style={{ fontFamily: FONT, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>Vložte URL mapy</p>
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

// ── ananda-01-contact ─────────────────────────────────────────────────────────
function ContactAnanda01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GOLD  = "#AA813A";
  const CREAM = "#F2EDE4";
  const BLUE  = "#2A9ABC";

  const [status, setStatus] = useState<Status>("idle");

  const title   = String(content.title   ?? "CHCETE VĚDĚT VÍC?\nKONTAKTUJTE NÁS");
  const phone   = String(content.phone   ?? "704 123 456");
  const email   = String(content.email   ?? "email@demo.cz");
  const address = String(content.address ?? "Náměstí Míru 12, Praha 2");
  const hours   = String(content.hours   ?? "Po–Pá 9:00–20:00 / So–Ne 10:00–18:00");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    await new Promise(r => setTimeout(r, 900));
    setStatus("success");
  }

  return (
    <section id="kontakt" style={{ backgroundColor: GOLD, padding: "80px 0" }}>
      <style>{`
        .ana-con-wrap {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 32px;
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 64px;
          align-items: start;
        }
        @media (max-width: 800px) {
          .ana-con-wrap { grid-template-columns: 1fr; gap: 40px; }
        }
        .ana-con-info-label {
          font-family: 'Jost', sans-serif;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(242,237,228,0.7);
          margin: 0 0 4px;
        }
        .ana-con-info-val {
          font-family: 'Jost', sans-serif;
          font-size: 16px;
          font-weight: 400;
          color: ${CREAM};
          margin: 0 0 28px;
          line-height: 1.5;
        }
        .ana-con-form {
          background: rgba(242,237,228,0.12);
          border-radius: 4px;
          padding: 36px 36px 32px;
        }
        .ana-con-field {
          width: 100%;
          box-sizing: border-box;
          background: rgba(242,237,228,0.18);
          border: 1px solid rgba(242,237,228,0.35);
          border-radius: 3px;
          padding: 13px 16px;
          color: ${CREAM};
          font-family: 'Jost', sans-serif;
          font-size: 14px;
          outline: none;
          margin-bottom: 14px;
          transition: border-color 0.2s ease;
        }
        .ana-con-field::placeholder { color: rgba(242,237,228,0.5); }
        .ana-con-field:focus { border-color: rgba(242,237,228,0.7); }
        .ana-con-field.textarea { min-height: 110px; resize: vertical; }
        .ana-con-submit {
          width: 100%;
          background: ${CREAM};
          color: ${GOLD};
          border: none;
          border-radius: 3px;
          padding: 14px 28px;
          font-family: 'Jost', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.25s ease, color 0.25s ease;
          margin-top: 6px;
        }
        .ana-con-submit:hover:not(:disabled) {
          background: #1a1208;
          color: ${CREAM};
        }
        .ana-con-submit:disabled { opacity: 0.6; cursor: default; }
      `}</style>

      <div className="ana-con-wrap">
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

          <p className="ana-con-info-label">Telefon</p>
          <p className="ana-con-info-val"><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" /></p>

          <p className="ana-con-info-label">E-mail</p>
          <p className="ana-con-info-val"><GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" /></p>

          <p className="ana-con-info-label">Adresa</p>
          <p className="ana-con-info-val"><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></p>

          <p className="ana-con-info-label">Otevírací doba</p>
          <p className="ana-con-info-val" style={{ marginBottom: 0 }}><GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" /></p>
        </div>

        {/* Right — form */}
        <div className="ana-con-form">
          {status === "success" ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 18, color: CREAM, letterSpacing: 1 }}>
                Děkujeme! Ozveme se vám co nejdříve.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input  className="ana-con-field" type="text"  name="name"  placeholder="Jméno a příjmení" required />
              <input  className="ana-con-field" type="email" name="email" placeholder="E-mail" required />
              <input  className="ana-con-field" type="tel"   name="phone" placeholder="Telefon (nepovinné)" />
              <textarea className="ana-con-field textarea" name="message" placeholder="Váš dotaz nebo zájem o proceduru..." />
              <button className="ana-con-submit" type="submit" disabled={status === "sending"}>
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
  const address   = String(content.address   ?? "");
  const phone     = String(content.phone     ?? "");
  const email     = String(content.email     ?? "");
  const hours     = String(content.hours     ?? "");
  const image     = String(content.image     ?? "");
  const facebook  = String(content.facebook  ?? "");
  const instagram = String(content.instagram ?? "");
  const ACCENT = "#ff5c4b";
  const SANS   = "Arial, Helvetica, sans-serif";

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
          <div style={{ flex: "0 0 50%", padding: "clamp(56px, 8vw, 96px) clamp(32px, 5vw, 72px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ width: 48, height: 3, backgroundColor: ACCENT, marginBottom: 24 }} aria-hidden />
            <h2 style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 900, color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 clamp(28px, 4vw, 44px)" }}>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            {[
              { icon: "📍", field: "address", value: address },
              { icon: "📞", field: "phone",   value: phone   },
              { icon: "✉️",  field: "email",   value: email   },
              { icon: "🕐", field: "hours",   value: hours   },
            ].filter(r => r.value).map(({ icon, field, value }) => (
              <div key={field} style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }} aria-hidden>{icon}</span>
                <span style={{ fontFamily: SANS, fontSize: "0.95rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
                  <GenericEditableText sectionId={sectionId} field={field} value={value} tag="span" />
                </span>
              </div>
            ))}
            {(facebook || instagram) && (
              <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
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
          <div className="t01-contact-photo" style={{ flex: "0 0 50%", position: "relative", minHeight: "clamp(300px, 40vw, 500px)" }}>
            {image ? (
              <>
                <Image src={image} alt="Studio" fill className="object-cover" sizes="50vw" unoptimized={shouldSkipNextImageOptimization(image)} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(10,10,10,0.45) 0%, transparent 40%)" }} aria-hidden />
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
// Tmavé bg (#111), 2-col: vlevo kontaktní info s ikonami, vpravo embed mapa.
// ─────────────────────────────────────────────────────────────────────────────
function ContactTattoo02({ content, sectionId }: {
  content: Record<string, unknown>;
  sectionId: number;
}) {
  const c        = content as Record<string, unknown>;
  const heading  = String(c.heading  ?? "Kontakty");
  const address  = String(c.address  ?? "Ukázková 123, 110 00 Praha 1");
  const phone    = String(c.phone    ?? "704 123 456");
  const email    = String(c.email    ?? "email@demo.cz");
  const hours    = String(c.hours    ?? "Po–Pá 9:00–18:00");
  const instagram= String(c.instagram ?? "");
  const facebook = String(c.facebook  ?? "");

  const GOLD = "#BF8A1D";
  const DARK = "#111111";

  const IconPin = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
    </svg>
  );
  const IconPhone = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 0 0 .07 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
    </svg>
  );
  const IconMail = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  );
  const IconClock = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
    </svg>
  );
  const IconIG = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
  const IconFB = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
    </svg>
  );

  const Row = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 28 }}>
      <div style={{
        width: 44, height: 44, flexShrink: 0,
        border: `1px solid ${GOLD}55`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>{icon}</div>
      <div style={{ paddingTop: 10 }}>{children}</div>
    </div>
  );

  return (
    <>
      <style>{`
        .tc02-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 520px;
        }
        @media (max-width: 800px) {
          .tc02-grid { grid-template-columns: 1fr; }
          .tc02-map  { min-height: 300px; }
        }
        .tc02-social a {
          display: inline-flex; align-items: center; justify-content: center;
          width: 40px; height: 40px;
          border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s;
        }
        .tc02-social a:hover { border-color: ${GOLD}; color: ${GOLD}; }
      `}</style>

      <section id="kontakt" data-section="contact-tattoo-02" style={{ background: DARK }}>
        <div className="tc02-grid">

          {/* Levý panel — info */}
          <div style={{
            padding: "clamp(56px,8vw,100px) clamp(28px,5vw,72px)",
            display: "flex", flexDirection: "column", justifyContent: "center",
          }}>
            <p style={{
              fontFamily: "Arial, sans-serif", fontSize: "0.7rem", fontWeight: 700,
              color: GOLD, letterSpacing: "0.3em", textTransform: "uppercase",
              margin: "0 0 14px",
            }}>Najdete nás</p>
            <div aria-hidden style={{ width: 48, height: 2, backgroundColor: GOLD, marginBottom: 24 }} />
            <h2 style={{
              fontFamily: "'Arial Black', Arial, sans-serif",
              fontWeight: 900, fontSize: "clamp(26px,3vw,38px)",
              color: "#fff", margin: "0 0 40px", lineHeight: 1.15,
            }}>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>

            <Row icon={<IconPin />}>
              <div style={{ fontFamily: "Arial, sans-serif", fontSize: "0.9rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </div>
            </Row>
            <Row icon={<IconPhone />}>
              <a href={`tel:${phone.replace(/\s/g,"")}`} style={{ fontFamily: "Arial, sans-serif", fontSize: "0.9rem", color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            </Row>
            <Row icon={<IconMail />}>
              <a href={`mailto:${email}`} style={{ fontFamily: "Arial, sans-serif", fontSize: "0.9rem", color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            </Row>
            <Row icon={<IconClock />}>
              <div style={{ fontFamily: "Arial, sans-serif", fontSize: "0.9rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
                <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
              </div>
            </Row>

            {/* Sociální sítě */}
            <div className="tc02-social" style={{ display: "flex", gap: 10, marginTop: 8 }}>
              {instagram && <a href={instagram} target="_blank" rel="noopener" aria-label="Instagram"><IconIG /></a>}
              {facebook  && <a href={facebook}  target="_blank" rel="noopener" aria-label="Facebook"><IconFB /></a>}
            </div>
          </div>

          {/* Pravý panel — Google mapa embed */}
          <div className="tc02-map" style={{ position: "relative", overflow: "hidden", minHeight: 480 }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2560.0!2d14.4208!3d50.0880!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTDCsDA1JzE2LjgiTiAxNMKwMjUnMTQuOSJF!5e0!3m2!1scs!2scz!4v1700000000000"
              width="100%" height="100%"
              style={{ border: 0, display: "block", minHeight: 480, filter: "grayscale(30%) contrast(1.05)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa studia"
            />
            {/* Zlatý border vlevo */}
            <div aria-hidden style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: 4, backgroundColor: GOLD,
            }} />
          </div>

        </div>
      </section>
    </>
  );
}

// ── tattoo-03-contact ─────────────────────────────────────────────────────────
// Tmavý 2-col kontakt — magictattoo.cz inspired
// #0A0A0E bg, foto studia vlevo (aspect 4/3), kontakt info vpravo (adresa/tel/email/hodiny + červené CTA + social)
// ─────────────────────────────────────────────────────────────────────────────
function ContactTattoo03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c          = content as Record<string, unknown>;
  const heading    = String(c.heading    ?? "Kontaktujte nás");
  const subheading = String(c.subheading ?? "Rezervace & informace");
  const address    = String(c.address    ?? "Ukázková 123, 110 00 Praha 1");
  const phone      = String(c.phone      ?? "704 123 456");
  const email      = String(c.email      ?? "email@demo.cz");
  const hours      = String(c.hours      ?? "Po–Ne 10:00–20:00");
  const facebook   = String(c.facebook   ?? "https://facebook.com/demo");
  const instagram  = String(c.instagram  ?? "https://instagram.com/demo");
  const image      = String(c.image      ?? "/templates/tattoo-03/contact-studio.jpg");

  const BG     = "#0A0A0E";
  const ACCENT = "#D41515";
  const SURFACE = "#111114";

  const rows = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      ),
      label: "ADRESA", field: "address", value: address, href: `https://maps.google.com/?q=${encodeURIComponent(address)}`,
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.4 2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      ),
      label: "TELEFON", field: "phone", value: phone, href: `tel:+420${phone.replace(/\s/g, "")}`,
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      ),
      label: "E-MAIL", field: "email", value: email, href: `mailto:${email}`,
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      ),
      label: "PROVOZNÍ HODINY", field: "hours", value: hours, href: null,
    },
  ];

  return (
    <section id="kontakt" style={{ backgroundColor: BG }}>
      <style>{`
        @media (max-width: 900px) {
          .t03-contact-grid { grid-template-columns: 1fr !important; }
          .t03-contact-img  { min-height: 300px !important; }
        }
      `}</style>

      <div
        className="t03-contact-grid"
        style={{ maxWidth: 1360, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}
      >
        {/* Foto studia — vlevo */}
        <div className="t03-contact-img" style={{ position: "relative", minHeight: 560, overflow: "hidden" }}>
          <GenericEditableImage sectionId={sectionId} field="image" src={image} alt="Tetovací studio" className="absolute inset-0 w-full h-full" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <img src={image} alt="Tetovací studio" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
          </GenericEditableImage>
          {/* Tmavý gradient overlay */}
          <div aria-hidden style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to right, transparent 60%, rgba(17,17,20,0.6) 100%)",
          }} />
        </div>

        {/* Kontakt info — vpravo */}
        <div style={{ padding: "clamp(48px,6vw,88px) clamp(24px,5vw,80px)", backgroundColor: SURFACE, display: "flex", flexDirection: "column", justifyContent: "center" }}>

          {/* Subheading */}
          <p style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: "0.7rem", fontWeight: 700,
            color: ACCENT, letterSpacing: "0.22em",
            textTransform: "uppercase", margin: "0 0 12px",
          }}>
            <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
          </p>

          {/* Heading */}
          <h2 style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(26px, 3vw, 42px)",
            color: "#ffffff",
            margin: "0 0 8px",
            lineHeight: 1.1,
          }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>

          {/* Červená linka pod nadpisem */}
          <div style={{ width: 48, height: 3, backgroundColor: ACCENT, margin: "16px 0 40px" }} aria-hidden />

          {/* Kontaktní řádky */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 40 }}>
            {rows.map((row, i) => {
              const inner = (
                <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  {/* Ikona v čtverci */}
                  <div style={{
                    width: 42, height: 42, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: `1px solid rgba(212,21,21,0.3)`,
                    backgroundColor: "rgba(212,21,21,0.06)",
                  }}>
                    {row.icon}
                  </div>
                  <div>
                    <div style={{
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontSize: "0.65rem", fontWeight: 700,
                      color: "rgba(255,255,255,0.35)",
                      textTransform: "uppercase", letterSpacing: "0.14em",
                      marginBottom: 3,
                    }}>
                      {row.label}
                    </div>
                    <div style={{
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontSize: "0.92rem",
                      color: "rgba(255,255,255,0.88)",
                      lineHeight: 1.4,
                    }}>
                      <GenericEditableText sectionId={sectionId} field={row.field} value={row.value} tag="span" />
                    </div>
                  </div>
                </div>
              );
              return row.href ? (
                <a key={i} href={row.href} style={{ textDecoration: "none", transition: "opacity 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >{inner}</a>
              ) : (
                <div key={i}>{inner}</div>
              );
            })}
          </div>

          {/* CTA + Social */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <a
              href={`tel:+420${phone.replace(/\s/g, "")}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                backgroundColor: ACCENT, color: "#ffffff",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: "0.88rem", fontWeight: 700,
                letterSpacing: "0.06em",
                padding: "14px 32px",
                textDecoration: "none",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#b30000")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = ACCENT)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.4 2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Zavolat nám
            </a>

            <div style={{ display: "flex", gap: 10 }}>
              {[
                { href: facebook, label: "Facebook", path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
                { href: instagram, label: "Instagram", path: null },
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  style={{
                    width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.65)",
                    textDecoration: "none", transition: "border-color 0.2s, color 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
                >
                  {s.path ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={s.path}/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
                  )}
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
        padding: "clamp(90px, 12vw, 160px) clamp(24px, 6vw, 72px)",
        position: "relative",
      }}
    >
      {/* Section eyebrow top-right */}
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
            {/* (04) with vertical hairline */}
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
            <div aria-hidden="true" style={{ width: 88, height: 1, backgroundColor: TAUPE, margin: "48px 0 28px" }} />
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
// Cream #FCF9F0 bg, 2-col (info left / map right). Vlevo: brown kicker + H2 +
// 4 info bloky (adresa, email, telefon×2, hodiny) s brown ikonkami. Vpravo:
// Google mapa s tenkým brown rámečkem. IG odkaz pod info.
// ─────────────────────────────────────────────────────────────────────────────
function ContactNails03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const CREAM = "#FCF9F0";
  const DARK  = "#0B090C";
  const BROWN = "#806248";
  const FONT  = "'Manrope', 'Helvetica Neue', Arial, sans-serif";

  const title       = String(content.title       ?? "Kontakty");
  const kicker      = String(content.kicker      ?? "Najdete nás v srdci města");
  const address     = String(content.address     ?? "Ukázková 123, 110 00 Praha 1");
  const email       = String(content.email       ?? "email@demo.cz");
  const phone       = String(content.phone       ?? "+420 704 123 456");
  const phone2      = String(content.phone2      ?? "");
  const hours       = String(content.hours       ?? "Po–Pá 9:00–18:00, So 9:00–14:00");
  const mapEmbedUrl = String(content.mapEmbedUrl ?? "https://www.google.com/maps?q=Praha+1&output=embed");
  const igHref      = String(content.igHref      ?? "https://instagram.com/demo");

  const iconAddress = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BROWN} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
  const iconEmail   = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BROWN} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>;
  const iconPhone   = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BROWN} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0122 16.92z"/></svg>;
  const iconClock   = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BROWN} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
  const iconIG      = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>;

  return (
    <section
      id="kontakt"
      data-section-type="contact"
      data-variant="nails-03-contact"
      style={{ backgroundColor: CREAM, padding: "clamp(64px, 9vw, 104px) clamp(24px, 6vw, 80px)" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          className="nails03-contact-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 6vw, 80px)", alignItems: "start" }}
        >
          {/* Left: info */}
          <div>
            <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: BROWN, margin: "0 0 16px" }}>
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            </p>
            <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: DARK, margin: "0 0 40px", letterSpacing: "0.02em" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>

            {/* Info rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Address */}
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ marginTop: 2, flexShrink: 0 }}>{iconAddress}</span>
                <div>
                  <p style={{ fontFamily: FONT, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: BROWN, margin: "0 0 4px" }}>Adresa</p>
                  <p style={{ fontFamily: FONT, fontSize: "0.95rem", color: DARK, margin: 0, lineHeight: 1.5 }}>
                    <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                  </p>
                </div>
              </div>

              {/* Email */}
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ marginTop: 2, flexShrink: 0 }}>{iconEmail}</span>
                <div>
                  <p style={{ fontFamily: FONT, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: BROWN, margin: "0 0 4px" }}>Email</p>
                  <a href={`mailto:${email}`} style={{ fontFamily: FONT, fontSize: "0.95rem", color: DARK, textDecoration: "none" }}>
                    <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                  </a>
                </div>
              </div>

              {/* Phone(s) */}
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ marginTop: 2, flexShrink: 0 }}>{iconPhone}</span>
                <div>
                  <p style={{ fontFamily: FONT, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: BROWN, margin: "0 0 4px" }}>Telefon</p>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ fontFamily: FONT, fontSize: "0.95rem", color: DARK, textDecoration: "none", display: "block" }}>
                    <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                  </a>
                  {phone2 && (
                    <a href={`tel:${phone2.replace(/\s/g, "")}`} style={{ fontFamily: FONT, fontSize: "0.95rem", color: DARK, textDecoration: "none", display: "block", marginTop: 2 }}>
                      <GenericEditableText sectionId={sectionId} field="phone2" value={phone2} tag="span" />
                    </a>
                  )}
                </div>
              </div>

              {/* Hours */}
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ marginTop: 2, flexShrink: 0 }}>{iconClock}</span>
                <div>
                  <p style={{ fontFamily: FONT, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: BROWN, margin: "0 0 4px" }}>Otevírací doba</p>
                  <p style={{ fontFamily: FONT, fontSize: "0.95rem", color: DARK, margin: 0, lineHeight: 1.5 }}>
                    <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
                  </p>
                </div>
              </div>
            </div>

            {/* IG link */}
            <a
              href={igHref}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                marginTop: 36,
                fontFamily: FONT, fontSize: "0.82rem", fontWeight: 600,
                color: BROWN, textDecoration: "none", letterSpacing: "0.06em",
              }}
            >
              {iconIG} Instagram
            </a>
          </div>

          {/* Right: map */}
          <div
            className="nails03-contact-map"
            style={{ position: "relative", width: "100%", minHeight: 440, border: `1.5px solid rgba(128,98,72,0.2)`, borderRadius: 4, overflow: "hidden" }}
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

      <style>{`
        @media (max-width: 860px) {
          .nails03-contact-grid { grid-template-columns: 1fr !important; }
          .nails03-contact-map { min-height: 320px !important; position: relative !important; }
        }
      `}</style>
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
// Reference: yesvisage.cz — kontaktní sekce
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
              href="#kontakt"
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

  const tagline  = String(content.tagline     ?? "Kontakt");
  const title    = String(content.title       ?? "Objednejte se ještě dnes");
  const phone    = String(content.phone       ?? "704 123 456");
  const email    = String(content.email       ?? "info@demo.cz");
  const address  = String(content.address     ?? "Ukázková 123");
  const city     = String(content.city        ?? "110 00 Praha 1");
  const hours    = String(content.hours       ?? "Po–Pá 7:00–20:00");
  const fbUrl    = String(content.facebookUrl  ?? "https://facebook.com/demo");
  const igUrl    = String(content.instagramUrl ?? "https://instagram.com/demo");

  const NAVY    = "#1f2d69";
  const GREEN   = "#10d15d";
  const TEAL    = "#6bbea1";
  const SURFACE = "#f5f8fc";
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

  return (
    <section id="kontakt" data-template="fyzio-01" style={{ backgroundColor: SURFACE, padding: "80px 24px", fontFamily: SANS }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="fyzio01-contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>

          {/* LEFT — info */}
          <div>
            <p style={{ fontFamily: MONT, fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: GREEN, marginBottom: 12 }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            <h2 style={{ fontFamily: MONT, fontSize: "clamp(22px,3vw,36px)", fontWeight: 700, color: NAVY, marginBottom: 40 }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>

            {/* Kontaktní bloky */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Telefon */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: NAVY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.75a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z"/></svg>
                </div>
                <div>
                  <p style={{ fontFamily: MONT, fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 4 }}>Telefon</p>
                  <a href={`tel:+420${phone.replace(/\s/g,"")}`} style={{ fontSize: 16, fontWeight: 600, color: TEXT, textDecoration: "none" }}>
                    <GenericEditableText sectionId={sectionId} field="phone" value={`+420 ${phone}`} tag="span" />
                  </a>
                </div>
              </div>

              {/* Email */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: NAVY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="18" height="14" viewBox="0 0 24 20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div>
                  <p style={{ fontFamily: MONT, fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 4 }}>Email</p>
                  <a href={`mailto:${email}`} style={{ fontSize: 16, fontWeight: 600, color: TEXT, textDecoration: "none" }}>
                    <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                  </a>
                </div>
              </div>

              {/* Adresa */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: NAVY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="16" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <p style={{ fontFamily: MONT, fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 4 }}>Adresa</p>
                  <p style={{ fontSize: 16, fontWeight: 600, color: TEXT, lineHeight: 1.5 }}>
                    <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /><br />
                    <GenericEditableText sectionId={sectionId} field="city" value={city} tag="span" />
                  </p>
                </div>
              </div>

              {/* Hodiny */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: NAVY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <p style={{ fontFamily: MONT, fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 4 }}>Otevírací doba</p>
                  <p style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>
                    <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
                  </p>
                </div>
              </div>
            </div>

            {/* Social */}
            <div style={{ display: "flex", gap: 12, marginTop: 36 }}>
              <a href={fbUrl} aria-label="Facebook" style={{ width: 40, height: 40, borderRadius: "50%", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: NAVY, textDecoration: "none", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = SURFACE)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href={igUrl} aria-label="Instagram" style={{ width: 40, height: 40, borderRadius: "50%", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: NAVY, textDecoration: "none", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = SURFACE)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            </div>
          </div>

          {/* RIGHT — formulář */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: "40px 36px", boxShadow: "0 4px 24px rgba(31,45,105,0.08)" }}>
            <h3 style={{ fontFamily: MONT, fontSize: 20, fontWeight: 700, color: NAVY, marginBottom: 28 }}>Napište nám</h3>
            {status === "success" ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: GREEN, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p style={{ fontFamily: MONT, fontSize: 16, fontWeight: 600, color: NAVY }}>Zpráva odeslána!</p>
                <p style={{ fontSize: 14, color: MUTED, marginTop: 8 }}>Ozveme se vám co nejdříve.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { field: "name",    label: "Jméno a příjmení", type: "text",  required: true  },
                  { field: "email",   label: "E-mail",            type: "email", required: true  },
                  { field: "phone",   label: "Telefon",           type: "tel",   required: false },
                ].map(f => (
                  <div key={f.field}>
                    <label style={{ display: "block", fontFamily: MONT, fontSize: 12, fontWeight: 600, color: NAVY, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{f.label}</label>
                    <input
                      type={f.type}
                      required={f.required}
                      style={{ width: "100%", padding: "12px 14px", border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 15, color: TEXT, fontFamily: SANS, outline: "none", boxSizing: "border-box" }}
                      onFocus={e => (e.currentTarget.style.borderColor = NAVY)}
                      onBlur={e => (e.currentTarget.style.borderColor = BORDER)}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontFamily: MONT, fontSize: 12, fontWeight: 600, color: NAVY, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Zpráva</label>
                  <textarea
                    rows={4}
                    required
                    style={{ width: "100%", padding: "12px 14px", border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 15, color: TEXT, fontFamily: SANS, outline: "none", resize: "vertical", boxSizing: "border-box" }}
                    onFocus={e => (e.currentTarget.style.borderColor = NAVY)}
                    onBlur={e => (e.currentTarget.style.borderColor = BORDER)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  style={{ backgroundColor: GREEN, color: "#fff", fontFamily: MONT, fontSize: 15, fontWeight: 700, padding: "14px", borderRadius: 4, border: "none", cursor: status === "sending" ? "wait" : "pointer", letterSpacing: "0.04em", transition: "opacity 0.2s", opacity: status === "sending" ? 0.7 : 1 }}
                >
                  {status === "sending" ? "Odesílám…" : "Odeslat zprávu"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) { .fyzio01-contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }
      `}</style>
    </section>
  );
}

// ── contact-fyzio-02 ──────────────────────────────────────────────────────────
// 2-col: vlevo info karty (telefon, email, adresa, hodiny) + CTA
//        vpravo jednoduchý kontaktní formulář na bílém bg
// Surface #f5f3ee bg sekce, navy + zlaté akcenty
// ─────────────────────────────────────────────────────────────────────────────
function ContactFyzio02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const tagline = String(content.tagline ?? "Kontakt");
  const title   = String(content.title   ?? "Zjistěte, co přesně děláme");
  const body    = String(content.body    ?? "Rádi vám odpovíme na vaše otázky.");
  const phone   = String(content.phone   ?? "704 123 456");
  const email   = String(content.email   ?? "email@demo.cz");
  const address = String(content.address ?? "Ukázková 123");
  const city    = String(content.city    ?? "110 00 Praha 1");
  const hours   = String(content.hours   ?? "Po–Pá 8:00–20:00");
  const id      = String(content.id      ?? "kontakt");

  const NAVY  = "#1a2e4a";
  const GOLD  = "#c9a84c";
  const SURF  = "#f5f3ee";
  const MUTED = "#6b7280";
  const WHITE = "#ffffff";
  const SERIF = "'DM Serif Display', serif";
  const SANS  = "'Plus Jakarta Sans', sans-serif";

  const InfoRow = ({ icon, label, field, value }: { icon: React.ReactNode; label: string; field: string; value: string }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "20px 0", borderBottom: "1px solid #e8e4dc" }}>
      <span style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center", color: GOLD, flexShrink: 0, boxShadow: "0 1px 6px rgba(26,46,74,0.07)" }}>
        {icon}
      </span>
      <div>
        <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: GOLD, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 2px" }}>{label}</p>
        <p style={{ fontFamily: SANS, fontSize: 15, color: NAVY, fontWeight: 500, margin: 0 }}>
          <GenericEditableText sectionId={sectionId} field={field} value={value} tag="span" />
        </p>
      </div>
    </div>
  );

  return (
    <section id={id} data-template="fyzio-02" style={{ backgroundColor: SURF, padding: "80px 24px", fontFamily: SANS }}>
      <style>{`
        .f02-contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; max-width: 1100px; margin: 0 auto; }
        .f02-form-input { width: 100%; padding: 12px 14px; border: 1.5px solid #e0ddd5; border-radius: 8px; font-family: ${SANS}; font-size: 14px; color: ${NAVY}; background: ${WHITE}; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
        .f02-form-input:focus { border-color: ${GOLD}; }
        .f02-form-textarea { resize: vertical; min-height: 120px; }
        @media(max-width: 760px) { .f02-contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }
        @media(max-width: 480px) { .f02-form-name-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div className="f02-contact-grid">
        {/* Levý sloupec — info */}
        <div>
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ width: 24, height: 2, backgroundColor: GOLD }} />
              <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </span>
            </div>
            <h2 style={{ fontFamily: SERIF, fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)", fontWeight: 400, color: NAVY, lineHeight: 1.2, marginBottom: 12 }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 15, color: MUTED, lineHeight: 1.75 }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          </div>

          <InfoRow
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.71 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
            label="Telefon" field="phone" value={phone}
          />
          <InfoRow
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>}
            label="E-mail" field="email" value={email}
          />
          <InfoRow
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>}
            label="Adresa" field="address" value={`${address}, ${city}`}
          />
          <InfoRow
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
            label="Hodiny" field="hours" value={hours}
          />
        </div>

        {/* Pravý sloupec — formulář */}
        <div style={{ backgroundColor: WHITE, borderRadius: 16, padding: "40px", boxShadow: "0 4px 24px rgba(26,46,74,0.08)" }}>
          <h3 style={{ fontFamily: SERIF, fontSize: "1.4rem", fontWeight: 400, color: NAVY, marginBottom: 28 }}>Napište nám</h3>
          <form onSubmit={e => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="f02-form-name-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <input className="f02-form-input" type="text" placeholder="Jméno" aria-label="Jméno" />
              <input className="f02-form-input" type="text" placeholder="Příjmení" aria-label="Příjmení" />
            </div>
            <input className="f02-form-input" type="email" placeholder="E-mail" aria-label="E-mail" />
            <input className="f02-form-input" type="tel" placeholder="Telefon" aria-label="Telefon" />
            <textarea className="f02-form-input f02-form-textarea" placeholder="Vaše zpráva..." aria-label="Zpráva" />
            <button
              type="submit"
              style={{ backgroundColor: GOLD, color: WHITE, fontFamily: SANS, fontSize: "0.95rem", fontWeight: 600, padding: "0.9rem", borderRadius: 8, border: "none", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#b8943d")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = GOLD)}
            >
              Odeslat zprávu
            </button>
          </form>
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

  const socials = (content.socials as Array<{ label?: string; href?: string; icon?: string }>) ?? [
    { icon: "instagram", label: "Instagram", href: "https://instagram.com/" },
    { icon: "facebook",  label: "Facebook",  href: "https://facebook.com/" },
    { icon: "google",    label: "Google",    href: "https://google.com/" },
  ];

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
function ContactRestaurant01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
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

  const id      = String(content.id      ?? "kontakt");
  const tagline = String(content.tagline ?? "Kde nás najdete");
  const title   = String(content.title   ?? "Kontakt a rezervace");
  const address = String(content.address ?? "Ukázková 123, 110 00 Praha 1");
  const phone   = String(content.phone   ?? "704 123 456");
  const email   = String(content.email   ?? "rezervace@demo.cz");
  const hours   = String(content.hours   ?? "Po–Pá 9:00–18:00, So 9:00–14:00");
  const ctaText = String(content.ctaText ?? "Rezervovat stůl");
  const ctaHref = String(content.ctaHref ?? "mailto:rezervace@demo.cz");

  const DARK  = "#1a0e0a";
  const CREAM = "#f5ede0";
  const AMBER = "#c8943f";
  const MUTED = "#a08060";
  const RED   = "#c0392b";
  const FONT  = "Georgia, 'Times New Roman', serif";
  const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const svgPin   = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>;
  const svgPhone = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
  const svgMail  = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
  const svgClock = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>;

  const infos = [
    { icon: svgPin,   label: "Adresa",        value: address, field: "address" },
    { icon: svgPhone, label: "Telefon",        value: phone,   field: "phone" },
    { icon: svgMail,  label: "E-mail",         value: email,   field: "email" },
    { icon: svgClock, label: "Otevírací doba", value: hours,   field: "hours" },
  ];

  return (
    <section ref={secRef} id={id} data-variant="restaurant-01-contact" style={{ backgroundColor: DARK, padding: "96px 0", fontFamily: SANS }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(24px, 5vw, 64px)" }}>
        {/* Header */}
        <div data-r01="0" style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: AMBER, margin: "0 0 16px" }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          <div style={{ width: 40, height: 1.5, backgroundColor: AMBER, margin: "0 auto 0" }} />
        </div>

        <div className="r01-contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 6vw, 80px)", alignItems: "start" }}>
          {/* Levá strana — info */}
          <div data-r01="1" style={{ transitionDelay: "0.1s" }}>
            <h2 style={{ fontFamily: FONT, fontSize: "clamp(26px, 3vw, 42px)", fontWeight: 400, color: CREAM, margin: "0 0 40px", lineHeight: 1.2 }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>

            {infos.map((inf, i) => (
              <div key={i} style={{ display: "flex", gap: 16, marginBottom: 28, alignItems: "flex-start" }}>
                <span style={{ marginTop: 1, flexShrink: 0 }}>{inf.icon}</span>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: AMBER, margin: "0 0 4px" }}>{inf.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 300, color: MUTED, margin: 0, lineHeight: 1.6 }}>
                    <GenericEditableText sectionId={sectionId} field={inf.field} value={inf.value} tag="span" />
                  </p>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 40 }}>
              <a href={ctaHref} data-btn="primary" style={{
                fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "#fff", textDecoration: "none",
                padding: "14px 36px", backgroundColor: RED, borderRadius: 3,
                display: "inline-block", transition: "background-color 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#a93226")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = RED)}
              >
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>
            </div>
          </div>

          {/* Pravá strana — mapa */}
          <div data-r01="2" className="r01-contact-map" style={{ aspectRatio: "4/3", borderRadius: 2, overflow: "hidden", border: `1px solid rgba(200,148,63,0.2)`, transitionDelay: "0.22s" }}>
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=14.4063%2C50.0725%2C14.4363%2C50.1025&layer=mapnik&marker=50.0875%2C14.4213"
              style={{ width: "100%", height: "100%", border: 0, display: "block", filter: "invert(0.85) hue-rotate(180deg) brightness(0.85)" }}
              title="Mapa"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){.r01-contact-grid{grid-template-columns:1fr!important}}
        @media(max-width:768px){.r01-contact-map{aspect-ratio:16/9!important}}
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
  const tagline  = String(content.tagline  ?? "Kde nás najdete");
  const title    = String(content.title    ?? "Kontakt\na rezervace");
  const address  = String(content.address  ?? "Ukázková 123, 110 00 Praha 1");
  const phone    = String(content.phone    ?? "704 123 456");
  const email    = String(content.email    ?? "rezervace@demo.cz");
  const hours    = String(content.hours    ?? "Po–Pá 11:00–23:00, So–Ne 12:00–23:00");
  const ctaText  = String(content.ctaText  ?? "Rezervovat stůl");
  const ctaHref  = String(content.ctaHref  ?? "mailto:rezervace@demo.cz");
  const mapLat   = String(content.mapLat   ?? "50.0875");
  const mapLng   = String(content.mapLng   ?? "14.4213");
  const fbUrl    = String(content.facebookUrl  ?? "");
  const igUrl    = String(content.instagramUrl ?? "");

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

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(mapLng)-0.012}%2C${parseFloat(mapLat)-0.008}%2C${parseFloat(mapLng)+0.012}%2C${parseFloat(mapLat)+0.008}&layer=mapnik&marker=${mapLat}%2C${mapLng}`;

  return (
    <section ref={secRef} id={id} data-template="restaurant-02" style={{ backgroundColor: "#ffffff", padding: "clamp(64px, 8vw, 112px) 0", fontFamily: POPPINS }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 6vw, 96px)", alignItems: "start" }} className="r02-contact-grid">

        {/* Info vlevo */}
        <div style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(28px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: RED, margin: "0 0 14px" }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          <h2 style={{ fontSize: "clamp(26px, 3vw, 40px)", fontWeight: 700, lineHeight: 1.2, color: BLACK, margin: "0 0 36px", whiteSpace: "pre-line" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 36 }}>
            {/* Adresa */}
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ color: RED, fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </span>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: MUTED, margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </p>
            </div>
            {/* Telefon */}
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <span style={{ color: RED, fontSize: 18, lineHeight: 1, flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.95-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </span>
              <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ fontSize: 14, color: BLACK, textDecoration: "none", fontWeight: 500 }}>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            </div>
            {/* E-mail */}
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <span style={{ color: RED, fontSize: 18, lineHeight: 1, flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
              <a href={`mailto:${email}`} style={{ fontSize: 14, color: BLACK, textDecoration: "none", fontWeight: 500 }}>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            </div>
            {/* Hodiny */}
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ color: RED, fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </span>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: MUTED, margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
              </p>
            </div>
          </div>

          {/* Social + CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <a
              href={ctaHref}
              data-btn="primary"
              style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ffffff", textDecoration: "none", padding: "13px 32px", backgroundColor: RED, display: "inline-block", transition: "background-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#a93226")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = RED)}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            <div style={{ display: "flex", gap: 12 }}>
              {fbUrl && (
                <a href={fbUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                  style={{ color: MUTED, transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = RED)}
                  onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {igUrl && (
                <a href={igUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                  style={{ color: MUTED, transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = RED)}
                  onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Mapa vpravo */}
        <div style={{ opacity: vis ? 1 : 0, transform: vis ? "translateX(0)" : "translateX(28px)", transition: "opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s", lineHeight: 0, border: `1px solid ${BORDER}` }}>
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

      <style>{`
        @media(max-width:768px){ .r02-contact-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// ── restaurant-03-contact ─────────────────────────────────────────────────────
// Dark #0c351a bg, zlatý kicker + bílý serif H2
// 2-col: vlevo kontaktní info (adresa/tel/email/hodiny) se zlatými SVG ikonami
//        + zlaté outline CTA "Rezervovat stůl"
//        vpravo: Google mapa iframe s tmavým overlay frame
// Ref: lacasalatina.cz kontaktní údaje
// ─────────────────────────────────────────────────────────────────────────────
function ContactRestaurant03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const id      = String(content.id      ?? "kontakt");
  const tagline = String(content.tagline ?? "Kde nás najdete");
  const title   = String(content.title   ?? "Kontakt\na rezervace");
  const address = String(content.address ?? "Ukázková 123, 110 00 Praha 1");
  const phone   = String(content.phone   ?? "704 123 456");
  const email   = String(content.email   ?? "rezervace@demo.cz");
  const hours   = String(content.hours   ?? "Po–Ne: 12:00–01:00");
  const hours2  = String(content.hours2  ?? "");
  const ctaText = String(content.ctaText ?? "Rezervovat stůl");
  const ctaHref = String(content.ctaHref ?? "mailto:rezervace@demo.cz");
  const mapUrl  = String(content.mapEmbedUrl ?? "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2559.9!2d14.4208!3d50.0880!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTDCsDA1JzE2LjgiTiAxNMKwMjUnMTUuMCJF!5e0!3m2!1scs!2scz!4v1700000000000");

  const BG   = "#0d1b2a";
  const SURF = "#162032";
  const GOLD = "#e05e3f";
  const WHITE = "#ffffff";
  const FONT = "Georgia, 'Times New Roman', serif";
  const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const secRef = useRef<HTMLElement>(null);

  const infoRows = [
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-5.686-8-11a8 8 0 1116 0c0 5.314-8 11-8 11z"/><circle cx="12" cy="11" r="3"/></svg>,
      label: "Adresa",
      value: address,
      href: undefined,
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.07 1.18 2 2 0 012 .07h3a2 2 0 012 1.72 12.05 12.05 0 00.66 2.89 2 2 0 01-.45 2.11L6.04 7.91a16 16 0 006.05 6.05l1.12-1.17a2 2 0 012.11-.45 12.05 12.05 0 002.89.66A2 2 0 0122 14.92z"/></svg>,
      label: "Telefon",
      value: phone,
      href: `tel:+420${phone.replace(/\s/g, "")}`,
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
      label: "E-mail",
      value: email,
      href: `mailto:${email}`,
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      label: "Otevírací doba",
      value: hours,
      href: undefined,
    },
  ];

  return (
    <section ref={secRef} id={id} data-variant="restaurant-03-contact" style={{ backgroundColor: BG, padding: "96px 0", fontFamily: SANS }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)" }}>
        {/* Header */}
        <div style={{ marginBottom: 56, textAlign: "center" }}>
          <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, margin: "0 0 12px" }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          <div style={{ width: 48, height: 1, backgroundColor: GOLD, margin: "0 auto 20px", opacity: 0.5 }} />
          <h2 style={{ fontFamily: FONT, fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 400, color: WHITE, margin: 0, lineHeight: 1.2, whiteSpace: "pre-line" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>

        {/* 2-col grid */}
        <div className="r03-contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px, 5vw, 72px)", alignItems: "start" }}>

          {/* Levý sloupec — info */}
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 28, marginBottom: 40 }}>
              {infoRows.map((row, i) => (
                <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ color: GOLD, flexShrink: 0, marginTop: 2 }}>{row.icon}</div>
                  <div>
                    <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: `${WHITE}66`, margin: "0 0 4px" }}>{row.label}</p>
                    {row.href ? (
                      <a href={row.href} style={{ fontFamily: SANS, fontSize: 15, color: `${WHITE}cc`, textDecoration: "none", lineHeight: 1.5, transition: "color 0.18s" }}
                        onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                        onMouseLeave={e => (e.currentTarget.style.color = `${WHITE}cc`)}
                      >
                        <GenericEditableText sectionId={sectionId} field={`row_${i}`} value={row.value} tag="span" />
                      </a>
                    ) : (
                      <p style={{ fontFamily: SANS, fontSize: 15, color: `${WHITE}cc`, margin: 0, lineHeight: 1.5 }}>
                        <GenericEditableText sectionId={sectionId} field={["address","phone","email","hours"][i] ?? `row_${i}`} value={row.value} tag="span" />
                        {hours2 && i === 3 && (
                          <><br /><span style={{ fontSize: 13, color: `${WHITE}88` }}>{hours2}</span></>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href={ctaHref}
              data-btn="primary"
              style={{
                fontFamily: SANS, fontSize: 11, fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: GOLD, textDecoration: "none",
                padding: "12px 28px", border: `1px solid ${GOLD}`,
                display: "inline-block", transition: "background-color 0.2s, color 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.color = WHITE; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = GOLD; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>

          {/* Pravý sloupec — mapa */}
          <div style={{ position: "relative", borderRadius: 2, overflow: "hidden", border: `1px solid ${WHITE}15` }}>
            <iframe
              src={mapUrl}
              width="100%"
              height="400"
              style={{ border: 0, display: "block", filter: "invert(90%) hue-rotate(180deg) saturate(0.7)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa"
            />
          </div>
        </div>
      </div>
      <style>{`@media(max-width:768px){.r03-contact-grid{grid-template-columns:1fr!important}}`}</style>
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
// Ref: fermakleri.cz kontakt stránka — tel/email/adresa vlevo + CTA karta vpravo
// ─────────────────────────────────────────────────────────────────────────────
function ContactReality02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title    = String(content.title    ?? "Kontaktujte nás");
  const subtitle = String(content.subtitle ?? "Rádi vám zodpovíme všechny otázky.");
  const phone    = String(content.phone    ?? "704 123 456");
  const email    = String(content.email    ?? "email@demo.cz");
  const address  = String(content.address  ?? "Ukázková 123, 110 00 Praha 1");

  const DARK  = "#05303a";
  const GREEN = "#3DCE78";
  const LIGHT = "#e8efee";
  const FONT  = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  return (
    <section id="kontakt" style={{ backgroundColor: "#ffffff", fontFamily: FONT, padding: "clamp(56px,9vw,104px) clamp(16px,5vw,48px)" }}>
      <div className="r02-contact-grid" style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
        <div>
          <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 800, color: DARK, marginBottom: 12 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p style={{ fontSize: 15, color: DARK, opacity: 0.75, marginBottom: 32, lineHeight: 1.6 }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <a href={`tel:${phone.replace(/\s/g,"")}`} style={{ display: "flex", alignItems: "center", gap: 12, color: DARK, textDecoration: "none", fontSize: 15, fontWeight: 600 }}>
              <span style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.71 3.32a2 2 0 0 1 1.994-2.18H5.65a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </span>
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
            <a href={`mailto:${email}`} style={{ display: "flex", alignItems: "center", gap: 12, color: DARK, textDecoration: "none", fontSize: 15, fontWeight: 600 }}>
              <span style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
              <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
            </a>
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: DARK, fontSize: 15 }}>
              <span style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </span>
              <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: LIGHT, borderRadius: 12, padding: "40px 32px", textAlign: "center" }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: DARK, marginBottom: 16 }}>Prodejte svou nemovitost</h3>
          <p style={{ fontSize: 14, color: DARK, opacity: 0.75, marginBottom: 28, lineHeight: 1.6 }}>Zanechte nám kontakt a my se vám ozveme do 24 hodin s nabídkou prověřeného makléře.</p>
          <a href="#prodej" style={{ display: "inline-block", padding: "12px 32px", backgroundColor: GREEN, color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none", borderRadius: 24 }}>Najít makléře</a>
        </div>
      </div>
      <style>{`@media(max-width:640px){.r02-contact-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}

// ── reality-01-contact ────────────────────────────────────────────────────────
// Bílý 2-col: vlevo info + ikony; vpravo mapa — ref: lexxusnorton.cz
// ─────────────────────────────────────────────────────────────────────────────
function ContactReality01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const tagline  = String(content.tagline  ?? "Kontakt");
  const title    = String(content.title    ?? "Jsme tu pro vás");
  const subtitle = String(content.subtitle ?? "Ozvěte se nám a my se vám obratem ozveme zpět.");
  const address  = String(content.address  ?? "Ukázková 123, 110 00 Praha 1");
  const phone    = String(content.phone    ?? "704 123 456");
  const email    = String(content.email    ?? "email@demo.cz");
  const hours    = String(content.hours    ?? "Po–Pá 9:00–18:00, So 9:00–14:00");

  const DARK       = "#1a3640";
  const GOLD       = "#d4a96e";
  const WHITE      = "#ffffff";
  const SURFACE    = "#f4ebe5";
  const TEXT       = "#141414";
  const TEXT_MUTED = "#6b7280";
  const MONTSERRAT = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const OPEN_SANS  = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed&z=15`;

  type ContactItem = { icon: React.ReactNode; label: string; value: string; href?: string };
  const contactItems: ContactItem[] = [
    {
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/></svg>,
      label: "Adresa", value: address,
    },
    {
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02z" fill="currentColor"/></svg>,
      label: "Telefon", value: `+420 ${phone}`, href: `tel:+420${phone.replace(/\s/g,"")}`,
    },
    {
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/></svg>,
      label: "E-mail", value: email, href: `mailto:${email}`,
    },
    {
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z" fill="currentColor"/></svg>,
      label: "Otevírací doba", value: hours,
    },
  ];

  return (
    <section style={{ backgroundColor: WHITE, padding: "clamp(56px,8vw,96px) 0" }}>
      <div style={{ maxWidth: 1340, margin: "0 auto", padding: "0 clamp(20px,4vw,56px)" }}>
        <div data-r01-contact style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px,5vw,72px)", alignItems: "start" }}>

          {/* LEFT — contact info */}
          <div>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="p"
              style={{ fontFamily: MONTSERRAT, fontSize: 12, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, margin: "0 0 14px" }} />
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2"
              style={{ fontFamily: MONTSERRAT, fontSize: "clamp(26px,3vw,40px)", fontWeight: 700, lineHeight: 1.2, color: DARK, margin: "0 0 16px" }} />
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p"
              style={{ fontFamily: OPEN_SANS, fontSize: 16, color: TEXT_MUTED, margin: "0 0 40px", lineHeight: 1.7 }} />

            {/* Contact items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {contactItems.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: SURFACE, display: "flex", alignItems: "center", justifyContent: "center", color: GOLD, flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: MONTSERRAT, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: TEXT_MUTED, marginBottom: 4 }}>{item.label}</div>
                    {item.href ? (
                      <a href={item.href} style={{ fontFamily: OPEN_SANS, fontSize: 15, color: DARK, textDecoration: "none", fontWeight: 500 }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = GOLD; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = DARK; }}
                      >
                        <GenericEditableText sectionId={sectionId} field={["address","phone","email","hours"][i] as string} value={item.value} tag="span" />
                      </a>
                    ) : (
                      <GenericEditableText sectionId={sectionId} field={["address","phone","email","hours"][i] as string} value={item.value} tag="div"
                        style={{ fontFamily: OPEN_SANS, fontSize: 15, color: TEXT, lineHeight: 1.5 }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — map */}
          <div style={{ borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.10)", aspectRatio: "4/3", position: "relative", backgroundColor: SURFACE }}>
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
        @media (max-width: 767px) { [data-r01-contact] { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// ── reality-04-contact ────────────────────────────────────────────────────────
// Ref: quantumreality.cz — kontaktní sekce
// Bílé bg; 2-col: vlevo formulář (jméno/telefon/email/zpráva + submit),
// vpravo kontaktní info (adresa, tel, email, hodiny) + OpenStreetMap iframe
// ─────────────────────────────────────────────────────────────────────────────
function ContactReality04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const sectionAnchor = String(content.id          ?? "kontakt");
  const title         = String(content.title        ?? "Chci nezávazně poradit s prodejem / pronájmem");
  const companyName   = String(content.companyName  ?? "Demo Reality s.r.o.");
  const address       = String(content.address      ?? "Ukázková 123");
  const city          = String(content.city         ?? "110 00 Praha 1");
  const hours         = String(content.hours        ?? "Pracovní dny: 9:00 – 18:00");
  const phone         = String(content.phone        ?? "704 123 456");
  const phone2        = String(content.phone2       ?? "");
  const email         = String(content.email        ?? "info@demo.cz");
  const mapLat        = Number(content.mapLat       ?? 50.076);
  const mapLng        = Number(content.mapLng       ?? 14.434);

  const PRIMARY = "#1032CF";
  const GREEN   = "#21b276";
  const DARK    = "#241f0c";
  const MUTED   = "#666";
  const BORDER  = "#e0e0e0";
  const WHITE   = "#ffffff";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", fontFamily: SANS, fontSize: 14,
    border: `1px solid ${BORDER}`, borderRadius: 4, outline: "none",
    color: DARK, backgroundColor: WHITE, boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const InfoRow = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#f2f2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
        {icon}
      </div>
      <div style={{ fontFamily: SANS, fontSize: 14, color: DARK, lineHeight: 1.5, paddingTop: 8 }}>{children}</div>
    </div>
  );

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${mapLng - 0.008}%2C${mapLat - 0.005}%2C${mapLng + 0.008}%2C${mapLat + 0.005}&layer=mapnik&marker=${mapLat}%2C${mapLng}`;

  return (
    <section id={sectionAnchor} style={{ backgroundColor: WHITE, padding: "clamp(56px, 7vw, 96px) 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px, 3vw, 40px)" }}>

        <h2 style={{ fontFamily: SANS, fontSize: "clamp(20px, 2.4vw, 30px)", fontWeight: 700, color: DARK, marginTop: 0, marginBottom: "clamp(32px, 4vw, 52px)", maxWidth: 640 }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>

        <div className="r04-contact-grid">
          {/* Levý sloupec — formulář */}
          <div>
            <form onSubmit={e => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="r04-contact-row">
                <input type="text" placeholder="Jméno a příjmení" required style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = PRIMARY)}
                  onBlur={e => (e.currentTarget.style.borderColor = BORDER)}
                />
                <input type="tel" placeholder="Telefon" style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = PRIMARY)}
                  onBlur={e => (e.currentTarget.style.borderColor = BORDER)}
                />
              </div>
              <input type="email" placeholder="E-mail" style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = PRIMARY)}
                onBlur={e => (e.currentTarget.style.borderColor = BORDER)}
              />
              <select style={{ ...inputStyle, color: MUTED, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23666' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}>
                <option value="">Vyberte typ nemovitosti</option>
                <option>Byt</option>
                <option>Dům</option>
                <option>Pozemek</option>
                <option>Komerční nemovitost</option>
                <option>Jiné</option>
              </select>
              <textarea placeholder="Vaše zpráva (nepovinné)" rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                onFocus={e => (e.currentTarget.style.borderColor = PRIMARY)}
                onBlur={e => (e.currentTarget.style.borderColor = BORDER)}
              />
              <div>
                <button
                  type="submit"
                  style={{ padding: "12px 32px", backgroundColor: GREEN, color: WHITE, fontFamily: SANS, fontSize: 15, fontWeight: 500, border: "none", borderRadius: 50, cursor: "pointer", boxShadow: `inset 0 0 0 2px ${GREEN}`, transition: "all 350ms ease" }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = GREEN; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = GREEN; e.currentTarget.style.color = WHITE; }}
                >
                  Odeslat poptávku
                </button>
              </div>
            </form>
          </div>

          {/* Pravý sloupec — kontaktní info + mapa */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div style={{ backgroundColor: "#f8f8f8", borderRadius: 8, padding: "clamp(20px, 2.5vw, 32px)" }}>
              <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: DARK, marginBottom: 18 }}>
                <GenericEditableText sectionId={sectionId} field="companyName" value={companyName} tag="span" />
              </div>
              <InfoRow icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />{", "}
                <GenericEditableText sectionId={sectionId} field="city" value={city} tag="span" />
              </InfoRow>
              <InfoRow icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}>
                <a href={`tel:${phone.replace(/\s/g,"")}`} style={{ color: DARK, textDecoration: "none" }}>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
                {phone2 && <><br /><a href={`tel:${phone2.replace(/\s/g,"")}`} style={{ color: DARK, textDecoration: "none" }}><GenericEditableText sectionId={sectionId} field="phone2" value={phone2} tag="span" /></a></>}
              </InfoRow>
              <InfoRow icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}>
                <a href={`mailto:${email}`} style={{ color: DARK, textDecoration: "none" }}>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              </InfoRow>
              <InfoRow icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}>
                <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
              </InfoRow>
            </div>

            {/* Mapa */}
            <div style={{ borderRadius: 8, overflow: "hidden", height: 220, flexShrink: 0 }}>
              <iframe
                src={mapSrc}
                width="100%" height="100%"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                title="Mapa"
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .r04-contact-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: clamp(32px, 5vw, 64px); align-items: start; }
        .r04-contact-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
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
function ContactAutoservis02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const RED  = "#d82a2a";
  const DARK = "#1a1a1a";
  const SANS = "'Open Sans', Arial, sans-serif";

  const tagline = (content.tagline as string) || "Kde nás najdete";
  const title   = (content.title   as string) || "Kontakt a objednávka";
  const address = (content.address as string) || "";
  const phone   = (content.phone   as string) || "";
  const email   = (content.email   as string) || "";
  const hours   = (content.hours   as string) || "";

  const [name, setName] = React.useState("");
  const [msg, setMsg]   = React.useState("");
  const [sent, setSent] = React.useState(false);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", border: "1px solid #e0e0e0", borderRadius: 4,
    fontFamily: SANS, fontSize: 14, color: DARK, outline: "none", boxSizing: "border-box" as const,
    marginBottom: 12,
  };

  return (
    <section id={(content.id as string) || "kontakt"} style={{ backgroundColor: "#f5f5f5", fontFamily: SANS, padding: "72px 24px" }}>
      <div className="a02-contact-grid" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
        {/* Left info */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: RED, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </div>
          <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 900, color: DARK, lineHeight: 1.2, marginBottom: 32, whiteSpace: "pre-line" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {[
            { icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z", label: "Adresa", field: "address", value: address },
            { icon: "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z", label: "Telefon", field: "phone", value: phone },
            { icon: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z", label: "E-mail", field: "email", value: email },
            { icon: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z", label: "Provozní doba", field: "hours", value: hours },
          ].filter(item => item.value).map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: RED, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d={item.icon} /></svg>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: DARK }}>
                  <GenericEditableText sectionId={sectionId} field={item.field} value={item.value} tag="span" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: form */}
        <div style={{ backgroundColor: "#fff", borderRadius: 8, padding: 36, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: DARK, marginBottom: 20, fontFamily: SANS }}>Objednat se online</h3>
          {sent ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: RED, fontWeight: 700, fontSize: 16 }}>Zpráva odeslána! Ozveme se vám co nejdříve.</div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); setSent(true); }}>
              <input style={inputStyle} placeholder="Vaše jméno" value={name} onChange={e => setName(e.target.value)} required />
              <input style={inputStyle} placeholder="Telefon nebo e-mail" required />
              <input style={inputStyle} placeholder="SPZ nebo typ vozidla" />
              <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} placeholder="Popište závadu nebo požadovaný servis" value={msg} onChange={e => setMsg(e.target.value)} />
              <button type="submit" style={{ width: "100%", padding: "14px", backgroundColor: RED, color: "#fff", fontFamily: SANS, fontSize: 15, fontWeight: 700, border: "none", borderRadius: 4, cursor: "pointer", transition: "opacity 0.18s" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >Odeslat objednávku</button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 759px) {
          .a02-contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
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

  const tagline = String(content.tagline ?? "Kde nás najdete");
  const title   = String(content.title   ?? "Kontakt\na objednávka");
  const address = String(content.address ?? "");
  const phone   = String(content.phone   ?? "");
  const email   = String(content.email   ?? "");
  const hours   = String(content.hours   ?? "");
  const mapUrl  = String(content.mapEmbedUrl ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    await new Promise(r => setTimeout(r, 800));
    setStatus("success");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    padding: "12px 16px", background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.18)", borderRadius: 6,
    color: LIGHT, fontFamily: SANS, fontSize: 15, outline: "none",
  };

  return (
    <section id={String(content.id ?? "kontakt")} style={{ backgroundColor: DARK, padding: "96px 0" }} data-template="autoservis-01-contact">
      <style>{`
        .a01-contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px,6vw,80px); }
        @media (max-width: 768px) { .a01-contact-grid { grid-template-columns: 1fr; } }
        .a01-contact-input:focus { border-color: ${ORANGE} !important; }
        .a01-contact-input::placeholder { color: rgba(255,255,255,0.35); }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <div className="a01-contact-grid">
          {/* Left: info */}
          <div>
            <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: ORANGE, margin: "0 0 12px" }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            <h2 style={{ fontFamily: SANS, fontSize: "clamp(26px,3.2vw,38px)", fontWeight: 800, color: LIGHT, margin: "0 0 8px", lineHeight: 1.2, whiteSpace: "pre-line" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <div style={{ width: 48, height: 3, backgroundColor: ORANGE, borderRadius: 2, margin: "0 0 36px" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 36 }}>
              {address && (
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </span>
                  <div>
                    <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: ORANGE, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Adresa</div>
                    <div style={{ fontFamily: SANS, fontSize: 15, color: LIGHT }}>
                      <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                    </div>
                  </div>
                </div>
              )}
              {phone && (
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.95 12 19.79 19.79 0 0 1 1.92 3.38 2 2 0 0 1 3.89 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </span>
                  <div>
                    <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: ORANGE, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Telefon</div>
                    <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ fontFamily: SANS, fontSize: 15, color: LIGHT, textDecoration: "none" }}>
                      <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                    </a>
                  </div>
                </div>
              )}
              {email && (
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>
                  </span>
                  <div>
                    <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: ORANGE, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>E-mail</div>
                    <a href={`mailto:${email}`} style={{ fontFamily: SANS, fontSize: 15, color: LIGHT, textDecoration: "none" }}>
                      <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                    </a>
                  </div>
                </div>
              )}
              {hours && (
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </span>
                  <div>
                    <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: ORANGE, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Otevírací doba</div>
                    <div style={{ fontFamily: SANS, fontSize: 15, color: LIGHT }}>
                      <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {mapUrl && (
              <div style={{ borderRadius: 8, overflow: "hidden", height: 220, border: "1px solid rgba(255,255,255,0.12)" }}>
                <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0, display: "block" }} loading="lazy" />
              </div>
            )}
          </div>

          {/* Right: form */}
          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "40px 36px" }}>
            <h3 style={{ fontFamily: SANS, fontSize: 22, fontWeight: 800, color: LIGHT, margin: "0 0 28px" }}>Objednejte se online</h3>
            {status === "success" ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <svg width="26" height="20" viewBox="0 0 26 20" fill="none"><path d="M2 10L10 18L24 2" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 17, fontWeight: 700, color: LIGHT, margin: "0 0 8px" }}>Zpráva odeslána!</p>
                <p style={{ fontFamily: SANS, fontSize: 15, color: MUTED, margin: 0 }}>Ozveme se vám co nejdříve.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <input className="a01-contact-input" style={inputStyle} placeholder="Jméno a příjmení" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                <input className="a01-contact-input" style={inputStyle} type="tel" placeholder="Telefon" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                <input className="a01-contact-input" style={inputStyle} type="email" placeholder="E-mail" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                <textarea className="a01-contact-input" style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} placeholder="Vaše zpráva / typ vozidla a závada" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
                <button type="submit" disabled={status === "sending"}
                  style={{ padding: "14px 32px", backgroundColor: ORANGE, color: "#fff", fontFamily: SANS, fontSize: 15, fontWeight: 800, border: "none", borderRadius: 6, cursor: "pointer", opacity: status === "sending" ? 0.7 : 1, transition: "opacity 0.2s" }}>
                  {status === "sending" ? "Odesílám…" : "Odeslat objednávku"}
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
  const SANS = "'Inter', 'Helvetica Neue', sans-serif";
  const ORANGE = "#f97316";

  const tagline  = (content.tagline as string)     || "Kontaktujte nás";
  const title    = (content.title as string)        || "Objednejte se předem";
  const note     = (content.note as string)         || "";
  const address  = (content.address as string)      || "";
  const phone    = (content.phone as string)        || "";
  const email    = (content.email as string)        || "";
  const hours    = (content.hours as string)        || "";
  const whatsapp = (content.whatsapp as string)     || "";
  const formTitle    = (content.formTitle as string)    || "Rezervace termínu";
  const formSubtitle = (content.formSubtitle as string) || "";
  const services = (content.services as string[])   || [];

  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", service: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  const infoItems = [
    { icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
      ), label: "Adresa", value: address },
    { icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.47 2 2 0 0 1 3.62 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.09 6.09l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
        </svg>
      ), label: "Telefon", value: phone, href: `tel:+420${phone.replace(/\s/g, "")}` },
    { icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
        </svg>
      ), label: "E-mail", value: email, href: `mailto:${email}` },
    { icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ), label: "Provozní doba", value: hours },
  ];

  return (
    <section
      id={(content.id as string) || "kontakt"}
      data-template="autoservis-03-contact"
      style={{ backgroundColor: "#0a0a0a", padding: "100px 24px" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ORANGE }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </span>
          <h2 style={{ fontFamily: SANS, fontSize: "clamp(26px,3.2vw,40px)", fontWeight: 900, color: "#fff", margin: "12px 0 0", lineHeight: 1.2, whiteSpace: "pre-line" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {note && <p style={{ fontFamily: SANS, fontSize: 15, color: "#9ca3af", margin: "16px 0 0" }}>{note}</p>}
        </div>

        {/* 2-col: info left + form right */}
        <style>{`
          .a03-contact-grid { display: grid; grid-template-columns: 1fr 1.4fr; gap: 40px; align-items: start; }
          @media (max-width: 768px) { .a03-contact-grid { grid-template-columns: 1fr; } }
        `}</style>
        <div className="a03-contact-grid">
          {/* Left: contact info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {infoItems.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280", marginBottom: 4 }}>{item.label}</div>
                  {item.href
                    ? <a href={item.href} style={{ fontFamily: SANS, fontSize: 15, color: "#fff", textDecoration: "none" }}>{item.value}</a>
                    : <div style={{ fontFamily: SANS, fontSize: 15, color: "#fff" }}>{item.value}</div>
                  }
                </div>
              </div>
            ))}

            {/* WhatsApp CTA */}
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 10, backgroundColor: "#25D366", color: "#fff", fontFamily: SANS, fontSize: 14, fontWeight: 700, padding: "12px 24px", borderRadius: 10, textDecoration: "none", marginTop: 8 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.555 4.122 1.527 5.857L0 24l6.27-1.502A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.81 9.81 0 0 1-5.001-1.366l-.36-.213-3.718.89.929-3.62-.234-.372A9.808 9.808 0 0 1 2.182 12C2.182 6.579 6.579 2.182 12 2.182S21.818 6.579 21.818 12 17.421 21.818 12 21.818z"/>
                </svg>
                Napsat na WhatsApp
              </a>
            )}
          </div>

          {/* Right: booking form */}
          <div style={{ backgroundColor: "#111827", borderRadius: 16, padding: "40px 36px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 style={{ fontFamily: SANS, fontSize: 20, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>{formTitle}</h3>
            {formSubtitle && <p style={{ fontFamily: SANS, fontSize: 14, color: "#9ca3af", margin: "0 0 28px" }}>{formSubtitle}</p>}

            {sent ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "rgba(249,115,22,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>Rezervace odeslána!</p>
                <p style={{ fontFamily: SANS, fontSize: 14, color: "#9ca3af", margin: 0 }}>Brzy se vám ozveme s potvrzením termínu.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { id: "name",  label: "Jméno a příjmení", type: "text",  placeholder: "Jan Novák" },
                  { id: "phone", label: "Telefon",           type: "tel",   placeholder: "+420 704 123 456" },
                  { id: "email", label: "E-mail",            type: "email", placeholder: "vas@email.cz" },
                ].map(f => (
                  <div key={f.id}>
                    <label style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>{f.label}</label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={(form as Record<string, string>)[f.id]}
                      onChange={e => setForm(prev => ({ ...prev, [f.id]: e.target.value }))}
                      style={{ width: "100%", backgroundColor: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "11px 14px", fontFamily: SANS, fontSize: 14, color: "#fff", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                ))}

                {services.length > 0 && (
                  <div>
                    <label style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Typ služby</label>
                    <select
                      value={form.service}
                      onChange={e => setForm(prev => ({ ...prev, service: e.target.value }))}
                      style={{ width: "100%", backgroundColor: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "11px 14px", fontFamily: SANS, fontSize: 14, color: form.service ? "#fff" : "#6b7280", outline: "none", boxSizing: "border-box" }}
                    >
                      <option value="">Vyberte službu…</option>
                      {services.map((s, i) => <option key={i} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Zpráva (nepovinné)</label>
                  <textarea
                    rows={3}
                    placeholder="Popište problém nebo dotaz…"
                    value={form.message}
                    onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                    style={{ width: "100%", backgroundColor: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "11px 14px", fontFamily: SANS, fontSize: 14, color: "#fff", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                  />
                </div>

                <button
                  type="submit"
                  style={{ background: `linear-gradient(135deg, ${ORANGE}, #ea6c08)`, color: "#fff", fontFamily: SANS, fontSize: 15, fontWeight: 700, padding: "14px", borderRadius: 10, border: "none", cursor: "pointer", marginTop: 4 }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  Odeslat rezervaci
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
// Surface bg, title + kicker vlevo, 2 pobočky (karty) vpravo
// ─────────────────────────────────────────────────────────────────────────────
function ContactOrtho01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const TEAL    = "#00b7ad";
  const SLATE   = "#244757";
  const SURFACE = "#eef8f8";
  const FONT    = "'Inter', 'DM Sans', Arial, sans-serif";

  type Hour  = { days: string; time: string };
  type Branch = { city: string; address: string; zip: string; phone: string; email: string; hours: Hour[] };

  const title    = String(content.title   ?? "Kde nás najdete");
  const kicker   = String(content.kicker  ?? "Jsme v Praze a v Brně");
  const ctaText  = String(content.ctaText ?? "Objednat se online");
  const ctaHref  = String(content.ctaHref ?? "#kontakt");
  const branches = (content.branches as Branch[]) ?? [];

  return (
    <section
      id="kontakt"
      data-section-type="contact"
      data-variant="ortho-01-contact"
      style={{ backgroundColor: SURFACE, padding: "clamp(56px, 7vw, 96px) 0", fontFamily: FONT }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(36px, 5vw, 56px)" }}>
          <p style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: TEAL, margin: "0 0 10px" }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, color: SLATE, margin: "0 0 24px", lineHeight: 1.2 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <a
            href={ctaHref}
            data-btn="primary"
            style={{
              display: "inline-flex", alignItems: "center", padding: "13px 32px",
              backgroundColor: TEAL, color: "#fff",
              fontFamily: FONT, fontSize: "0.95rem", fontWeight: 700,
              borderRadius: "100px", textDecoration: "none",
              transition: "background-color 0.18s",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = SLATE; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = TEAL; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

        {/* Branch cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "clamp(16px, 3vw, 28px)" }}>
          {branches.map((b, i) => (
            <div key={i} style={{ backgroundColor: "#fff", borderRadius: 16, padding: "clamp(24px, 3vw, 36px)", boxShadow: "0 2px 16px rgba(0,36,55,0.07)" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: SLATE, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", width: 8, height: 8, borderRadius: "50%", backgroundColor: TEAL, flexShrink: 0 }} />
                <GenericEditableText sectionId={sectionId} field={`branches.${i}.city`} value={b.city} tag="span" />
              </h3>

              {/* Address */}
              <div style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                </svg>
                <span style={{ fontSize: "0.88rem", color: "#506470", lineHeight: 1.5 }}>
                  <GenericEditableText sectionId={sectionId} field={`branches.${i}.address`} value={b.address} tag="span" />{", "}
                  <GenericEditableText sectionId={sectionId} field={`branches.${i}.zip`} value={b.zip} tag="span" />
                </span>
              </div>

              {/* Phone */}
              <div style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.08 4.18 2 2 0 015 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                <a href={`tel:${b.phone}`} style={{ fontSize: "0.88rem", color: SLATE, textDecoration: "none", fontWeight: 600 }}>
                  <GenericEditableText sectionId={sectionId} field={`branches.${i}.phone`} value={b.phone} tag="span" />
                </a>
              </div>

              {/* Email */}
              <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <a href={`mailto:${b.email}`} style={{ fontSize: "0.88rem", color: SLATE, textDecoration: "none" }}>
                  <GenericEditableText sectionId={sectionId} field={`branches.${i}.email`} value={b.email} tag="span" />
                </a>
              </div>

              {/* Hours */}
              {b.hours?.length > 0 && (
                <div style={{ borderTop: `1px solid #e2eaed`, paddingTop: 16 }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: TEAL, margin: "0 0 10px" }}>
                    <GenericEditableText sectionId={sectionId} field="hoursLabel" value="Otevírací doba" tag="span" />
                  </p>
                  {b.hours.map((h, hi) => (
                    <div key={hi} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#506470", marginBottom: 4 }}>
                      <span><GenericEditableText sectionId={sectionId} field={`branches.${i}.hours.${hi}.days`} value={h.days} tag="span" /></span>
                      <span style={{ fontWeight: 500, color: SLATE }}><GenericEditableText sectionId={sectionId} field={`branches.${i}.hours.${hi}.time`} value={h.time} tag="span" /></span>
                    </div>
                  ))}
                </div>
              )}
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
  const MUTED = "#888";
  const FONT  = "'Raleway', 'Montserrat', Arial, sans-serif";

  const heading     = String(content.heading     ?? "Kontaktujte nás");
  const subheading  = String(content.subheading  ?? "Objednejte se");
  const body        = String(content.body        ?? "Online, telefonicky nebo e-mailem. Těšíme se na vás!");
  const phone       = String(content.phone       ?? "");
  const email       = String(content.email       ?? "");
  const address     = String(content.address     ?? "");
  const hours       = String(content.hours       ?? "");
  const bookingHref = String(content.bookingHref ?? "#");
  const ctaText     = String(content.ctaText     ?? "Objednat se online");
  const mapLat      = String(content.mapLat      ?? "50.0755");
  const mapLng      = String(content.mapLng      ?? "14.4378");

  const mapSrc = `https://maps.google.com/maps?q=${mapLat},${mapLng}&z=15&output=embed`;

  return (
    <section
      id="kontakt"
      data-section-type="contact"
      data-variant="ortho-02-contact"
      style={{ backgroundColor: "#fff", fontFamily: FONT }}
    >
      {/* Info strip */}
      <div style={{ backgroundColor: "#f7f6f4", padding: "clamp(56px, 7vw, 96px) 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "clamp(40px, 5vw, 64px)" }}>
            <p style={{ fontSize: "clamp(0.7rem, 1vw, 0.78rem)", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: 14 }}>
              <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
            </p>
            <h2 style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.6rem)", fontWeight: 300, color: DARK, margin: "0 auto 16px", lineHeight: 1.25 }}>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            <p style={{ fontSize: "clamp(0.9rem, 1.2vw, 1.05rem)", color: MUTED, margin: 0 }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          </div>

          {/* Info cards */}
          <div className="o02-contact-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "clamp(12px, 2vw, 24px)", marginBottom: "clamp(32px, 4vw, 56px)" }}>
            <div style={{ backgroundColor: "#fff", border: "1px solid #e8e5e0", borderRadius: 4, padding: "clamp(20px, 2.5vw, 32px)", textAlign: "center" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={BEIGE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", margin: "0 auto 12px" }}>
                <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.08 4.18 2 2 0 015 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
              <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, margin: "0 0 6px" }}>Telefon</p>
              <a href={`tel:${phone}`} style={{ fontSize: "clamp(0.88rem, 1.1vw, 1rem)", fontWeight: 600, color: DARK, textDecoration: "none" }}>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            </div>

            <div style={{ backgroundColor: "#fff", border: "1px solid #e8e5e0", borderRadius: 4, padding: "clamp(20px, 2.5vw, 32px)", textAlign: "center" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={BEIGE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", margin: "0 auto 12px" }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, margin: "0 0 6px" }}>E-mail</p>
              <a href={`mailto:${email}`} style={{ fontSize: "clamp(0.88rem, 1.1vw, 1rem)", fontWeight: 600, color: DARK, textDecoration: "none" }}>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            </div>

            <div style={{ backgroundColor: "#fff", border: "1px solid #e8e5e0", borderRadius: 4, padding: "clamp(20px, 2.5vw, 32px)", textAlign: "center" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={BEIGE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", margin: "0 auto 12px" }}>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
              </svg>
              <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, margin: "0 0 6px" }}>Adresa</p>
              <p style={{ fontSize: "clamp(0.88rem, 1.1vw, 1rem)", fontWeight: 600, color: DARK, margin: 0, lineHeight: 1.4 }}>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </p>
            </div>

            <div style={{ backgroundColor: "#fff", border: "1px solid #e8e5e0", borderRadius: 4, padding: "clamp(20px, 2.5vw, 32px)", textAlign: "center" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={BEIGE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", margin: "0 auto 12px" }}>
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, margin: "0 0 6px" }}>Ordinační hodiny</p>
              <p style={{ fontSize: "clamp(0.88rem, 1.1vw, 1rem)", fontWeight: 600, color: DARK, margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
              </p>
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center" }}>
            <a
              href={bookingHref}
              style={{
                display: "inline-flex", alignItems: "center",
                padding: "14px 40px",
                border: `2px solid ${DARK}`, borderRadius: 2,
                fontSize: "clamp(0.85rem, 1vw, 0.95rem)", fontWeight: 600,
                letterSpacing: "0.05em", textTransform: "uppercase",
                color: DARK, textDecoration: "none",
                transition: "background 0.18s, color 0.18s",
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = DARK; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = DARK; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ width: "100%", height: "clamp(280px, 35vw, 480px)", overflow: "hidden" }}>
        <iframe
          src={mapSrc}
          width="100%" height="100%"
          style={{ border: 0, display: "block", filter: "grayscale(25%)" }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          title="Mapa ordinace"
        />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .o02-contact-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .o02-contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/* ─── ContactLawyer01 ─────────────────────────────────────────── */
function ContactLawyer01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY    = "#141760";
  const CRIMSON = "#a70336";
  const HEADING = "'Raleway','Montserrat','Helvetica Neue',Arial,sans-serif";
  const BODY    = "'Open Sans','Helvetica Neue',Arial,sans-serif";

  const title   = String(content.title ?? "Kontaktujte nás");
  const offices = Array.isArray(content.offices) ? content.offices as Array<Record<string, string>> : [];

  return (
    <section
      id="kontakt"
      data-variant="lawyer-01-contact"
      style={{ backgroundColor: "#f7f8fa", padding: "88px 0 96px" }}
    >
      <style>{`
        @media (max-width: 900px) {
          .l01-contact-outer { grid-template-columns: 1fr !important; }
          .l01-contact-grid  { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 580px) {
          .l01-contact-grid  { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 32px" }}>
        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ width: 36, height: 3, backgroundColor: CRIMSON, marginBottom: 20 }} />
          <h2 style={{ fontFamily: HEADING, fontSize: "clamp(1.75rem,3vw,2.5rem)", fontWeight: 700, color: NAVY, margin: 0, lineHeight: 1.15 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>

        {/* 2-col: offices grid left, form right */}
        <div className="l01-contact-outer" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px,5vw,80px)", alignItems: "start" }}>

          {/* Offices */}
          <div>
            <div
              className="l01-contact-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
            >
              {offices.map((o, i) => (
                <div
                  key={i}
                  style={{ backgroundColor: "#fff", borderRadius: 4, padding: "24px 22px", borderTop: `3px solid ${CRIMSON}`, boxShadow: "0 2px 12px rgba(20,23,96,0.07)" }}
                >
                  <p style={{ fontFamily: HEADING, fontSize: "1rem", fontWeight: 700, color: NAVY, margin: "0 0 10px" }}>
                    <GenericEditableText sectionId={sectionId} field={`offices.${i}.city`} value={o.city ?? ""} tag="span" />
                  </p>
                  <p style={{ fontFamily: BODY, fontSize: "0.85rem", color: "#4b5563", margin: "0 0 8px", lineHeight: 1.5 }}>
                    <GenericEditableText sectionId={sectionId} field={`offices.${i}.address`} value={o.address ?? ""} tag="span" />
                  </p>
                  <a href={`tel:${(o.phone ?? "").replace(/\s/g, "")}`} style={{ fontFamily: BODY, fontSize: "0.83rem", color: NAVY, textDecoration: "none", display: "block", marginBottom: 2 }}>
                    <GenericEditableText sectionId={sectionId} field={`offices.${i}.phone`} value={o.phone ?? ""} tag="span" />
                  </a>
                  <a href={`mailto:${o.email ?? ""}`} style={{ fontFamily: BODY, fontSize: "0.83rem", color: CRIMSON, textDecoration: "none" }}>
                    <GenericEditableText sectionId={sectionId} field={`offices.${i}.email`} value={o.email ?? ""} tag="span" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Contact form */}
          <div style={{ backgroundColor: "#fff", borderRadius: 4, padding: "40px 36px", boxShadow: "0 2px 16px rgba(20,23,96,0.08)" }}>
            <h3 style={{ fontFamily: HEADING, fontSize: "1.2rem", fontWeight: 700, color: NAVY, margin: "0 0 28px" }}>Napište nám</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {(["Jméno a příjmení", "E-mailová adresa", "Telefon"] as string[]).map((label, i) => (
                <div key={i}>
                  <label style={{ fontFamily: BODY, fontSize: "0.8rem", fontWeight: 600, color: "#6b7280", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>{label.toUpperCase()}</label>
                  <input
                    type={i === 1 ? "email" : i === 2 ? "tel" : "text"}
                    style={{ width: "100%", padding: "11px 14px", fontFamily: BODY, fontSize: "0.92rem", border: "1px solid #e5e7eb", borderRadius: 4, outline: "none", boxSizing: "border-box", color: "#1a1a1a" }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontFamily: BODY, fontSize: "0.8rem", fontWeight: 600, color: "#6b7280", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>ZPRÁVA</label>
                <textarea
                  rows={4}
                  style={{ width: "100%", padding: "11px 14px", fontFamily: BODY, fontSize: "0.92rem", border: "1px solid #e5e7eb", borderRadius: 4, outline: "none", resize: "vertical", boxSizing: "border-box", color: "#1a1a1a" }}
                />
              </div>
              <button
                type="submit"
                style={{ padding: "13px 0", backgroundColor: NAVY, color: "#fff", fontFamily: BODY, fontSize: "0.93rem", fontWeight: 600, border: "none", borderRadius: 4, cursor: "pointer", letterSpacing: "0.04em", transition: "background 0.18s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = CRIMSON; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = NAVY; }}
              >
                ODESLAT ZPRÁVU
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

  const tagline   = String(content.tagline   ?? "Napište nebo zavolejte");
  const title     = String(content.title     ?? "Domluvme si\nkonzultaci");
  const formTitle = String(content.formTitle ?? "Nezávazná poptávka");
  const address   = String(content.address   ?? "");
  const phone     = String(content.phone     ?? "");
  const email     = String(content.email     ?? "");
  const hours     = String(content.hours     ?? "");

  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  const InfoItem = ({ icon, label, value, href, field }: { icon: React.ReactNode; label: string; value: string; href?: string; field: string }) => (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 10, backgroundColor: "rgba(255,111,13,0.10)", display: "flex", alignItems: "center", justifyContent: "center", color: ORANGE }}>
        {icon}
      </div>
      <div>
        <div style={{ color: GRAY, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
        {href ? (
          <a href={href} style={{ color: DARK, fontSize: "0.95rem", fontWeight: 600, textDecoration: "none" }}>
            <GenericEditableText sectionId={sectionId} field={field} value={value} tag="span" />
          </a>
        ) : (
          <div style={{ color: DARK, fontSize: "0.95rem", fontWeight: 600 }}>
            <GenericEditableText sectionId={sectionId} field={field} value={value} tag="span" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section id={String(content.id ?? "kontakt")} style={{ backgroundColor: "#ffffff", fontFamily: FONT, padding: "clamp(64px,9vw,112px) 0" }} data-template="stavba-01">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        <div className="stavba-contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>

          {/* Left — info */}
          <div>
            <p style={{ color: ORANGE, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 12px" }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            <h2 style={{ color: DARK, fontSize: "clamp(26px,3.5vw,44px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 40px", whiteSpace: "pre-line" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {phone && <InfoItem field="phone" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12.25 19.79 19.79 0 0 1 1.17 3.63 2 2 0 0 1 3.15 1.45h3a2 2 0 0 1 2 1.72c.12.97.33 1.93.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.88.37 1.84.58 2.81.7A2 2 0 0 1 21 16.92z"/></svg>} label="Telefon" value={phone} href={`tel:+420${phone.replace(/\s/g,"")}`} />}
              {email && <InfoItem field="email" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>} label="E-mail" value={email} href={`mailto:${email}`} />}
              {address && <InfoItem field="address" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>} label="Adresa" value={address} />}
              {hours && <InfoItem field="hours" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>} label="Provozní doba" value={hours} />}
            </div>
          </div>

          {/* Right — form */}
          <div style={{ backgroundColor: "#f8f7f4", borderRadius: 16, padding: 40 }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "rgba(255,111,13,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: ORANGE }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <h3 style={{ color: DARK, fontFamily: FONT, fontWeight: 700, fontSize: "1.1rem", margin: "0 0 8px" }}>Zpráva odeslána!</h3>
                <p style={{ color: GRAY, fontSize: "0.9rem", margin: 0 }}>Ozveme se Vám co nejdříve.</p>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true); }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h3 style={{ color: DARK, fontFamily: FONT, fontWeight: 700, fontSize: "1.1rem", margin: "0 0 8px" }}>
                  <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" />
                </h3>
                <input type="text" placeholder="Vaše jméno" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                  style={{ padding: "12px 14px", borderRadius: 8, border: "1px solid #e0e0e0", fontFamily: FONT, fontSize: "0.9rem", color: DARK, backgroundColor: "#fff", outline: "none" }} />
                <input type="tel" placeholder="Telefon" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  style={{ padding: "12px 14px", borderRadius: 8, border: "1px solid #e0e0e0", fontFamily: FONT, fontSize: "0.9rem", color: DARK, backgroundColor: "#fff", outline: "none" }} />
                <textarea placeholder="Popište váš projekt nebo dotaz..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4}
                  style={{ padding: "12px 14px", borderRadius: 8, border: "1px solid #e0e0e0", fontFamily: FONT, fontSize: "0.9rem", color: DARK, backgroundColor: "#fff", resize: "vertical", outline: "none" }} />
                <button type="submit" style={{ padding: "14px 0", backgroundColor: ORANGE, color: "#fff", fontFamily: FONT, fontSize: "0.95rem", fontWeight: 700, border: "none", borderRadius: 8, cursor: "pointer", marginTop: 4, boxShadow: "0 4px 16px rgba(255,111,13,0.28)", transition: "opacity 0.18s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}>
                  Odeslat poptávku
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

  const kicker    = String(content.kicker    ?? "Kontakt");
  const title     = String(content.title     ?? "Kontaktujte mě");
  const formTitle = String(content.formTitle ?? "Napište mi");
  const phone     = String(content.phone     ?? "704 123 456");
  const email     = String(content.email     ?? "info@demo.cz");
  const address   = String(content.address   ?? "Ukázková 123, 110 00 Praha 1");
  const hours     = String(content.hours     ?? "Po–Pá 8:00–18:00");

  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: 0,
    border: "1px solid rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.06)",
    color: WHITE, fontFamily: "'Roboto',sans-serif", fontSize: "0.9rem", outline: "none",
    boxSizing: "border-box",
  };

  return (
    <section id="kontakt" data-template="elektro-01"
      style={{ backgroundColor: DARK, fontFamily: FONT, padding: "clamp(56px,8vw,96px) 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>

        <div style={{ marginBottom: 48 }}>
          <span style={{ color: RED, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </span>
          <h2 style={{ color: WHITE, fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 800, margin: "8px 0 0", lineHeight: 1.15, fontFamily: FONT }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 60 }} className="elektro-contact-grid">
          {/* Info vlevo */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {[
              { icon: "📞", label: "Telefon", val: phone, field: "phone" },
              { icon: "✉️", label: "E-mail",  val: email, field: "email" },
              { icon: "📍", label: "Adresa",  val: address, field: "address" },
              { icon: "🕐", label: "Hodiny",  val: hours, field: "hours" },
            ].map(({ icon, label, val, field }) => (
              <div key={field} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20, lineHeight: 1.4 }}>{icon}</span>
                <div>
                  <div style={{ color: RED, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                  <div style={{ color: "rgba(255,255,255,0.88)", fontSize: "0.95rem", fontWeight: 500, fontFamily: "'Roboto',sans-serif" }}>
                    <GenericEditableText sectionId={sectionId} field={field} value={val} tag="span" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Formulář vpravo */}
          <div style={{ backgroundColor: "rgba(255,255,255,0.04)", padding: "36px 32px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ color: WHITE, fontSize: "1.15rem", fontWeight: 700, margin: "0 0 24px", fontFamily: FONT }}>
              <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" />
            </h3>
            {sent ? (
              <p style={{ color: RED, fontWeight: 600, fontSize: "1rem" }}>Zpráva odeslána. Ozvu se co nejdříve!</p>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input placeholder="Jméno" required value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  style={inputStyle} />
                <input placeholder="Telefon" value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  style={inputStyle} />
                <input placeholder="E-mail" type="email" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  style={inputStyle} />
                <textarea placeholder="Popis práce / zpráva" rows={4} required value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  style={{ ...inputStyle, resize: "vertical" }} />
                <button type="submit" style={{ backgroundColor: RED, color: WHITE, border: "none", fontFamily: FONT, fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "14px 0", borderRadius: 0, cursor: "pointer", transition: "opacity 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.86"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}>
                  <GenericEditableText sectionId={sectionId} field="submitText" value={String(content.submitText ?? "Odeslat")} tag="span" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width:800px) { .elektro-contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }
      `}</style>
    </section>
  );
}

function ContactLegal02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY   = "#143171";
  const ORANGE = "#EB5C2E";
  const BOLD   = "bw_gradualbold, Georgia, serif";
  const REG    = "bw_gradualregular, Georgia, serif";

  const title    = (content.title    as string) ?? "Jsme tu pro vás";
  const subtitle = (content.subtitle as string) ?? "";
  const phone    = (content.phone    as string) ?? "";
  const email    = (content.email    as string) ?? "";
  const address  = (content.address  as string) ?? "";

  return (
    <section id={String(sectionId)} data-variant="legal-02-contact" style={{ backgroundColor: "#ECEFF4", padding: "128px 0" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 80px", boxSizing: "border-box" }}>
        <div style={{ backgroundColor: "#DCDFEB", padding: "104px" }}>
          <div style={{ display: "flex", gap: 80 }}>

            {/* Left — info */}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: BOLD, fontSize: 32, lineHeight: "40px", fontWeight: 400, color: NAVY, margin: "0 0 32px" }}>
                {title}
              </h2>
              {subtitle && (
                <p style={{ fontFamily: REG, fontSize: 18, lineHeight: "28px", color: NAVY, margin: "0 0 48px", opacity: 0.85 }}>
                  {subtitle}
                </p>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: REG, fontSize: 16, color: NAVY }}>
                {phone && (
                  <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                    <span style={{ fontFamily: BOLD, fontSize: 13, letterSpacing: "0.1em", opacity: 0.55, minWidth: 20 }}>T</span>
                    <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ color: NAVY, textDecoration: "none", fontSize: 18 }}>{phone}</a>
                  </div>
                )}
                {email && (
                  <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                    <span style={{ fontFamily: BOLD, fontSize: 13, letterSpacing: "0.1em", opacity: 0.55, minWidth: 20 }}>E</span>
                    <a href={`mailto:${email}`} style={{ color: NAVY, textDecoration: "none", fontSize: 18 }}>{email}</a>
                  </div>
                )}
                {address && (
                  <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                    <span style={{ fontFamily: BOLD, fontSize: 13, letterSpacing: "0.1em", opacity: 0.55, minWidth: 20 }}>A</span>
                    <span style={{ fontSize: 16 }}>{address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right — form */}
            <div style={{ width: "50%", flexShrink: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {(["Jméno a příjmení", "E-mailová adresa", "Telefon"] as string[]).map((label, i) => (
                  <div key={i}>
                    <label style={{ fontFamily: BOLD, fontSize: 12, letterSpacing: "0.08em", color: NAVY, opacity: 0.6, display: "block", marginBottom: 6 }}>{label.toUpperCase()}</label>
                    <input
                      type={i === 1 ? "email" : i === 2 ? "tel" : "text"}
                      style={{ width: "100%", padding: "13px 16px", fontFamily: REG, fontSize: 15, border: "1px solid rgba(20,49,113,0.25)", backgroundColor: "#fff", outline: "none", boxSizing: "border-box", color: NAVY }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ fontFamily: BOLD, fontSize: 12, letterSpacing: "0.08em", color: NAVY, opacity: 0.6, display: "block", marginBottom: 6 }}>ZPRÁVA</label>
                  <textarea
                    rows={5}
                    style={{ width: "100%", padding: "13px 16px", fontFamily: REG, fontSize: 15, border: "1px solid rgba(20,49,113,0.25)", backgroundColor: "#fff", outline: "none", resize: "vertical", boxSizing: "border-box", color: NAVY }}
                  />
                </div>
                <button
                  type="submit"
                  style={{ padding: "16px 0", backgroundColor: NAVY, color: "#fff", fontFamily: BOLD, fontSize: 14, letterSpacing: "0.08em", border: "none", cursor: "pointer", transition: "background 0.18s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = ORANGE; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = NAVY; }}
                >
                  ODESLAT ZPRÁVU
                </button>
              </div>
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
    <section style={{ background: DARK, padding: "90px 0", fontFamily: FONT }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <p style={{ color: ORANGE, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 12px" }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 style={{ color: "#fff", fontSize: "clamp(26px,3.2vw,40px)", fontWeight: 800, lineHeight: 1.15, margin: 0 }}>
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
                label: "Telefon", value: phone, field: "phone", href: `tel:${phone.replace(/\s/g, "")}`,
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                label: "E-mail", value: email, field: "email", href: `mailto:${email}`,
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                label: "Adresa", value: address, field: "address", href: undefined,
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                label: "Provozní hodiny", value: hours, field: "hours", href: undefined,
              },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 16, marginBottom: 28 }}>
                <div style={{ width: 44, height: 44, background: "#fff1e6", borderRadius: 0, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <p style={{ color: "#999", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 4px" }}>{item.label as string}</p>
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
                IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" />
              </p>
            )}
          </div>

          {/* Right — form */}
          <div style={{ background: "#242222", padding: "40px 36px" }}>
            <h3 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: 700, margin: "0 0 28px", borderBottom: `2px solid ${ORANGE}`, paddingBottom: 14 }}>
              <GenericEditableText sectionId={sectionId} field="formHeading" value={formHeading} tag="span" />
            </h3>

            {sent ? (
              <div style={{ padding: "32px 0", textAlign: "center" }}>
                <div style={{ width: 56, height: 56, background: "#fff1e6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem", margin: "0 0 8px" }}>Poptávka odeslána!</p>
                <p style={{ color: "#999", fontSize: "0.9rem", margin: 0 }}>Ozveme se vám do 24 hodin.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="stavba03-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <input name="name" placeholder="Jméno a příjmení *" required value={form.name} onChange={handleChange} style={inputStyle} />
                  <input name="phone" placeholder="Telefon *" required value={form.phone} onChange={handleChange} style={inputStyle} />
                </div>
                <input name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} style={inputStyle} />
                <textarea name="message" placeholder="Popište vaši zakázku..." rows={5} value={form.message} onChange={handleChange} style={{ ...inputStyle, resize: "vertical" }} />
                <button type="submit" disabled={sending} style={{
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
// Cream #EDE9E3 bg, 2-col: left = kicker + H2 + info blocks | right = white card form
// ─────────────────────────────────────────────────────────────────────────────
function ContactStavba02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const BROWN = "#674832";
  const DARK  = "#2D1A0F";
  const MUTED = "#7A6454";
  const CREAM = "#EDE9E3";
  const FONT  = "'Roboto', sans-serif";

  const sectionId2 = String(content.id      ?? "poptavka");
  const kicker     = String(content.kicker  ?? "Nezávazná poptávka");
  const title      = String(content.title   ?? "Kontaktujte nás");
  const phone      = String(content.phone   ?? "");
  const email      = String(content.email   ?? "");
  const address    = String(content.address ?? "");
  const ctaText    = String(content.ctaText ?? "Odeslat poptávku");

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", border: "1px solid #D4C9BE", borderRadius: 6,
    fontFamily: FONT, fontSize: "0.9rem", color: DARK, backgroundColor: "#fff",
    outline: "none", boxSizing: "border-box",
  };

  return (
    <section id={sectionId2} style={{ backgroundColor: CREAM, fontFamily: FONT, padding: "clamp(64px, 8vw, 100px) 0" }} data-template="stavba-02">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        <div className="s02-contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "clamp(40px, 6vw, 72px)", alignItems: "start" }}>

          {/* Left — info */}
          <div>
            <p style={{ color: BROWN, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 14px" }}>
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            </p>
            <h2 style={{ color: DARK, fontSize: "clamp(24px, 3.2vw, 40px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", margin: "0 0 32px" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {phone && (
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: BROWN, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72 12.7 12.7 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.19-1.19a2 2 0 012.11-.45 12.7 12.7 0 002.81.7A2 2 0 0122 14.92z"/></svg>
                  </span>
                  <div>
                    <div style={{ color: MUTED, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Telefon</div>
                    <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ color: DARK, fontSize: "0.95rem", fontWeight: 600, textDecoration: "none" }}>
                      <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                    </a>
                  </div>
                </div>
              )}
              {email && (
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: BROWN, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </span>
                  <div>
                    <div style={{ color: MUTED, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>E-mail</div>
                    <a href={`mailto:${email}`} style={{ color: DARK, fontSize: "0.95rem", fontWeight: 600, textDecoration: "none" }}>
                      <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                    </a>
                  </div>
                </div>
              )}
              {address && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <span style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: BROWN, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </span>
                  <div>
                    <div style={{ color: MUTED, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Adresa</div>
                    <span style={{ color: DARK, fontSize: "0.95rem", fontWeight: 600 }}>
                      <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right — form card */}
          <div style={{ backgroundColor: "#fff", borderRadius: 14, padding: "clamp(28px, 4vw, 44px)", boxShadow: "0 4px 32px rgba(45,26,15,0.09)" }}>
            <form onSubmit={e => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="s02-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", color: MUTED, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Jméno</label>
                  <input type="text" placeholder="Vaše jméno" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", color: MUTED, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Telefon</label>
                  <input type="tel" placeholder="+420 xxx xxx xxx" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", color: MUTED, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>E-mail</label>
                <input type="email" placeholder="vas@email.cz" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", color: MUTED, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Zpráva</label>
                <textarea placeholder="Popište, co potřebujete zrekonstruovat..." rows={4} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <button
                type="submit"
                style={{ backgroundColor: BROWN, color: "#fff", fontFamily: FONT, fontSize: "0.9rem", fontWeight: 700, padding: "14px 28px", border: "none", borderRadius: 6, cursor: "pointer", transition: "opacity 0.18s", marginTop: 4 }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
              >
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
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
  const DARK = "#1e293b";

  const kicker = (content.kicker as string) || "";
  const title = (content.title as string) || "";
  const phone = (content.phone as string) || "";
  const email = (content.email as string) || "";
  const address = (content.address as string) || "";
  const hours = (content.hours as string) || "";
  const submitText = (content.submitText as string) || "Odeslat";

  const [sent, setSent] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", subject: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 15,
    fontFamily: "inherit",
    color: DARK,
    background: "#fff",
    boxSizing: "border-box",
    outline: "none",
  };

  return (
    <section id={String(sectionId)} style={{ background: "#fff", padding: "80px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        <div className="i01-contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 56, alignItems: "start" }}>

          {/* Left: info */}
          <div>
            {kicker && (
              <p style={{ fontSize: 15, fontWeight: 300, textTransform: "uppercase", letterSpacing: "0.14em", color: "#222222", marginBottom: 12 }}>
                <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
              </p>
            )}
            <h2 style={{ fontSize: "clamp(26px,3vw,40px)", fontWeight: 600, textTransform: "capitalize", color: DARK, lineHeight: 1.2, marginBottom: 32 }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {phone && (
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: YELLOW, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 6 6l.9-.9a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 16z"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: "#888", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>Telefon</p>
                    <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ fontSize: 17, fontWeight: 600, color: DARK, textDecoration: "none" }}>
                      <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                    </a>
                  </div>
                </div>
              )}
              {email && (
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: YELLOW, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: "#888", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>E-mail</p>
                    <a href={`mailto:${email}`} style={{ fontSize: 17, fontWeight: 600, color: DARK, textDecoration: "none" }}>
                      <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                    </a>
                  </div>
                </div>
              )}
              {address && (
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: YELLOW, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: "#888", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>Adresa</p>
                    <p style={{ fontSize: 17, fontWeight: 600, color: DARK }}>
                      <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                    </p>
                  </div>
                </div>
              )}
              {hours && (
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: YELLOW, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: "#888", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>Pracovní doba</p>
                    <p style={{ fontSize: 17, fontWeight: 600, color: DARK }}>
                      <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: form */}
          <div style={{ background: "#F2F5F7", borderRadius: 16, padding: "40px 40px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: YELLOW, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <p style={{ fontSize: 20, fontWeight: 600, color: DARK }}>Zpráva odeslána!</p>
                <p style={{ fontSize: 15, color: "#555", marginTop: 8 }}>Ozveme se vám co nejdříve.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="i01-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: "#555", display: "block", marginBottom: 6 }}>Jméno *</label>
                    <input required style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: "#555", display: "block", marginBottom: 6 }}>E-mail *</label>
                    <input required type="email" style={inputStyle} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>
                <div className="i01-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: "#555", display: "block", marginBottom: 6 }}>Telefon</label>
                    <input style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: "#555", display: "block", marginBottom: 6 }}>Předmět</label>
                    <input style={inputStyle} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#555", display: "block", marginBottom: 6 }}>Zpráva</label>
                  <textarea rows={5} style={{ ...inputStyle, resize: "vertical" }} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                </div>
                <button type="submit" style={{
                  alignSelf: "flex-start",
                  background: YELLOW,
                  color: DARK,
                  border: "none",
                  borderRadius: 999,
                  padding: "14px 36px",
                  fontSize: 16,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                }}
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
        @media (max-width: 860px) {
          .i01-contact-grid { grid-template-columns: 1fr !important; }
          .i01-form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
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

// ─── sweet-01 Locations — branch cards grid, white bg ────────────────────────
function LocationsSweet01({
  content,
  sectionId,
}: {
  content: Record<string, unknown>;
  sectionId: number;
}) {
  interface Branch { name: string; address: string; hours: string; phone: string; }
  const title    = String(content.title    ?? "Kde nás najdete?");
  const subtitle = String(content.subtitle ?? "");
  const email    = String(content.email    ?? "");
  const phone    = String(content.phone    ?? "");
  const branches = (content.branches as Branch[]) ?? [];

  const RED  = "#E2001A";
  const DARK = "#0a0a0a";
  const FONT = "'Roboto','Helvetica Neue',Arial,sans-serif";

  return (
    <section
      data-variant="sweet-01-locations"
      style={{ background: "#fefefe", padding: "80px 0", borderTop: "1px solid #e8e8e8" }}
    >
      <style>{`
        .sw01-loc-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .sw01-loc-hd { text-align: center; margin-bottom: 48px; }
        .sw01-loc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .sw01-loc-card { border: 1px solid #e8e8e8; border-radius: 4px; padding: 32px 28px; display: flex; flex-direction: column; gap: 12px; }
        .sw01-loc-card h3 { font-family: ${FONT}; font-size: 1rem; font-weight: 700; color: ${DARK}; margin: 0 0 4px; padding-bottom: 12px; border-bottom: 2px solid ${RED}; }
        .sw01-loc-row { display: flex; align-items: flex-start; gap: 10px; }
        .sw01-loc-row-icon { flex-shrink: 0; margin-top: 2px; }
        .sw01-loc-row-text { font-family: ${FONT}; font-size: 0.875rem; color: #444; line-height: 1.55; }
        .sw01-loc-footer { margin-top: 48px; padding-top: 32px; border-top: 1px solid #e8e8e8; display: flex; justify-content: center; gap: 48px; flex-wrap: wrap; }
        .sw01-loc-contact-item { display: flex; align-items: center; gap: 10px; font-family: ${FONT}; font-size: 0.95rem; color: ${DARK}; }
        .sw01-loc-contact-item a { color: ${DARK}; text-decoration: none; }
        .sw01-loc-contact-item a:hover { color: ${RED}; }
        @media (max-width: 900px) {
          .sw01-loc-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 600px) {
          .sw01-loc-grid { grid-template-columns: 1fr; }
          .sw01-loc-footer { flex-direction: column; align-items: center; gap: 20px; }
        }
      `}</style>

      <div className="sw01-loc-inner">
        <div className="sw01-loc-hd">
          <h2 style={{ fontFamily: FONT, fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 700, color: DARK, margin: "0 0 12px" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {subtitle && (
            <p style={{ fontFamily: FONT, fontSize: "1rem", color: "#666", margin: 0 }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}
        </div>

        <div className="sw01-loc-grid">
          {branches.map((b, i) => (
            <div key={i} className="sw01-loc-card">
              <h3>
                <GenericEditableText sectionId={sectionId} field={`branches.${i}.name`} value={b.name} tag="span" />
              </h3>

              {/* Address */}
              <div className="sw01-loc-row">
                <span className="sw01-loc-row-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </span>
                <span className="sw01-loc-row-text">
                  <GenericEditableText sectionId={sectionId} field={`branches.${i}.address`} value={b.address} tag="span" />
                </span>
              </div>

              {/* Hours */}
              <div className="sw01-loc-row">
                <span className="sw01-loc-row-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </span>
                <span className="sw01-loc-row-text">
                  <GenericEditableText sectionId={sectionId} field={`branches.${i}.hours`} value={b.hours} tag="span" />
                </span>
              </div>

              {/* Phone */}
              <div className="sw01-loc-row">
                <span className="sw01-loc-row-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                  </svg>
                </span>
                <span className="sw01-loc-row-text">
                  <a href={`tel:${b.phone.replace(/\s/g, "")}`} style={{ color: "#444", textDecoration: "none" }}>
                    <GenericEditableText sectionId={sectionId} field={`branches.${i}.phone`} value={b.phone} tag="span" />
                  </a>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Global contact footer */}
        {(email || phone) && (
          <div className="sw01-loc-footer">
            {phone && (
              <div className="sw01-loc-contact-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                </svg>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </div>
            )}
            {email && (
              <div className="sw01-loc-contact-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/>
                </svg>
                <a href={`mailto:${email}`}>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── autoskola-01 Contact — 2-col formulář + info ────────────────────────────
function ContactAutoskola01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const heading    = String(content.heading    ?? "Kontaktujte nás");
  const subheading = String(content.subheading ?? "Rádi vám odpovíme na jakékoliv dotazy.");
  const phone      = String(content.phone      ?? "704 123 456");
  const email      = String(content.email      ?? "info@demo.cz");
  const address    = String(content.address    ?? "Ukázková 123, 110 00 Praha 1");
  const hours      = String(content.hours      ?? "Po–Pá 9:00–18:00");
  const ctaText    = String(content.ctaText    ?? "Odeslat zprávu");
  const ff         = (content.formFields as Record<string, string>) ?? {};

  const ORANGE = "#f16823";
  const DARK   = "#484848";
  const FONT   = "'Roboto', sans-serif";

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", fontFamily: FONT, fontSize: 14,
    border: "1px solid #e0e0e0", borderRadius: 4, outline: "none",
    backgroundColor: "#fafafa", color: DARK, boxSizing: "border-box",
  };

  const InfoRow = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
      <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: "50%", backgroundColor: "#fff3ec", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
        {icon}
      </div>
      <span style={{ fontFamily: FONT, fontSize: "0.9rem", color: DARK, lineHeight: 1.6, paddingTop: 6 }}>{text}</span>
    </div>
  );

  const ic = (path: React.ReactNode) => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{path}</svg>
  );

  return (
    <section id={String(sectionId)} style={{ backgroundColor: "#fff", padding: "80px clamp(24px, 6vw, 80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)", color: DARK, margin: "0 0 12px" }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: "1rem", color: "#777", margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
          </p>
          <div style={{ width: 48, height: 3, backgroundColor: ORANGE, borderRadius: 2, margin: "20px auto 0" }} />
        </div>

        {/* 2-col grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px, 5vw, 72px)", alignItems: "start" }}>

          {/* Formulář vlevo */}
          <form onSubmit={e => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input type="text" placeholder={ff.namePlaceholder ?? "Vaše jméno"} style={inputStyle} />
            <input type="email" placeholder={ff.emailPlaceholder ?? "E-mail"} style={inputStyle} />
            <input type="tel" placeholder={ff.phonePlaceholder ?? "Telefon"} style={inputStyle} />
            <textarea placeholder={ff.messagePlaceholder ?? "Váš dotaz..."} rows={5} style={{ ...inputStyle, resize: "vertical" }} />
            <button
              type="submit"
              style={{ padding: "13px 28px", backgroundColor: ORANGE, color: "#fff", fontFamily: FONT, fontSize: 14, fontWeight: 600, letterSpacing: "0.04em", border: "none", borderRadius: 4, cursor: "pointer", transition: "background 0.2s", alignSelf: "flex-start" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#d85710"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = ORANGE; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </button>
          </form>

          {/* Info vpravo */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 4 }}>
            <InfoRow
              icon={ic(<><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.36 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></>)}
              text={phone}
            />
            <InfoRow
              icon={ic(<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>)}
              text={email}
            />
            <InfoRow
              icon={ic(<><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></>)}
              text={address}
            />
            <InfoRow
              icon={ic(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>)}
              text={hours}
            />

            {/* Oranžový info box */}
            <div style={{ backgroundColor: "#fff3ec", borderLeft: `4px solid ${ORANGE}`, borderRadius: "0 4px 4px 0", padding: "20px 20px" }}>
              <p style={{ fontFamily: FONT, fontWeight: 600, fontSize: "0.9rem", color: DARK, margin: "0 0 4px" }}>Rychlá odpověď</p>
              <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: "0.85rem", color: "#666", margin: 0, lineHeight: 1.6 }}>
                Na vaše dotazy odpovídáme zpravidla do 24 hodin v pracovních dnech.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          [id="${sectionId}"] > div > div[style*="grid"] { grid-template-columns: 1fr !important; }
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

  const heading    = String(content.heading    ?? "Kontaktujte nás");
  const subheading = String(content.subheading ?? "Vyplňte formulář a my se vám ozveme do 24 hodin.");
  const phone      = String(content.phone      ?? "+420 704 123 456");
  const email      = String(content.email      ?? "info@demo.cz");
  const address    = String(content.address    ?? "Ukázková 123, 110 00 Praha 1");
  const hours      = String(content.hours      ?? "Po–Pá 9:00–18:00, So 9:00–14:00");
  const status     = String(content.status     ?? "Jsme právě k dispozici!");

  const infos = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      ),
      label: "Telefon", value: phone, field: "phone", href: `tel:${phone.replace(/\s/g, "")}`,
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
      ),
      label: "E-mail", value: email, field: "email", href: `mailto:${email}`,
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
        </svg>
      ),
      label: "Adresa", value: address, field: "address", href: undefined,
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>
      ),
      label: "Otevírací doba", value: hours, field: "hours", href: undefined,
    },
  ];

  return (
    <>
      <style>{`
        .edu01ct{padding:100px 40px;background:#fff;font-family:${FONT};}
        .edu01ct-inner{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:start;}
        /* LEFT info */
        .edu01ct-eyebrow{display:inline-block;color:${BLUE};font-size:12px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:12px;}
        .edu01ct-left h2{font-family:${FONT};font-size:clamp(1.8rem,3vw,2.6rem);font-weight:800;color:${NAVY};margin:0 0 12px;letter-spacing:-0.04em;line-height:1.15;}
        .edu01ct-sub{font-size:15px;color:#6b7280;line-height:1.7;margin:0 0 36px;}
        .edu01ct-status{display:inline-flex;align-items:center;gap:8px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:40px;padding:8px 16px;font-size:13px;font-weight:600;color:#15803d;margin-bottom:36px;}
        .edu01ct-status-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;animation:edu01ctpulse 2s ease-in-out infinite;}
        @keyframes edu01ctpulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
        .edu01ct-infos{display:flex;flex-direction:column;gap:20px;}
        .edu01ct-info{display:flex;align-items:flex-start;gap:14px;}
        .edu01ct-info-icon{width:40px;height:40px;border-radius:10px;background:#f3f6fb;color:${BLUE};display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .edu01ct-info-label{font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;}
        .edu01ct-info-val{font-size:14px;font-weight:600;color:${NAVY};text-decoration:none;}
        .edu01ct-info-val:hover{color:${BLUE};}
        /* RIGHT form */
        .edu01ct-form{background:#f3f6fb;border-radius:20px;padding:40px 36px;}
        .edu01ct-form h3{font-family:${FONT};font-size:20px;font-weight:700;color:${NAVY};margin:0 0 24px;}
        .edu01ct-field{margin-bottom:16px;}
        .edu01ct-field label{display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;}
        .edu01ct-field input,.edu01ct-field textarea{width:100%;box-sizing:border-box;padding:12px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-family:${FONT};font-size:14px;color:${NAVY};background:#fff;outline:none;transition:border-color 0.15s;}
        .edu01ct-field input:focus,.edu01ct-field textarea:focus{border-color:${BLUE};}
        .edu01ct-field textarea{resize:vertical;min-height:120px;}
        .edu01ct-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .edu01ct-btn{width:100%;padding:14px;background:${BLUE};color:#fff;font-family:${FONT};font-size:15px;font-weight:700;border:none;border-radius:62px;cursor:pointer;transition:background 0.15s,transform 0.15s;margin-top:8px;}
        .edu01ct-btn:hover{background:#0032b2;transform:translateY(-1px);}
        .edu01ct-note{font-size:12px;color:#9ca3af;text-align:center;margin-top:12px;}
        @media(max-width:900px){
          .edu01ct-inner{grid-template-columns:1fr;gap:48px;}
          .edu01ct{padding:72px 24px;}
          .edu01ct-row{grid-template-columns:1fr;}
          .edu01ct-form{padding:28px 24px;}
        }
      `}</style>

      <section id={String(sectionId)} className="edu01ct" data-template="edu-01-contact">
        <div className="edu01ct-inner">
          {/* LEFT — contact info */}
          <div className="edu01ct-left">
            <span className="edu01ct-eyebrow">Kontakt</span>
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
                    <div className="edu01ct-info-label">{info.label}</div>
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
          <div className="edu01ct-form">
            <h3>Napište nám</h3>
            <div className="edu01ct-row">
              <div className="edu01ct-field">
                <label>Jméno</label>
                <input type="text" placeholder="Jana Nováková" />
              </div>
              <div className="edu01ct-field">
                <label>E-mail</label>
                <input type="email" placeholder="jana@email.cz" />
              </div>
            </div>
            <div className="edu01ct-field">
              <label>Předmět / zájem</label>
              <input type="text" placeholder="Příprava na maturitu z matematiky" />
            </div>
            <div className="edu01ct-field">
              <label>Zpráva</label>
              <textarea placeholder="Popište nám vaše potřeby..." />
            </div>
            <button className="edu01ct-btn" type="button">Odeslat zprávu</button>
            <p className="edu01ct-note">Odpovídáme do 24 hodin. Bez závazků.</p>
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
  const kicker       = String(content.kicker       ?? "Kontakt");
  const heading      = String(content.heading      ?? "Navštivte nás");
  const phone        = String(content.phone        ?? "");
  const email        = String(content.email        ?? "");
  const address      = String(content.address      ?? "");
  const hours        = String(content.hours        ?? "");
  const hoursNote    = String(content.hoursNote    ?? "");
  const ctaText      = String(content.ctaText      ?? "Napište nám");
  const ctaHref      = String(content.ctaHref      ?? `mailto:${email}`);
  const ctaCardTitle = String(content.ctaCardTitle ?? "Máte dotaz nebo chcete objednat mazlíčka?");
  const ctaCardBody  = String(content.ctaCardBody  ?? "Neváhejte nás kontaktovat. Rádi odpovíme na vaše otázky a pomůžeme s objednáním termínu.");

  const TEAL   = "#286C7E";
  const TEAL_L = "#42aaba";
  const TEAL_D = "#0d7486";
  const DARK   = "#1a2c33";
  const FONT_H = "'Forum', 'Georgia', serif";
  const FONT_B = "'Roboto Condensed', 'Roboto', sans-serif";

  const InfoRow = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 0", borderBottom: "1px solid #e8f0f3" }}>
      <span style={{ width: 36, height: 36, borderRadius: "50%", background: "#e8f4f7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: TEAL }}>
        {icon}
      </span>
      <div style={{ fontFamily: FONT_B, fontSize: 15, color: DARK, lineHeight: 1.5 }}>{children}</div>
    </div>
  );

  return (
    <section
      id={String(sectionId)}
      data-variant="vet-01-contact"
      style={{ background: "#fff", padding: "clamp(56px,7vw,96px) clamp(20px,5vw,40px)" }}
    >
      <style>{`
        .v01con-inner { max-width: 1140px; margin: 0 auto; }
        .v01con-header { margin-bottom: 48px; }
        .v01con-kicker { font-family: ${FONT_B}; font-size: 12px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${TEAL_L}; margin: 0 0 10px; }
        .v01con-heading { font-family: ${FONT_H}; font-weight: 400; font-size: clamp(1.8rem,3vw,2.5rem); color: ${DARK}; margin: 0; }
        .v01con-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
        .v01con-info-list { padding: 0; list-style: none; margin: 0; }
        .v01con-cta-card { background: ${TEAL_D}; border-radius: 8px; padding: 48px 36px; display: flex; flex-direction: column; gap: 20px; }
        .v01con-cta-card h3 { font-family: ${FONT_H}; font-size: 1.6rem; font-weight: 400; color: #fff; margin: 0; }
        .v01con-cta-card p  { font-family: ${FONT_B}; font-size: 15px; color: rgba(255,255,255,0.8); line-height: 1.65; margin: 0; }
        .v01con-cta-btn { display: inline-block; padding: 13px 32px; background: #fff; color: ${TEAL}; font-family: ${FONT_B}; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 3px; align-self: flex-start; transition: background 0.2s; }
        .v01con-cta-btn:hover { background: ${TEAL_L}; color: #fff; }
        .v01con-link { color: ${TEAL}; text-decoration: none; font-family: ${FONT_B}; font-size: 15px; }
        .v01con-link:hover { text-decoration: underline; }
        @media (max-width: 820px) { .v01con-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="v01con-inner">
        <div className="v01con-header">
          <p className="v01con-kicker">
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 className="v01con-heading">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
        </div>

        <div className="v01con-grid">
          {/* Info karty vlevo */}
          <div>
            {phone && (
              <InfoRow icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.15a16 16 0 006.94 6.94l1.51-1.51a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>}>
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="v01con-link">
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              </InfoRow>
            )}
            {email && (
              <InfoRow icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}>
                <a href={`mailto:${email}`} className="v01con-link">
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              </InfoRow>
            )}
            {address && (
              <InfoRow icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>}>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </InfoRow>
            )}
            {hours && (
              <InfoRow icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>}>
                <div>
                  <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
                  {hoursNote && (
                    <div style={{ fontSize: 13, color: "#7a9ba6", marginTop: 2 }}>
                      <GenericEditableText sectionId={sectionId} field="hoursNote" value={hoursNote} tag="span" />
                    </div>
                  )}
                </div>
              </InfoRow>
            )}
          </div>

          {/* CTA karta vpravo */}
          <div className="v01con-cta-card">
            <h3><GenericEditableText sectionId={sectionId} field="ctaCardTitle" value={ctaCardTitle} tag="span" /></h3>
            <p><GenericEditableText sectionId={sectionId} field="ctaCardBody" value={ctaCardBody} tag="span" /></p>
            <a href={ctaHref} data-btn="primary" className="v01con-cta-btn">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}


// ── pethotel-01-contact ───────────────────────────────────────────────────────
// Cream bg, 2-col: left = info karta (nadpis, tel, email, adresa, hodiny),
// right = kontaktní formulář s poznámkou. Quicksand, #712419/#D6123D palette.
// ─────────────────────────────────────────────────────────────────────────────
function ContactPethotel01({
  content,
  sectionId,
}: {
  content: Record<string, unknown>;
  sectionId: number;
}) {
  const heading    = String(content.heading    ?? "Objednávka");
  const subheading = String(content.subheading ?? "Rezervujte místo pro vašeho pejska ještě dnes");
  const phone      = String(content.phone      ?? "");
  const email      = String(content.email      ?? "");
  const address    = String(content.address    ?? "");
  const hours      = String(content.hours      ?? "");
  const formNote   = String(content.formNote   ?? "Ozveme se vám do 24 hodin.");

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

  const PhoneIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.12 1.2 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.45-.45a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
    </svg>
  );
  const MailIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  );
  const PinIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
  const ClockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
  const PawIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 120 120" aria-hidden="true" style={{ flexShrink: 0, opacity: 0.7 }}>
      <circle cx="36" cy="26" r="12" fill={RED}/>
      <circle cx="60" cy="16" r="12" fill={RED}/>
      <circle cx="84" cy="26" r="12" fill={RED}/>
      <ellipse cx="60" cy="68" rx="26" ry="22" fill={RED}/>
      <circle cx="46" cy="88" r="10" fill={RED}/>
      <circle cx="74" cy="88" r="10" fill={RED}/>
    </svg>
  );

  return (
    <>
      <style>{`
        .ph01ct { background: ${CREAM}; padding: 100px 0 100px; font-family: ${FONT}; }
        .ph01ct-inner { max-width: 1100px; margin: 0 auto; padding: 0 32px; }

        /* Header */
        .ph01ct-hdr { text-align: center; margin-bottom: 64px; }
        .ph01ct-h2 { color: ${BROWN}; font-size: clamp(28px,3.5vw,46px); font-weight: 800; margin: 0 0 12px; font-family: ${FONT}; }
        .ph01ct-sub { color: #a08070; font-size: clamp(15px,1.6vw,19px); font-weight: 500; margin: 0; }

        /* 2-col */
        .ph01ct-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
        @media(max-width:720px){ .ph01ct-cols { grid-template-columns:1fr; gap:36px; } }

        /* Info karta */
        .ph01ct-info { background: ${BROWN}; border-radius: 12px; padding: 48px 40px; color: #fff; }
        .ph01ct-info-title { font-size: 22px; font-weight: 800; margin: 0 0 32px; font-family: ${FONT}; line-height: 1.3; }
        .ph01ct-row { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 24px; }
        .ph01ct-row:last-child { margin-bottom: 0; }
        .ph01ct-row-text { font-size: 16px; font-weight: 600; line-height: 1.5; }
        .ph01ct-row-text a { color: #fff; text-decoration: none; }
        .ph01ct-row-text a:hover { text-decoration: underline; }
        .ph01ct-row svg circle, .ph01ct-row svg path, .ph01ct-row svg rect, .ph01ct-row svg ellipse { stroke: #fff !important; fill: none !important; }

        /* Formulář */
        .ph01ct-form-wrap { background: #fff; border-radius: 12px; padding: 48px 40px; box-shadow: 0 4px 24px rgba(113,36,25,0.08); }
        .ph01ct-form-title { font-size: 20px; font-weight: 800; color: ${BROWN}; margin: 0 0 28px; font-family: ${FONT}; }
        .ph01ct-field { margin-bottom: 18px; }
        .ph01ct-label { display: block; font-size: 13px; font-weight: 700; color: ${BROWN}; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
        .ph01ct-input, .ph01ct-textarea {
          width: 100%; box-sizing: border-box;
          padding: 13px 16px; border: 2px solid ${BEIGE};
          border-radius: 6px; font-family: ${FONT}; font-size: 15px; font-weight: 500;
          color: ${BROWN}; background: ${CREAM};
          transition: border-color 0.2s;
          outline: none;
        }
        .ph01ct-input:focus, .ph01ct-textarea:focus { border-color: ${RED}; }
        .ph01ct-textarea { min-height: 100px; resize: vertical; }
        .ph01ct-note { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #a08070; font-weight: 500; margin-bottom: 20px; }
        .ph01ct-submit {
          width: 100%; padding: 16px; background: ${RED}; color: #fff;
          border: none; border-radius: 6px; font-family: ${FONT}; font-size: 16px; font-weight: 700;
          cursor: pointer; transition: background 0.25s, transform 0.2s;
        }
        .ph01ct-submit:hover { background: #b80d32; transform: translateY(-1px); }
        .ph01ct-success { text-align: center; padding: 40px 0; }
        .ph01ct-success-icon { font-size: 48px; margin-bottom: 16px; }
        .ph01ct-success h3 { color: ${BROWN}; font-size: 22px; font-weight: 800; margin: 0 0 8px; font-family: ${FONT}; }
        .ph01ct-success p { color: #a08070; font-size: 15px; font-weight: 500; margin: 0; }
      `}</style>

      <section className="ph01ct" data-template="pethotel-01-contact">
        <div className="ph01ct-inner">

          <div className="ph01ct-hdr">
            <h2 className="ph01ct-h2">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            <p className="ph01ct-sub">
              <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
            </p>
          </div>

          <div className="ph01ct-cols">

            {/* Info karta */}
            <div className="ph01ct-info">
              <p className="ph01ct-info-title">Kontaktní informace</p>

              {phone && (
                <div className="ph01ct-row">
                  <PhoneIcon />
                  <div className="ph01ct-row-text">
                    <a href={`tel:${phone.replace(/\s/g, "")}`}>
                      <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                    </a>
                  </div>
                </div>
              )}

              {email && (
                <div className="ph01ct-row">
                  <MailIcon />
                  <div className="ph01ct-row-text">
                    <a href={`mailto:${email}`}>
                      <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                    </a>
                  </div>
                </div>
              )}

              {address && (
                <div className="ph01ct-row">
                  <PinIcon />
                  <div className="ph01ct-row-text">
                    <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                  </div>
                </div>
              )}

              {hours && (
                <div className="ph01ct-row">
                  <ClockIcon />
                  <div className="ph01ct-row-text">
                    <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
                  </div>
                </div>
              )}
            </div>

            {/* Formulář */}
            <div className="ph01ct-form-wrap">
              {sent ? (
                <div className="ph01ct-success">
                  <div className="ph01ct-success-icon">🐾</div>
                  <h3>Odesláno!</h3>
                  <p>Ozveme se vám co nejdříve.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <p className="ph01ct-form-title">Rezervační formulář</p>

                  <div className="ph01ct-field">
                    <label className="ph01ct-label">Vaše jméno</label>
                    <input
                      type="text"
                      className="ph01ct-input"
                      placeholder="Jana Nováková"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="ph01ct-field">
                    <label className="ph01ct-label">Telefon</label>
                    <input
                      type="tel"
                      className="ph01ct-input"
                      placeholder="604 000 000"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="ph01ct-field">
                    <label className="ph01ct-label">Jméno a plemeno pejska</label>
                    <input
                      type="text"
                      className="ph01ct-input"
                      placeholder="Rek, labradorský retrívr"
                      value={form.dog}
                      onChange={(e) => setForm({ ...form, dog: e.target.value })}
                    />
                  </div>

                  <div className="ph01ct-field">
                    <label className="ph01ct-label">Zpráva</label>
                    <textarea
                      className="ph01ct-textarea"
                      placeholder="Termín, typ pobytu, dotazy..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </div>

                  <div className="ph01ct-note">
                    <PawIcon />
                    <GenericEditableText sectionId={sectionId} field="formNote" value={formNote} tag="span" />
                  </div>

                  <button type="submit" className="ph01ct-submit">Odeslat rezervaci</button>
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

  const heading    = String(content.heading    ?? "Kontakt");
  const kicker     = String(content.kicker     ?? "Napište nám");
  const subheading = String(content.subheading ?? "Objednejte svého mazlíčka");
  const phone      = String(content.phone      ?? "");
  const email      = String(content.email      ?? "");
  const address    = String(content.address    ?? "");
  const hours      = String(content.hours      ?? "");

  type Social = { icon?: string; label?: string; href?: string };
  const socials = (content.socials as Social[]) ?? [];

  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  return (
    <section id="kontakt" data-template="grooming-01-contact" style={{ background: DARK, fontFamily: FONT }}>
      <style>{`
        .gr01ct-wrap{display:grid;grid-template-columns:1fr 1fr;min-height:600px;}
        .gr01ct-left{padding:clamp(56px,8vw,100px) clamp(32px,6vw,72px);display:flex;flex-direction:column;justify-content:center;border-right:1px solid rgba(255,255,255,0.08);}
        .gr01ct-kicker{font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${GOLD};margin:0 0 14px;}
        .gr01ct-h2{font-size:clamp(26px,3vw,40px);font-weight:700;color:#fff;margin:0 0 10px;line-height:1.15;}
        .gr01ct-sub{font-size:15px;color:rgba(255,255,255,0.55);margin:0 0 44px;}
        .gr01ct-info{display:flex;flex-direction:column;gap:20px;margin-bottom:40px;}
        .gr01ct-row{display:flex;align-items:flex-start;gap:14px;}
        .gr01ct-ico{width:36px;height:36px;border-radius:50%;border:1.5px solid rgba(208,170,87,0.4);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}
        .gr01ct-val{font-size:14px;color:rgba(255,255,255,0.78);line-height:1.55;}
        .gr01ct-val a{color:${GOLD};text-decoration:none;}
        .gr01ct-social{display:flex;gap:12px;margin-top:4px;}
        .gr01ct-social a{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;border:1.5px solid rgba(208,170,87,0.4);transition:border-color 0.2s,background 0.2s;}
        .gr01ct-social a:hover{border-color:${GOLD};background:rgba(208,170,87,0.12);}
        .gr01ct-right{padding:clamp(56px,8vw,100px) clamp(32px,6vw,72px);display:flex;flex-direction:column;justify-content:center;}
        .gr01ct-form{display:flex;flex-direction:column;gap:16px;}
        .gr01ct-input{width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#fff;font-family:${FONT};font-size:14px;padding:14px 16px;outline:none;transition:border-color 0.2s;box-sizing:border-box;}
        .gr01ct-input::placeholder{color:rgba(255,255,255,0.35);}
        .gr01ct-input:focus{border-color:${GOLD};}
        .gr01ct-textarea{resize:vertical;min-height:120px;}
        .gr01ct-submit{background:${GOLD};color:${DARK};border:none;cursor:pointer;font-family:${FONT};font-size:13px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;padding:16px 36px;width:100%;transition:opacity 0.2s;margin-top:4px;}
        .gr01ct-submit:hover{opacity:0.85;}
        .gr01ct-success{text-align:center;padding:40px 0;}
        .gr01ct-success p{color:#fff;font-size:16px;margin:12px 0 0;}
        @media(max-width:800px){
          .gr01ct-wrap{grid-template-columns:1fr;}
          .gr01ct-left{border-right:none;border-bottom:1px solid rgba(255,255,255,0.08);}
          .gr01ct-left,.gr01ct-right{padding:56px 28px;}
        }
      `}</style>
      <div className="gr01ct-wrap">
        {/* Left — info */}
        <div className="gr01ct-left">
          <p className="gr01ct-kicker">
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 className="gr01ct-h2">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <p className="gr01ct-sub">
            <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
          </p>
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
              <p>Zpráva odeslána! Ozveme se vám co nejdříve.</p>
            </div>
          ) : (
            <form
              className="gr01ct-form"
              onSubmit={e => { e.preventDefault(); setSent(true); }}
            >
              <input
                className="gr01ct-input"
                type="text"
                placeholder="Jméno a příjmení"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                className="gr01ct-input"
                type="email"
                placeholder="E-mail"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
              <input
                className="gr01ct-input"
                type="tel"
                placeholder="Telefon"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
              <textarea
                className="gr01ct-input gr01ct-textarea"
                placeholder="Zpráva / termín"
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              />
              <button type="submit" className="gr01ct-submit">Odeslat rezervaci</button>
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

  const title     = String(content.title     ?? "Napište nám");
  const lead      = String(content.lead      ?? "Rádi vám pomůžeme s daňovým poradenstvím nebo vedením účetnictví.");
  const phone     = String(content.phone     ?? "+420 704 123 456");
  const email     = String(content.email     ?? "email@demo.cz");
  const address   = String(content.address   ?? "Ukázková 123, 110 00 Praha 1");
  const hours     = String(content.hours     ?? "Po–Pá: 9:00–16:00");
  const formTitle = String(content.formTitle ?? "Zdarma konzultace");

  const iconPhone = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.61 5.07 2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10.7a16 16 0 0 0 6.29 6.29l1.06-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 18.3z"/></svg>`;
  const iconMail  = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
  const iconPin   = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  const iconClock = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

  const infoItems = [
    { icon: iconPhone, label: "Telefon",        value: phone,   field: "phone" },
    { icon: iconMail,  label: "E-mail",         value: email,   field: "email" },
    { icon: iconPin,   label: "Adresa",         value: address, field: "address" },
    { icon: iconClock, label: "Otevírací doba", value: hours,   field: "hours" },
  ];

  return (
    <>
      <style>{`
        .ucn02ct-section {
          background: ${GREEN};
          padding: 88px 24px;
          font-family: ${FONT_B};
        }
        .ucn02ct-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: start;
        }
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
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
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
          width: 100%;
          padding: 15px;
          background: ${GOLD};
          color: ${WHITE};
          font-family: ${FONT_H};
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          margin-top: 4px;
        }
        .ucn02ct-submit:hover { background: #a9904d; transform: translateY(-1px); }
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
          <div>
            <div className="ucn02ct-overline">
              <span className="ucn02ct-overline-bar" aria-hidden />
              Kontaktujte nás
            </div>
            <h2 className="ucn02ct-h2">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p className="ucn02ct-lead">
              <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
            </p>
            <div className="ucn02ct-info-list">
              {infoItems.map((item, i) => (
                <div key={i} className="ucn02ct-info-item">
                  <div className="ucn02ct-info-icon" dangerouslySetInnerHTML={{ __html: item.icon }} />
                  <div className="ucn02ct-info-text">
                    <span className="ucn02ct-info-label">{item.label}</span>
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
                  <label className="ucn02ct-label">Jméno</label>
                  <input type="text" className="ucn02ct-input" placeholder="Jan Novák" />
                </div>
                <div className="ucn02ct-field">
                  <label className="ucn02ct-label">E-mail</label>
                  <input type="email" className="ucn02ct-input" placeholder="jan@email.cz" />
                </div>
              </div>
              <div className="ucn02ct-field">
                <label className="ucn02ct-label">Telefon</label>
                <input type="tel" className="ucn02ct-input" placeholder="+420 000 000 000" />
              </div>
              <div className="ucn02ct-field">
                <label className="ucn02ct-label">Zpráva</label>
                <textarea className="ucn02ct-textarea" placeholder="Stručně popište váš záměr nebo dotaz..." />
              </div>
              <button type="button" className="ucn02ct-submit">Odeslat zprávu</button>
              <p className="ucn02ct-note">Odpovíme do 24 hodin. Konzultace je zcela zdarma.</p>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

// ── ucetni-03-contact ─────────────────────────────────────────────────────────
// gpf.cz style: #f8f8f8 bg, 2-col: left info + right white form card
// Left: dark H2 + lead + 4 contact items (phone/email/address/hours) w/ green icons
// Right: white card — name/email/phone/message fields + green CTA
// ─────────────────────────────────────────────────────────────────────────────
function ContactUcetni03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const DARK   = "#002000";
  const GREEN  = "#8ec63f";
  const FONT_H = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const FONT_B = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  const title   = String(content.title   ?? "Pojďme probrat vaši situaci");
  const lead    = String(content.lead    ?? "Napište nám nebo zavolejte. Poradíme vám nebo rovnou zajistíme nabídku šitou na míru.");
  const phone   = String(content.phone   ?? "+420 704 123 456");
  const email   = String(content.email   ?? "email@demo.cz");
  const address = String(content.address ?? "Ukázková 123, 110 00 Praha 1");
  const hours   = String(content.hours   ?? "Po–Pá 9:00–18:00");

  const SVG_PHONE   = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${GREEN}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.61 5.07 2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10.7a16 16 0 0 0 6.29 6.29l1.06-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 18.3z"/></svg>`;
  const SVG_MAIL    = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${GREEN}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
  const SVG_PIN     = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${GREEN}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  const SVG_CLOCK   = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${GREEN}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

  const infoItems = [
    { icon: SVG_PHONE, label: "Telefon",      value: phone,   field: "phone" },
    { icon: SVG_MAIL,  label: "E-mail",       value: email,   field: "email" },
    { icon: SVG_PIN,   label: "Adresa",       value: address, field: "address" },
    { icon: SVG_CLOCK, label: "Otevírací doba", value: hours, field: "hours" },
  ];

  return (
    <>
      <style>{`
        .ucn03ct-section {
          background: #f8f8f8;
          padding: 88px 40px;
          font-family: ${FONT_B};
        }
        .ucn03ct-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: start;
        }
        .ucn03ct-kicker {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: ${GREEN};
          margin-bottom: 12px;
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
        }
        .ucn03ct-info-icon {
          width: 40px;
          height: 40px;
          background: #fff;
          border: 1px solid #e4e4e4;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
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
        /* Form card */
        .ucn03ct-card {
          background: #fff;
          border-radius: 16px;
          padding: 40px 36px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
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
          border: 1px solid #e4e4e4;
          border-radius: 7px;
          font-family: ${FONT_B};
          font-size: 0.9rem;
          color: #3c3d3d;
          background: #fafafa;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .ucn03ct-input:focus, .ucn03ct-textarea:focus { border-color: ${GREEN}; background: #fff; }
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
          border-radius: 7px;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 4px;
        }
        .ucn03ct-submit:hover { background: #9dd44a; }
        .ucn03ct-note {
          font-size: 0.75rem;
          color: #aaa;
          text-align: center;
          margin-top: 8px;
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

      <section className="ucn03ct-section" data-template="ucetni-03-contact" id="kontakt">
        <div className="ucn03ct-inner">

          {/* Left: info */}
          <div>
            <span className="ucn03ct-kicker">Kontakt</span>
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
                    <span className="ucn03ct-info-label">{item.label}</span>
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
            <div className="ucn03ct-card-title">Napište nám</div>
            <div className="ucn03ct-form">
              <div className="ucn03ct-row">
                <div className="ucn03ct-field">
                  <label className="ucn03ct-label">Jméno</label>
                  <input type="text" className="ucn03ct-input" placeholder="Jan Novák" />
                </div>
                <div className="ucn03ct-field">
                  <label className="ucn03ct-label">E-mail</label>
                  <input type="email" className="ucn03ct-input" placeholder="jan@email.cz" />
                </div>
              </div>
              <div className="ucn03ct-field">
                <label className="ucn03ct-label">Telefon</label>
                <input type="tel" className="ucn03ct-input" placeholder="+420 000 000 000" />
              </div>
              <div className="ucn03ct-field">
                <label className="ucn03ct-label">Zpráva</label>
                <textarea className="ucn03ct-textarea" placeholder="Stručně popište váš záměr nebo dotaz..." />
              </div>
              <button type="button" className="ucn03ct-submit">Odeslat zprávu</button>
              <p className="ucn03ct-note">Odpovíme do 24 hodin. Konzultace je zcela zdarma.</p>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

// ── ucetni-04-contact ──────────────────────────────────────────────────────────
// bcas.cz style: navy bg #1B3A6B, 2-col left info + right white form card
// Left: H2 + subheading + 4 contact items w/ gold icons
// Right: white rounded card with name/email/phone/message + navy CTA
// ──────────────────────────────────────────────────────────────────────────────
function ContactUcetni04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY   = "#1B3A6B";
  const GOLD   = "#C8923A";
  const WHITE  = "#FFFFFF";
  const FONT_H = "'Inter', 'Helvetica Neue', Arial, sans-serif";
  const FONT_B = "'Inter', 'Helvetica Neue', Arial, sans-serif";

  const heading    = String(content.heading    ?? "Chcete se nás zeptat?");
  const subheading = String(content.subheading ?? "Konzultace je nezávazná a zdarma.");
  const phone      = String(content.phone      ?? "704 123 456");
  const email      = String(content.email      ?? "email@demo.cz");
  const address    = String(content.address    ?? "Ukázková 123, 110 00 Praha 1");
  const hours      = String(content.hours      ?? "Po–Pá 9:00–18:00");
  const nameLabel  = String(content.formNameLabel    ?? "Jméno a příjmení");
  const emailLabel = String(content.formEmailLabel   ?? "E-mail");
  const phoneLabel = String(content.formPhoneLabel   ?? "Telefon");
  const msgLabel   = String(content.formMessageLabel ?? "Zpráva");
  const submitText = String(content.formSubmitText   ?? "Odeslat zprávu");

  const SVG_PHONE = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.61 5.07 2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10.7a16 16 0 0 0 6.29 6.29l1.06-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 18.3z"/></svg>`;
  const SVG_MAIL  = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
  const SVG_PIN   = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  const SVG_CLOCK = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

  const infoItems = [
    { icon: SVG_PHONE, label: "Telefon",        value: phone,   field: "phone",   href: `tel:${phone.replace(/\s/g, "")}` },
    { icon: SVG_MAIL,  label: "E-mail",         value: email,   field: "email",   href: `mailto:${email}` },
    { icon: SVG_PIN,   label: "Adresa",         value: address, field: "address", href: undefined },
    { icon: SVG_CLOCK, label: "Otevírací doba", value: hours,   field: "hours",   href: undefined },
  ];

  return (
    <>
      <style>{`
        .ucn04ct-section {
          background: ${NAVY};
          padding: clamp(64px, 8vw, 96px) clamp(20px, 5vw, 60px);
          font-family: ${FONT_B};
        }
        .ucn04ct-inner {
          max-width: 1160px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: start;
        }
        .ucn04ct-left { color: ${WHITE}; }
        .ucn04ct-h2 {
          font-family: ${FONT_H};
          font-size: clamp(1.8rem, 3vw, 2.5rem);
          font-weight: 700;
          color: ${WHITE};
          line-height: 1.2;
          margin: 0 0 20px 0;
        }
        .ucn04ct-sub {
          font-size: 1rem;
          color: rgba(255,255,255,0.75);
          line-height: 1.7;
          margin: 0 0 44px 0;
          max-width: 460px;
        }
        .ucn04ct-info-list { display: flex; flex-direction: column; gap: 24px; }
        .ucn04ct-info-item { display: flex; align-items: flex-start; gap: 16px; }
        .ucn04ct-info-icon {
          width: 42px;
          height: 42px;
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ucn04ct-info-text { display: flex; flex-direction: column; gap: 3px; padding-top: 4px; }
        .ucn04ct-info-label {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
        }
        .ucn04ct-info-value {
          font-size: 0.95rem;
          font-weight: 500;
          color: ${WHITE};
          text-decoration: none;
        }
        a.ucn04ct-info-value:hover { color: ${GOLD}; }
        .ucn04ct-card {
          background: ${WHITE};
          border-radius: 18px;
          padding: clamp(28px, 4vw, 48px);
          box-shadow: 0 8px 40px rgba(0,0,0,0.18);
        }
        .ucn04ct-card-title {
          font-family: ${FONT_H};
          font-size: 1.2rem;
          font-weight: 700;
          color: ${NAVY};
          margin: 0 0 28px 0;
        }
        .ucn04ct-form { display: flex; flex-direction: column; gap: 14px; }
        .ucn04ct-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .ucn04ct-field { display: flex; flex-direction: column; gap: 6px; }
        .ucn04ct-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #374151;
          letter-spacing: 0.2px;
        }
        .ucn04ct-input, .ucn04ct-textarea {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #E5E7EB;
          border-radius: 8px;
          font-family: ${FONT_B};
          font-size: 0.9rem;
          color: #111827;
          background: #FAFAFA;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .ucn04ct-input:focus, .ucn04ct-textarea:focus {
          border-color: ${NAVY};
          background: #fff;
        }
        .ucn04ct-textarea { resize: vertical; min-height: 110px; }
        .ucn04ct-submit {
          width: 100%;
          padding: 14px;
          background: ${NAVY};
          color: ${WHITE};
          font-family: ${FONT_H};
          font-size: 0.95rem;
          font-weight: 700;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          margin-top: 4px;
          letter-spacing: 0.3px;
        }
        .ucn04ct-submit:hover { background: #152d54; transform: translateY(-1px); }
        .ucn04ct-note {
          font-size: 0.75rem;
          color: #9CA3AF;
          text-align: center;
          margin-top: 6px;
        }
        @media (max-width: 900px) {
          .ucn04ct-inner { grid-template-columns: 1fr; gap: 48px; }
        }
        @media (max-width: 500px) {
          .ucn04ct-row { grid-template-columns: 1fr; }
          .ucn04ct-card { padding: 24px 18px; }
        }
      `}</style>

      <section className="ucn04ct-section" data-template="ucetni-04-contact" id="kontakt">
        <div className="ucn04ct-inner">

          <div className="ucn04ct-left">
            <h2 className="ucn04ct-h2">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            <p className="ucn04ct-sub">
              <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
            </p>
            <div className="ucn04ct-info-list">
              {infoItems.map((item, i) => (
                <div key={i} className="ucn04ct-info-item">
                  <div className="ucn04ct-info-icon" dangerouslySetInnerHTML={{ __html: item.icon }} />
                  <div className="ucn04ct-info-text">
                    <span className="ucn04ct-info-label">{item.label}</span>
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
            <div className="ucn04ct-card-title">Napište nám</div>
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
              <p className="ucn04ct-note">Odpovíme do 24 hodin. Konzultace je zcela zdarma.</p>
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

  const RED    = "#ee4036";
  const DARK   = "#111111";
  const WHITE  = "#ffffff";
  const FONT_H = "'Montserrat', sans-serif";
  const FONT_B = "'Roboto', sans-serif";

  const kicker   = String(c.kicker   ?? "Kontakt a poptávka");
  const title    = String(c.title    ?? "Napište nám nebo zavolejte");
  const subtitle = String(c.subtitle ?? "Obratem se ozveme s konkrétní nabídkou nebo si domluvíme nezávaznou konzultaci.");
  const phone    = String(c.phone    ?? "+420 704 123 456");
  const email    = String(c.email    ?? "info@demo.cz");
  const address  = String(c.address  ?? "Ukázková 123, 110 00 Praha 1");
  const hours    = String(c.hours    ?? "Po–Pá 7:00–17:00");
  const ico      = String(c.ico      ?? "12345678");
  const submitText = String(c.submitText ?? "Odeslat poptávku");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 900));
    setSending(false);
    setSent(true);
  }

  const InfoRow = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
      <div style={{ width: 40, height: 40, background: RED, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ fontSize: 15, color: "#ccc", lineHeight: 1.55, paddingTop: 4 }}>{children}</div>
    </div>
  );

  return (
    <section
      id="kontakt"
      data-template="instala-02-contact"
      style={{ backgroundColor: "#111", fontFamily: FONT_B, padding: "96px 0" }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Roboto:wght@400;500&display=swap" />
      <style>{`        .i2ct-outer   { max-width: 1200px; margin: 0 auto; padding: 0 48px; }
        .i2ct-grid    { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: start; }

        /* left panel */
        .i2ct-kicker  { font-family: ${FONT_H}; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${RED}; margin: 0 0 16px; display: flex; align-items: center; gap: 12px; }
        .i2ct-kicker::before { content: ''; display: inline-block; width: 36px; height: 2px; background: ${RED}; }
        .i2ct-h2      { font-family: ${FONT_H}; font-size: clamp(26px, 3vw, 42px); font-weight: 800; color: ${WHITE}; line-height: 1.12; margin: 0 0 14px; }
        .i2ct-sub     { font-size: 15px; color: #888; line-height: 1.65; margin: 0 0 40px; max-width: 400px; }
        .i2ct-divider { width: 48px; height: 3px; background: ${RED}; margin: 0 0 36px; border-radius: 2px; }

        /* right panel — form */
        .i2ct-form    { background: #1a1a1a; border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.06); }
        .i2ct-form-title { font-family: ${FONT_H}; font-size: 18px; font-weight: 800; color: ${WHITE}; margin: 0 0 28px; }
        .i2ct-row     { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .i2ct-field   { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
        .i2ct-label   { font-family: ${FONT_H}; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #666; }
        .i2ct-input   { background: #111; border: 1.5px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px 16px; font-family: ${FONT_B}; font-size: 14px; color: ${WHITE}; outline: none; transition: border-color .2s; }
        .i2ct-input:focus { border-color: ${RED}; }
        .i2ct-input::placeholder { color: #444; }
        .i2ct-textarea { resize: vertical; min-height: 110px; }
        .i2ct-btn     { width: 100%; background: ${RED}; color: ${WHITE}; font-family: ${FONT_H}; font-size: 14px; font-weight: 700; letter-spacing: 0.04em; padding: 15px 24px; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background .2s; margin-top: 6px; }
        .i2ct-btn:hover { background: #c42d2d; }
        .i2ct-btn:disabled { opacity: 0.6; cursor: default; }
        .i2ct-ok      { text-align: center; padding: 32px 0; }
        .i2ct-ok-icon { width: 56px; height: 56px; background: ${RED}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
        .i2ct-ok-title { font-family: ${FONT_H}; font-size: 20px; font-weight: 800; color: ${WHITE}; margin: 0 0 8px; }
        .i2ct-ok-sub  { font-size: 14px; color: #666; }

        @media (max-width: 900px) {
          .i2ct-outer { padding: 0 20px !important; }
          .i2ct-grid  { grid-template-columns: 1fr !important; gap: 48px !important; }
          .i2ct-row   { grid-template-columns: 1fr !important; }
          .i2ct-form  { padding: 28px 20px !important; }
        }
      `}</style>

      <div className="i2ct-outer">
        <div className="i2ct-grid">

          {/* ── Left: info panel ── */}
          <div>
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

            <InfoRow icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.09 6.09l1.11-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}>
              <div style={{ fontFamily: FONT_H, fontSize: 11, fontWeight: 700, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>Telefon</div>
              <a href={`tel:${phone.replace(/\s/g,"")}`} style={{ color: WHITE, fontFamily: FONT_H, fontSize: 18, fontWeight: 800, textDecoration: "none" }}>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            </InfoRow>

            <InfoRow icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="22,6 12,13 2,6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}>
              <div style={{ fontFamily: FONT_H, fontSize: 11, fontWeight: 700, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>E-mail</div>
              <a href={`mailto:${email}`} style={{ color: WHITE, fontFamily: FONT_H, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            </InfoRow>

            <InfoRow icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="10" r="3" stroke="white" strokeWidth="2"/></svg>}>
              <div style={{ fontFamily: FONT_H, fontSize: 11, fontWeight: 700, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>Adresa</div>
              <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
            </InfoRow>

            <InfoRow icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/><polyline points="12 6 12 12 16 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}>
              <div style={{ fontFamily: FONT_H, fontSize: 11, fontWeight: 700, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>Provozní doba</div>
              <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
            </InfoRow>

            <div style={{ marginTop: 8, padding: "14px 18px", background: "rgba(255,255,255,0.04)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", fontSize: 13, color: "#555", fontFamily: FONT_H }}>
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
// 1:1 klempirzprahy.cz contact section:
// - White bg, padding 80px 0
// - H2 "Kontakt" centered + silver underline
// - Centered intro box (max-w 800px): h3 + subtitle text + phone CTA button
// - 2-col: left info panel (phone/email/address/hours) | right contact form
// - Contact icon: 50px circle silver gradient bg, 4 items
// - Form: name + phone (row), email, textarea, submit button
// ─────────────────────────────────────────────────────────────────────────────
interface ContactK01Props {
  content: Record<string, unknown>;
  sectionId: number;
}

function ContactKlempir01({ content, sectionId }: ContactK01Props) {
  const FONT   = "'Montserrat', sans-serif";
  const SILVER = "#c0c0c0";
  const DARK   = "#1a1a1a";
  const MEDIUM = "#3a3a3a";
  const GRAY   = "#717171";

  const title      = String(content.title      ?? "Kontakt");
  const subtitle   = String(content.subtitle   ?? "Potřebujete opravit střechu, vyměnit klempířské prvky nebo řešit havarijní stav?");
  const phone      = String(content.phone      ?? "+420 704 123 456");
  const email      = String(content.email      ?? "info@demo.cz");
  const address    = String(content.address    ?? "Praha a okolí");
  const hours      = String(content.hours      ?? "Po–Pá 7:00–18:00, So 8:00–13:00");
  const formTitle  = String(content.formTitle  ?? "Napište mi");
  const ctaText    = String(content.ctaText    ?? "Odeslat zprávu");

  return (
    <>
      <style>{`
        .k01-contact { background: #ffffff; padding: 80px 0; position: relative; font-family: ${FONT}; }
        .k01-contact::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: rgba(0,0,0,0.05); }
        .k01-contact-container { width: 90%; max-width: 1200px; margin: 0 auto; padding: 0 15px; }
        .k01-contact-h2 { font-size: 36px; font-weight: 600; color: ${DARK}; text-align: center; margin-bottom: 50px; position: relative; font-family: ${FONT}; }
        .k01-contact-h2::after { content: ''; display: block; width: 80px; height: 3px; background: ${SILVER}; margin: 15px auto 0; }
        .k01-contact-intro { text-align: center; max-width: 800px; margin: 0 auto 50px; background: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.08); }
        .k01-contact-intro h3 { font-size: 28px; font-weight: 600; color: ${MEDIUM}; margin-bottom: 20px; font-family: ${FONT}; }
        .k01-contact-intro p { font-size: 18px; line-height: 1.6; color: ${GRAY}; margin-bottom: 15px; }
        .k01-contact-cta { display: flex; flex-direction: column; align-items: center; margin-top: 30px; }
        .k01-contact-btn { display: inline-flex; align-items: center; gap: 10px; background: ${MEDIUM}; color: #fff; padding: 14px 32px; border-radius: 4px; text-decoration: none; font-weight: 600; font-size: 16px; font-family: ${FONT}; transition: background 0.2s; min-width: 220px; justify-content: center; }
        .k01-contact-btn:hover { background: ${DARK}; }
        .k01-contact-content { display: flex; gap: 50px; }
        .k01-contact-info { flex: 1; background: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.08); }
        .k01-contact-item { display: flex; align-items: flex-start; margin-bottom: 30px; }
        .k01-contact-item:last-child { margin-bottom: 0; }
        .k01-contact-icon { width: 50px; height: 50px; background: linear-gradient(135deg, ${SILVER}, #a0a0a0); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 20px; flex-shrink: 0; font-size: 20px; color: ${DARK}; }
        .k01-contact-itext h3 { font-size: 18px; font-weight: 600; color: ${MEDIUM}; margin-bottom: 5px; font-family: ${FONT}; }
        .k01-contact-itext p, .k01-contact-itext a { color: ${GRAY}; text-decoration: none; font-size: 15px; line-height: 1.5; }
        .k01-contact-itext a:hover { color: ${SILVER}; }
        .k01-contact-form { flex: 1; background: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.08); }
        .k01-contact-form h3 { font-size: 24px; font-weight: 600; color: ${MEDIUM}; margin-bottom: 25px; font-family: ${FONT}; }
        .k01-form-row { display: flex; gap: 20px; margin-bottom: 20px; }
        .k01-form-group { flex: 1; margin-bottom: 20px; }
        .k01-form-group:last-child { margin-bottom: 0; }
        .k01-form-group input, .k01-form-group textarea { width: 100%; padding: 12px 15px; border: 1px solid #e0e0e0; border-radius: 4px; font-family: ${FONT}; font-size: 15px; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; }
        .k01-form-group input:focus, .k01-form-group textarea:focus { outline: none; border-color: ${SILVER}; box-shadow: 0 0 0 2px rgba(192,192,192,0.2); }
        .k01-form-group textarea { height: 150px; resize: vertical; }
        .k01-form-submit { background: ${MEDIUM}; color: #fff; padding: 14px 30px; border: none; border-radius: 4px; font-family: ${FONT}; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.2s; margin-top: 10px; }
        .k01-form-submit:hover { background: ${DARK}; }
        @media (max-width: 992px) {
          .k01-contact-content { flex-direction: column; }
          .k01-form-row { flex-direction: column; gap: 0; }
        }
        @media (max-width: 600px) {
          .k01-contact-intro { padding: 24px 16px; }
          .k01-contact-info, .k01-contact-form { padding: 24px 16px; }
          .k01-contact-h2 { font-size: 28px; }
          .k01-contact-intro h3 { font-size: 22px; }
        }
      `}</style>

      <section id="kontakt" className="k01-contact" data-template="klempir-01">
        <div className="k01-contact-container">
          <h2 className="k01-contact-h2">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>

          {/* Intro box */}
          <div className="k01-contact-intro">
            <h3>Potřebujete odbornou pomoc?</h3>
            <p>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
            <div className="k01-contact-cta">
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="k01-contact-btn">
                📞 Zavolat ihned
              </a>
            </div>
          </div>

          {/* Info + form */}
          <div className="k01-contact-content">
            {/* Left: contact info */}
            <div className="k01-contact-info">
              <div className="k01-contact-item">
                <div className="k01-contact-icon">📞</div>
                <div className="k01-contact-itext">
                  <h3>Telefon</h3>
                  <p><a href={`tel:${phone.replace(/\s/g, "")}`}>
                    <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                  </a></p>
                </div>
              </div>
              <div className="k01-contact-item">
                <div className="k01-contact-icon">✉️</div>
                <div className="k01-contact-itext">
                  <h3>Email</h3>
                  <p><a href={`mailto:${email}`}>
                    <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                  </a></p>
                </div>
              </div>
              <div className="k01-contact-item">
                <div className="k01-contact-icon">📍</div>
                <div className="k01-contact-itext">
                  <h3>Oblast působení</h3>
                  <p><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></p>
                </div>
              </div>
              <div className="k01-contact-item">
                <div className="k01-contact-icon">🕐</div>
                <div className="k01-contact-itext">
                  <h3>Pracovní doba</h3>
                  <p><GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" /></p>
                </div>
              </div>
            </div>

            {/* Right: form */}
            <div className="k01-contact-form">
              <h3>
                <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" />
              </h3>
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="k01-form-row">
                  <div className="k01-form-group" style={{ marginBottom: 0 }}>
                    <input type="text" placeholder="Vaše jméno" required />
                  </div>
                  <div className="k01-form-group" style={{ marginBottom: 0 }}>
                    <input type="tel" placeholder="Váš telefon" required />
                  </div>
                </div>
                <div className="k01-form-group">
                  <input type="email" placeholder="Váš email" />
                </div>
                <div className="k01-form-group">
                  <textarea placeholder="Popis zakázky" required />
                </div>
                <button type="submit" className="k01-form-submit">
                  <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ── garden-01-contact ────────────────────────────────────────────────────────
function ContactGarden01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const title      = String(content.title      ?? "Pošlete nám zprávu");
  const subtitle   = String(content.subtitle   ?? "Rádi s vámi probereme vaši představu. Ozveme se do 24 hodin.");
  const phone      = String(content.phone      ?? "+420 704 123 456");
  const email      = String(content.email      ?? "info@demo.cz");
  const address    = String(content.address    ?? "Praha a okolí");
  const buttonText = String(content.buttonText ?? "Odeslat zprávu");

  const [sent, setSent] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 800);
  }

  return (
    <>
      <style>{`
        .g01c-section {
          background: #f2f2f2;
          padding: 80px 48px;
          box-sizing: border-box;
        }
        .g01c-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 64px;
          align-items: start;
        }
        .g01c-info-title {
          font-family: 'Cardo', Georgia, serif;
          font-size: 36px;
          font-weight: 700;
          color: #202714;
          margin: 0 0 12px 0;
          line-height: 1.2;
        }
        .g01c-hr {
          border: none;
          border-top: 2px solid #6a961f;
          width: 60px;
          margin: 0 0 16px 0;
        }
        .g01c-info-subtitle {
          font-family: 'Inter', Arial, sans-serif;
          font-size: 15px;
          color: #5a5a5a;
          margin: 0 0 36px 0;
          line-height: 1.7;
        }
        .g01c-contact-items {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .g01c-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .g01c-contact-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6a961f;
          flex-shrink: 0;
          border: 2px solid #e0e0e0;
        }
        .g01c-contact-text {
          display: flex;
          flex-direction: column;
        }
        .g01c-contact-label {
          font-family: 'Inter', Arial, sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #5a5a5a;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 2px;
        }
        .g01c-contact-value {
          font-family: 'Inter', Arial, sans-serif;
          font-size: 15px;
          color: #202714;
          font-weight: 500;
          text-decoration: none;
        }
        .g01c-contact-value:hover { color: #6a961f; }
        .g01c-form-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
        }
        .g01c-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .g01c-field {
          display: flex;
          flex-direction: column;
          margin-bottom: 16px;
        }
        .g01c-field label {
          font-family: 'Inter', Arial, sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #202714;
          margin-bottom: 6px;
          letter-spacing: 0.03em;
        }
        .g01c-field input,
        .g01c-field textarea {
          font-family: 'Inter', Arial, sans-serif;
          font-size: 15px;
          color: #202714;
          background: #f9f9f9;
          border: 1.5px solid #e0e0e0;
          border-radius: 8px;
          padding: 10px 14px;
          outline: none;
          transition: border-color 0.2s;
          resize: vertical;
          box-sizing: border-box;
          width: 100%;
        }
        .g01c-field input:focus,
        .g01c-field textarea:focus {
          border-color: #6a961f;
          background: #fff;
        }
        .g01c-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #6a961f;
          color: #ffffff;
          font-family: 'Lato', Arial, sans-serif;
          font-size: 15px;
          font-weight: 700;
          border: none;
          border-radius: 24px;
          padding: 14px 36px;
          cursor: pointer;
          letter-spacing: 0.4px;
          width: 100%;
          margin-top: 8px;
          transition: background 0.2s;
        }
        .g01c-submit:hover:not(:disabled) { background: #5a7e18; }
        .g01c-submit:disabled { opacity: 0.7; cursor: default; }
        .g01c-success {
          text-align: center;
          padding: 32px 0;
          font-family: 'Cardo', Georgia, serif;
          font-size: 22px;
          color: #6a961f;
        }

        @media (max-width: 1023px) {
          .g01c-inner { grid-template-columns: 1fr; gap: 40px; }
        }
        @media (max-width: 767px) {
          .g01c-section { padding: 60px 20px; }
          .g01c-form-card { padding: 24px; }
          .g01c-form-row { grid-template-columns: 1fr; }
          .g01c-info-title { font-size: 28px; }
        }
      `}</style>

      <section id="kontakt" className="g01c-section">
        <div className="g01c-inner">
          <div className="g01c-info">
            <GenericEditableText
              tag="h2"
              className="g01c-info-title"
              value={title}
              sectionId={sectionId}
              field="title"
            />
            <hr className="g01c-hr" />
            <GenericEditableText
              tag="p"
              className="g01c-info-subtitle"
              value={subtitle}
              sectionId={sectionId}
              field="subtitle"
            />
            <div className="g01c-contact-items">
              <div className="g01c-contact-item">
                <div className="g01c-contact-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v2.92z"/>
                  </svg>
                </div>
                <div className="g01c-contact-text">
                  <span className="g01c-contact-label">Telefon</span>
                  <a href={`tel:${phone.replace(/\s/g,"")}`} className="g01c-contact-value">{phone}</a>
                </div>
              </div>
              <div className="g01c-contact-item">
                <div className="g01c-contact-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div className="g01c-contact-text">
                  <span className="g01c-contact-label">E-mail</span>
                  <a href={`mailto:${email}`} className="g01c-contact-value">{email}</a>
                </div>
              </div>
              <div className="g01c-contact-item">
                <div className="g01c-contact-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div className="g01c-contact-text">
                  <span className="g01c-contact-label">Oblast</span>
                  <span className="g01c-contact-value">{address}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="g01c-form-card">
            {sent ? (
              <p className="g01c-success">Děkujeme! Ozveme se vám do 24 hodin.</p>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="g01c-form-row">
                  <div className="g01c-field">
                    <label>Jméno a příjmení</label>
                    <input type="text" placeholder="Jan Novák" required />
                  </div>
                  <div className="g01c-field">
                    <label>Telefon</label>
                    <input type="tel" placeholder="+420 000 000 000" />
                  </div>
                </div>
                <div className="g01c-field">
                  <label>E-mail</label>
                  <input type="email" placeholder="vas@email.cz" required />
                </div>
                <div className="g01c-field">
                  <label>Zpráva</label>
                  <textarea placeholder="Popište vaši zahradu a co potřebujete..." rows={5} required />
                </div>
                <button type="submit" className="g01c-submit" disabled={sending}>
                  {sending ? "Odesílám…" : buttonText}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// ── clean-02-contact ──────────────────────────────────────────────────────────
function ContactClean02({ content, sectionId, tenantSlug: _tenantSlug, isAdmin: _isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const eyebrow = String(content.eyebrow ?? "Nezávazná poptávka");
  const title   = String(content.title ?? "Připravíme vám cenovou nabídku");
  const sub     = String(content.subtitle ?? "Na zprávy i hovory reagujeme bez zbytečných prodlev. S námi se domluvíte rychle a jasně.");
  const phone   = String(content.phone ?? "+420 704 123 456");
  const email   = String(content.email ?? "email@demo.cz");
  const address = String(content.address ?? "Ukázková 123, 110 00 Praha 1");
  const hours   = String(content.openingHours ?? "Po–Pá 8:00–16:00");
  const services = (content.services as string[]) ?? [];
  const NAVY = "#0e0e53"; const BLUE = "#019dff";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 900));
    setSending(false);
    setSent(true);
  };

  return (
    <>
      <style>{`
        .c02co-section { background: #f3f9ff; padding: 5.5rem 5%; font-family: 'Onest',sans-serif; }
        .c02co-inner { max-width: 80rem; margin: 0 auto; display: grid; grid-template-columns: 1fr 1.5fr; gap: 2.5rem; align-items: start; }
        .c02co-panel { background: ${NAVY}; border-radius: 20px; padding: 2.75rem 2.25rem; position: relative; overflow: hidden; }
        .c02co-panel::before { content: ''; position: absolute; bottom: -60px; right: -60px; width: 250px; height: 250px; border-radius: 50%; background: radial-gradient(circle, rgba(1,157,255,.18) 0%, transparent 70%); pointer-events: none; }
        .c02co-kicker { display: inline-flex; align-items: center; gap: .45rem; font-size: .72rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: ${BLUE}; margin-bottom: .75rem; }
        .c02co-kicker::before { content: ''; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${BLUE}; }
        .c02co-h2 { font-family: 'Bricolage Grotesque',sans-serif; font-size: clamp(1.4rem,2.5vw,2rem); font-weight: 800; color: #fff; margin: 0 0 .75rem; line-height: 1.25; }
        .c02co-sub { font-size: .9rem; color: rgba(255,255,255,.65); line-height: 1.65; margin: 0 0 2rem; }
        .c02co-divider { border: none; border-top: 1px solid rgba(255,255,255,.12); margin: 0 0 2rem; }
        .c02co-row { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.25rem; }
        .c02co-row:last-child { margin-bottom: 0; }
        .c02co-icon-box { width: 40px; height: 40px; border-radius: 10px; background: rgba(1,157,255,.18); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .c02co-icon-box svg { width: 18px; height: 18px; color: ${BLUE}; }
        .c02co-row-label { font-size: .72rem; font-weight: 600; color: rgba(255,255,255,.45); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 2px; }
        .c02co-row-val { font-size: .9rem; font-weight: 600; color: #fff; }
        .c02co-row-val a { color: #fff; text-decoration: none; }
        .c02co-row-val a:hover { color: ${BLUE}; }
        .c02co-form-wrap { background: #fff; border: 1px solid #dfecff; border-radius: 20px; padding: 2.5rem; }
        .c02co-form-title { font-family: 'Bricolage Grotesque',sans-serif; font-size: 1.35rem; font-weight: 800; color: ${NAVY}; margin: 0 0 1.75rem; }
        .c02co-form { display: flex; flex-direction: column; gap: 1.1rem; }
        .c02co-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .c02co-field label { font-size: .78rem; font-weight: 700; color: ${NAVY}; display: block; margin-bottom: .35rem; letter-spacing: .02em; }
        .c02co-field input, .c02co-field select, .c02co-field textarea {
          width: 100%; padding: .8rem 1rem; border: 1.5px solid #dfecff; border-radius: 10px; box-sizing: border-box;
          font-family: 'Onest',sans-serif; font-size: .9rem; color: ${NAVY}; background: #fafcff; outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .c02co-field input:focus, .c02co-field select:focus, .c02co-field textarea:focus { border-color: ${BLUE}; box-shadow: 0 0 0 3px rgba(1,157,255,.12); background: #fff; }
        .c02co-field textarea { min-height: 110px; resize: vertical; }
        .c02co-submit { width: 100%; padding: .95rem 2rem; border-radius: 9999px; border: none; background: linear-gradient(100deg,#2bbbff,#1c91ff 40%,#2559e2); color: #fff; font-family: 'Onest',sans-serif; font-size: 1rem; font-weight: 700; cursor: pointer; transition: opacity .2s, transform .15s; box-shadow: 0 8px 24px -6px rgba(1,157,255,.4); }
        .c02co-submit:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
        .c02co-submit:disabled { opacity: .7; cursor: default; }
        .c02co-success { background: #ecfdf5; border: 1.5px solid #6ee7b7; border-radius: 12px; padding: 1.5rem; text-align: center; }
        .c02co-success-icon { font-size: 2rem; margin-bottom: .5rem; }
        .c02co-success p { font-size: .95rem; color: #065f46; font-weight: 600; margin: 0; }
        @media(max-width:960px) { .c02co-inner { grid-template-columns: 1fr; } }
        @media(max-width:520px) { .c02co-row2 { grid-template-columns: 1fr; } .c02co-form-wrap { padding: 1.75rem 1.25rem; } }
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
            {sent ? (
              <div className="c02co-success">
                <div className="c02co-success-icon">✓</div>
                <p>Zpráva odeslána! Ozveme se vám do 24 hodin.</p>
              </div>
            ) : (
              <form className="c02co-form" onSubmit={handleSubmit}>
                <div className="c02co-row2">
                  <div className="c02co-field">
                    <label>Jméno a příjmení *</label>
                    <input type="text" name="name" required placeholder="Jan Novák" />
                  </div>
                  <div className="c02co-field">
                    <label>Telefonní číslo *</label>
                    <input type="tel" name="phone" required placeholder="+420 704 123 456" />
                  </div>
                </div>
                <div className="c02co-field">
                  <label>E-mail *</label>
                  <input type="email" name="email" required placeholder="jan@firma.cz" />
                </div>
                {services.length > 0 && (
                  <div className="c02co-field">
                    <label>Typ poptávky</label>
                    <select name="service">
                      {services.map((s, i) => <option key={i} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                <div className="c02co-field">
                  <label>Zpráva</label>
                  <textarea name="message" placeholder="Popište prostor, který potřebujete uklidit — velikost, frekvenci, případné zvláštní požadavky…" />
                </div>
                <button type="submit" className="c02co-submit" disabled={sending}>
                  {sending ? "Odesílám…" : "Odeslat poptávku"}
                </button>
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
  const tagline   = String(content.tagline   ?? "Kde nás najdete");
  const title     = String(content.title     ?? "Dvě pobočky\nv Praze.");
  const body      = String(content.body      ?? "");
  const formTitle = String((content as any).formTitle ?? "Zanechte zprávu");
  const formSub   = String((content as any).formSubtitle ?? "Vyplňte formulář a my se vám ozveme.");
  const locations = ((content as any).locations as Array<{ name: string; address: string; city: string; phone?: string; email?: string; hours?: string }>) ?? [];

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

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    background: SURF, border: `1px solid ${BORDER}`,
    borderRadius: 2, padding: "12px 16px",
    fontFamily: SANS, fontSize: 14, color: CREAM,
    outline: "none", transition: "border-color 0.2s",
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
    <section id="kontakt" style={{ background: DARK, padding: "clamp(64px, 10vw, 120px) clamp(24px, 6vw, 80px)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <p style={{
            fontFamily: SANS, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: RED, margin: "0 0 16px",
          }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          <h2 style={{
            fontFamily: SERIF, fontSize: "clamp(28px, 4vw, 50px)", fontWeight: 400,
            fontStyle: "italic", color: CREAM, margin: "0 0 20px", lineHeight: 1.12,
            whiteSpace: "pre-line",
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {body && (
            <p style={{ fontFamily: SANS, fontSize: 16, color: MUTED, lineHeight: 1.7, margin: 0, maxWidth: 560 }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
        </div>

        {/* 2-col: lokace + formulář */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px, 6vw, 80px)",
        }} className="r04-contact-grid">
          {/* Lokace */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {locations.map((loc, i) => (
              <div key={i} style={{
                background: SURF, border: `1px solid ${BORDER}`,
                borderTop: `2px solid ${RED}`,
                borderRadius: 2, padding: "28px 28px 32px",
              }}>
                <h3 style={{
                  fontFamily: SERIF, fontSize: "clamp(16px, 2vw, 20px)", fontWeight: 400,
                  fontStyle: "italic", color: CREAM, margin: "0 0 20px",
                }}>
                  <GenericEditableText sectionId={sectionId} field={`locations.${i}.name`} value={loc.name} tag="span" />
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
                      <a href={`tel:${loc.phone.replace(/\s/g, "")}`} style={{ fontFamily: SANS, fontSize: 14, color: MUTED, textDecoration: "none" }}>
                        <GenericEditableText sectionId={sectionId} field={`locations.${i}.phone`} value={loc.phone} tag="span" />
                      </a>
                    </div>
                  )}
                  {loc.email && (
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <IconMail />
                      <a href={`mailto:${loc.email}`} style={{ fontFamily: SANS, fontSize: 14, color: MUTED, textDecoration: "none" }}>
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
          <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 2, padding: "36px" }}>
            <h3 style={{
              fontFamily: SERIF, fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: 400,
              fontStyle: "italic", color: CREAM, margin: "0 0 8px",
            }}>
              <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" />
            </h3>
            <p style={{ fontFamily: SANS, fontSize: 14, color: MUTED, margin: "0 0 28px" }}><GenericEditableText sectionId={sectionId} field="formSubtitle" value={formSub} tag="span" /></p>

            {sent ? (
              <div style={{
                padding: "28px 24px", background: DARK, borderRadius: 2,
                textAlign: "center", border: `1px solid ${RED}44`,
              }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>✓</div>
                <p style={{ fontFamily: SANS, fontSize: 15, color: CREAM, margin: 0 }}>
                  Zpráva odeslána. Ozveme se vám co nejdříve.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input
                  type="text" placeholder="Vaše jméno" required
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = RED)}
                  onBlur={e => (e.target.style.borderColor = BORDER)}
                />
                <input
                  type="email" placeholder="E-mail" required
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = RED)}
                  onBlur={e => (e.target.style.borderColor = BORDER)}
                />
                <input
                  type="tel" placeholder="Telefon (nepovinné)"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = RED)}
                  onBlur={e => (e.target.style.borderColor = BORDER)}
                />
                <textarea
                  placeholder="Vaše zpráva nebo dotaz k rezervaci..." required
                  rows={5}
                  style={{ ...inputStyle, resize: "vertical" }}
                  onFocus={e => (e.target.style.borderColor = RED)}
                  onBlur={e => (e.target.style.borderColor = BORDER)}
                />
                <button
                  type="submit"
                  style={{
                    fontFamily: SANS, fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    color: CREAM, background: RED, border: "none",
                    borderRadius: 2, padding: "15px 32px",
                    cursor: "pointer", transition: "background-color 0.2s",
                    alignSelf: "flex-start",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#a01515")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = RED)}
                >
                  Odeslat zprávu
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .r04-contact-grid { grid-template-columns: 1fr !important; } }
      `}</style>
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
  const heading    = String(content.heading    ?? "Kontakt");
  const subheading = String(content.subheading ?? "");
  const email      = String(content.email      ?? "");
  const phone      = String(content.phone      ?? "");
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
        .ar01cnt-btn { background: #000; color: #fff; border: none; padding: 14px 32px; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; cursor: pointer; font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; transition: background .2s; align-self: flex-start; }
        .ar01cnt-btn:hover { background: #333; }
        .ar01cnt-success { font-size: 14px; color: #4caf50; padding: 12px 0; }
        @media (max-width: 768px) { .ar01cnt { padding: 56px 24px; } .ar01cnt-inner { grid-template-columns: 1fr; gap: 48px; } }
      `}</style>
      <section className="ar01cnt" data-template="arch-01-contact">
        <div className="ar01cnt-inner">
          <div>
            <h2 className="ar01cnt-heading">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
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
