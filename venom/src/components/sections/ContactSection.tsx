"use client";

import { useState } from "react";
import Image from "next/image";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";
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
  if (variant === "hair-04-contact") {
    return <ContactHair04 content={content} sectionId={sectionId} />;
  }
  if (variant === "contact-beauty-01") {
    return <ContactBeauty01 content={content} sectionId={sectionId} />;
  }
  if (variant === "contact-hair-02-location") {
    return <ContactHair02Location content={content} sectionId={sectionId} />;
  }
  return <ContactSectionForm content={content} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
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
  const title      = String(content.title      ?? "Najdete nás v srdci Prahy.");
  const address    = String(content.address    ?? "");
  const mapsLabel  = String(content.mapsLabel  ?? "Otevřít v Google Maps");
  const mapsHref   = String(content.mapsHref   ?? "https://maps.google.com");
  const phone      = String(content.phone      ?? "");
  const phoneLabel = String(content.phoneLabel ?? "Zavolat");
  const email      = String(content.email      ?? "");
  const hours      = (content.hours as Array<{ day: string; value: string }>) ?? [];

  const CREAM  = "#FFF8F1";
  const DARK   = "#1F1F1F";
  const MUTED  = "#5B4D43";
  const SAND   = "#E0BE9A";
  const FONT_H = "'Cormorant Garamond', 'Fahkwang', Georgia, serif";
  const FONT_B = "'Fahkwang', sans-serif";

  return (
    <section id="kontakt" style={{ backgroundColor: CREAM, padding: "80px 24px" }} data-template="beauty-01">
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        {/* Title */}
        <h2 style={{ fontFamily: FONT_H, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 400, color: DARK, marginBottom: 48, lineHeight: 1.2 }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>

        {/* 2-col: adresa+mapa vlevo, hodiny+kontakt vpravo */}
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "48px 64px" }}>
          {/* Levý sloupec — adresa */}
          <div>
            <p style={{ fontFamily: FONT_B, fontSize: 11, fontWeight: 300, letterSpacing: "0.16em", color: MUTED, textTransform: "uppercase", marginBottom: 12 }}>
              Adresa
            </p>
            {address && (
              <p style={{ fontFamily: FONT_B, fontSize: 16, fontWeight: 300, color: DARK, lineHeight: 1.7, marginBottom: 20, whiteSpace: "pre-line" }}>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </p>
            )}
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                fontFamily: FONT_B, fontSize: 12, fontWeight: 400, color: DARK,
                letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none",
                borderBottom: `1px solid ${SAND}`, paddingBottom: 2, transition: "color 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = MUTED; }}
              onMouseLeave={e => { e.currentTarget.style.color = DARK; }}
            >
              <GenericEditableText sectionId={sectionId} field="mapsLabel" value={mapsLabel} tag="span" />
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden><path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </a>
          </div>

          {/* Pravý sloupec — hodiny + kontakt */}
          <div>
            {/* Hodiny */}
            {hours.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <p style={{ fontFamily: FONT_B, fontSize: 11, fontWeight: 300, letterSpacing: "0.16em", color: MUTED, textTransform: "uppercase", marginBottom: 12 }}>
                  Otevírací doba
                </p>
                {hours.map((h, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, borderBottom: "1px solid rgba(224,190,154,0.2)", paddingBottom: 8 }}>
                    <span style={{ fontFamily: FONT_B, fontSize: 14, fontWeight: 300, color: MUTED }}>
                      <GenericEditableText sectionId={sectionId} field={`hours.${i}.day`} value={h.day} tag="span" />
                    </span>
                    <span style={{ fontFamily: FONT_B, fontSize: 14, fontWeight: 400, color: DARK }}>
                      <GenericEditableText sectionId={sectionId} field={`hours.${i}.value`} value={h.value} tag="span" />
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Kontakt */}
            <p style={{ fontFamily: FONT_B, fontSize: 11, fontWeight: 300, letterSpacing: "0.16em", color: MUTED, textTransform: "uppercase", marginBottom: 12 }}>
              Kontakt
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {phone && (
                <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ fontFamily: FONT_B, fontSize: 15, fontWeight: 300, color: DARK, textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, minWidth: 56 }}>
                    <GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span" />
                  </span>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} style={{ fontFamily: FONT_B, fontSize: 15, fontWeight: 300, color: DARK, textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, minWidth: 56 }}>
                    Email
                  </span>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              )}
            </div>
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
