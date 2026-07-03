"use client";

import type React from "react";
import { useRef, useEffect } from "react";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import { GenericEditableImage } from "@/components/tenant/GenericEditableImage";
import { OptimizedPicture } from "@/components/OptimizedPicture";
import { WeberoCredit } from "@/components/WeberoCredit";
import { CateringSaveurLogo } from "@/components/sections/NavbarSection";

interface Props {
  content: Record<string, unknown>;
  variant?: string;
  isAdmin: boolean;
  tenantSlug?: string;
  sectionId: number;
}

function demoLogoDataUrl(name: string): string {
  const initials = encodeURIComponent(name.slice(0, 2).toUpperCase());
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23111'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='28' fill='white' font-family='sans-serif'%3E${initials}%3C/text%3E%3C/svg%3E`;
}

export function FooterSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {

  if (variant === "elektro-01-footer") return <FooterElektro01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "nails-01-footer") return <FooterNails01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "nails-02-footer") return <FooterNails02 content={content} sectionId={sectionId} />;
  if (variant === "nails-03-footer")  return <FooterNails03 content={content} sectionId={sectionId} />;
  if (variant === "clinic-02-footer") return <FooterClinic02 content={content} sectionId={sectionId} />;
  if (variant === "clinic-03-footer")    return <FooterClinic03 content={content} sectionId={sectionId} />;
  if (variant === "restaurant-01-footer") return <FooterRestaurant01 content={content} sectionId={sectionId} />;
  if (variant === "restaurant-02-footer") return <FooterRestaurant02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "restaurant-03-footer") return <FooterRestaurant03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "cafe-02-footer")       return <FooterCafe02 content={content} sectionId={sectionId} />;
  if (variant === "cafe-03-footer")       return <FooterCafe03 content={content} sectionId={sectionId} />;
  if (variant === "cafe-04-footer")       return <FooterCafe04 content={content} sectionId={sectionId} />;
  if (variant === "bakery-01-footer")     return <FooterBakery01 content={content} sectionId={sectionId} />;
  if (variant === "reality-01-footer")    return <FooterReality01 content={content} sectionId={sectionId} />;
  if (variant === "reality-02-footer")    return <FooterReality02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "reality-03-footer")    return <FooterReality03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "reality-04-footer")    return <FooterReality04 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "reality-05-footer")    return <FooterReality05 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "reality-06-footer")    return <FooterReality06 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "fitness-01-footer") return <FooterFitness01 content={content} sectionId={sectionId} />;
  if (variant === "fitness-02-footer") return <FooterFitness02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "fyzio-01-footer")   return <FooterFyzio01 content={content} sectionId={sectionId} />;
  if (variant === "fyzio-02-footer")   return <FooterFyzio02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "dental-01-footer")  return <FooterDental01 content={content} sectionId={sectionId} />;

  if (variant === "ananda-01-footer") {
    return <FooterAnanda01 content={content} sectionId={sectionId} />;
  }
  if (variant === "tawan-02-footer") {
    return <FooterTawan02 content={content} sectionId={sectionId} />;
  }
  if (variant === "tawan-01-footer") {
    return <FooterTawan01 content={content} sectionId={sectionId} />;
  }
  if (variant === "massage-01-footer") {
    return <FooterMassage01 content={content} sectionId={sectionId} />;
  }
  if (variant === "tattoo-01-footer") {
    return <FooterTattoo01 content={content} sectionId={sectionId} />;
  }
  if (variant === "tattoo-02-footer") {
    return <FooterTattoo02 content={content} sectionId={sectionId} />;
  }
  if (variant === "tattoo-03-footer") {
    return <FooterTattoo03 content={content} sectionId={sectionId} />;
  }

  // hair-04: tmavý footer, logo vlevo, info uprostřed, soc. sítě vpravo, copyright bar dole
  if (variant === "hair-04-footer") {
    const siteName  = String(content.siteName  ?? "Impresiv Studio");
    const address   = String(content.address   ?? "");
    const phone     = String(content.phone     ?? "");
    const email     = String(content.email     ?? "");
    const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);
    const gdprHref  = String(content.gdprHref  ?? "/gdpr");
    const facebook  = String(content.facebook  ?? "");
    const instagram = String(content.instagram ?? "");
    const GOLD  = "#FFDF25";
    const DARK  = "#0a0a0a";
    const LATO  = "'Lato', sans-serif";

    return (
      <footer data-template="hair-04" style={{ backgroundColor: DARK, borderTop: "1px solid rgba(255,223,37,0.2)" }}>
        {/* Hlavní řádek */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 32,
          padding: "52px clamp(32px,6vw,100px)",
        }}>
          {/* Logo vlevo */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontFamily: LATO, fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </span>
            <span style={{ fontFamily: LATO, fontSize: 11, fontWeight: 300, color: GOLD, letterSpacing: "0.25em", textTransform: "uppercase" }}>Hair Salon</span>
          </div>

          {/* Kontaktní info uprostřed */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", textAlign: "center" }}>
            {address && (
              <GenericEditableText sectionId={sectionId} field="address" value={address} tag="p"
                style={{ fontFamily: LATO, fontSize: 14, fontWeight: 300, color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.5 }} />
            )}
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
              {phone && (
                <a href={`tel:+420${phone.replace(/\s/g,"")}`}
                  style={{ fontFamily: LATO, fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.75)", textDecoration: "none" }}
                  onMouseEnter={e => { e.currentTarget.style.color = GOLD; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`}
                  style={{ fontFamily: LATO, fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.75)", textDecoration: "none" }}
                  onMouseEnter={e => { e.currentTarget.style.color = GOLD; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              )}
            </div>
          </div>

          {/* Sociální sítě vpravo */}
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            {facebook && (
              <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                style={{ color: "rgba(255,255,255,0.5)", transition: "color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = GOLD; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            )}
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                style={{ color: "rgba(255,255,255,0.5)", transition: "color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = GOLD; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            )}
          </div>
        </div>

        {/* Copyright bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "18px clamp(32px,6vw,100px)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="p"
            style={{ fontFamily: LATO, fontSize: 13, fontWeight: 300, color: "rgba(255,255,255,0.4)", margin: 0 }} />
          <a href={gdprHref}
            style={{ fontFamily: LATO, fontSize: 13, fontWeight: 300, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
            onMouseEnter={e => { e.currentTarget.style.color = GOLD; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
            Ochrana osobních údajů
          </a>
        </div>
      </footer>
    );
  }

  const siteName = String(content.siteName ?? "Web");
  const tagline = String(content.tagline ?? "");
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];
  const phone = String(content.phone ?? "");
  const email = String(content.email ?? "");
  const address = String(content.address ?? "");
  const year = new Date().getFullYear();
  const columns = (content.columns as Array<{ title: string; links: Array<{ label: string; href: string }> }>) ?? [];
  const socials = (content.socials as Array<{ label?: string; href?: string; icon?: string }>) ?? [];
  const logoUrl = String(content.logoUrl ?? "");
  const logoSrc = logoUrl || demoLogoDataUrl(siteName);
  const legalLinks = (content.legalLinks as Array<{ label: string; href: string }>) ?? [];

  // beauty-01 — Sand-Cream Editorial Wellness footer
  // Dark ink #1F1F1F (kontrast k cream body), HUGE Fahkwang wordmark hero + brandTag,
  // 4-col grid (Navigace / Kontakt / Otevřeno / Sledujte), bottom legal + WeberoCredit.
  if (variant === "beauty-01-footer") {
    const cc = content as Record<string, unknown>;
    const brandTag   = String(cc.brandTag ?? "Wellness atelier. Vinohrady, Praha.");
    const links      = (cc.links as Array<{ label: string; href: string }>) ?? [];
    const hours      = (cc.hours as Array<{ day: string; value: string }>) ?? [];
    const navTitle      = String(cc.navTitle      ?? "Navigace");
    const contactTitle  = String(cc.contactTitle  ?? "Kontakt");
    const hoursTitle    = String(cc.hoursTitle    ?? "Otevřeno");
    const socialTitle   = String(cc.socialTitle   ?? "Sledujte");
    const copyright     = String(cc.copyright     ?? "© 2026 Atelier Lumina s.r.o.");
    const legalText     = String(cc.legalText     ?? "Všechna práva vyhrazena");

    const BG     = "#1F1F1F";
    const BORDER = "rgba(224,190,154,0.18)";
    const SAND   = "#E0BE9A";
    const WHITE  = "#ffffff";
    const MUTED  = "rgba(255,255,255,0.55)";
    const FONT   = "'Fahkwang', Georgia, serif";
    const SANS   = "var(--font-overpass), 'Overpass', Inter, system-ui, sans-serif";
    const MONO   = "var(--font-overpass-mono), 'Overpass Mono', Menlo, monospace";

    return (
      <footer
        className="b01-footer"
        style={{
          backgroundColor: BG,
          fontFamily: FONT,
          color: WHITE,
          paddingTop: "clamp(64px, 8vw, 96px)",
          paddingBottom: "clamp(28px, 3vw, 40px)",
          paddingLeft: "clamp(24px, 5vw, 64px)",
          paddingRight: "clamp(24px, 5vw, 64px)",
        }}
        data-template="beauty-01"
      >
        <div className="mx-auto" style={{ maxWidth: 1320 }}>
          {/* Wordmark hero */}
          <div style={{
            paddingBottom: "clamp(40px, 5vw, 56px)",
            borderBottom: `1px solid ${BORDER}`,
            marginBottom: "clamp(40px, 5vw, 56px)",
          }}>
            <h2 style={{
              margin: 0,
              fontFamily: FONT, fontWeight: 500,
              fontSize: "clamp(36px, 6vw, 84px)",
              lineHeight: 1.05, letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: WHITE,
            }}>
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </h2>
            <p style={{
              margin: "14px 0 0",
              fontFamily: SANS, fontWeight: 300,
              fontSize: "clamp(13px, 1.2vw, 16px)",
              color: MUTED, fontStyle: "italic",
              letterSpacing: "0.01em",
              maxWidth: 540,
            }}>
              <GenericEditableText sectionId={sectionId} field="brandTag" value={brandTag} tag="span" />
            </p>
          </div>

          {/* 4-col grid */}
          <div className="b01-foot-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "clamp(32px, 4vw, 48px)",
          }}>
            {links.length > 0 && (
              <div>
                <h3 style={{
                  margin: "0 0 18px",
                  fontFamily: MONO, fontSize: 11, fontWeight: 400,
                  letterSpacing: "0.24em", textTransform: "uppercase",
                  color: SAND,
                }}>
                  <GenericEditableText sectionId={sectionId} field="navTitle" value={navTitle} tag="span" />
                </h3>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {links.map((l, i) => (
                    <li key={`b1-f-l-${i}`}>
                      <a href={l.href} className="b01-foot-link" style={{
                        fontFamily: FONT, fontWeight: 400, fontSize: 14,
                        letterSpacing: "0.08em",
                        color: WHITE, textDecoration: "none",
                        transition: "color 0.3s ease",
                      }}>
                        <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 style={{
                margin: "0 0 18px",
                fontFamily: MONO, fontSize: 11, fontWeight: 400,
                letterSpacing: "0.24em", textTransform: "uppercase",
                color: SAND,
              }}>
                <GenericEditableText sectionId={sectionId} field="contactTitle" value={contactTitle} tag="span" />
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {phone && (
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="b01-foot-link" style={{
                    fontFamily: SANS, fontSize: 14, color: WHITE,
                    textDecoration: "none", transition: "color 0.3s ease",
                  }}>
                    <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                  </a>
                )}
                {email && (
                  <a href={`mailto:${email}`} className="b01-foot-link" style={{
                    fontFamily: SANS, fontSize: 14, color: WHITE,
                    textDecoration: "none", transition: "color 0.3s ease",
                  }}>
                    <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                  </a>
                )}
                {address && (
                  <span style={{
                    fontFamily: SANS, fontSize: 14, color: MUTED,
                    whiteSpace: "pre-line", lineHeight: 1.5,
                  }}>
                    <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                  </span>
                )}
              </div>
            </div>

            {hours.length > 0 && (
              <div>
                <h3 style={{
                  margin: "0 0 18px",
                  fontFamily: MONO, fontSize: 11, fontWeight: 400,
                  letterSpacing: "0.24em", textTransform: "uppercase",
                  color: SAND,
                }}>
                  <GenericEditableText sectionId={sectionId} field="hoursTitle" value={hoursTitle} tag="span" />
                </h3>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  {hours.map((h, i) => (
                    <li key={`b1-f-h-${i}`} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <span style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>
                        <GenericEditableText sectionId={sectionId} field={`hours.${i}.day`} value={h.day} tag="span" />
                      </span>
                      <span style={{ fontFamily: MONO, fontSize: 12, color: WHITE, letterSpacing: "0.04em" }}>
                        <GenericEditableText sectionId={sectionId} field={`hours.${i}.value`} value={h.value} tag="span" />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {socials.length > 0 && (
              <div>
                <h3 style={{
                  margin: "0 0 18px",
                  fontFamily: MONO, fontSize: 11, fontWeight: 400,
                  letterSpacing: "0.24em", textTransform: "uppercase",
                  color: SAND,
                }}>
                  <GenericEditableText sectionId={sectionId} field="socialTitle" value={socialTitle} tag="span" />
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {socials.map((s, i) => (
                    <a
                      key={`b1-f-s-${i}`}
                      href={s.href ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="b01-foot-link"
                      style={{
                        fontFamily: FONT, fontSize: 14, color: WHITE,
                        letterSpacing: "0.06em", textDecoration: "none",
                        transition: "color 0.3s ease",
                      }}
                    >
                      <GenericEditableText sectionId={sectionId} field={`socials.${i}.label`} value={s.label ?? ""} tag="span" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom legal */}
          <div style={{
            marginTop: "clamp(48px, 6vw, 72px)",
            paddingTop: 24,
            borderTop: `1px solid ${BORDER}`,
            display: "flex", flexWrap: "wrap",
            alignItems: "center", justifyContent: "space-between",
            gap: 16,
          }}>
            <p style={{
              margin: 0,
              fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em",
              color: MUTED,
            }}>
              <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
              <span style={{ margin: "0 8px", opacity: 0.4 }}>·</span>
              <GenericEditableText sectionId={sectionId} field="legalText" value={legalText} tag="span" />
            </p>
            <WeberoCredit />
          </div>
        </div>
      </footer>
    );
  }

  // hair-03 — Petra Studio — minimální šedá patička
  if (variant === "hair-03-footer") {
    return <FooterHair03 content={content} sectionId={sectionId} />;
  }

  // hair-01 — Salon Aria — dark footer: heading + 3-col (phone/hours/address+social) + legal
  if (variant === "hair-01-footer") {
    const heading  = String(content.heading ?? "Těšíme se na vás!");
    const phone    = String(content.phone ?? "");
    const emailVal = String(content.email ?? "");
    const address  = String(content.address ?? "").replace(/\\n/g, "\n");
    const legal    = String(content.legal ?? "");
    const hoursLabel = String(content.hoursLabel ?? "Otevírací doba:");
    const hours = (content.hours as Array<{ day: string; value: string }>) ?? [];
    const socials_ = (content.socials as Array<{ label: string; href: string }>) ?? [];
    const MONO = "'Montserrat',sans-serif";
    const GOLD = "#8a6f28";
    const BG = "#1e1e1e";
    const TEXT = "rgba(255,255,255,0.75)";
    const H = "#ffffff";
    return (
      <footer id="kontakt" data-template="hair-01" style={{ backgroundColor: BG, fontFamily: MONO }}>
        <div className="max-w-[1280px] mx-auto" style={{ padding: "80px clamp(20px,5vw,60px) 0" }}>
          {/* Heading */}
          <h2 style={{ color: H, fontSize: "clamp(24px,3.5vw,42px)", fontWeight: 200, letterSpacing: "0.04em", marginBottom: 56, textAlign: "center" }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>

          {/* 3-col info */}
          <div className="grid gap-10" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 48 }}>
            {/* Zavolejte nám */}
            <div>
              <p style={{ color: GOLD, fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>Zavolejte nám</p>
              {phone && (
                <a href={`tel:${phone.replace(/\s/g,"")}`} style={{ color: H, fontSize: "clamp(15px,1.4vw,18px)", fontWeight: 300, textDecoration: "none", display: "block", marginBottom: 8 }}>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              )}
              {emailVal && (
                <a href={`mailto:${emailVal}`} style={{ color: TEXT, fontSize: 13, fontWeight: 300, textDecoration: "none" }}>
                  <GenericEditableText sectionId={sectionId} field="email" value={emailVal} tag="span" />
                </a>
              )}
            </div>

            {/* Otevírací doba */}
            <div>
              <p style={{ color: GOLD, fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>
                <GenericEditableText sectionId={sectionId} field="hoursLabel" value={hoursLabel} tag="span" />
              </p>
              {hours.map((h, i) => (
                <div key={i} className="flex gap-3" style={{ marginBottom: 6 }}>
                  <span style={{ color: TEXT, fontSize: 13, fontWeight: 300, minWidth: 130 }}>
                    <GenericEditableText sectionId={sectionId} field={`hours.${i}.day`} value={h.day} tag="span" />
                  </span>
                  <span style={{ color: H, fontSize: 13, fontWeight: 400 }}>
                    <GenericEditableText sectionId={sectionId} field={`hours.${i}.value`} value={h.value} tag="span" />
                  </span>
                </div>
              ))}
            </div>

            {/* Adresa + social */}
            <div>
              <p style={{ color: GOLD, fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>Adresa</p>
              {address && (
                <address style={{ color: TEXT, fontSize: 13, fontWeight: 300, lineHeight: 1.7, fontStyle: "normal", marginBottom: 20 }}>
                  {address.split("\n").map((line, i) => <span key={i} style={{ display: "block" }}>{line}</span>)}
                </address>
              )}
              {socials_.length > 0 && (
                <div className="flex gap-4">
                  {socials_.map((s, i) => (
                    <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                      style={{ color: TEXT, fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                      onMouseLeave={e => (e.currentTarget.style.color = TEXT)}
                    >
                      <GenericEditableText sectionId={sectionId} field={`socials.${i}.label`} value={s.label} tag="span" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Legal */}
          {legal && (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, textAlign: "center", padding: "28px 0 28px", marginTop: 48, borderTop: "1px solid rgba(255,255,255,0.06)", lineHeight: 1.6 }}>
              <GenericEditableText sectionId={sectionId} field="legal" value={legal} tag="span" />
            </p>
          )}
        </div>
      </footer>
    );
  }

  // Footer — peak-cut (aka barber-05) Brutalist Atelier White
  // Dark ink #0a0a0a footer (kontrast k whitebody), 4-col grid: BRAND / NAV / KONTAKT / OTEVŘENO,
  // wordmark hero, mono labels, hairline white 0.15 dividers, bottom legal + socials + WeberoCredit.
  if (variant === "footer-peak-cut") {
    const OSWALD = "var(--font-oswald), 'Oswald', 'Bebas Neue', Impact, sans-serif";
    const MONO   = "var(--font-overpass-mono), 'Overpass Mono', 'JetBrains Mono', Menlo, monospace";
    const OVERPASS = "var(--font-overpass), 'Overpass', 'Inter', system-ui, sans-serif";
    const cc = content as Record<string, unknown>;
    const siteName = String(cc.siteName ?? "Peak Cut");
    const brandTag = String(cc.brandTag ?? "Pánský barbershop. Vinohrady, Praha.");
    const links = (cc.links as Array<{ label: string; href: string }>) ?? [];
    const phone = String(cc.phone ?? "");
    const email = String(cc.email ?? "");
    const address = String(cc.address ?? "");
    const hours = (cc.hours as Array<{ day: string; value: string }>) ?? [];
    const socials = (cc.socials as Array<{ icon?: string; label?: string; href?: string }>) ?? [];
    const navTitle      = String(cc.navTitle      ?? "Navigace");
    const contactTitle  = String(cc.contactTitle  ?? "Kontakt");
    const hoursTitle    = String(cc.hoursTitle    ?? "Otevírací doba");
    const copyright     = String(cc.copyright     ?? "© 2025 Peak Cut s.r.o.");
    const legalText     = String(cc.legalText     ?? "Všechna práva vyhrazena");

    const SocialIcon = ({ name }: { name?: string }) => {
      const p = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
      switch (name) {
        case "instagram":
          return (<svg {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>);
        case "facebook":
          return (<svg {...p}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>);
        case "youtube":
          return (<svg {...p}><path d="M22.5 6.5a3 3 0 0 0-2.1-2.1C18.6 4 12 4 12 4s-6.6 0-8.4.4A3 3 0 0 0 1.5 6.5C1 8.3 1 12 1 12s0 3.7.5 5.5a3 3 0 0 0 2.1 2.1C5.4 20 12 20 12 20s6.6 0 8.4-.4a3 3 0 0 0 2.1-2.1c.5-1.8.5-5.5.5-5.5s0-3.7-.5-5.5z"/><polygon points="10 15 16 12 10 9"/></svg>);
        case "tiktok":
          return (<svg {...p}><path d="M21 8.5a6.5 6.5 0 0 1-4.5-1.8v8.2A5.6 5.6 0 1 1 10.9 9v3a2.6 2.6 0 1 0 2.6 2.6V2h2.4A4.6 4.6 0 0 0 21 6z"/></svg>);
        default:
          return (<span style={{ fontSize: 11 }}>{name}</span>);
      }
    };

    return (
      <footer
        className="relative w-full overflow-hidden pc-footer"
        style={{
          backgroundColor: "#0a0a0a",
          color: "#ffffff",
          paddingTop: "clamp(64px, 8vw, 96px)",
          paddingBottom: "clamp(28px, 3vw, 40px)",
          paddingLeft: "clamp(24px, 5vw, 64px)",
          paddingRight: "clamp(24px, 5vw, 64px)",
        }}
        data-template="peak-cut"
      >
        <div className="mx-auto" style={{ maxWidth: 1320 }}>
          {/* Wordmark hero — full width above the grid */}
          <div style={{
            paddingBottom: "clamp(40px, 5vw, 56px)",
            borderBottom: "1px solid rgba(255,255,255,0.15)",
            marginBottom: "clamp(40px, 5vw, 56px)",
          }}>
            <h2 style={{
              margin: 0,
              fontFamily: OSWALD, fontWeight: 700,
              fontSize: "clamp(40px, 7vw, 96px)",
              lineHeight: 1, letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#ffffff",
            }}>
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </h2>
            <p style={{
              margin: "16px 0 0",
              fontFamily: OVERPASS, fontWeight: 300,
              fontSize: "clamp(14px, 1.2vw, 17px)",
              color: "rgba(255,255,255,0.6)",
              maxWidth: 540,
            }}>
              <GenericEditableText sectionId={sectionId} field="brandTag" value={brandTag} tag="span" />
            </p>
          </div>

          {/* 4-col grid */}
          <div className="pc-foot-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "clamp(32px, 4vw, 48px)",
          }}>
            {links.length > 0 && (
              <div>
                <h3 style={{
                  margin: "0 0 18px",
                  fontFamily: MONO, fontSize: 11, fontWeight: 400,
                  letterSpacing: "0.24em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                }}>
                  <GenericEditableText sectionId={sectionId} field="navTitle" value={navTitle} tag="span" />
                </h3>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {links.map((l, i) => (
                    <li key={`pc-f-l-${i}`}>
                      <a href={l.href} className="pc-foot-link" style={{
                        fontFamily: OSWALD, fontWeight: 500, fontSize: 14,
                        letterSpacing: "0.10em", textTransform: "uppercase",
                        color: "#ffffff", textDecoration: "none",
                        transition: "color 0.3s ease",
                      }}>
                        <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 style={{
                margin: "0 0 18px",
                fontFamily: MONO, fontSize: 11, fontWeight: 400,
                letterSpacing: "0.24em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
              }}>
                <GenericEditableText sectionId={sectionId} field="contactTitle" value={contactTitle} tag="span" />
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {phone && (
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="pc-foot-link" style={{
                    fontFamily: OVERPASS, fontSize: 14, color: "#ffffff",
                    textDecoration: "none", transition: "color 0.3s ease",
                  }}>
                    <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                  </a>
                )}
                {email && (
                  <a href={`mailto:${email}`} className="pc-foot-link" style={{
                    fontFamily: OVERPASS, fontSize: 14, color: "#ffffff",
                    textDecoration: "none", transition: "color 0.3s ease",
                  }}>
                    <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                  </a>
                )}
                {address && (
                  <span style={{
                    fontFamily: OVERPASS, fontSize: 14, color: "rgba(255,255,255,0.7)",
                    whiteSpace: "pre-line", lineHeight: 1.5,
                  }}>
                    <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                  </span>
                )}
              </div>
            </div>

            {hours.length > 0 && (
              <div>
                <h3 style={{
                  margin: "0 0 18px",
                  fontFamily: MONO, fontSize: 11, fontWeight: 400,
                  letterSpacing: "0.24em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                }}>
                  <GenericEditableText sectionId={sectionId} field="hoursTitle" value={hoursTitle} tag="span" />
                </h3>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  {hours.map((h, i) => (
                    <li key={`pc-f-h-${i}`} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <span style={{ fontFamily: OVERPASS, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                        <GenericEditableText sectionId={sectionId} field={`hours.${i}.day`} value={h.day} tag="span" />
                      </span>
                      <span style={{ fontFamily: MONO, fontSize: 12, color: "#ffffff", letterSpacing: "0.04em" }}>
                        <GenericEditableText sectionId={sectionId} field={`hours.${i}.value`} value={h.value} tag="span" />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {socials.length > 0 && (
              <div>
                <h3 style={{
                  margin: "0 0 18px",
                  fontFamily: MONO, fontSize: 11, fontWeight: 400,
                  letterSpacing: "0.24em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                }}>Sledujte</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {socials.map((s, i) => (
                    <a
                      key={`pc-f-s-${i}`}
                      href={s.href ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label ?? s.icon ?? "social"}
                      className="pc-foot-soc inline-flex items-center justify-center"
                      style={{
                        width: 36, height: 36,
                        border: "1px solid rgba(255,255,255,0.25)",
                        color: "#ffffff",
                        transition: "color 0.3s ease, border-color 0.3s ease, background-color 0.3s ease",
                      }}
                    >
                      <SocialIcon name={s.icon} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom legal row */}
          <div style={{
            marginTop: "clamp(48px, 6vw, 72px)",
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.15)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}>
            <p style={{
              margin: 0,
              fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.5)",
            }}>
              <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
              <span style={{ margin: "0 8px", opacity: 0.4 }}>·</span>
              <GenericEditableText sectionId={sectionId} field="legalText" value={legalText} tag="span" />
            </p>
            <WeberoCredit />
          </div>
        </div>
      </footer>
    );
  }

  // Footer — barber-04 (Černý Fade) — 3-col blurbs (lokalita / hodiny / kontakt s legal a social) — bez bottom legal řádku
  if (variant === "barber-04-multi-blurb-legal") {
    const hours = (content.hours as Array<{ day: string; value: string }>) ?? [];
    const hoursNote = String(content.hoursNote ?? "");
    const subway = String(content.subway ?? "");
    const ico = String(content.ico ?? "");
    const dic = String(content.dic ?? "");
    const vatNote = String(content.vatNote ?? "");
    const bankAccount = String(content.bankAccount ?? "");
    const paymentNote = String(content.paymentNote ?? "");
    const socials4 = (content.socials as Array<{ icon?: string; label?: string; href?: string }>) ?? [];
    const SocialIcon = ({ name }: { name?: string }) => {
      const p = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
      switch (name) {
        case "instagram": return (<svg {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>);
        case "facebook": return (<svg {...p}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>);
        case "youtube": return (<svg {...p}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor"/></svg>);
        case "tiktok": return (<svg {...p}><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>);
        default: return (<span style={{ fontSize: 11, textTransform: "uppercase" }}>{name}</span>);
      }
    };
    const h4 = {
      fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif" as const,
      fontWeight: 400 as const,
      fontSize: 18,
      letterSpacing: "0.20em",
      color: "#ffffff",
      textTransform: "uppercase" as const,
      marginBottom: 12,
      textAlign: "center" as const,
    };
    const body = {
      fontFamily: "'Lato',Helvetica,Arial,sans-serif" as const,
      fontSize: 13.5,
      lineHeight: 1.9,
      color: "rgba(255,255,255,0.70)",
      textAlign: "center" as const,
      margin: "0 0 12px",
    };
    const card = {
      backgroundColor: "#13110d",
      padding: "52px 32px",
      minHeight: 460,
      border: "1px solid rgba(213,185,129,0.06)",
      transition: "border-color .3s ease, transform .3s ease",
    } as const;
    const goldLink = { color: "#d5b981", textDecoration: "none", transition: "color .2s ease" } as const;
    return (
      <footer
        style={{ backgroundColor: "#050403", color: "rgba(255,255,255,0.85)", padding: "0 24px", position: "relative" }}
        data-template="barber-04"
      >
        {/* Top gold fade divider — signature */}
        <div aria-hidden style={{
          position: "absolute", top: 0, left: "15%", right: "15%", height: 1,
          background: "linear-gradient(90deg, transparent 0%, rgba(213,185,129,.45) 50%, transparent 100%)",
        }} />
        <div style={{ paddingTop: 72 }} />
        <div className="max-w-[1320px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 b04-footer-grid">
          {/* Lokalita */}
          <div style={card} className="b04-footer-card">
            <h4 style={h4}>
              <GenericEditableText sectionId={sectionId} field="locationTitle" value={String(content.locationTitle ?? "lokalita")} tag="span" />
            </h4>
            <div aria-hidden style={{ width: 64, height: 1, margin: "0 auto 32px", background: "linear-gradient(90deg, transparent 0%, rgba(213,185,129,.7) 50%, transparent 100%)" }} />
            {address && address.split("\n").map((line, i) => (
              <p key={`addr-${i}`} style={body}>
                <GenericEditableText sectionId={sectionId} field={i === 0 ? "address" : `address-${i}`} value={line} tag="span" />
              </p>
            ))}
            {subway && (
              <p style={body}>
                <GenericEditableText sectionId={sectionId} field="subway" value={subway} tag="span" />
              </p>
            )}
          </div>

          {/* Otevírací doba — souhrnný řádek (Po–Ne 9–20) + poznámka */}
          <div style={card} className="b04-footer-card">
            <h4 style={h4}>
              <GenericEditableText sectionId={sectionId} field="hoursTitle" value={String(content.hoursTitle ?? "Otevírací doba")} tag="span" />
            </h4>
            <div aria-hidden style={{ width: 64, height: 1, margin: "0 auto 32px", background: "linear-gradient(90deg, transparent 0%, rgba(213,185,129,.7) 50%, transparent 100%)" }} />
            {hours.map((h, i) => (
              <p key={`hr-${i}`} style={{ ...body, marginBottom: 4 }}>
                <GenericEditableText sectionId={sectionId} field={`hours.${i}.day`} value={h.day} tag="span" />
                {h.value && (
                  <>
                    <br />
                    <GenericEditableText sectionId={sectionId} field={`hours.${i}.value`} value={h.value} tag="span" />
                  </>
                )}
              </p>
            ))}
            {hoursNote && (
              <p style={{ ...body, marginTop: 22 }}>
                <GenericEditableText sectionId={sectionId} field="hoursNote" value={hoursNote} tag="span" />
              </p>
            )}
          </div>

          {/* Kontakt — telefon/email gold + IČ/DIČ/DPH/účet/platba + Daňový doklad + social */}
          <div style={card} className="b04-footer-card">
            <h4 style={h4}>
              <GenericEditableText sectionId={sectionId} field="contactTitle" value={String(content.contactTitle ?? "kontakt")} tag="span" />
            </h4>
            <div aria-hidden style={{ width: 64, height: 1, margin: "0 auto 32px", background: "linear-gradient(90deg, transparent 0%, rgba(213,185,129,.7) 50%, transparent 100%)" }} />
            {phone && (
              <p style={body}>
                <a href={`tel:${phone.replace(/\s/g, "")}`} style={goldLink}>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              </p>
            )}
            {email && (
              <p style={{ ...body, marginBottom: 28 }}>
                <a href={`mailto:${email}`} style={goldLink}>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              </p>
            )}
            {ico && (
              <p style={body}>
                <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" />
              </p>
            )}
            {dic && (
              <p style={body}>
                <GenericEditableText sectionId={sectionId} field="dic" value={dic} tag="span" />
              </p>
            )}
            {vatNote && (
              <p style={body}>
                <GenericEditableText sectionId={sectionId} field="vatNote" value={vatNote} tag="span" />
              </p>
            )}
            {bankAccount && (
              <p style={body}>
                <GenericEditableText sectionId={sectionId} field="bankAccount" value={bankAccount} tag="span" />
              </p>
            )}
            {paymentNote && (
              <p style={{ ...body, fontStyle: "italic" }}>
                <GenericEditableText sectionId={sectionId} field="paymentNote" value={paymentNote} tag="span" />
              </p>
            )}
            {!!content.receiptNote && (
              <p style={body}>
                <GenericEditableText sectionId={sectionId} field="receiptNote" value={content.receiptNote as string} tag="span" />
              </p>
            )}
            {socials4.length > 0 && (
              <div className="flex items-center justify-center gap-5 mt-6" style={{ color: "#d5b981" }}>
                {socials4.map((s, i) => (
                  <a
                    key={`fs-${i}`}
                    href={s.href ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label ?? s.icon ?? "social"}
                    className="b04-social"
                    style={{ color: "inherit", opacity: 0.85 }}
                  >
                    <SocialIcon name={s.icon} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Copyright + Webero credit */}
        <div
          style={{
            maxWidth: 1320,
            margin: "60px auto 0",
            paddingTop: 24,
            paddingBottom: 24,
            borderTop: "1px solid rgba(213,185,129,0.10)",
            color: "rgba(255,255,255,0.42)",
            fontFamily: "'Lato',Helvetica,Arial,sans-serif",
            fontSize: 12,
            lineHeight: 1.7,
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <p style={{ margin: 0, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 11 }}>
            © {year} <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" /> · <GenericEditableText sectionId={sectionId} field="legalText" value={String(content.legalText ?? "Všechna práva vyhrazena")} tag="span" />
          </p>
          <WeberoCredit />
        </div>
      </footer>
    );
  }

  // Footer — map + contact (barber-03): large map left, contact widget right
  if (variant === "footer-map-contact") {
    const hours = (content.hours as Array<{ day: string; value: string }>) ?? [];
    const hoursTitle = String(content.hoursTitle ?? "Otevírací doba");
    const kontaktyTitle = String(content.kontaktyTitle ?? "Kontakty");
    const mapEmbedUrl = String(content.mapEmbedUrl ?? "");
    const mapImage = String(content.mapImage ?? "");
    const tagline = String(content.tagline ?? "");
    const legal = String(content.legal ?? "");
    const SocialIcon = ({ name }: { name?: string }) => {
      const p = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
      const key = (name ?? "").toLowerCase();
      switch (true) {
        case key.includes("insta"):
          return (<svg {...p}><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>);
        case key.includes("facebook") || key.includes("fb"):
          return (<svg {...p}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>);
        case key.includes("twitter") || key === "x":
          return (<svg {...p}><path d="M4 4l7.5 9.5L4.5 20H7l6-6.2L17.5 20H20l-7.8-10L19.5 4H17l-5.4 5.6L7 4z"/></svg>);
        case key.includes("tiktok"):
          return (<svg {...p}><path d="M21 8.5a6.4 6.4 0 0 1-4-1.4V15a6 6 0 1 1-6-6h1v3.5h-1a2.5 2.5 0 1 0 2.5 2.5V3h3a4 4 0 0 0 4 4z"/></svg>);
        case key.includes("youtube"):
          return (<svg {...p}><rect x="2" y="6" width="20" height="12" rx="3"/><polygon points="10 9 16 12 10 15" fill="currentColor"/></svg>);
        default: return null;
      }
    };
    return (
      <footer
        id="footer"
        style={{
          backgroundColor: "#0f0a07",
          color: "rgba(245,239,230,0.7)",
          position: "relative",
          overflow: "hidden",
        }}
        data-template="barber-03"
      >
        {/* Top gold hairline accent */}
        <div aria-hidden style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: 220, height: 1,
          background: "linear-gradient(90deg, transparent, #c8a96e 50%, transparent)",
        }} />

        {/* Warm radial ambient glow */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          background: "radial-gradient(ellipse at center top, rgba(200,169,110,0.06) 0%, transparent 55%)",
        }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(80px, 11vw, 120px) 24px clamp(36px, 5vw, 56px)", position: "relative", zIndex: 1 }}>
          {/* Brand wordmark centered */}
          <div style={{ textAlign: "center", marginBottom: "clamp(48px, 7vw, 72px)" }}>
            <a
              href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "#"}
              className="b03-footer-brand"
              style={{
                display: "inline-block",
                textDecoration: "none",
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#f5efe6",
                textTransform: "uppercase",
                transition: "color 0.3s ease",
                marginBottom: 14,
              }}
            >
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </a>
            {/* Decorative diamond rule */}
            <div aria-hidden style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 14 }}>
              <span style={{ width: 48, height: 1, backgroundColor: "rgba(200,169,110,0.55)" }} />
              <span style={{ width: 6, height: 6, backgroundColor: "#c8a96e", transform: "rotate(45deg)" }} />
              <span style={{ width: 48, height: 1, backgroundColor: "rgba(200,169,110,0.55)" }} />
            </div>
            {tagline && (
              <p style={{
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontStyle: "italic",
                fontSize: "0.95rem",
                color: "rgba(200,169,110,0.85)",
                margin: "20px auto 0",
                maxWidth: 560,
              }}>
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </p>
            )}
          </div>

          {/* Map + contact card 2-col grid */}
          <div className="footer-bb03-grid" style={{ display: "grid", gap: 32, alignItems: "stretch" }}>
            {/* MAP — left, with gold corner brackets */}
            <div className="b03-footer-map-wrap" style={{ position: "relative", minHeight: 400 }}>
              <span aria-hidden className="b03-footer-map-corner b03-footer-map-corner-tl" style={{
                position: "absolute", top: -10, left: -10, width: 40, height: 40, zIndex: 3,
                borderTop: "1px solid #c8a96e", borderLeft: "1px solid #c8a96e",
                transition: "all 0.4s cubic-bezier(.22,.68,0,1.1)",
              }} />
              <span aria-hidden className="b03-footer-map-corner b03-footer-map-corner-br" style={{
                position: "absolute", bottom: -10, right: -10, width: 40, height: 40, zIndex: 3,
                borderBottom: "1px solid #c8a96e", borderRight: "1px solid #c8a96e",
                transition: "all 0.4s cubic-bezier(.22,.68,0,1.1)",
              }} />
              {mapEmbedUrl ? (
                <iframe
                  src={mapEmbedUrl}
                  style={{
                    border: 0, width: "100%", height: 400, display: "block",
                    filter: "grayscale(0.4) brightness(0.85) sepia(0.15)",
                    transition: "filter 0.5s ease",
                  }}
                  className="b03-footer-map-iframe"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa"
                />
              ) : mapImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img loading="lazy" src={mapImage} alt="Mapa" style={{ width: "100%", height: 400, objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{
                  width: "100%", height: 400,
                  backgroundColor: "#1c1410",
                  border: "1px solid rgba(200,169,110,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(245,239,230,0.4)",
                  fontFamily: "'Libre Baskerville', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "0.95rem",
                }}>
                  Mapa — vlož embed v Studio
                </div>
              )}
            </div>

            {/* CONTACT CARD — right */}
            <div className="b03-footer-card" style={{
              backgroundColor: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(200,169,110,0.22)",
              padding: "36px 32px",
              minHeight: 400,
              display: "flex", flexDirection: "column",
            }}>
              {/* Eyebrow */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <span aria-hidden style={{ width: 32, height: 1, backgroundColor: "#c8a96e" }} />
                <span style={{
                  fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                  color: "#c8a96e",
                }}>
                  <GenericEditableText sectionId={sectionId} field="kontaktyTitle" value={kontaktyTitle} tag="span" />
                </span>
              </div>

              {address && (
                <p style={{
                  fontFamily: "'Libre Baskerville', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "1.02rem",
                  lineHeight: 1.7,
                  marginBottom: 22,
                  color: "rgba(245,239,230,0.88)",
                  whiteSpace: "pre-line",
                }}>
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                </p>
              )}

              {/* Phone + email as icon rows */}
              {phone && (
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="b03-footer-contact-row"
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    color: "#c8a96e", textDecoration: "none",
                    fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                    fontSize: "0.95rem", fontWeight: 600,
                    letterSpacing: "0.04em",
                    paddingBlock: 8,
                  }}
                >
                  <span aria-hidden style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 28, height: 28, borderRadius: "50%",
                    border: "1px solid rgba(200,169,110,0.4)",
                    flexShrink: 0,
                    transition: "background 0.3s, border-color 0.3s",
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.45 2 2 0 0 1 3.61 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </span>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="b03-footer-contact-row"
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    color: "rgba(245,239,230,0.85)", textDecoration: "none",
                    fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                    fontSize: "0.95rem",
                    paddingBlock: 8,
                    marginBottom: 10,
                  }}
                >
                  <span aria-hidden style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 28, height: 28, borderRadius: "50%",
                    border: "1px solid rgba(200,169,110,0.4)",
                    flexShrink: 0,
                    transition: "background 0.3s, border-color 0.3s",
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              )}

              {/* Hours */}
              {hours.length > 0 && (
                <div style={{ marginTop: "auto", paddingTop: 24, borderTop: "1px solid rgba(200,169,110,0.18)" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <span aria-hidden style={{ width: 32, height: 1, backgroundColor: "#c8a96e" }} />
                    <span style={{
                      fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.32em",
                      textTransform: "uppercase",
                      color: "#c8a96e",
                    }}>
                      <GenericEditableText sectionId={sectionId} field="hoursTitle" value={hoursTitle} tag="span" />
                    </span>
                  </div>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {hours.map((h, i) => (
                      <li key={i} className="b03-footer-hours-row" style={{
                        display: "flex", justifyContent: "space-between", alignItems: "baseline",
                        gap: 10, paddingBlock: 8,
                        borderBottom: "1px dashed rgba(200,169,110,0.14)",
                        position: "relative",
                      }}>
                        <span style={{
                          fontFamily: "'Libre Baskerville', Georgia, serif",
                          fontStyle: "italic",
                          fontSize: "0.88rem",
                          color: "rgba(245,239,230,0.72)",
                        }}>
                          <GenericEditableText sectionId={sectionId} field={`hours.${i}.day`} value={h.day} tag="span" />
                        </span>
                        <span style={{
                          fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                          fontSize: "0.86rem", fontWeight: 600,
                          color: "#c8a96e", whiteSpace: "nowrap",
                        }}>
                          <GenericEditableText sectionId={sectionId} field={`hours.${i}.value`} value={h.value} tag="span" />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Bottom row: legal + socials + Webero credit */}
          <div
            style={{
              marginTop: "clamp(40px, 5vw, 60px)",
              paddingTop: 28,
              borderTop: "1px solid rgba(200,169,110,0.18)",
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p style={{
              fontFamily: "'Source Sans Pro', system-ui, sans-serif",
              fontSize: 12,
              color: "rgba(245,239,230,0.45)",
              margin: 0,
            }}>
              {legal ? (
                <GenericEditableText sectionId={sectionId} field="legal" value={legal} tag="span" />
              ) : (
                <>© {year} <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />. <GenericEditableText sectionId={sectionId} field="legalText" value={String(content.legalText ?? "Všechna práva vyhrazena.")} tag="span" /></>
              )}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 26 }}>
              {socials.length > 0 && (
                <div style={{ display: "flex", gap: 14 }}>
                  {socials.map((s, i) => (
                    <a
                      key={i}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="b03-footer-social"
                      style={{
                        color: "rgba(245,239,230,0.6)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 34, height: 34,
                        borderRadius: "50%",
                        border: "1px solid rgba(200,169,110,0.28)",
                        transition: "color 0.3s ease, border-color 0.3s ease, transform 0.3s ease, background 0.3s ease",
                      }}
                    >
                      <SocialIcon name={s.label} />
                    </a>
                  ))}
                </div>
              )}
              <WeberoCredit />
            </div>
          </div>
        </div>

        <style>{`
          .footer-bb03-grid { grid-template-columns: 1fr; }
          @media (min-width: 1024px) {
            .footer-bb03-grid { grid-template-columns: 2.2fr 1fr; gap: 40px; }
          }
        `}</style>
      </footer>
    );
  }

  // Footer — luxury barber 2-col (barber-02): logo+contact+social left, hours right
  if (variant === "barber-luxury") {
    const hours = (content.hours as Array<{ day: string; value: string }>) ?? [];
    const hoursTitle = String(content.hoursTitle ?? "Otevírací doba");
    const tagline = String(content.tagline ?? "");
    const legal = String(content.legal ?? "");
    // Fallback navigation links so 3-col grid always fills properly
    const effectiveLinks = links.length > 0 ? links : [
      { label: "Domů",    href: "/" },
      { label: "O nás",   href: "/o-nas" },
      { label: "Služby",  href: "#cenik" },
      { label: "Galerie", href: "#galerie" },
      { label: "Kontakt", href: "#kontakt" },
    ];
    // Dynamic grid columns based on which content columns are filled
    const hasContact = !!(address || phone || email);
    const hasNav     = effectiveLinks.length > 0;
    const hasHours   = hours.length > 0;
    const colCount   = [hasContact, hasNav, hasHours].filter(Boolean).length;
    const gridCols   = colCount === 3 ? "1.05fr 0.9fr 0.95fr"
                     : colCount === 2 ? "1fr 1fr"
                     : "1fr";
    const SocialIcon = ({ name }: { name?: string }) => {
      const p = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
      const key = (name ?? "").toLowerCase();
      switch (true) {
        case key.includes("insta"):
          return (<svg {...p}><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>);
        case key.includes("facebook") || key.includes("fb"):
          return (<svg {...p}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>);
        case key.includes("twitter") || key === "x":
          return (<svg {...p}><path d="M4 4l7.5 9.5L4.5 20H7l6-6.2L17.5 20H20l-7.8-10L19.5 4H17l-5.4 5.6L7 4z"/></svg>);
        case key.includes("tiktok"):
          return (<svg {...p}><path d="M21 8.5a6.4 6.4 0 0 1-4-1.4V15a6 6 0 1 1-6-6h1v3.5h-1a2.5 2.5 0 1 0 2.5 2.5V3h3a4 4 0 0 0 4 4z"/></svg>);
        case key.includes("youtube"):
          return (<svg {...p}><path d="M22 8.6a3 3 0 0 0-2.1-2.1C17.8 6 12 6 12 6s-5.8 0-7.9.5A3 3 0 0 0 2 8.6C1.5 10.7 1.5 12 1.5 12s0 1.3.5 3.4a3 3 0 0 0 2.1 2.1C6.2 18 12 18 12 18s5.8 0 7.9-.5a3 3 0 0 0 2.1-2.1c.5-2.1.5-3.4.5-3.4s0-1.3-.5-3.4z"/><polygon points="10 9 15 12 10 15" fill="currentColor"/></svg>);
        default:
          return null;
      }
    };
    return (
      <footer
        style={{
          backgroundColor: "#0f0a06",
          color: "rgba(245,239,230,0.7)",
          padding: "clamp(72px, 10vw, 110px) clamp(20px,5vw,40px) clamp(36px, 5vw, 56px)",
          position: "relative",
          overflow: "hidden",
        }}
        data-template="barber-02"
      >
        {/* Top decorative gold hairline */}
        <div aria-hidden style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: 200, height: 1,
          background: "linear-gradient(90deg, transparent, #d4a96e 50%, transparent)",
        }} />

        {/* Subtle ambient glow */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          background: "radial-gradient(ellipse at center top, rgba(212,169,110,0.04) 0%, transparent 60%)",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1180, margin: "0 auto" }}>
          {/* Brand wordmark — large centered */}
          <div style={{ textAlign: "center", marginBottom: "clamp(48px, 7vw, 72px)" }}>
            <a
              href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "#"}
              className="b02-footer-brand"
              style={{
                display: "inline-block",
                textDecoration: "none",
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#f5efe6",
                transition: "color 0.3s ease",
                marginBottom: 18,
              }}
            >
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </a>
            {/* Decorative rule */}
            <div aria-hidden style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 14 }}>
              <span style={{ width: 48, height: 1, backgroundColor: "rgba(212,169,110,0.55)" }} />
              <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#d4a96e" }} />
              <span style={{ width: 48, height: 1, backgroundColor: "rgba(212,169,110,0.55)" }} />
            </div>
            {tagline && (
              <p style={{
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontStyle: "italic",
                fontSize: "0.95rem",
                color: "rgba(212,169,110,0.85)",
                margin: "20px auto 0",
                maxWidth: 540,
              }}>
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </p>
            )}
          </div>

          {/* Grid: kontakt | navigace | hodiny — adapts to filled columns */}
          <div
            data-footer-barber-luxury
            className="grid"
            style={{
              gridTemplateColumns: gridCols,
              gap: "clamp(40px, 5vw, 64px)",
              alignItems: "start",
            }}
          >
            {/* Contact column */}
            <div>
              <p className="b02-footer-eyebrow"><GenericEditableText sectionId={sectionId} field="contactTitle" value={String(content.contactTitle ?? "Kontakt")} tag="span" /></p>
              {address && (
                <p style={{
                  fontFamily: "'Libre Baskerville', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "0.92rem",
                  lineHeight: 1.7,
                  marginBottom: 14,
                  color: "rgba(245,239,230,0.78)",
                  whiteSpace: "pre-line",
                }}>
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                </p>
              )}
              {phone && (
                <p style={{ fontSize: "0.95rem", lineHeight: 1.8, marginBottom: 6 }}>
                  <a href={`tel:${phone.replace(/\s+/g, "")}`} className="b02-footer-link" style={{
                    fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                    color: "rgba(245,239,230,0.78)",
                    textDecoration: "none",
                    position: "relative",
                    paddingBottom: 2,
                  }}>
                    <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                  </a>
                </p>
              )}
              {email && (
                <p style={{ fontSize: "0.95rem", lineHeight: 1.8 }}>
                  <a href={`mailto:${email}`} className="b02-footer-link" style={{
                    fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                    color: "rgba(245,239,230,0.78)",
                    textDecoration: "none",
                    position: "relative",
                    paddingBottom: 2,
                  }}>
                    <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                  </a>
                </p>
              )}
            </div>

            {/* Navigation links column */}
            {hasNav && (
              <div>
                <p className="b02-footer-eyebrow"><GenericEditableText sectionId={sectionId} field="navTitle" value={String(content.navTitle ?? "Navigace")} tag="span" /></p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {effectiveLinks.map((l, i) => (
                    <li key={`${l.href}-${i}`} style={{ marginBottom: 12 }}>
                      <a
                        href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                        className="b02-footer-link"
                        style={{
                          fontFamily: "'Libre Baskerville', Georgia, serif",
                          fontStyle: "italic",
                          fontSize: "0.95rem",
                          color: "rgba(245,239,230,0.78)",
                          textDecoration: "none",
                          position: "relative",
                          paddingBottom: 2,
                          display: "inline-block",
                        }}
                      >
                        {links.length > 0 ? (
                          <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                        ) : (
                          <span>{l.label}</span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hours column */}
            {hours.length > 0 && (
              <div>
                <p className="b02-footer-eyebrow">
                  <GenericEditableText sectionId={sectionId} field="hoursTitle" value={hoursTitle} tag="span" />
                </p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {hours.map((h, i) => (
                    <li key={i} className="b02-footer-hours-row" style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: 10,
                      paddingBlock: 8,
                      borderBottom: "1px dashed rgba(212,169,110,0.14)",
                    }}>
                      <span style={{
                        fontFamily: "'Libre Baskerville', Georgia, serif",
                        fontStyle: "italic",
                        fontSize: "0.9rem",
                        color: "rgba(245,239,230,0.72)",
                      }}>
                        <GenericEditableText sectionId={sectionId} field={`hours.${i}.day`} value={h.day} tag="span" />
                      </span>
                      <span style={{
                        fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        color: "#d4a96e",
                        whiteSpace: "nowrap",
                      }}>
                        <GenericEditableText sectionId={sectionId} field={`hours.${i}.value`} value={h.value} tag="span" />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Bottom row: legal + socials + Webero credit */}
          <div
            data-footer-barber-luxury-bottom
            style={{
              marginTop: "clamp(48px, 6vw, 72px)",
              paddingTop: 32,
              borderTop: "1px solid rgba(212,169,110,0.18)",
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p style={{
              fontFamily: "'Source Sans Pro', system-ui, sans-serif",
              fontSize: 12,
              color: "rgba(245,239,230,0.45)",
              margin: 0,
            }}>
              {legal ? (
                <GenericEditableText sectionId={sectionId} field="legal" value={legal} tag="span" />
              ) : (
                <>© {year} <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />. <GenericEditableText sectionId={sectionId} field="legalText" value={String(content.legalText ?? "Všechna práva vyhrazena.")} tag="span" /></>
              )}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 26 }}>
              {socials.length > 0 && (
                <div style={{ display: "flex", gap: 16 }}>
                  {socials.map((s, i) => (
                    <a
                      key={i}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="b02-footer-social"
                      style={{
                        color: "rgba(245,239,230,0.6)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 32, height: 32,
                        borderRadius: "50%",
                        border: "1px solid rgba(212,169,110,0.22)",
                        transition: "color 0.3s ease, border-color 0.3s ease, transform 0.3s ease",
                      }}
                    >
                      <SocialIcon name={s.label} />
                    </a>
                  ))}
                </div>
              )}
              <WeberoCredit />
            </div>
          </div>
        </div>

        <style>{`
          [data-template="barber-02"] .b02-footer-eyebrow {
            font-family: 'Source Sans Pro', system-ui, sans-serif;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.28em;
            text-transform: uppercase;
            color: #d4a96e;
            margin: 0 0 20px;
          }
          @media(max-width:900px){
            [data-footer-barber-luxury]{grid-template-columns:1fr !important;gap:36px !important;}
            [data-footer-barber-luxury-bottom]{justify-content:center !important;text-align:center;}
          }
        `}</style>
      </footer>
    );
  }

  if (variant === "barber-dark") {
    return (
      <footer
        className="py-16 px-4"
        style={{ backgroundColor: "#080808", borderTop: "1px solid rgba(201,168,76,0.18)" }}
        data-template="barber-01"
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <div>
              <p
                className="font-bold text-base mb-3 uppercase tracking-widest"
                style={{ fontFamily: "var(--font-heading)", color: "var(--color-accent, #C9A84C)", letterSpacing: "0.12em" }}
              >
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </p>
              {tagline && (
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted, #A0A0A0)" }}>
                  <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
                </p>
              )}
            </div>

            {links.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--color-text-muted, #A0A0A0)" }}><GenericEditableText sectionId={sectionId} field="navTitle" value={String(content.navTitle ?? "Navigace")} tag="span" /></p>
                <ul className="space-y-3">
                  {links.map((l, i) => (
                    <li key={l.href}>
                      <a
                        href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                        className="bc-footer-link text-sm"
                        style={{ color: "rgba(245,245,245,0.7)", textDecoration: "none", position: "relative", display: "inline-block", paddingBottom: 2 }}
                      >
                        <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(phone || email || address) && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--color-text-muted, #A0A0A0)" }}><GenericEditableText sectionId={sectionId} field="contactTitle" value={String(content.contactTitle ?? "Kontakt")} tag="span" /></p>
                <ul className="space-y-3 text-sm" style={{ color: "var(--color-text-muted, #A0A0A0)" }}>
                  {phone && (
                    <li><a href={`tel:${phone}`}><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" /></a></li>
                  )}
                  {email && (
                    <li><a href={`mailto:${email}`}><GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" /></a></li>
                  )}
                  {address && (
                    <li><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="pt-6 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-4" style={{ borderColor: "rgba(201,168,76,0.18)" }}>
            <p className="text-xs" style={{ color: "rgba(245,245,245,0.5)" }}>
              © {year} <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />. <GenericEditableText sectionId={sectionId} field="legalText" value={String(content.legalText ?? "Všechna práva vyhrazena.")} tag="span" />
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:gap-6 gap-3">
              {socials.length > 0 && (
                <ul className="flex gap-5">
                  {socials.map((s, i) => (
                    <li key={i}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className="bc-footer-link text-xs" style={{ color: "rgba(245,245,245,0.6)", textDecoration: "none", position: "relative", paddingBottom: 2 }}>
                        <GenericEditableText sectionId={sectionId} field={`socials.${i}.label`} value={s.label ?? ""} tag="span" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {/* Webero credit — always visible bottom-right */}
              <WeberoCredit />
            </div>
          </div>
        </div>
      </footer>
    );
  }

  if (content.layout === "6col") {
    const cc = content as Record<string, unknown>;
    const newsletterTitle = String(cc.newsletterTitle ?? "Zůstaňte ve vlně novinek");
    const newsletterSubtitle = String(cc.newsletterSubtitle ?? "Přihlaste se k odběru — dostávejte novinky, akce a magazín Vlna do své schránky.");
    const newsletterPlaceholder = String(cc.newsletterPlaceholder ?? "Váš e-mail");
    const newsletterCta = String(cc.newsletterCta ?? "Odebírat");
    const copyrightLabel = String(cc.copyrightLabel ?? "všechna práva vyhrazena");
    const SocialIcon = ({ name }: { name?: string }) => {
      const p = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
      const key = (name || "").toLowerCase();
      if (key.includes("instagram")) return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>;
      if (key.includes("facebook"))  return <svg {...p}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
      if (key.includes("tiktok"))    return <svg {...p}><path d="M15 3v9.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M15 3c0 3 2 5 5 5"/></svg>;
      if (key.includes("twitter") || key.includes("x"))   return <svg {...p}><path d="M4 4l16 16M20 4L4 20"/></svg>;
      if (key.includes("youtube"))   return <svg {...p}><rect x="3" y="6" width="18" height="12" rx="3"/><path d="M11 10l4 2-4 2z" fill="currentColor" stroke="none"/></svg>;
      return <span style={{ fontSize: 10 }}>{name}</span>;
    };
    return (
      <footer className="cafe01-footer" data-template="cafe-01">
        {/* Top wave decoration echoing hero */}
        <div className="cafe01-footer__wave" aria-hidden="true" />

        {/* Brand + newsletter row */}
        <div className="cafe01-footer__hero">
          <div className="cafe01-footer__hero-inner">
            <div className="cafe01-footer__brand">
              <div className="cafe01-footer__eyebrow">
                <span className="cafe01-footer__eyebrow-line" aria-hidden="true" />
                <span>Vlna kávy</span>
              </div>
              <h3 className="cafe01-footer__newsletter-title">
                <GenericEditableText sectionId={sectionId} field="newsletterTitle" value={newsletterTitle} tag="span" />
              </h3>
              <p className="cafe01-footer__newsletter-sub">
                <GenericEditableText sectionId={sectionId} field="newsletterSubtitle" value={newsletterSubtitle} tag="span" />
              </p>
            </div>
            <form className="cafe01-footer__newsletter" onSubmit={(e) => e.preventDefault()}>
              <label className="sr-only" htmlFor="cafe01-newsletter-email">E-mail</label>
              <input
                id="cafe01-newsletter-email"
                type="email"
                placeholder={newsletterPlaceholder}
                className="cafe01-footer__newsletter-input"
                required
              />
              <button type="submit" className="cafe01-footer__newsletter-btn">
                <span className="cafe01-footer__newsletter-btn-shine" aria-hidden="true" />
                <GenericEditableText sectionId={sectionId} field="newsletterCta" value={newsletterCta} tag="span" />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* 6 columns */}
        <div className="cafe01-footer__cols">
          <div className="cafe01-footer__cols-inner">
            {columns.map((col, ci) => (
              <div key={ci} className="cafe01-footer__col">
                <h4 className="cafe01-footer__col-title">
                  <GenericEditableText sectionId={sectionId} field={`columns.${ci}.title`} value={col.title} tag="span" />
                </h4>
                <ul className="cafe01-footer__col-list">
                  {col.links.map((l, li) => (
                    <li key={li}>
                      <a href={resolveDemoHref(l.href, tenantSlug, isAdmin)} className="cafe01-footer__link">
                        <span className="cafe01-footer__link-dot" aria-hidden="true" />
                        <GenericEditableText sectionId={sectionId} field={`columns.${ci}.links.${li}.label`} value={l.label} tag="span" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="cafe01-footer__bottom">
          <div className="cafe01-footer__bottom-inner">
            <div className="cafe01-footer__copy">
              © {year}{" "}
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />,{" "}
              <GenericEditableText sectionId={sectionId} field="copyrightLabel" value={copyrightLabel} tag="span" />
            </div>
            {legalLinks.length > 0 && (
              <ul className="cafe01-footer__legal">
                {legalLinks.map((l, i) => (
                  <li key={i}>
                    <a href={l.href} className="cafe01-footer__legal-link">
                      <GenericEditableText sectionId={sectionId} field={`legalLinks.${i}.label`} value={l.label} tag="span" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {socials.length > 0 && (
              <ul className="cafe01-footer__socials">
                {socials.map((s, i) => (
                  <li key={i}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="cafe01-footer__social"
                    >
                      <SocialIcon name={s.label} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="cafe01-footer__credit">
            <WeberoCredit />
          </div>
        </div>
      </footer>
    );
  }

  if (variant === "ortho-01-footer")      return <FooterOrtho01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "ortho-02-footer")      return <FooterOrtho02 content={content} sectionId={sectionId} />;
  if (variant === "autoservis-01-footer") return <FooterAutoservis01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "autoservis-02-footer") return <FooterAutoservis02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "autoservis-03-footer") return <FooterAutoservis03 content={content} sectionId={sectionId} />;
  if (variant === "stavba-03-footer")     return <FooterStavba03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "stavba-01-footer")     return <FooterStavba01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "instala-01-footer")   return <FooterInstala01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "florist-01-footer")   return <FooterFlorist01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "catering-01-footer")  return <FooterCatering01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "bakery-02-footer")    return <FooterBakery02 content={content} sectionId={sectionId} />;
  if (variant === "stavba-02-footer")     return <FooterStavba02 content={content} sectionId={sectionId} />;
  if (variant === "lawyer-01-footer")     return <FooterLawyer01 content={content} sectionId={sectionId} />;
  if (variant === "legal-02-footer")      return <FooterLegal02 content={content} sectionId={sectionId} />;
  if (variant === "sweet-01-footer")      return <FooterSweet01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "autoskola-01-footer")  return <FooterAutoskola01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "lang-01-footer")       return <FooterLang01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "edu-01-footer")        return <FooterEdu01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "kids-01-footer")       return <FooterKids01 content={content} sectionId={sectionId} />;
  if (variant === "vet-01-footer")        return <FooterVet01  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "pethotel-01-footer")   return <FooterPethotel01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "grooming-01-footer")   return <FooterGrooming01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "ucetni-01-footer")     return <FooterUcetni01  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "ucetni-02-footer")     return <FooterUcetni02  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "ucetni-03-footer")     return <FooterUcetni03  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "ucetni-04-footer")     return <FooterUcetni04  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "solar-01-footer")      return <FooterSolar01   content={content} sectionId={sectionId} />;
  if (variant === "arch-01-footer")       return <FooterArch01    content={content} sectionId={sectionId} tenantSlug={tenantSlug} />;
  if (variant === "clean-01-footer")      return <FooterClean01   content={content} sectionId={sectionId} tenantSlug={tenantSlug} />;
  if (variant === "instala-02-footer")    return <FooterInstala02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "solar-03-footer")      return <FooterSolar03   content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "klima-01-footer")      return <FooterKlima01   content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "solar-02-footer")      return <FooterSolar02   content={content} sectionId={sectionId} />;
  if (variant === "floors-01-footer")     return <FooterFloors01  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "klempir-01-footer")    return <FooterKlempir01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "malir-01-footer")      return <FooterMalir01   content={content} sectionId={sectionId} isAdmin={isAdmin} />;
  if (variant === "malir-02-footer")      return <FooterMalir02   content={content} sectionId={sectionId} />;
  if (variant === "garden-01-footer")    return <FooterGarden01  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "clean-02-footer")     return <FooterClean02   content={content} sectionId={sectionId} tenantSlug={tenantSlug} />;
  if (variant === "garden-02-footer")   return <FooterGarden02  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "hotel-01-footer")    return <FooterHotel01   content={content} sectionId={sectionId} />;
  if (variant === "hotel-02-footer")    return <FooterHotel02   content={content} sectionId={sectionId} />;
  if (variant === "arbo-01-footer")     return <FooterArbo01    content={content} sectionId={sectionId} />;
  if (variant === "ddd-01-footer")     return <FooterDdd01     content={content} sectionId={sectionId} />;
  if (variant === "chalet-01-footer")  return <FooterChalet01  content={content} sectionId={sectionId} />;
  if (variant === "photo-01-footer")   return <FooterPhoto01   content={content} sectionId={sectionId} />;
  if (variant === "events-01-footer")  return <FooterEvents01  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "dj-01-footer")      return <FooterDj01      content={content} sectionId={sectionId} />;
  if (variant === "restaurant-04-footer") return <FooterRestaurant04 content={content} sectionId={sectionId} />;
  if (variant === "video-01-footer")      return <FooterVideo01      content={content} sectionId={sectionId} isAdmin={isAdmin} />;
  if (variant === "light") {
    // Jednořádkový minimální footer: logo vlevo | nav linky uprostřed | kontakt+social vpravo
    const SocialIcon = ({ name }: { name?: string }) => {
      const p = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
      if (name === "instagram") return (<svg {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>);
      if (name === "facebook") return (<svg {...p}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>);
      return <span style={{ fontSize: 10 }}>{name}</span>;
    };
    return (
      <footer
        style={{
          backgroundColor: "#ffffff",
          borderTop: "1px solid #e8e4df",
          color: "#1a1a1a",
        }}
        data-template="peak-cut"
      >
        <div
          className="max-w-[1280px] mx-auto px-6 lg:px-10"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, minHeight: 72 }}
        >
          {/* Logo vlevo */}
          <a
            href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"}
            className="flex items-center shrink-0"
            title={siteName}
          >
            <GenericEditableImage
              sectionId={sectionId}
              field="logoUrl"
              src={logoSrc}
              alt={siteName}
              className="relative overflow-hidden shrink-0"
              style={{ width: 36, height: 36 }}
            >
              <OptimizedPicture src={logoSrc} alt={siteName} imgStyle={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </GenericEditableImage>
          </a>

          {/* Nav linky horizontálně uprostřed */}
          {links.length > 0 && (
            <nav className="hidden md:flex items-center gap-8">
              {links.map((l, i) => (
                <a
                  key={l.href}
                  href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                  className="hover:opacity-60 transition-opacity"
                  style={{ fontSize: 13, color: "#1a1a1a", letterSpacing: "0.02em" }}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              ))}
            </nav>
          )}

          {/* Kontakt + social vpravo */}
          <div className="hidden md:flex items-center gap-5">
            {email && (
              <a href={`mailto:${email}`} className="hover:opacity-60 transition-opacity flex items-center gap-2" style={{ fontSize: 13, color: "#1a1a1a" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            )}
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:opacity-60 transition-opacity flex items-center gap-2" style={{ fontSize: 13, color: "#1a1a1a" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.99-.94a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            )}
            {socials.map((s, i) => (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label ?? s.icon}
                className="flex items-center justify-center rounded-full hover:opacity-60 transition-opacity"
                style={{ width: 32, height: 32, border: "1px solid #d0ccc6", color: "#1a1a1a" }}
              >
                <SocialIcon name={s.icon} />
              </a>
            ))}
          </div>
        </div>

        {/* Copyright řádek */}
        <div style={{ borderTop: "1px solid #e8e4df", padding: "10px 0", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "#999", margin: 0 }}>
            © {year} <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />. <GenericEditableText sectionId={sectionId} field="legalText" value={String(content.legalText ?? "Všechna práva vyhrazena.")} tag="span" />
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className="py-12 px-4"
      style={{
        backgroundColor: "var(--color-secondary, #111827)",
        color: "rgba(255,255,255,0.85)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <p
              className="font-bold text-lg mb-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </p>
            {tagline && (
              <p className="text-sm opacity-70">
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </p>
            )}
          </div>

          {links.length > 0 && (
            <div>
              <p className="font-semibold text-sm mb-3 opacity-60 uppercase tracking-wide"><GenericEditableText sectionId={sectionId} field="navTitle" value={String(content.navTitle ?? "Navigace")} tag="span" /></p>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.href}>
                    <a href={resolveDemoHref(l.href, tenantSlug, isAdmin)} className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                      <GenericEditableText sectionId={sectionId} field={`links.${links.indexOf(l)}.label`} value={l.label} tag="span" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(phone || email || address) && (
            <div>
              <p className="font-semibold text-sm mb-3 opacity-60 uppercase tracking-wide"><GenericEditableText sectionId={sectionId} field="contactTitle" value={String(content.contactTitle ?? "Kontakt")} tag="span" /></p>
              <ul className="space-y-2 text-sm opacity-80">
                {phone && <li><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" /></li>}
                {email && <li><GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" /></li>}
                {address && <li><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></li>}
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-xs opacity-50">
          © {year} <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />. <GenericEditableText sectionId={sectionId} field="legalText" value={String(content.legalText ?? "Všechna práva vyhrazena.")} tag="span" />
        </div>
      </div>
    </footer>
  );
}

// hair-03-footer — šedá (#c1c1c1) minimální patička s centrovaným logem a copyrightem
function FooterHair03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const siteName = String(content.siteName ?? "Petra Studio");
  const logoUrl  = String(content.logoUrl ?? "");
  const copyright = String(content.copyright ?? `Copyright © ${new Date().getFullYear()} Demo Studio s.r.o. – Všechna práva vyhrazena.`);
  const SANS = "Helvetica, Arial, sans-serif";
  const GOLD = "#c8a97e";
  const DARK = "#2f201a";

  const LogoSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 62" width="180" height="40" aria-label={siteName}>
      <text x="4" y="16" fontFamily={SANS} fontSize="10" fill={GOLD} letterSpacing="4">HAIR MAKING</text>
      <text x="4" y="44" fontFamily={SANS} fontSize="26" fontWeight="400" fill={DARK} letterSpacing="2">petra</text>
      <text x="98" y="44" fontFamily={SANS} fontSize="26" fill={GOLD} letterSpacing="2"> studio</text>
      <line x1="4" y1="50" x2="276" y2="50" stroke={GOLD} strokeWidth="0.8" />
    </svg>
  );

  return (
    <footer style={{ backgroundColor: "#c1c1c1", padding: "16px 12px" }} data-template="hair-03">
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        {logoUrl ? (
          <img loading="lazy" src={logoUrl} alt={siteName} style={{ height: 60, objectFit: "contain" }} />
        ) : (
          <LogoSvg />
        )}
        <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="p"
          style={{ fontFamily: SANS, fontSize: 16, fontWeight: 500, color: "#525252", margin: 0, textAlign: "center" }}
        />
        <div style={{ display: "flex", gap: 24 }}>
          <a href="#" style={{ fontFamily: SANS, fontSize: 16, fontWeight: 500, color: "#050505", textDecoration: "none" }}>
            Ochrana osobních údajů
          </a>
        </div>
      </div>
    </footer>
  );
}

// ── massage-01-footer ────────────────────────────────────────────────────────
// Surface #141414 bg, footer-top: logo vlevo + sociální ikony vpravo
// Divider, footer-bottom: copyright vlevo + legal links vpravo
// Logo: gold mark 28×28 + name + tagline
// ─────────────────────────────────────────────────────────────────────────────
function FooterMassage01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const siteName    = String(content.siteName    ?? "Demo Masáže");
  const siteTagline = String(content.siteTagline ?? "Masážní studio Praha");
  const copyright   = String(content.copyright   ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);
  const facebookUrl = String(content.facebookUrl ?? "#");
  const instagramUrl = String(content.instagramUrl ?? "#");
  const legalLinks  = (content.legalLinks as Array<{ label: string; href: string }>) ?? [];

  const SURFACE = "#141414";
  const BORDER  = "#2A2520";
  const GOLD    = "#C9A962";
  const TEXT    = "#F5F0E8";
  const MUTED   = "rgba(255,255,255,0.35)";
  const SECONDARY = "#A09888";
  const FONT    = "'Inter', sans-serif";

  const SocialIcon = ({ href, label, children }: { href: string; label: string; children: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{ color: SECONDARY, textDecoration: "none", display: "flex", alignItems: "center", transition: "color 0.2s" }}
      onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
      onMouseLeave={e => (e.currentTarget.style.color = SECONDARY)}
    >
      {children}
    </a>
  );

  return (
    <footer style={{ backgroundColor: SURFACE, fontFamily: FONT }} data-template="massage-01">
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 80px", display: "flex", flexDirection: "column", gap: 40 }}>

        {/* Top: logo + social */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }} aria-label={siteName}>
            <div style={{ width: 28, height: 28, border: `1px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke={GOLD} strokeWidth="1.2">
                <path d="M7 1c1.5 1.5 4 2.5 4 5.5a4 4 0 0 1-8 0C3 3.5 5.5 2.5 7 1z"/>
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: 3, color: TEXT, textTransform: "uppercase" }}>
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </span>
              <span style={{ fontSize: 9, fontWeight: 400, letterSpacing: 2, color: MUTED, textTransform: "uppercase" }}>
                <GenericEditableText sectionId={sectionId} field="siteTagline" value={siteTagline} tag="span" />
              </span>
            </div>
          </a>

          <div style={{ display: "flex", gap: 20 }}>
            <SocialIcon href={instagramUrl} label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/>
              </svg>
            </SocialIcon>
            <SocialIcon href={facebookUrl} label="Facebook">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </SocialIcon>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: BORDER }} />

        {/* Bottom: copyright + legal */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </p>
          {legalLinks.length > 0 && (
            <div style={{ display: "flex", gap: 24 }}>
              {legalLinks.map((link, i) => (
                <a key={i} href={link.href} style={{ fontSize: 12, color: MUTED, textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = SECONDARY)}
                  onMouseLeave={e => (e.currentTarget.style.color = MUTED as string)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

function resolveDemoHref(href: string, tenantSlug?: string, isAdmin = false) {
  if (!tenantSlug || !href.startsWith("/")) return href;
  if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
  return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
}

// ── tawan-01-footer ───────────────────────────────────────────────────────────
// Patička 1:1 tawan.cz — 3 sloupce na tmavém fialovém pozadí:
// Vlevo: logo (siteName) + tagline + socials
// Střed: navigační linky
// Vpravo: kontaktní info (adresa, tel, email)
// Pod tím: fullwidth Google mapa iframe (height 320px)
// Úplně dole: copyright bar s legal linky
// Design tokens: PURPLE #393145, BRONZE #af8c6a, Muli
// ─────────────────────────────────────────────────────────────────────────────
function FooterTawan01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Link = { label: string; href: string };
  const siteName    = String(content.siteName    ?? "Demo TAWAN");
  const siteTagline = String(content.siteTagline ?? "Thajské masáže");
  const description = String(content.description ?? "Přinášíme autentické thajské masáže do srdce Prahy a dalších měst České republiky.");
  const address     = String(content.address     ?? "");
  const phone       = String(content.phone       ?? "");
  const email       = String(content.email       ?? "");
  const facebookUrl = String(content.facebookUrl ?? "");
  const instagramUrl= String(content.instagramUrl?? "");
  const mapEmbedUrl = String(content.mapEmbedUrl ?? "");
  const copyright   = String(content.copyright   ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);
  const links       = (content.links       as Link[] | undefined) ?? [];
  const legalLinks  = (content.legalLinks  as Link[] | undefined) ?? [];

  const PURPLE = "#393145";
  const BRONZE = "#af8c6a";
  const WHITE  = "#ffffff";
  const MUTED  = "rgba(255,255,255,0.55)";
  const FONT   = "'Muli', sans-serif";

  return (
    <footer data-template="tawan-01" style={{ backgroundColor: PURPLE, fontFamily: FONT }}>

      {/* Hlavní 3-col grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 32px 56px", display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 48 }}>

        {/* Sloupec 1: logo + tagline + socials */}
        <div>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontFamily: FONT, fontSize: 22, fontWeight: 900, color: WHITE, letterSpacing: 2, textTransform: "uppercase" }}>
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </span>
          </div>
          <p style={{ fontFamily: FONT, fontSize: 13, color: BRONZE, letterSpacing: 2, textTransform: "uppercase", marginBottom: 24 }}>
            <GenericEditableText sectionId={sectionId} field="siteTagline" value={siteTagline} tag="span" />
          </p>
          <p style={{ fontFamily: FONT, fontSize: 13, color: MUTED, lineHeight: 1.7, marginBottom: 28 }}>
            <GenericEditableText sectionId={sectionId} field="description" value={description} tag="span" />
          </p>
          {/* Sociální ikony */}
          <div style={{ display: "flex", gap: 12 }}>
            {facebookUrl && (
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                style={{ width: 38, height: 38, border: `1px solid rgba(175,140,106,0.4)`, display: "flex", alignItems: "center", justifyContent: "center", color: BRONZE, textDecoration: "none", transition: "border-color 0.2s,color 0.2s", borderRadius: "16px 0 16px 0" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            )}
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                style={{ width: 38, height: 38, border: `1px solid rgba(175,140,106,0.4)`, display: "flex", alignItems: "center", justifyContent: "center", color: BRONZE, textDecoration: "none", transition: "border-color 0.2s,color 0.2s", borderRadius: "16px 0 16px 0" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            )}
          </div>
        </div>

        {/* Sloupec 2: navigační linky */}
        <div>
          <h4 style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: BRONZE, marginBottom: 24 }}>Navigace</h4>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {links.map((link, i) => (
              <li key={i}>
                <a href={link.href} style={{ fontFamily: FONT, fontSize: 14, color: MUTED, textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                  onMouseLeave={e => (e.currentTarget.style.color = MUTED)}>
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Sloupec 3: kontakt */}
        <div>
          <h4 style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: BRONZE, marginBottom: 24 }}>Kontakt</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {address && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BRONZE} strokeWidth="1.5" style={{ flexShrink: 0, marginTop: 2 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                <span style={{ fontFamily: FONT, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                </span>
              </div>
            )}
            {phone && (
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BRONZE} strokeWidth="1.5" style={{ flexShrink: 0 }}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 010 1.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.93v1.99z"/></svg>
                <a href={`tel:${phone.replace(/\s/g,"")}`} style={{ fontFamily: FONT, fontSize: 13, color: MUTED, textDecoration: "none" }}>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              </div>
            )}
            {email && (
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BRONZE} strokeWidth="1.5" style={{ flexShrink: 0 }}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
                <a href={`mailto:${email}`} style={{ fontFamily: FONT, fontSize: 13, color: MUTED, textDecoration: "none" }}>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Mapa — fullwidth */}
      {mapEmbedUrl && (
        <div style={{ width: "100%", height: 320 }}>
          <iframe
            src={mapEmbedUrl}
            width="100%"
            height="320"
            style={{ border: 0, display: "block", filter: "grayscale(20%) brightness(0.85)" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      {/* Copyright bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "20px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontFamily: FONT, fontSize: 12, color: MUTED }}>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </span>
          <div style={{ display: "flex", gap: 20 }}>
            {legalLinks.map((link, i) => (
              <a key={i} href={link.href} style={{ fontFamily: FONT, fontSize: 12, color: MUTED, textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                onMouseLeave={e => (e.currentTarget.style.color = MUTED)}>
                <GenericEditableText sectionId={sectionId} field={`legalLinks.${i}.label`} value={link.label} tag="span" />
              </a>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}

// ── ananda-01-footer ──────────────────────────────────────────────────────────
function FooterAnanda01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GOLD  = "#AA813A";
  const CREAM = "#F2EDE4";
  const DARK  = "#12100a";

  const siteName = String(content.siteName ?? "Demo Ananda SPA");
  const tagline  = String(content.tagline  ?? "Tradiční indická medicína v srdci Prahy");
  const phone    = String(content.phone    ?? "704 123 456");
  const email    = String(content.email    ?? "email@demo.cz");
  const address  = String(content.address  ?? "Náměstí Míru 12, Praha 2");
  const copy     = String(content.copy     ?? `© ${new Date().getFullYear()} Demo Ananda SPA. Všechna práva vyhrazena.`);

  type LinkItem = { label?: string; href?: string };
  const links: LinkItem[] = Array.isArray(content.links)
    ? (content.links as LinkItem[])
    : [
        { label: "Ájurvéda poprvé", href: "#ayurveda-poprve" },
        { label: "Nabídka procedur", href: "#sluzby" },
        { label: "O ájurvédě",      href: "#o-ayurvede" },
        { label: "Kontakt",          href: "#kontakt" },
        { label: "ANANDA KLUB",      href: "#klub" },
        { label: "Dárkový voucher",  href: "#voucher" },
      ];

  return (
    <footer style={{ backgroundColor: DARK, padding: "64px 0 0" }}>
      <style>{`
        .ana-ftr-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px 56px;
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr;
          gap: 48px;
        }
        @media (max-width: 800px) {
          .ana-ftr-wrap { grid-template-columns: 1fr; gap: 32px; }
        }
        .ana-ftr-link {
          display: block;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(242,237,228,0.65);
          text-decoration: none;
          margin-bottom: 12px;
          transition: color 0.2s ease;
        }
        .ana-ftr-link:hover { color: ${CREAM}; }
        .ana-ftr-col-title {
          font-family: 'Jost', sans-serif;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: ${GOLD};
          margin: 0 0 20px;
        }
        .ana-ftr-bar {
          border-top: 1px solid rgba(242,237,228,0.12);
          padding: 20px 32px;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .ana-ftr-copy {
          font-family: 'Jost', sans-serif;
          font-size: 12px;
          color: rgba(242,237,228,0.4);
          margin: 0;
          letter-spacing: 0.5px;
        }
      `}</style>

      <div className="ana-ftr-wrap">
        {/* Col 1 — brand */}
        <div>
          <p style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: 22,
            fontWeight: 300,
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: GOLD,
            margin: "0 0 12px",
          }}>
            <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
          </p>
          <p style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: 13,
            color: "rgba(242,237,228,0.55)",
            lineHeight: 1.7,
            margin: "0 0 28px",
            maxWidth: 280,
          }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          {/* Social icons */}
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Facebook", d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
              { label: "Instagram", d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z" },
            ].map(s => (
              <a key={s.label} href="#" aria-label={s.label} style={{
                width: 36, height: 36,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid rgba(170,129,58,0.4)`,
                borderRadius: 2,
                color: GOLD,
                transition: "border-color 0.2s, color 0.2s",
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <path d={s.d}/>
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Col 2 — navigace */}
        <div>
          <p className="ana-ftr-col-title">Navigace</p>
          {links.map((l, i) => (
            <a key={i} href={l.href ?? "#"} className="ana-ftr-link">
              <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label ?? ""} tag="span" />
            </a>
          ))}
        </div>

        {/* Col 3 — kontakt */}
        <div>
          <p className="ana-ftr-col-title">Kontakt</p>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 13, color: "rgba(242,237,228,0.65)", margin: "0 0 10px", lineHeight: 1.6 }}>
            <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
          </p>
          <a href={`tel:${phone.replace(/\s/g,"")}`} style={{ display: "block", fontFamily: "'Jost', sans-serif", fontSize: 13, color: "rgba(242,237,228,0.65)", textDecoration: "none", marginBottom: 8 }}>
            <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
          </a>
          <a href={`mailto:${email}`} style={{ display: "block", fontFamily: "'Jost', sans-serif", fontSize: 13, color: GOLD, textDecoration: "none" }}>
            <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
          </a>
        </div>
      </div>

      {/* Copyright bar */}
      <div style={{ borderTop: "1px solid rgba(242,237,228,0.1)", padding: "20px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p className="ana-ftr-copy">{copy}</p>
          <p className="ana-ftr-copy">Vytvořeno s <span style={{ color: GOLD }}>Webero</span></p>
        </div>
      </div>
    </footer>
  );
}

// ── tawan-02-footer ───────────────────────────────────────────────────────────
function FooterTawan02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const siteName  = String(content.siteName  ?? "Demo Escape Massage");
  const address   = String(content.address   ?? "Ukázková 123, 110 00 Praha 1");
  const phone     = String(content.phone     ?? "+420 704 123 456");
  const email     = String(content.email     ?? "email@demo.cz");
  const hours     = String(content.hours     ?? "Po–Ne: 10:00–22:00");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}`);
  const social    = (content.social as Record<string, string>) ?? {};
  const navGroups = (content.navGroups as Record<string, Array<{ label: string; href: string }>>) ?? {};
  const servicesLinks = navGroups.services ?? [];
  const infoLinks     = navGroups.info     ?? [];

  const BG     = "#604B3A";
  const CREAM  = "#EAE3DE";
  const TEXT   = "#D8CABF";
  const FONT   = "'Candara', 'Calibri', sans-serif";
  const FLOWER = "/clones/escape/wp-content/themes/twentyseventeen/assets/images/footer-flower.png";

  return (
    <footer data-template="tawan-02" style={{
      background: `${BG} url(${FLOWER}) no-repeat top right`,
      color: TEXT,
      fontFamily: FONT,
      fontSize: 16,
      lineHeight: "25px",
      padding: "100px 0 0",
      marginTop: 0,
      borderTop: "none",
    }}>
      <style>{`
        .t02-ftr-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 clamp(24px,5vw,80px);
          display: flex;
          flex-wrap: wrap;
          column-gap: 115px;
          row-gap: 60px;
        }
        .t02-ftr-col-contact { max-width: 224px; }
        .t02-ftr-h4 {
          font-size: 24px;
          font-weight: 700;
          line-height: 35px;
          color: ${CREAM};
          margin: 0 0 15px;
          font-family: ${FONT};
        }
        .t02-icon-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 10px;
          color: ${TEXT};
          font-family: ${FONT};
          font-size: 15px;
          line-height: 22px;
        }
        .t02-icon-row .t02-ftr-icon { width: 30px; flex-shrink: 0; padding-top: 3px; }
        .t02-ftr-link {
          display: block;
          color: ${TEXT};
          text-decoration: none;
          font-family: ${FONT};
          font-size: 15px;
          line-height: 28px;
          transition: color 0.2s;
        }
        .t02-ftr-link:hover { color: ${CREAM}; }
        .t02-ftr-social { display: flex; gap: 14px; margin-top: 20px; }
        .t02-ftr-social a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border: 1px solid rgba(234,227,222,0.35);
          border-radius: 50%;
          color: ${CREAM};
          transition: border-color 0.2s, background 0.2s;
        }
        .t02-ftr-social a:hover { background: rgba(234,227,222,0.12); border-color: ${CREAM}; }
        @media (max-width: 767px) {
          .t02-ftr-container { column-gap: 0; }
          .t02-ftr-col-contact { max-width: 100%; }
        }
      `}</style>

      <div className="t02-ftr-container">
        {/* Col 1 — Kontakt */}
        <div className="t02-ftr-col-contact">
          <h4 className="t02-ftr-h4">Kontakt</h4>

          <div className="t02-icon-row">
            <span className="t02-ftr-icon">
              <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.5 0C2.90643 0 0 2.6605 0 5.95C0 10.4125 6.5 17 6.5 17C6.5 17 13 10.4125 13 5.95C13 2.6605 10.0936 0 6.5 0ZM1.85714 5.95C1.85714 3.604 3.93714 1.7 6.5 1.7C9.06286 1.7 11.1429 3.604 11.1429 5.95C11.1429 8.398 8.46857 12.0615 6.5 14.348C4.56857 12.0785 1.85714 8.3725 1.85714 5.95Z" fill="#EAE3DE"/>
                <path d="M6.50002 8.07495C7.78211 8.07495 8.82145 7.12356 8.82145 5.94995C8.82145 4.77635 7.78211 3.82495 6.50002 3.82495C5.21793 3.82495 4.17859 4.77635 4.17859 5.94995C4.17859 7.12356 5.21793 8.07495 6.50002 8.07495Z" fill="#EAE3DE"/>
              </svg>
            </span>
            <GenericEditableText sectionId={sectionId} field="address" value={address} tag="p" style={{ margin: 0, color: TEXT, fontFamily: FONT, fontSize: 15, lineHeight: "22px" }} />
          </div>

          <div className="t02-icon-row">
            <span className="t02-ftr-icon">
              <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.23333 1.66667C3.28814 2.40833 3.42514 3.13333 3.64435 3.825L2.54831 4.825C2.17382 3.825 1.93635 2.76667 1.85414 1.66667H3.23333ZM12.2392 11.6833C13.0155 11.8833 13.8102 12.0083 14.6139 12.0583V13.3C13.4083 13.225 12.2483 13.0083 11.1431 12.675L12.2392 11.6833ZM4.11017 0H0.913371C0.411017 0 0 0.375 0 0.833333C0 8.65833 6.95075 15 15.5273 15C16.0297 15 16.4407 14.625 16.4407 14.1667V11.2583C16.4407 10.8 16.0297 10.425 15.5273 10.425C14.3947 10.425 13.2895 10.2583 12.2666 9.95C12.1752 9.91667 12.0748 9.90833 11.9834 9.90833C11.746 9.90833 11.5176 9.99167 11.3349 10.15L9.32552 11.9833C6.74068 10.775 4.62166 8.85 3.3064 6.49167L5.31582 4.65833C5.57156 4.425 5.64463 4.1 5.54416 3.80833C5.20621 2.875 5.02354 1.875 5.02354 0.833333C5.02354 0.375 4.61252 0 4.11017 0Z" fill="#EAE3DE"/>
              </svg>
            </span>
            <a href={`tel:${phone.replace(/\s/g,"")}`} style={{ color: TEXT, textDecoration: "none", fontSize: 15 }}>
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
          </div>

          <div className="t02-icon-row">
            <span className="t02-ftr-icon">
              <svg width="17" height="13" viewBox="0 0 17 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 1.625C17 0.73125 16.235 0 15.3 0H1.7C0.765 0 0 0.73125 0 1.625V11.375C0 12.2688 0.765 13 1.7 13H15.3C16.235 13 17 12.2688 17 11.375V1.625ZM15.3 1.625L8.5 5.6875L1.7 1.625H15.3ZM15.3 11.375H1.7V3.25L8.5 7.3125L15.3 3.25V11.375Z" fill="#EAE3DE"/>
              </svg>
            </span>
            <a href={`mailto:${email}`} style={{ color: TEXT, textDecoration: "none", fontSize: 15 }}>
              <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
            </a>
          </div>

          <h4 className="t02-ftr-h4" style={{ marginTop: 24 }}>Otevírací doba</h4>
          <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="p" style={{ margin: 0, color: TEXT, fontFamily: FONT, fontSize: 15, lineHeight: "22px" }} />

          {social.instagram && (
            <div className="t02-ftr-social">
              <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            </div>
          )}
        </div>

        {/* Col 2 — Služby */}
        {servicesLinks.length > 0 && (
          <div>
            <h4 className="t02-ftr-h4">Služby</h4>
            {servicesLinks.map((l, i) => (
              <a key={i} href={l.href ?? "#"} className="t02-ftr-link">
                <GenericEditableText sectionId={sectionId} field={`navGroups.services.${i}.label`} value={l.label ?? ""} tag="span" />
              </a>
            ))}
          </div>
        )}

        {/* Col 3 — Základní informace */}
        {infoLinks.length > 0 && (
          <div>
            <h4 className="t02-ftr-h4">Základní informace</h4>
            {infoLinks.map((l, i) => (
              <a key={i} href={l.href ?? "#"} className="t02-ftr-link">
                <GenericEditableText sectionId={sectionId} field={`navGroups.info.${i}.label`} value={l.label ?? ""} tag="span" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{ marginTop: 60, borderTop: "1px solid rgba(234,227,222,0.15)", padding: "22px clamp(24px,5vw,80px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontSize: 13, color: "rgba(216,202,191,0.6)", fontFamily: FONT }}>
          <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="p" style={{ margin: 0, color: "rgba(216,202,191,0.6)", fontFamily: FONT, fontSize: 13 }} />
          <div style={{ display: "flex", gap: 20 }}>
            <a href="/gdpr" style={{ color: "rgba(216,202,191,0.6)", textDecoration: "none", fontSize: 13, fontFamily: FONT }}>Zásady osobních údajů</a>
            <a href="/vop" style={{ color: "rgba(216,202,191,0.6)", textDecoration: "none", fontSize: 13, fontFamily: FONT }}>Obchodní podmínky</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── tattoo-01-footer ──────────────────────────────────────────────────────────
// Tmavý footer: červená linka nahoře, 3-sloupcový grid
// Col1: logo + tagline + social | Col2: kontakt s ikonami | Col3: navigace
// Copyright bar dole
// ─────────────────────────────────────────────────────────────────────────────
function FooterTattoo01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const siteName  = String(content.siteName  ?? "Demo Tattoo Studio");
  const tagline   = String(content.tagline   ?? "Profesionální tetování a piercing v srdci Prahy.");
  const logoUrl   = String(content.logoUrl   ?? "/templates/tattoo-01/logo.svg");
  const address   = String(content.address   ?? "");
  const phone     = String(content.phone     ?? "");
  const email     = String(content.email     ?? "");
  const hours     = String(content.hours     ?? "Po–So  10:00–20:00");
  const facebook  = String(content.facebook  ?? "");
  const instagram = String(content.instagram ?? "");
  const copyright = String(content.copyright ?? `© ${siteName} ${new Date().getFullYear()}`);
  const navLinks  = (content.navLinks as Array<{ label: string; href: string }>) ?? [
    { label: "Tattoo",  href: "#tattoo" },
    { label: "Piercing", href: "#piercing" },
    { label: "Galerie",  href: "#galerie" },
    { label: "Ceník",    href: "#cenik" },
    { label: "Kontakt",  href: "#kontakt" },
  ];

  const ACCENT = "#ff5c4b";
  const SANS   = "Arial, Helvetica, sans-serif";
  const WHITE  = "#ffffff";
  const MUTED  = "rgba(255,255,255,0.48)";

  const iconStyle: React.CSSProperties = { flexShrink: 0, marginTop: 1 };

  return (
    <footer data-template="tattoo-01" style={{ backgroundColor: "#0a0a0a" }}>
      {/* Červená linka nahoře */}
      <div style={{ height: 3, backgroundColor: ACCENT }} aria-hidden />

      {/* 3-sloupcový grid */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(56px, 8vw, 80px) clamp(24px, 5vw, 80px)" }}>
        <div className="t01-ftr-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 0.9fr", gap: "clamp(32px, 5vw, 72px)", alignItems: "start" }}>

          {/* Col 1 — Logo + tagline + social */}
          <div>
            <span style={{ display: "inline-block", marginBottom: 18 }}>
              <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "inline-block" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img loading="lazy" src={logoUrl} alt={siteName} style={{ height: 50, width: "auto", objectFit: "contain", maxWidth: 220, display: "block" }} />
              </GenericEditableImage>
            </span>
            <p style={{ fontFamily: SANS, fontSize: "0.875rem", color: MUTED, lineHeight: 1.75, maxWidth: 300, margin: "0 0 24px" }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                  style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.14)", color: MUTED, transition: "border-color 0.2s, color 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = MUTED; }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                  style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.14)", color: MUTED, transition: "border-color 0.2s, color 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = MUTED; }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Col 2 — Kontakt */}
          <div>
            <p style={{ fontFamily: SANS, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", color: ACCENT, textTransform: "uppercase", margin: "0 0 22px" }}>Kontakt</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {address && (
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" style={{ fontFamily: SANS, fontSize: "0.875rem", color: MUTED, lineHeight: 1.6 }} />
                </div>
              )}
              {phone && (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.99-.94a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <a href={`tel:${phone.replace(/\s/g,"")}`} style={{ fontFamily: SANS, fontSize: "0.875rem", color: WHITE, textDecoration: "none" }}>
                    <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                  </a>
                </div>
              )}
              {email && (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
                  <a href={`mailto:${email}`} style={{ fontFamily: SANS, fontSize: "0.875rem", color: MUTED, textDecoration: "none" }}>
                    <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                  </a>
                </div>
              )}
              {hours && (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" style={{ fontFamily: SANS, fontSize: "0.875rem", color: MUTED }} />
                </div>
              )}
            </div>
          </div>

          {/* Col 3 — Navigace */}
          <div>
            <p style={{ fontFamily: SANS, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", color: ACCENT, textTransform: "uppercase", margin: "0 0 22px" }}>Nabídka</p>
            <nav style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {navLinks.map((l, i) => (
                <a key={i} href={l.href}
                  style={{ fontFamily: SANS, fontSize: "0.875rem", color: MUTED, textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                  onMouseLeave={e => (e.currentTarget.style.color = MUTED)}>
                  <GenericEditableText sectionId={sectionId} field={`navLinks.${i}.label`} value={l.label} tag="span" />
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "18px clamp(24px, 5vw, 80px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="p" style={{ margin: 0, fontFamily: SANS, fontSize: "0.78rem", color: "rgba(255,255,255,0.22)" }} />
          <a href="/gdpr" style={{ fontFamily: SANS, fontSize: "0.78rem", color: "rgba(255,255,255,0.22)", textDecoration: "none" }}>Ochrana osobních údajů</a>
        </div>
      </div>

      <style>{`
        @media(max-width:880px){[data-template="tattoo-01"] .t01-ftr-grid{grid-template-columns:1fr 1fr !important;}}
        @media(max-width:540px){[data-template="tattoo-01"] .t01-ftr-grid{grid-template-columns:1fr !important;}}
      `}</style>
    </footer>
  );
}

// ── tattoo-02-footer ──────────────────────────────────────────────────────────
// Tmavý (#0f0f0f), 3 sloupce: logo+tagline | navigace | kontakt+sociální sítě
// Zlatá top linka, copyright bar dole.
// ─────────────────────────────────────────────────────────────────────────────
function FooterTattoo02({ content, sectionId }: {
  content: Record<string, unknown>;
  sectionId: number;
}) {
  const c        = content as Record<string, unknown>;
  const siteName = String(c.siteName  ?? "Demo Homie Tattoo");
  const logoUrl  = String(c.logoUrl   ?? "/templates/tattoo-02/logo-white.svg");
  const tagline  = String(c.tagline   ?? "Prémiové tetovací & piercing studio v srdci Prahy.");
  const address  = String(c.address   ?? "Ukázková 123, 110 00 Praha 1");
  const phone    = String(c.phone     ?? "+420 704 123 456");
  const email    = String(c.email     ?? "email@demo.cz");
  const copyright= String(c.copyright ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);
  const instagram= String(c.instagram ?? "");
  const facebook = String(c.facebook  ?? "");
  const links    = (c.links as Array<{ label: string; href: string }>) ?? [];

  const GOLD = "#BF8A1D";
  const BG   = "#0f0f0f";

  const IGIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
  const FBIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
    </svg>
  );

  return (
    <>
      <style>{`
        .tf02-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr;
          gap: 48px;
          max-width: 1100px;
          margin: 0 auto;
          padding: 64px clamp(20px,4vw,48px) 56px;
        }
        @media (max-width: 860px) { .tf02-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 520px) { .tf02-grid { grid-template-columns: 1fr; gap: 32px; } }
        .tf02-nav-link {
          display: block;
          font-family: Arial, sans-serif; font-size: 0.85rem;
          color: rgba(255,255,255,0.55);
          text-decoration: none; padding: 5px 0;
          transition: color 0.2s;
        }
        .tf02-nav-link:hover { color: ${GOLD}; }
        .tf02-social a {
          display: inline-flex; align-items: center; justify-content: center;
          width: 36px; height: 36px;
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s;
        }
        .tf02-social a:hover { border-color: ${GOLD}; color: ${GOLD}; }
      `}</style>

      <footer data-section="footer-tattoo-02" style={{ backgroundColor: BG, borderTop: `3px solid ${GOLD}` }}>
        <div className="tf02-grid">

          {/* Sloupec 1 — Logo + tagline */}
          <div>
            <img loading="lazy" src={logoUrl} alt={siteName} style={{ height: 50, width: "auto", marginBottom: 20 }} />
            <p style={{
              fontFamily: "Arial, sans-serif", fontSize: "0.85rem",
              color: "rgba(255,255,255,0.45)", lineHeight: 1.7,
              margin: "0 0 24px", maxWidth: 260,
            }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            {/* Sociální sítě */}
            <div className="tf02-social" style={{ display: "flex", gap: 8 }}>
              {instagram && <a href={instagram} target="_blank" rel="noopener" aria-label="Instagram"><IGIcon /></a>}
              {facebook  && <a href={facebook}  target="_blank" rel="noopener" aria-label="Facebook"><FBIcon /></a>}
            </div>
          </div>

          {/* Sloupec 2 — Navigace */}
          <div>
            <h3 style={{
              fontFamily: "'Arial Black', Arial, sans-serif",
              fontWeight: 900, fontSize: "0.72rem",
              color: GOLD, letterSpacing: "0.22em",
              textTransform: "uppercase", margin: "0 0 20px",
            }}>Navigace</h3>
            <nav>
              {links.map((l, i) => (
                <a key={i} href={l.href} className="tf02-nav-link">
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              ))}
            </nav>
          </div>

          {/* Sloupec 3 — Kontakt */}
          <div>
            <h3 style={{
              fontFamily: "'Arial Black', Arial, sans-serif",
              fontWeight: 900, fontSize: "0.72rem",
              color: GOLD, letterSpacing: "0.22em",
              textTransform: "uppercase", margin: "0 0 20px",
            }}>Kontakt</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href={`tel:${phone.replace(/\s/g,"")}`} style={{ fontFamily: "Arial, sans-serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.55)", textDecoration: "none", lineHeight: 1.6, transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
              <a href={`mailto:${email}`} style={{ fontFamily: "Arial, sans-serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.55)", textDecoration: "none", lineHeight: 1.6, transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
              <span style={{ fontFamily: "Arial, sans-serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </span>
            </div>
          </div>

        </div>

        {/* Copyright bar */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "16px clamp(20px,4vw,48px)",
          textAlign: "center",
        }}>
          <p style={{
            fontFamily: "Arial, sans-serif", fontSize: "0.72rem",
            color: "rgba(255,255,255,0.3)", margin: 0,
          }}>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </p>
        </div>
      </footer>
    </>
  );
}

// ── tattoo-03-footer ──────────────────────────────────────────────────────────
// Tmavý footer — magictattoo.cz inspired
// #0A0A0E bg, červená top linka, 2-col: logo+tagline vlevo / kontakt+social+nav vpravo
// Copyright bar dole
// ─────────────────────────────────────────────────────────────────────────────
function FooterTattoo03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c         = content as Record<string, unknown>;
  const siteName  = String(c.siteName  ?? "Demo Magic Tattoo Studio");
  const tagline   = String(c.tagline   ?? "Profesionální tetovací studio v centru Prahy. Walk-in i rezervace.");
  const logoUrl   = String(c.logoUrl   ?? "/templates/tattoo-03/logo.svg");
  const address   = String(c.address   ?? "Ukázková 123, 110 00 Praha 1");
  const phone     = String(c.phone     ?? "704 123 456");
  const email     = String(c.email     ?? "email@demo.cz");
  const hours     = String(c.hours     ?? "Po–Ne 10:00–20:00");
  const facebook  = String(c.facebook  ?? "https://facebook.com/demo");
  const instagram = String(c.instagram ?? "https://instagram.com/demo");
  const copyright = String(c.copyright ?? `© Demo Magic Tattoo Studio ${new Date().getFullYear()}`);
  const navLinks  = (c.navLinks as Array<{ label: string; href: string }>) ?? [];

  const BG     = "#0A0A0E";
  const ACCENT = "#D41515";

  return (
    <>
      <footer style={{ backgroundColor: BG, borderTop: `3px solid ${ACCENT}` }}>
        {/* Hlavní část */}
        <div style={{
          maxWidth: 1360, margin: "0 auto",
          display: "grid", gridTemplateColumns: "1fr 1.5fr",
          gap: 48,
          padding: "clamp(48px,6vw,80px) clamp(20px,4vw,60px)",
        }} className="t03-footer-grid">
          <style>{`
            @media (max-width: 768px) { .t03-footer-grid { grid-template-columns: 1fr !important; } }
          `}</style>

          {/* Logo + tagline */}
          <div>
            <img
              src={logoUrl}
              alt={siteName}
              style={{ height: 44, width: "auto", marginBottom: 20 }}
            />
            <p style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: "0.84rem",
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.7,
              margin: 0,
              maxWidth: 280,
            }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
          </div>

          {/* Kontakt + social + nav */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
          }} className="t03-footer-right">
            <style>{`
              @media (max-width: 480px) { .t03-footer-right { grid-template-columns: 1fr !important; } }
            `}</style>

            {/* Kontakt */}
            <div>
              <h4 style={{
                fontFamily: "Arial, Helvetica, sans-serif",
                fontWeight: 700, fontSize: "0.72rem",
                color: ACCENT, textTransform: "uppercase",
                letterSpacing: "0.14em", margin: "0 0 16px",
              }}>Kontakt</h4>
              {([
                { field: "address", label: address },
                { field: "phone",   label: phone },
                { field: "email",   label: email },
                { field: "hours",   label: hours },
              ] as Array<{ field: string; label: string }>).map((r, i) => (
                <div key={i} style={{
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: "0.82rem",
                  color: "rgba(255,255,255,0.58)",
                  marginBottom: 6,
                  lineHeight: 1.5,
                }}>
                  <GenericEditableText sectionId={sectionId} field={r.field} value={r.label} tag="span" />
                </div>
              ))}
              {/* Social */}
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <a href={facebook} target="_blank" rel="noopener noreferrer" style={{
                  fontFamily: "Arial, sans-serif", fontSize: "0.72rem", fontWeight: 700,
                  color: "rgba(255,255,255,0.5)", textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.15)", padding: "5px 10px",
                  transition: "color 0.2s, border-color 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.borderColor = ACCENT; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
                >FB</a>
                <a href={instagram} target="_blank" rel="noopener noreferrer" style={{
                  fontFamily: "Arial, sans-serif", fontSize: "0.72rem", fontWeight: 700,
                  color: "rgba(255,255,255,0.5)", textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.15)", padding: "5px 10px",
                  transition: "color 0.2s, border-color 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.borderColor = ACCENT; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
                >IG</a>
              </div>
            </div>

            {/* Navigace */}
            <div>
              <h4 style={{
                fontFamily: "Arial, Helvetica, sans-serif",
                fontWeight: 700, fontSize: "0.72rem",
                color: ACCENT, textTransform: "uppercase",
                letterSpacing: "0.14em", margin: "0 0 16px",
              }}>Navigace</h4>
              <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {navLinks.map((l, i) => (
                  <a
                    key={i}
                    href={l.href}
                    style={{
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontSize: "0.82rem",
                      color: "rgba(255,255,255,0.55)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#ffffff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                  >
                    <GenericEditableText sectionId={sectionId} field={`navLinks.${i}.label`} value={l.label} tag="span" />
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "16px clamp(20px,4vw,60px)",
          display: "flex", justifyContent: "center",
        }}>
          <p style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.3)",
            margin: 0,
          }}>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </p>
        </div>
      </footer>
    </>
  );
}

// nails-01 · Kyoto Wabi-Sabi Beauty footer — burgundy luxe
// Top hairline s central diamond · hanko seal + Georgia italic wordmark left
// 4-col: Brand+Newsletter | Navigace | Otevřeno (dotted-leader) | Kontakt+Social
// Bottom copyright bar s WeberoCredit
function FooterNails01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const BURGUNDY = "#79142b";
  const CREAM    = "#f4f1e9";
  const SERIF    = "Georgia, 'Times New Roman', serif";
  const SANS     = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  const wordmark  = String(content.wordmark  ?? "NOIR NAILS");
  const subtitle  = String(content.subtitle  ?? "Beauty · Spa · Praha");
  const tagline   = String(content.tagline   ?? "Prémiové nehtové studio a beauty salon inspirované japonským wabi-sabi.");
  const nav       = (content.nav as Array<{ label: string; href: string }>) ?? [];
  const hours     = (content.hours as Array<{ days: string; time: string }>) ?? [];
  const address   = String(content.address   ?? "Vinohradská 26, 110 00 Praha 1");
  const phone     = String(content.phone     ?? "+420 777 123 456");
  const email     = String(content.email     ?? "studio@noirnails.cz");
  const instagram = String(content.instagram ?? "https://instagram.com/demo");
  const facebook  = String(content.facebook  ?? "https://facebook.com/demo");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} Demo Noir Nails & Spa · Všechna práva vyhrazena`);
  const legalText = String(content.legalText ?? "Ochrana údajů · Obchodní podmínky");
  const legalHref = String(content.legalHref ?? "/kontakt");
  const siteMode  = String(content.siteMode ?? "multipage");

  const resolve = (href: string): string => {
    if (!href) return "#";
    if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return href;
    const base = tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "";
    if (siteMode === "onepage") {
      if (href.startsWith("/") && href !== "/") return `${base}#${href.slice(1)}`;
      if (href.startsWith("#")) return `${base}${href}`;
      return href;
    }
    if (href.startsWith("#")) return `${base}/${href.slice(1)}`;
    if (href.startsWith("/")) return `${base}${href}`;
    return href;
  };

  const colHead: React.CSSProperties = {
    fontFamily: SANS,
    fontSize: "0.68rem",
    fontWeight: 400,
    color: CREAM,
    letterSpacing: "0.36em",
    textTransform: "uppercase",
    margin: "0 0 22px",
    opacity: 0.85,
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

  return (
    <footer
      id="kontakt"
      data-template="nails-01"
      data-section-type="footer"
      data-variant="nails-01-footer"
      className="n01-footer"
      style={{ backgroundColor: BURGUNDY, position: "relative", overflow: "hidden" }}
    >
      {/* Noir gradient overlay */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 100% 0%, rgba(0,0,0,0.28), transparent 55%), radial-gradient(ellipse at 0% 100%, rgba(0,0,0,0.28), transparent 55%)",
      }} />

      {/* Top hairline s central diamond */}
      <div aria-hidden="true" style={{
        position: "relative",
        height: 1,
        background: "linear-gradient(90deg, transparent 0%, rgba(244,241,233,0.4) 30%, rgba(244,241,233,0.4) 70%, transparent 100%)",
      }}>
        <span style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%, -50%) rotate(45deg)",
          width: 8, height: 8,
          backgroundColor: BURGUNDY,
          border: `1px solid ${CREAM}`,
        }} />
      </div>

      {/* 4-col grid */}
      <div className="n01-footer-grid" style={{
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr 1fr 1.2fr",
        gap: "clamp(32px, 4vw, 64px)",
        padding: "clamp(64px, 8vh, 96px) clamp(28px, 6vw, 80px)",
        maxWidth: 1320,
        margin: "0 auto",
        position: "relative",
      }}>
        {/* Col 1 — Brand */}
        <div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10, marginBottom: 22 }}>
            {/* Hanko seal (cream) */}
            <svg width="64" height="64" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="n01-footer-seal">
              <circle cx="36" cy="36" r="32" stroke={CREAM} strokeWidth="1.3" fill="none" />
              <circle cx="36" cy="36" r="27" stroke={CREAM} strokeWidth="0.5" strokeDasharray="1.5 2" fill="none" opacity="0.55" />
              <path d="M 12 30 Q 20 14, 40 12" stroke={CREAM} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.35" />
              <circle cx="55" cy="55" r="1.4" fill={CREAM} opacity="0.5" />
              <text x="36" y="45" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" fontSize="26" fontWeight="700" fill={CREAM} letterSpacing="0">N</text>
            </svg>
            <span style={{
              fontFamily: SERIF, fontStyle: "italic",
              fontSize: "1.35rem", fontWeight: 700,
              color: CREAM, letterSpacing: "0.06em",
            }}>
              <GenericEditableText sectionId={sectionId} field="wordmark" value={wordmark} tag="span" />
            </span>
            <span style={{
              fontFamily: SANS, fontSize: "0.62rem", fontWeight: 300,
              letterSpacing: "0.36em", textTransform: "uppercase",
              color: CREAM, opacity: 0.7,
            }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </span>
          </div>
          <p style={{
            fontFamily: SERIF, fontStyle: "italic",
            fontSize: "0.95rem", color: CREAM, opacity: 0.75,
            lineHeight: 1.65, margin: 0, maxWidth: 280,
          }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
        </div>

        {/* Col 2 — Navigace */}
        <div>
          <p style={colHead}>
            <span aria-hidden="true" style={{ width: 24, height: 1, background: CREAM, opacity: 0.6 }} />
            Navigace
          </p>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {nav.map((l, i) => (
              <li key={`n01-fnav-${i}`}>
                <a
                  href={resolve(l.href)}
                  className="n01-footer-link"
                  style={{
                    fontFamily: SERIF, fontStyle: "italic",
                    fontSize: "1.02rem", color: CREAM,
                    textDecoration: "none", opacity: 0.85,
                  }}
                >
                  <GenericEditableText sectionId={sectionId} field={`nav.${i}.label`} value={l.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — Otevřeno (dotted-leader) */}
        <div>
          <p style={colHead}>
            <span aria-hidden="true" style={{ width: 24, height: 1, background: CREAM, opacity: 0.6 }} />
            Otevřeno
          </p>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {hours.map((h, i) => (
              <li key={`n01-fh-${i}`} style={{
                display: "flex", alignItems: "baseline", gap: 8,
                fontFamily: SANS, fontSize: "0.85rem", color: CREAM,
              }}>
                <span style={{
                  fontFamily: SERIF, fontStyle: "italic",
                  fontSize: "0.98rem", opacity: 0.85, flexShrink: 0,
                }}>{h.days}</span>
                <span aria-hidden="true" style={{
                  flex: 1, height: 0,
                  borderBottom: `1px dotted rgba(244,241,233,0.35)`,
                  transform: "translateY(-4px)",
                }} />
                <span style={{ opacity: 0.9, letterSpacing: "0.04em", flexShrink: 0 }}>
                  <GenericEditableText sectionId={sectionId} field={`hours.${i}.time`} value={h.time} tag="span" />
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4 — Kontakt + Social */}
        <div>
          <p style={colHead}>
            <span aria-hidden="true" style={{ width: 24, height: 1, background: CREAM, opacity: 0.6 }} />
            Kontakt
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 }}>
            <div style={{ fontFamily: SANS, fontSize: "0.88rem", color: CREAM, opacity: 0.85, lineHeight: 1.55 }}>
              <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
            </div>
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="n01-footer-contact" style={{
              fontFamily: SANS, fontSize: "0.88rem", color: CREAM,
              textDecoration: "none", opacity: 0.85,
            }}>
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
            <a href={`mailto:${email}`} className="n01-footer-contact" style={{
              fontFamily: SANS, fontSize: "0.88rem", color: CREAM,
              textDecoration: "none", opacity: 0.85,
            }}>
              <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
            </a>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="n01-social-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="n01-social-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom copyright bar */}
      <div style={{
        position: "relative",
        borderTop: `1px solid rgba(244,241,233,0.18)`,
        padding: "22px clamp(28px, 6vw, 80px)",
      }}>
        <div style={{
          maxWidth: 1320, margin: "0 auto",
          display: "flex", flexWrap: "wrap",
          alignItems: "center", justifyContent: "space-between",
          gap: 16,
        }}>
          <p style={{
            margin: 0,
            fontFamily: SANS, fontSize: "0.7rem",
            fontWeight: 300, letterSpacing: "0.2em",
            textTransform: "uppercase", color: CREAM, opacity: 0.6,
          }}>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <a href={resolve(legalHref)} className="n01-footer-legal" style={{
              fontFamily: SANS, fontSize: "0.7rem",
              fontWeight: 300, letterSpacing: "0.2em",
              textTransform: "uppercase", color: CREAM,
              opacity: 0.6, textDecoration: "none",
            }}>
              <GenericEditableText sectionId={sectionId} field="legalText" value={legalText} tag="span" />
            </a>
            <WeberoCredit />
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── nails-02-footer ───────────────────────────────────────────────────────────
// Tmavé wine #14100e bg, 3-col: brand+tagline / quick links / kontakt; copyright
// bar dole s legal linky. Serif italic wordmark, taupe accenty.
// ─────────────────────────────────────────────────────────────────────────────
function FooterNails02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const DARK  = "#14100e";
  const WINE  = "#6b3f38";
  const TAUPE = "#d4a080";
  const CREAM = "#f6efe9";
  const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
  const SANS  = "'Helvetica Neue', Arial, sans-serif";

  const ctaKicker = String(content.ctaKicker ?? "Rezervace");
  const ctaTitle  = String(content.ctaTitle  ?? "Objednáte si termín ještě dnes?");
  const ctaText   = String(content.ctaText   ?? "Rezervovat termín");
  const ctaHref   = String(content.ctaHref   ?? "/kontakt");

  const siteName  = String(content.siteName  ?? "Premium Nails");
  const tagline   = String(content.tagline   ?? "Prémiové nehtové studio v srdci Prahy — manikúra, pedikúra a originální nail design.");
  const address   = String(content.address   ?? "Melantrichova 15, 110 00 Praha 1");
  const email     = String(content.email     ?? "studio@premiumnails.cz");
  const phone     = String(content.phone     ?? "+420 704 123 456");
  const hours     = String(content.hours     ?? "Po–Pá 9:00–20:00 · So 9:00–15:00");
  const links     = (content.links as Array<{ label: string; href: string }>) ?? [];
  const ico       = String(content.ico       ?? "12345678");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} Premium Nails. Demo web.`);
  const igHref    = String(content.igHref    ?? "https://instagram.com/premiumnails.demo");
  const waHref    = String(content.waHref    ?? "https://wa.me/420704123456");

  const colTitle: React.CSSProperties = {
    fontFamily: SERIF,
    fontStyle: "italic",
    fontSize: "1.25rem",
    fontWeight: 400,
    color: TAUPE,
    margin: "0 0 20px",
    letterSpacing: "0.005em",
    paddingBottom: 12,
    borderBottom: `1px solid ${TAUPE}33`,
  };
  const colItem: React.CSSProperties = {
    fontFamily: SANS,
    fontSize: "0.94rem",
    fontWeight: 300,
    color: "rgba(246,239,233,0.78)",
    textDecoration: "none",
    lineHeight: 1.7,
    transition: "color 0.25s, transform 0.3s",
    display: "inline-block",
  };

  return (
    <footer
      data-section-type="footer"
      data-variant="nails-02-footer"
      data-template="nails-02"
      style={{
        backgroundColor: DARK,
        padding: "0 clamp(24px, 6vw, 72px) 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        {/* CTA strip */}
        <div
          className="n02-footer-cta-strip"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            gap: 40,
            padding: "clamp(56px, 7vw, 88px) 0",
            borderBottom: `1px solid ${TAUPE}22`,
          }}
        >
          <div>
            <p style={{
              fontFamily: SANS,
              fontSize: "0.72rem",
              fontWeight: 600,
              color: TAUPE,
              textTransform: "uppercase",
              letterSpacing: "0.36em",
              margin: "0 0 20px",
            }}>
              <GenericEditableText sectionId={sectionId} field="ctaKicker" value={ctaKicker} tag="span" />
            </p>
            <h3 style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(2rem, 4vw, 3.4rem)",
              lineHeight: 1.05,
              color: CREAM,
              margin: 0,
              letterSpacing: "-0.01em",
              maxWidth: 720,
            }}>
              <GenericEditableText sectionId={sectionId} field="ctaTitle" value={ctaTitle} tag="span" />
            </h3>
          </div>
          <a
            href={ctaHref}
            data-btn="primary"
            className="n02-footer-cta"
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "17px 36px",
              backgroundColor: "transparent",
              color: CREAM,
              border: `1px solid ${CREAM}`,
              fontFamily: SANS,
              fontSize: "0.8rem",
              fontWeight: 600,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              textDecoration: "none",
              overflow: "hidden",
              transition: "color 0.35s ease",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <span style={{ position: "relative", zIndex: 2 }}>
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </span>
            <span style={{ position: "relative", zIndex: 2, display: "inline-flex" }} className="n02-footer-cta-arrow">
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M1 5h11m-3.5-3.5L12 5l-3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </span>
          </a>
        </div>

        {/* 4-col main grid */}
        <div
          className="nails02-footer-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
            gap: "clamp(40px, 5vw, 72px)",
            padding: "clamp(64px, 8vw, 96px) 0 clamp(56px, 7vw, 80px)",
          }}
        >
          {/* Col 1: brand */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 22,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 12A8 8 0 1 1 12 4a6 6 0 0 0 8 8Z" fill={TAUPE} opacity="0.9"/>
              </svg>
              <span style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 500,
                fontSize: "1.8rem",
                color: CREAM,
                letterSpacing: "0.005em",
                lineHeight: 1,
              }}>
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </span>
            </div>
            <p
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: "1.05rem",
                fontWeight: 400,
                color: "rgba(246,239,233,0.7)",
                lineHeight: 1.65,
                margin: 0,
                maxWidth: 340,
              }}
            >
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 30 }}>
              <a
                href={igHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="n02-footer-social"
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 40, height: 40, borderRadius: 999,
                  border: `1px solid ${TAUPE}`,
                  color: TAUPE,
                  textDecoration: "none",
                  transition: "background 0.25s, color 0.25s, transform 0.3s",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/></svg>
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="n02-footer-social"
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 40, height: 40, borderRadius: 999,
                  border: `1px solid ${TAUPE}`,
                  color: TAUPE,
                  textDecoration: "none",
                  transition: "background 0.25s, color 0.25s, transform 0.3s",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 14.3c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.2-.4-2.4-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.7.1-.1.3-.3.5-.5.1-.2.2-.3.3-.5.1-.2.1-.4 0-.5-.1-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .2.2 2 3.1 4.9 4.4 1.7.7 2.4.8 3.3.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3z"/></svg>
              </a>
            </div>
          </div>

          {/* Col 2: nav */}
          <div>
            <h4 style={colTitle}>Navigace</h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {links.map((l, i) => (
                <li key={`fn-${i}`}>
                  <a
                    href={l.href}
                    className="n02-footer-navlink"
                    style={colItem}
                  >
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: contact */}
          <div>
            <h4 style={colTitle}>Kontakt</h4>
            <address style={{ fontStyle: "normal", display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={colItem}>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </span>
              <a href={`mailto:${email}`} className="n02-footer-navlink" style={colItem}>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="n02-footer-navlink" style={colItem}>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            </address>
          </div>

          {/* Col 4: hours */}
          <div>
            <h4 style={colTitle}>Otevřeno</h4>
            <p style={{ ...colItem, whiteSpace: "pre-line", cursor: "default" }}>
              <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="nails02-footer-bottom"
          style={{
            borderTop: `1px solid rgba(212,160,128,0.18)`,
            padding: "22px 0 28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: SANS,
              fontSize: "0.78rem",
              fontWeight: 300,
              color: "rgba(246,239,233,0.55)",
              letterSpacing: "0.04em",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </span>
          <span
            style={{
              fontFamily: SANS,
              fontSize: "0.72rem",
              fontWeight: 400,
              color: "rgba(246,239,233,0.45)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" />
          </span>
          <WeberoCredit />
        </div>
      </div>
      <style>{`
        .n02-footer-cta {
          transition: background-color 0.35s ease, color 0.35s ease, border-color 0.35s ease;
        }
        .n02-footer-cta:hover { background-color: ${CREAM}; color: ${DARK}; border-color: ${CREAM}; }
        .n02-footer-cta:hover .n02-footer-cta-arrow { transform: translateX(4px); transition: transform 0.3s ease; }
        .n02-footer-navlink:hover { color: ${CREAM}; transform: translateX(4px); }
        .n02-footer-social:hover { background-color: ${TAUPE}; color: ${DARK}; transform: translateY(-2px); }
        @media (max-width: 900px) {
          .nails02-footer-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .n02-footer-cta-strip { grid-template-columns: 1fr !important; gap: 28px !important; }
        }
        @media (max-width: 560px) {
          .nails02-footer-grid { grid-template-columns: 1fr !important; }
          .nails02-footer-bottom { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>
    </footer>
  );
}

// ── nails-03-footer ───────────────────────────────────────────────────────────
// Dark #0B090C bg. 3-col grid: (1) logo/tagline + IG, (2) rychlé odkazy,
// (3) kontaktní info. Spodní bar: copyright + IČO oddělen tenkým brown pruhem.
// ─────────────────────────────────────────────────────────────────────────────
function FooterNails03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const DARK  = "#0B090C";
  const CREAM = "#FCF9F0";
  const BROWN = "#806248";
  const MUTED = "rgba(252,249,240,0.45)";
  const FONT  = "'Manrope', 'Helvetica Neue', Arial, sans-serif";

  const siteName  = String(content.siteName  ?? "Studio Krásy");
  const tagline   = String(content.tagline   ?? "Studio krásy v srdci Prahy — manikúra, pedikúra, kosmetika a péče o obočí.");
  const address   = String(content.address   ?? "Ukázková 123, 110 00 Praha 1");
  const email     = String(content.email     ?? "email@demo.cz");
  const phone     = String(content.phone     ?? "+420 704 123 456");
  const hours     = String(content.hours     ?? "Po–Pá 9:00–18:00, So 9:00–14:00");
  const ico       = String(content.ico       ?? "12345678");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);
  const igHref    = String(content.igHref    ?? "https://instagram.com/demo");
  const links     = ((content.links as Array<{ label: string; href: string }>) ?? []);

  const iconIG = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>;

  return (
    <footer
      data-section-type="footer"
      data-variant="nails-03-footer"
      style={{ backgroundColor: DARK, color: CREAM }}
    >
      {/* Top brown line */}
      <div style={{ height: 1, backgroundColor: BROWN, opacity: 0.3 }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(48px, 7vw, 80px) clamp(24px, 6vw, 80px) clamp(32px, 4vw, 48px)" }}>
        <div
          className="nails03-footer-grid"
          style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.4fr", gap: "clamp(32px, 5vw, 64px)" }}
        >
          {/* Col 1: Brand */}
          <div>
            <p style={{ fontFamily: FONT, fontWeight: 800, fontSize: "1.05rem", letterSpacing: "0.14em", textTransform: "uppercase", color: CREAM, margin: "0 0 14px" }}>
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </p>
            <p style={{ fontFamily: FONT, fontSize: "0.85rem", fontWeight: 300, lineHeight: 1.65, color: MUTED, margin: "0 0 28px", maxWidth: 300 }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            <a
              href={igHref}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 7, color: BROWN, fontFamily: FONT, fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.08em", textDecoration: "none" }}
            >
              {iconIG} Instagram
            </a>
          </div>

          {/* Col 2: Nav links */}
          <div>
            <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: BROWN, margin: "0 0 20px" }}>Navigace</p>
            <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {links.map((l, i) => (
                <a
                  key={i}
                  href={l.href}
                  style={{ fontFamily: FONT, fontSize: "0.88rem", fontWeight: 400, color: MUTED, textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = CREAM)}
                  onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              ))}
            </nav>
          </div>

          {/* Col 3: Contact info */}
          <div>
            <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: BROWN, margin: "0 0 20px" }}>Kontakt</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ fontFamily: FONT, fontSize: "0.88rem", color: MUTED, margin: 0, lineHeight: 1.5 }}>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </p>
              <a href={`mailto:${email}`} style={{ fontFamily: FONT, fontSize: "0.88rem", color: MUTED, textDecoration: "none" }}>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
              <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ fontFamily: FONT, fontSize: "0.88rem", color: MUTED, textDecoration: "none" }}>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
              <p style={{ fontFamily: FONT, fontSize: "0.88rem", color: MUTED, margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ height: 1, backgroundColor: BROWN, opacity: 0.2, margin: "40px 0 24px" }} />
        <div
          className="nails03-footer-bottom"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}
        >
          <p style={{ fontFamily: FONT, fontSize: "0.75rem", color: MUTED, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </p>
          <p style={{ fontFamily: FONT, fontSize: "0.75rem", color: MUTED, margin: 0 }}>
            IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" />
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nails03-footer-grid { grid-template-columns: 1fr !important; }
          .nails03-footer-bottom { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>
    </footer>
  );
}

// ── clinic-02-footer ───────────────────────────────────────────────────────
// Navy bg, cream text, navbar-style wordmark, 4-col layout with amber accents.
function FooterClinic02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY    = "#0F203E";
  const NAVY_D  = "#0a172e";
  const AMBER   = "#ffa60b";
  const CREAM   = "#fffaf2";
  const MUTED   = "rgba(255,250,242,0.55)";
  const BORDER  = "rgba(255,250,242,0.10)";
  const FONT_H  = "'Poppins', Arial, sans-serif";
  const FONT_B  = "'Open Sans', Arial, sans-serif";

  const siteName    = String((content as Record<string,unknown>).siteName    ?? "AURÉLIE");
  const siteTagline = String((content as Record<string,unknown>).siteTagline ?? "CLINIC");
  const tagline     = String(content.tagline   ?? "Klinika estetické dermatologie & medicínské kosmetiky v centru Prahy.");
  const address     = String(content.address   ?? "Vinohradská 2828/151, 130 00 Praha 3");
  const phone       = String(content.phone     ?? "+420 234 567 890");
  const email       = String(content.email     ?? "info@aurelie-clinic.cz");
  const facebook    = String(content.facebook  ?? "https://facebook.com/aurelie.clinic");
  const instagram   = String(content.instagram ?? "https://instagram.com/aurelie.clinic");
  const copyright   = String(content.copyright ?? `© ${new Date().getFullYear()} Aurélie Clinic s.r.o. Všechna práva vyhrazena.`);
  const hours       = Array.isArray(content.hours)
    ? (content.hours as Array<{ days?: string; time?: string }>)
    : [];
  const links       = Array.isArray(content.links)
    ? (content.links as Array<{ label?: string; href?: string }>)
    : [];

  return (
    <footer data-template="clinic-02" style={{
      background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY_D} 100%)`,
      color: CREAM, fontFamily: FONT_B,
      borderTop: `2px solid ${AMBER}`,
    }}>
      {/* Main grid */}
      <div className="c02-footer-grid" style={{
        maxWidth: 1280, margin: "0 auto",
        padding: "clamp(64px,8vw,96px) clamp(24px,5vw,60px) clamp(40px,5vw,56px)",
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
        gap: "clamp(32px,4vw,56px)",
      }}>
        {/* Col 1: wordmark + tagline + socials */}
        <div>
          <a href="/" style={{ textDecoration: "none", display: "block", marginBottom: 22, lineHeight: 1 }}>
            <div style={{ fontFamily: FONT_H, fontSize: "clamp(1.7rem,2.6vw,2.2rem)", fontWeight: 700, color: CREAM, letterSpacing: "0.06em" }}>
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </div>
            <div style={{ fontFamily: FONT_H, fontSize: "0.7rem", fontWeight: 400, color: AMBER, letterSpacing: "0.55em", marginTop: 6, textTransform: "uppercase" }}>
              <GenericEditableText sectionId={sectionId} field="siteTagline" value={siteTagline} tag="span" />
            </div>
          </a>
          <p style={{ fontSize: "0.88rem", color: MUTED, lineHeight: 1.75, margin: "0 0 28px", maxWidth: 320 }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { href: instagram, label: "Instagram", inner: <><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></> },
              { href: facebook,  label: "Facebook",  inner: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /> },
            ].map(({ href, label, inner }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                className="c02-footer-social"
                style={{
                  width: 38, height: 38, borderRadius: "50%",
                  border: `1px solid ${BORDER}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: CREAM, textDecoration: "none",
                  transition: "border-color .2s, color .2s, background-color .2s",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {inner}
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Col 2: navigace */}
        <div>
          <div style={{ fontFamily: FONT_B, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: AMBER, marginBottom: 22, display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 18, height: 1, backgroundColor: AMBER }} />
            Navigace
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {links.map((l, i) => (
              <a key={i} href={l.href ?? "#"}
                className="c02-footer-link"
                style={{
                  fontFamily: FONT_B, fontSize: "0.88rem", color: CREAM,
                  textDecoration: "none", opacity: 0.82,
                  transition: "color .2s, opacity .2s, transform .2s",
                  display: "inline-flex", alignItems: "center", gap: 8, width: "fit-content",
                }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label ?? ""} tag="span" />
              </a>
            ))}
          </nav>
        </div>

        {/* Col 3: kontakt */}
        <div>
          <div style={{ fontFamily: FONT_B, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: AMBER, marginBottom: 22, display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 18, height: 1, backgroundColor: AMBER }} />
            Kontakt
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: "0.86rem", color: MUTED, lineHeight: 1.65 }}>
              <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
            </div>
            <a href={`tel:${phone.replace(/\s/g, "")}`}
              className="c02-footer-link"
              style={{ fontSize: "0.92rem", fontWeight: 600, color: CREAM, textDecoration: "none", transition: "color .2s" }}
            >
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
            <a href={`mailto:${email}`}
              className="c02-footer-link"
              style={{ fontSize: "0.86rem", color: MUTED, textDecoration: "none", transition: "color .2s" }}
            >
              <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
            </a>
          </div>
        </div>

        {/* Col 4: hodiny */}
        <div>
          <div style={{ fontFamily: FONT_B, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: AMBER, marginBottom: 22, display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 18, height: 1, backgroundColor: AMBER }} />
            Otevřeno
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {hours.map((h, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: "0.86rem" }}>
                <span style={{ color: MUTED }}>{h.days}</span>
                <span style={{ color: CREAM, fontWeight: 600 }}>{h.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div style={{ borderTop: `1px solid ${BORDER}` }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          padding: "22px clamp(24px,5vw,60px)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 16, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: "0.78rem", color: MUTED }}>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </span>
          <WeberoCredit />
        </div>
      </div>

      <style>{`
        .c02-footer-social:hover {
          color: ${NAVY} !important;
          background-color: ${AMBER};
          border-color: ${AMBER} !important;
        }
        .c02-footer-link:hover {
          color: ${AMBER} !important;
          opacity: 1 !important;
        }
        @media (max-width: 900px) {
          footer .c02-footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 520px) {
          footer .c02-footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}

// ── clinic-03-footer ───────────────────────────────────────────────────────
function FooterClinic03({ content, sectionId }: { content: Record<string,unknown>; sectionId: number }) {
  const GOLD  = "#97855F";
  const GOLD_H = "#82734f";
  const WHITE = "#ffffff";
  const BG    = "#1A1A1A";
  const MUTED = "rgba(255,255,255,0.45)";
  const LIGHT = "rgba(255,255,255,0.7)";
  const SANS  = "'DM Sans', Arial, sans-serif";
  const SERIF = "'Cormorant Garamond', Georgia, serif";

  const siteName  = String(content.siteName  ?? "Diamond Look");
  const tagline   = String(content.tagline   ?? "Klinika estetické medicíny s více než 15letou tradicí. Prémiová péče v srdci Prahy.");
  const address   = String(content.address   ?? "Pařížská 28, 110 00 Praha 1");
  const phone     = String(content.phone     ?? "+420 222 888 999");
  const email     = String(content.email     ?? "recepce@diamondlook.cz");
  const hours     = String(content.hours     ?? "Po–Pá 8:00–19:00, So 9:00–14:00");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} Diamond Look s.r.o. Všechna práva vyhrazena.`);
  const instagram = String(content.instagram ?? "https://instagram.com/diamondlook");
  const facebook  = String(content.facebook  ?? "https://facebook.com/diamondlook");

  type NavLink = { label: string; href: string };
  const links = (content.links as NavLink[]) ?? [];

  return (
    <footer data-template="clinic-03" style={{ backgroundColor: BG, fontFamily: SANS }}>
      {/* Gold top line */}
      <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(48px, 6vw, 80px) clamp(20px, 4vw, 56px) 40px" }}>

        {/* Top: diamond monogram + siteName */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <svg width="28" height="28" viewBox="0 0 30 30" aria-hidden style={{ marginBottom: 16 }}>
            <path d="M15 2 L28 15 L15 28 L2 15 Z" fill="none" stroke={GOLD} strokeWidth="1" />
            <path d="M15 9 L21 15 L15 21 L9 15 Z" fill={GOLD} opacity="0.35" />
          </svg>
          <div style={{ fontFamily: SERIF, fontSize: "clamp(1.2rem, 2vw, 1.5rem)", fontWeight: 300, fontStyle: "italic", color: WHITE, letterSpacing: "0.08em", marginBottom: 10 }}>
            <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
          </div>
          <div style={{ width: 40, height: 1, backgroundColor: `${GOLD}40`, margin: "0 auto 16px" }} />
          <p style={{ fontFamily: SANS, fontSize: "0.8rem", color: MUTED, lineHeight: 1.7, margin: "0 auto", maxWidth: 400 }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
        </div>

        {/* 3-col grid */}
        <div className="c03-footer-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "clamp(32px, 4vw, 56px)", borderTop: `1px solid rgba(255,255,255,0.06)`, paddingTop: 40 }}>

          {/* Col 1: Navigace */}
          <div>
            <div style={{ fontSize: "0.6rem", fontWeight: 500, color: GOLD, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>Navigace</div>
            <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {links.map((l, i) => (
                <a key={i} href={l.href} className="c03-footer-link"
                  style={{ fontFamily: SANS, fontSize: "0.82rem", color: MUTED, textDecoration: "none", transition: "color 0.2s ease" }}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              ))}
            </nav>
          </div>

          {/* Col 2: Kontakt */}
          <div>
            <div style={{ fontSize: "0.6rem", fontWeight: 500, color: GOLD, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>Kontakt</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { val: address, field: "address", d: "M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" },
                { val: phone,   field: "phone",   d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5 13a19.79 19.79 0 0 1-3-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.73.32 1.44.58 2.12a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.68.26 1.39.46 2.12.58A2 2 0 0 1 22 16.92z" },
                { val: email,   field: "email",   d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" },
                { val: hours,   field: "hours",   d: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" },
              ].map(({ val, field, d }, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3, opacity: 0.7 }}>
                    <path d={d}/>
                  </svg>
                  <span style={{ fontSize: "0.82rem", color: MUTED, lineHeight: 1.55 }}>
                    <GenericEditableText sectionId={sectionId} field={field} value={val} tag="span" />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Col 3: Sociální sítě */}
          <div>
            <div style={{ fontSize: "0.6rem", fontWeight: 500, color: GOLD, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>Sledujte nás</div>
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              {[
                { href: instagram, label: "Instagram", icon: <><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></> },
                { href: facebook,  label: "Facebook",  icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/> },
              ].map(({ href, label, icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="c03-footer-social"
                  style={{ width: 38, height: 38, border: `1px solid rgba(255,255,255,0.1)`, display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, transition: "all 0.25s ease" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                </a>
              ))}
            </div>
            <GenericEditableText sectionId={sectionId} field="socialNote" value={
              String(content.socialNote ?? "Sledujte naše proměny a novinky ze světa estetické medicíny.")
            } tag="p"
              style={{ fontSize: "0.78rem", color: MUTED, lineHeight: 1.65, margin: 0, maxWidth: 260 }}
            />
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div style={{ borderTop: `1px solid rgba(255,255,255,0.06)`, padding: "18px clamp(20px, 4vw, 56px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: "0.72rem", color: `rgba(255,255,255,0.3)` }}>
          <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
        </span>
        <WeberoCredit />
      </div>
    </footer>
  );
}

// ── fitness-01-footer ─────────────────────────────────────────────────────────
// Luxe Warm Physio Sanctuary — cocoa-dark footer se signature quote pull
// Top row: brand blok (Instrument Serif italic name + tagline + italic quote pull) + Menu + Kontakt/Studio + Social
// Bottom bar: copyright + legal links + WeberoCredit
// ─────────────────────────────────────────────────────────────────────────────
function FooterFitness01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const siteName        = String(content.siteName        ?? "Adam Vítek");
  const tagline         = String(content.tagline         ?? "Fyzio · Osobní trénink");
  const quote           = String(content.quote           ?? "");
  const phone           = String(content.phone           ?? "");
  const email           = String(content.email           ?? "");
  const address         = String(content.address         ?? "");
  const city            = String(content.city            ?? "");
  const hours           = String(content.hours           ?? "");
  const fbUrl           = String(content.facebookUrl     ?? "");
  const igUrl           = String(content.instagramUrl    ?? "");
  const menuHeading     = String(content.menuHeading     ?? "Menu");
  const contactHeading  = String(content.contactHeading  ?? "Kontakt & studio");
  const socialHeading   = String(content.socialHeading   ?? "Sledujte mě");
  const copyright       = String(content.copyright       ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);
  const siteMode        = String((content as { siteMode?: string }).siteMode ?? "multipage");
  const links           = (content.links as Array<{ label: string; href: string }>) ?? [];
  const legalLinks      = (content.legalLinks as Array<{ label: string; href: string }>) ?? [];

  const resolveHref = (href: string) => {
    if (!href) return href;
    if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return href;
    if (siteMode === "onepage") {
      if (href === "/") return "/";
      return "/#" + href.replace(/^\//, "");
    }
    return href;
  };

  return (
    <footer className="fit01-footer" data-template="fitness-01">
      {/* Ambient warm glow */}
      <div className="fit01-footer-glow" aria-hidden="true" />
      {/* Decorative arc top-right */}
      <svg className="fit01-footer-arc" width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
        <path d="M 10 110 A 100 100 0 0 1 110 10" stroke="#AD8A72" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
        <path d="M 30 110 A 80 80 0 0 1 110 30"   stroke="#AD8A72" strokeWidth="1.2" strokeLinecap="round" opacity="0.2" />
      </svg>

      <div className="fit01-footer-inner">
        <div className="fit01-footer-grid">
          {/* Brand column */}
          <div className="fit01-footer-brand">
            <div className="fit01-footer-name">
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </div>
            <div className="fit01-footer-tagline">
              <span className="fit01-tagline-mark fit01-tagline-mark-dark" aria-hidden="true" />
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </div>
            {quote && (
              <p className="fit01-footer-quote">
                <span className="fit01-footer-quote-mark" aria-hidden="true">&ldquo;</span>
                <GenericEditableText sectionId={sectionId} field="quote" value={quote} tag="span" />
              </p>
            )}
          </div>

          {/* Menu */}
          {links.length > 0 && (
            <div className="fit01-footer-col">
              <div className="fit01-footer-h">
                <GenericEditableText sectionId={sectionId} field="menuHeading" value={menuHeading} tag="span" />
              </div>
              <ul className="fit01-footer-list">
                {links.map((l, i) => (
                  <li key={i}>
                    <a href={resolveHref(l.href)} className="fit01-footer-link">
                      <span className="fit01-footer-link-arrow" aria-hidden="true">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4h7M5 1l3 3-3 3"/></svg>
                      </span>
                      <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact/Studio */}
          <div className="fit01-footer-col">
            <div className="fit01-footer-h">
              <GenericEditableText sectionId={sectionId} field="contactHeading" value={contactHeading} tag="span" />
            </div>
            <ul className="fit01-footer-contact-list">
              {phone && (
                <li>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="fit01-footer-c-value">
                    <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="fit01-footer-c-value">
                    <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                  </a>
                </li>
              )}
              {(address || city) && (
                <li className="fit01-footer-c-address">
                  {address && (
                    <div>
                      <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                    </div>
                  )}
                  {city && (
                    <div className="fit01-footer-c-muted">
                      <GenericEditableText sectionId={sectionId} field="city" value={city} tag="span" />
                    </div>
                  )}
                </li>
              )}
              {hours && (
                <li className="fit01-footer-c-hours">
                  <span className="fit01-footer-hours-dot" aria-hidden="true" />
                  <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
                </li>
              )}
            </ul>
          </div>

          {/* Social */}
          {(fbUrl || igUrl) && (
            <div className="fit01-footer-col">
              <div className="fit01-footer-h">
                <GenericEditableText sectionId={sectionId} field="socialHeading" value={socialHeading} tag="span" />
              </div>
              <div className="fit01-footer-socials">
                {fbUrl && (
                  <a href={fbUrl} target="_blank" rel="noopener noreferrer" className="fit01-footer-social" aria-label="Facebook">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12A10 10 0 1 0 10.42 21.88v-6.98H7.9V12h2.52V9.84c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.9h-2.34v6.98A10 10 0 0 0 22 12z"/></svg>
                    <span>Facebook</span>
                  </a>
                )}
                {igUrl && (
                  <a href={igUrl} target="_blank" rel="noopener noreferrer" className="fit01-footer-social" aria-label="Instagram">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
                    <span>Instagram</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="fit01-footer-bottom">
          <div className="fit01-footer-copyright">
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </div>
          <div className="fit01-footer-legal">
            {legalLinks.map((l, i) => (
              <a key={i} href={resolveHref(l.href)} className="fit01-footer-legal-link">
                <GenericEditableText sectionId={sectionId} field={`legalLinks.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </div>
          <div className="fit01-footer-webero">
            <WeberoCredit />
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── fitness-02-footer ─────────────────────────────────────────────────────────
// Black 3-col + pink border-top — 1:1 fitnessvictory.cz
// Col1: logo img + tagline + social (FB/IG pink icons)
// Col2: nav links
// Col3: contact (tel/email/address/hours)
// Bottom copyright #C3C3C3
// ─────────────────────────────────────────────────────────────────────────────
function FooterFitness02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const siteName  = String(content.siteName  ?? "Power Fitness");
  const tagline   = String(content.tagline   ?? "Moderní fitness studia v Praze");
  const logoUrl   = String(content.logoUrl   ?? "");
  const phone     = String(content.phone     ?? "704 111 222");
  const email     = String(content.email     ?? "info@demo.cz");
  const address   = String(content.address   ?? "Ukázková 123, 110 00 Praha 1");
  const hours     = String(content.hours     ?? "Po–Pá 6:00–22:00, So–Ne 8:00–20:00");
  const fbUrl     = String(content.facebookUrl  ?? "https://facebook.com/demo");
  const igUrl     = String(content.instagramUrl ?? "https://instagram.com/demo");
  const copyright = String(content.copyright   ?? `© ${new Date().getFullYear()} Power Fitness. Všechna práva vyhrazena.`);
  const links     = (content.links as Array<{ label: string; href: string }>) ?? [];
  const siteMode  = String((content as { siteMode?: string }).siteMode ?? "multipage");

  const BG     = "#000000";
  const ACCENT = "#FF5500";
  const WHITE  = "#FFFFFF";
  const MUTED  = "#C3C3C3";
  const FONT_H = "'Archivo Black', sans-serif";
  const FONT_B = "'Montserrat', sans-serif";

  const resolveHref = (href: string) => {
    if (!href) return href;
    if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return href;
    if (siteMode === "onepage") return href === "/" ? "/" : "/#" + href.replace(/^\//, "");
    return tenantSlug ? `/demo/${tenantSlug}${href === "/" ? "" : href}` : href;
  };

  const FbIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
  const IgIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
    </svg>
  );

  return (
    <footer
      className="fitness02-footer"
      style={{
        backgroundColor: BG,
        borderTop: `2px solid ${ACCENT}`,
        fontFamily: FONT_B,
        position: "relative",
        overflow: "hidden",
      }}
      data-template="fitness-02"
      data-section="fitness-02-footer"
      {...(isAdmin ? {} : {})}
    >
      <div aria-hidden="true" className="fitness02-grain" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04, mixBlendMode: "overlay" }} />

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "80px 40px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1.4fr", gap: 72 }} className="fitness02-footer-grid">
          {/* Col1 — logo + tagline + social */}
          <div>
            {logoUrl ? (
              <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} className="relative" style={{ display: "inline-block", marginBottom: 20 }}>
                <img loading="lazy" src={logoUrl} alt={siteName} style={{ height: 44, width: "auto", objectFit: "contain", display: "block" }} />
              </GenericEditableImage>
            ) : (
              <div style={{ fontSize: 22, color: WHITE, fontFamily: FONT_H, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 20, display: "inline-flex", alignItems: "baseline", gap: 4 }}>
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
                <span aria-hidden="true" style={{ color: ACCENT }}>.</span>
              </div>
            )}
            <p style={{ fontSize: 14, fontWeight: 400, color: MUTED, marginBottom: 28, lineHeight: 1.65, maxWidth: 340 }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              {fbUrl && (
                <a href={fbUrl} aria-label="Facebook" className="fitness02-footer-social"
                  style={{
                    color: ACCENT, width: 40, height: 40, border: `1px solid ${ACCENT}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.35s cubic-bezier(0.22,0.61,0.36,1), color 0.35s cubic-bezier(0.22,0.61,0.36,1), transform 0.35s cubic-bezier(0.22,0.61,0.36,1)",
                  }}
                >
                  <FbIcon />
                </a>
              )}
              {igUrl && (
                <a href={igUrl} aria-label="Instagram" className="fitness02-footer-social"
                  style={{
                    color: ACCENT, width: 40, height: 40, border: `1px solid ${ACCENT}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.35s cubic-bezier(0.22,0.61,0.36,1), color 0.35s cubic-bezier(0.22,0.61,0.36,1), transform 0.35s cubic-bezier(0.22,0.61,0.36,1)",
                  }}
                >
                  <IgIcon />
                </a>
              )}
            </div>
          </div>

          {/* Col2 — nav links */}
          <nav>
            <div className="fitness02-footer-heading" style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <span aria-hidden="true" style={{ display: "inline-block", width: 24, height: 2, background: ACCENT }} />
              <span style={{ fontSize: 12, letterSpacing: "0.28em", color: ACCENT, textTransform: "uppercase", fontFamily: FONT_H }}>Navigace</span>
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {links.map((l, i) => (
                <li key={i}>
                  <a href={resolveHref(l.href)} className="fitness02-footer-link" style={{
                    color: MUTED, fontSize: 14, textDecoration: "none",
                    letterSpacing: "0.08em",
                    transition: "color 0.35s ease, padding-left 0.35s cubic-bezier(0.22,0.61,0.36,1)",
                    display: "inline-block",
                  }}>
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Col3 — contact */}
          <div>
            <div className="fitness02-footer-heading" style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <span aria-hidden="true" style={{ display: "inline-block", width: 24, height: 2, background: ACCENT }} />
              <span style={{ fontSize: 12, letterSpacing: "0.28em", color: ACCENT, textTransform: "uppercase", fontFamily: FONT_H }}>Kontakt</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {phone && (
                <a href={`tel:${phone.replace(/\s/g,"")}`} className="fitness02-footer-contact" style={{
                  fontSize: 14, color: MUTED, textDecoration: "none",
                  letterSpacing: "0.06em",
                  transition: "color 0.35s ease",
                }}>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="fitness02-footer-contact" style={{
                  fontSize: 14, color: MUTED, textDecoration: "none",
                  letterSpacing: "0.06em",
                  transition: "color 0.35s ease",
                }}>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              )}
              {address && (
                <div style={{ fontSize: 14, color: MUTED, letterSpacing: "0.03em", lineHeight: 1.55 }}>
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                </div>
              )}
              {hours && (
                <div style={{ fontSize: 13, color: MUTED, letterSpacing: "0.06em", marginTop: 6, opacity: 0.85, lineHeight: 1.55 }}>
                  <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar — copyright + WeberoCredit */}
        <div className="fitness02-footer-bottom" style={{
          borderTop: "1px solid rgba(255,85,0,0.28)",
          marginTop: 56, paddingTop: 26,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20,
          fontSize: 12, color: MUTED,
          letterSpacing: "0.1em",
        }}>
          <span style={{ opacity: 0.8 }}>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </span>
          <WeberoCredit />
        </div>
      </div>
    </footer>
  );
}

// ── fyzio-01-footer ───────────────────────────────────────────────────────────
// Navy #1f2d69 bg, border-top 3px solid #10d15d
// 4-col: SVG logo+tagline+social vlevo / Služby linky / Informace linky / Kontakt info
// Teal #6bbea1 H4 nadpisy; bottom copyright bílý
// ─────────────────────────────────────────────────────────────────────────────
function FooterFyzio01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Link = { label: string; href: string };
  const siteName       = String(content.siteName       ?? "Demo Fyzio Klinika");
  const logoUrl        = String(content.logoUrl        ?? "");
  const tagline        = String(content.tagline        ?? "Fyzioterapie v centru Prahy");
  const phone          = String(content.phone          ?? "704 123 456");
  const email          = String(content.email          ?? "info@demo.cz");
  const address        = String(content.address        ?? "Ukázková 123, 110 00 Praha 1");
  const hours          = String(content.hours          ?? "Po–Pá 7:00–20:00");
  const fbUrl          = String(content.facebookUrl    ?? "https://facebook.com/demo");
  const igUrl          = String(content.instagramUrl   ?? "https://instagram.com/demo");
  const copyright      = String(content.copyright      ?? `© ${new Date().getFullYear()} Demo Fyzio Klinika. Všechna práva vyhrazena.`);
  const links          = (content.links         as Link[]) ?? [];
  const linksServices  = (content.linksServices  as Link[]) ?? [];
  const linksInfo      = (content.linksInfo      as Link[]) ?? [];

  const NAVY   = "#1f2d69";
  const GREEN  = "#10d15d";
  const TEAL   = "#6bbea1";
  const WHITE  = "#ffffff";
  const MUTED  = "rgba(255,255,255,0.6)";
  const MONT   = "'Montserrat', sans-serif";
  const SANS   = "'Open Sans', sans-serif";

  const logoSrc = logoUrl
    ? logoUrl.replace(/(-white)?\.svg$/, "-white.svg")
    : demoLogoDataUrl(siteName);

  return (
    <footer data-template="fyzio-01" style={{ backgroundColor: NAVY, borderTop: `3px solid ${GREEN}`, fontFamily: SANS }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 32px 32px" }}>
        {/* 4-col grid */}
        <div className="fyzio01-footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", gap: 48, marginBottom: 56 }}>

          {/* COL 1 — logo + tagline + social */}
          <div>
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoSrc} alt={siteName} className="relative overflow-hidden" style={{ display: "inline-block", marginBottom: 16 }}>
              <OptimizedPicture src={logoSrc} alt={siteName} imgStyle={{ width: 207, height: 55, objectFit: "contain" }} />
            </GenericEditableImage>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7, marginBottom: 24, maxWidth: 260 }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            {/* Social */}
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { href: fbUrl, label: "Facebook", icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/> },
                { href: igUrl, label: "Instagram", icon: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></> },
              ].map((s, i) => (
                <a key={i} href={s.href} aria-label={s.label} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, textDecoration: "none", transition: "color 0.2s, border-color 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = WHITE; e.currentTarget.style.borderColor = WHITE; }}
                  onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={i === 0 ? "currentColor" : "none"} stroke={i === 1 ? "currentColor" : "none"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                </a>
              ))}
            </div>
          </div>

          {/* COL 2 — Navigace */}
          <div>
            <h4 style={{ fontFamily: MONT, fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: TEAL, marginBottom: 20 }}>Navigace</h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {links.map((l, i) => (
                <li key={i}>
                  <a href={l.href} style={{ fontSize: 14, color: MUTED, textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                    onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                  ><GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" /></a>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 3 — Služby / Info */}
          <div>
            <h4 style={{ fontFamily: MONT, fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: TEAL, marginBottom: 20 }}>Služby</h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {(linksServices.length ? linksServices : linksInfo).map((l, i) => (
                <li key={i}>
                  <a href={l.href} style={{ fontSize: 14, color: MUTED, textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                    onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                  ><GenericEditableText sectionId={sectionId} field={`linksServices.${i}.label`} value={l.label} tag="span" /></a>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 4 — Kontakt */}
          <div>
            <h4 style={{ fontFamily: MONT, fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: TEAL, marginBottom: 20 }}>Kontakt</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.75a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z"/>, text: `+420 ${phone}`, href: `tel:+420${phone.replace(/\s/g,"")}` },
                { icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>, text: email, href: `mailto:${email}` },
                { icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>, text: address, href: "#" },
                { icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>, text: hours, href: "#" },
              ].map((item, i) => (
                <a key={i} href={item.href} style={{ display: "flex", alignItems: "flex-start", gap: 10, color: MUTED, textDecoration: "none", fontSize: 14, lineHeight: 1.5, transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                  onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>{item.icon}</svg>
                  <span>{item.text}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 24, display: "flex", justifyContent: "center" }}>
          <p style={{ fontSize: 13, color: MUTED, fontFamily: SANS }}>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </p>
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) { .fyzio01-footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; } }
        @media (max-width: 560px)  { .fyzio01-footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
}

// ── fyzio-02-footer ───────────────────────────────────────────────────────────
// Navy #1a2e4a bg, 3-col: brand + tagline | navigace | kontakt
// Logo, zlatá čára separator, copyright
// ─────────────────────────────────────────────────────────────────────────────
function FooterFyzio02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  type Link = { label: string; href: string };
  const siteName  = String(content.siteName  ?? "Demo Reset Fyzio");
  const logoUrl   = String(content.logoUrl   ?? "/templates/fyzio-02/logo.svg");
  const tagline   = String(content.tagline   ?? "Zbavte se omezení a bolesti.");
  const phone     = String(content.phone     ?? "704 123 456");
  const email     = String(content.email     ?? "email@demo.cz");
  const address   = String(content.address   ?? "Ukázková 123, 110 00 Praha 1");
  const hours     = String(content.hours     ?? "Po–Pá 8:00–20:00");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);
  const links     = (content.links as Link[]) ?? [];

  const NAVY  = "#1a2e4a";
  const GOLD  = "#c9a84c";
  const WHITE = "#ffffff";
  const MUTED = "rgba(255,255,255,0.55)";
  const SERIF = "'DM Serif Display', serif";
  const SANS  = "'Plus Jakarta Sans', sans-serif";

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <footer data-template="fyzio-02" style={{ backgroundColor: NAVY, fontFamily: SANS }}>
      <style>{`
        .f02-footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 48px; max-width: 1100px; margin: 0 auto; padding: 64px 24px 48px; }
        @media(max-width: 860px) { .f02-footer-grid { grid-template-columns: 1fr 1fr !important; gap: 36px !important; } }
        @media(max-width: 520px) { .f02-footer-grid { grid-template-columns: 1fr !important; } }
        .f02-footer-link { color: ${MUTED}; font-family: ${SANS}; font-size: 14px; text-decoration: none; transition: color 0.15s; line-height: 2; display: block; }
        .f02-footer-link:hover { color: ${GOLD}; }
      `}</style>

      <div className="f02-footer-grid">
        {/* Brand */}
        <div>
          <a href={resolve("/")} aria-label={siteName} style={{ display: "inline-block", marginBottom: 20 }}>
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl.replace(/logo\.svg$/, "logo-light.svg")} alt={siteName} className="relative overflow-hidden" style={{ height: 44, width: "auto" }}>
              <img loading="lazy" src={logoUrl.replace(/logo\.svg$/, "logo-light.svg")} alt={siteName} style={{ height: 44, width: "auto", display: "block" }} />
            </GenericEditableImage>
          </a>
          <p style={{ fontFamily: SANS, fontSize: 14, color: MUTED, lineHeight: 1.75, maxWidth: 260, marginBottom: 24 }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          {/* Social */}
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { href: String(content.facebookUrl ?? "#"), label: "Facebook", path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
              { href: String(content.instagramUrl ?? "#"), label: "Instagram", path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z" },
            ].map(s => (
              <a key={s.label} href={s.href} aria-label={s.label} target="_blank" rel="noopener noreferrer"
                style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, transition: "border-color 0.15s, color 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = MUTED; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {s.path.split(" M").map((d, i) => <path key={i} d={(i === 0 ? "" : "M") + d} />)}
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Navigace */}
        <div>
          <h4 style={{ fontFamily: SERIF, fontSize: "1rem", fontWeight: 400, color: WHITE, marginBottom: 20, letterSpacing: "0.02em" }}>Navigace</h4>
          <nav>
            {links.map((l, i) => (
              <a key={i} href={resolve(l.href)} className="f02-footer-link">
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>
        </div>

        {/* Kontakt */}
        <div>
          <h4 style={{ fontFamily: SERIF, fontSize: "1rem", fontWeight: 400, color: WHITE, marginBottom: 20, letterSpacing: "0.02em" }}>Kontakt</h4>
          <a href={`tel:+420${phone.replace(/\s/g, "")}`} className="f02-footer-link">
            <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
          </a>
          <a href={`mailto:${email}`} className="f02-footer-link">
            <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
          </a>
          <p style={{ fontFamily: SANS, fontSize: 14, color: MUTED, lineHeight: 1.75, marginTop: 4 }}>
            <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
          </p>
          <p style={{ fontFamily: SANS, fontSize: 14, color: MUTED, lineHeight: 1.75 }}>
            <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", maxWidth: 1100, margin: "0 auto", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <p style={{ fontFamily: SANS, fontSize: 13, color: MUTED, margin: 0 }}>
          <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
        </p>
        <div style={{ width: 32, height: 2, backgroundColor: GOLD }} />
      </div>
    </footer>
  );
}

// ── cafe-02-footer ────────────────────────────────────────────────────────────
// Cream #F7F4EF bg, gold top linka
// 3 sloupce: SVG logo (dark filtered) + tagline + FB/IG social / navigace / kontakt
// Bottom: dark copyright + IČO bar
// ─────────────────────────────────────────────────────────────────────────────
function FooterCafe02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const siteName     = String(content.siteName     ?? "Demo Café Belvedere");
  const logoUrl      = String(content.logoUrl      ?? "/templates/cafe-02/logo.svg");
  const tagline      = String(content.tagline      ?? "Vídeňská elegance v srdci Prahy — kavárna, jídlo, víno a pomalý čas.");
  const address      = String(content.address      ?? "Národní 12, 110 00 Praha 1");
  const phone        = String(content.phone        ?? "+420 700 111 222");
  const email        = String(content.email        ?? "rezervace@belvedere-demo.cz");
  const hours        = String(content.hours        ?? "Po–Ne · 8:00 – 23:00");
  const ico          = String(content.ico          ?? "12345678");
  const dic          = String(content.dic          ?? "CZ12345678");
  const newsletterLabel = String(content.newsletterLabel ?? "Novinky & víkendová menu");
  const newsletterPlaceholder = String(content.newsletterPlaceholder ?? "Váš e-mail");
  const newsletterCta = String(content.newsletterCta ?? "Odebírat");
  const links        = (content.links as Array<{ label: string; href: string }>) ?? [];
  const socials = (content.socials as Array<{ label?: string; href?: string; icon?: string }>) ?? [
    { icon: "instagram", label: "Instagram", href: String(content.instagramUrl ?? "https://instagram.com/") },
    { icon: "facebook",  label: "Facebook",  href: String(content.facebookUrl ?? "https://facebook.com/") },
    { icon: "google",    label: "Google",    href: "https://google.com/" },
  ];

  const year = new Date().getFullYear();

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

  return (
    <footer data-template="cafe-02" data-variant="cafe-02-footer" className="cafe02-footer">
      <div className="cafe02-footer__band" aria-hidden>
        <span className="cafe02-footer__band-dot" />
      </div>

      <div className="cafe02-footer__inner">
        <div className="cafe02-footer__grid">
          <div className="cafe02-footer__col cafe02-footer__col--brand">
            <a href="/" aria-label={siteName} className="cafe02-footer__brand">
              <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "flex", alignItems: "center" }}>
                <img loading="lazy" src={logoUrl} alt={siteName} className="cafe02-footer__logo" />
              </GenericEditableImage>
            </a>
            <p className="cafe02-footer__tagline">
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            <ul className="cafe02-footer__socials">
              {socials.map((s, i) => (
                <li key={i}>
                  <a href={s.href || "#"} target="_blank" rel="noopener noreferrer" aria-label={s.label || s.icon}>
                    <SocialIcon name={s.icon} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="cafe02-footer__col">
            <h4 className="cafe02-footer__heading">
              <GenericEditableText sectionId={sectionId} field="navLabel" value={String(content.navLabel ?? "Navigace")} tag="span" />
            </h4>
            <nav aria-label="Zápatí navigace">
              {links.map((l, i) => (
                <a key={i} href={l.href} className="cafe02-footer__link">
                  <span className="cafe02-footer__link-mark" aria-hidden />
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              ))}
            </nav>
          </div>

          <div className="cafe02-footer__col">
            <h4 className="cafe02-footer__heading">
              <GenericEditableText sectionId={sectionId} field="contactLabel" value={String(content.contactLabel ?? "Kontakt")} tag="span" />
            </h4>
            <div className="cafe02-footer__contact">
              <p>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </p>
              <a href={"tel:" + phone.replace(/\s+/g, "")}>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
              <a href={"mailto:" + email}>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
              <p className="cafe02-footer__contact-hours">
                <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
              </p>
            </div>
          </div>

          <div className="cafe02-footer__col cafe02-footer__col--news">
            <h4 className="cafe02-footer__heading">
              <GenericEditableText sectionId={sectionId} field="newsletterLabel" value={newsletterLabel} tag="span" />
            </h4>
            <p className="cafe02-footer__news-note">
              <GenericEditableText sectionId={sectionId} field="newsletterNote" value={String(content.newsletterNote ?? "Sezónní menu, akce a připomenutí rezervace přímo do vaší schránky.")} tag="span" />
            </p>
            <form className="cafe02-footer__news" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder={newsletterPlaceholder} aria-label={newsletterPlaceholder} className="cafe02-footer__news-input" />
              <button type="submit" className="cafe02-footer__news-btn">
                <GenericEditableText sectionId={sectionId} field="newsletterCta" value={newsletterCta} tag="span" />
              </button>
            </form>
          </div>
        </div>

        <div className="cafe02-footer__legal">
          <div className="cafe02-footer__legal-left">
            <span className="cafe02-footer__legal-mono" aria-hidden>&#10052;</span>
            <span>© {year} <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" /></span>
            <span className="cafe02-footer__legal-sep" aria-hidden />
            <span>IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" /></span>
            <span className="cafe02-footer__legal-sep" aria-hidden />
            <span>DIČ: <GenericEditableText sectionId={sectionId} field="dic" value={dic} tag="span" /></span>
          </div>
          <WeberoCredit />
        </div>
      </div>
    </footer>
  );
}

// ── restaurant-01-footer ──────────────────────────────────────────────────────
// Dark #1a0e0a bg, amber top linka
// 3 sloupce: SVG logo + tagline + FB/IG social / navigace / kontakt info
// Bottom: cream copyright + IČO bar
// ─────────────────────────────────────────────────────────────────────────────
function FooterRestaurant01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const siteName     = String(content.siteName     ?? "Ambiente Bistro");
  const logoUrl      = String(content.logoUrl      ?? "/templates/restaurant-01/logo.svg");
  const tagline      = String(content.tagline      ?? "Gastronomie jako umění i řemeslo.");
  const address      = String(content.address      ?? "Ukázková 123, 110 00 Praha 1");
  const phone        = String(content.phone        ?? "704 123 456");
  const email        = String(content.email        ?? "info@demo.cz");
  const hours        = String(content.hours        ?? "Po–Pá 9:00–18:00, So 9:00–14:00");
  const ico          = String(content.ico          ?? "12345678");
  const facebookUrl  = String(content.facebookUrl  ?? "https://facebook.com/demo");
  const instagramUrl = String(content.instagramUrl ?? "https://instagram.com/demo");
  const links        = (content.links as Array<{ label: string; href: string }>) ?? [];

  const BG    = "#1a0e0a";
  const CREAM = "#f5ede0";
  const AMBER = "#c8943f";
  const MUTED = "#a08060";
  const FONT  = "Georgia, 'Times New Roman', serif";
  const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const year  = new Date().getFullYear();

  return (
    <footer data-variant="restaurant-01-footer" style={{ backgroundColor: BG, fontFamily: SANS, borderTop: `2px solid ${AMBER}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px clamp(24px, 5vw, 64px) 40px" }}>
        <div className="r01-footer-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: "clamp(32px, 5vw, 64px)" }}>
          {/* Sloupec 1: Brand */}
          <div>
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "block", marginBottom: 20 }}>
              <img loading="lazy" src={logoUrl} alt={siteName} style={{ height: 40, display: "block" }} />
            </GenericEditableImage>
            <p style={{ fontSize: 13, fontWeight: 300, color: MUTED, lineHeight: 1.7, margin: "0 0 24px" }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            {/* Social */}
            <div style={{ display: "flex", gap: 12 }}>
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${AMBER}40`, display: "flex", alignItems: "center", justifyContent: "center", color: AMBER, textDecoration: "none", transition: "border-color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = AMBER)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = `${AMBER}40`)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${AMBER}40`, display: "flex", alignItems: "center", justifyContent: "center", color: AMBER, textDecoration: "none", transition: "border-color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = AMBER)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = `${AMBER}40`)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Sloupec 2: Navigace */}
          <div>
            <h4 style={{ fontFamily: FONT, fontSize: 14, fontWeight: 400, color: CREAM, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 20px" }}>Navigace</h4>
            <nav>
              {links.map((l, i) => (
                <a key={i} href={l.href} style={{ display: "block", fontSize: 13, fontWeight: 300, color: MUTED, textDecoration: "none", marginBottom: 10, transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = CREAM)}
                  onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              ))}
            </nav>
          </div>

          {/* Sloupec 3: Kontakt */}
          <div>
            <h4 style={{ fontFamily: FONT, fontSize: 14, fontWeight: 400, color: CREAM, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 20px" }}>Kontakt</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 300, color: MUTED, margin: 0, lineHeight: 1.5 }}>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </p>
              <a href={`tel:+420${phone.replace(/\s/g,"")}`} style={{ fontSize: 13, fontWeight: 300, color: MUTED, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = CREAM)}
                onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
              >
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
              <a href={`mailto:${email}`} style={{ fontSize: 13, fontWeight: 300, color: MUTED, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = CREAM)}
                onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
              >
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
              <p style={{ fontSize: 13, fontWeight: 300, color: MUTED, margin: 0, lineHeight: 1.5 }}>
                <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div style={{ borderTop: `1px solid rgba(200,148,63,0.2)`, padding: "16px clamp(24px, 5vw, 64px)" }}>
        <div className="r01-footer-copyright" style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>© {year} {siteName} · IČO: {ico}</p>
          <p style={{ fontSize: 11, color: `${MUTED}88`, margin: 0 }}>Vytvořeno s Webero</p>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){.r01-footer-grid{grid-template-columns:1fr!important}}
        @media(max-width:480px){.r01-footer-copyright{flex-direction:column!important;text-align:center}}
      `}</style>
    </footer>
  );
}

// ── restaurant-02-footer ──────────────────────────────────────────────────────
// Černé bg (#000), 3-col: logo+tagline vlevo | navigace | kontakt vpravo
// Copyright bar dole — Poppins, bílý text
// ─────────────────────────────────────────────────────────────────────────────
function FooterRestaurant02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const siteName = String(content.siteName ?? "Demo Hybernská");
  const logoUrl  = String(content.logoUrl  ?? "/templates/restaurant-02/logo.svg");
  const tagline  = String(content.tagline  ?? "Česká kuchyně v srdci Prahy.");
  const address  = String(content.address  ?? "");
  const phone    = String(content.phone    ?? "");
  const email    = String(content.email    ?? "");
  const hours    = String(content.hours    ?? "");
  const ico      = String(content.ico      ?? "");
  const fbUrl    = String(content.facebookUrl  ?? "");
  const igUrl    = String(content.instagramUrl ?? "");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const BLACK   = "#000000";
  const WHITE   = "#ffffff";
  const GHOST   = "rgba(255,255,255,0.55)";
  const RED     = "#c0392b";
  const POPPINS = "'Poppins', sans-serif";
  const year    = new Date().getFullYear();

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <footer data-template="restaurant-02" style={{ backgroundColor: BLACK, fontFamily: POPPINS, color: WHITE }}>
      {/* Hlavní mřížka */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(48px, 7vw, 88px) clamp(20px, 5vw, 60px) clamp(40px, 5vw, 64px)", display: "grid", gridTemplateColumns: "1.4fr 1fr 1.2fr", gap: "clamp(32px, 5vw, 72px)" }} className="r02-footer-grid">

        {/* Logo + tagline */}
        <div>
          <a href={resolve("/")} style={{ textDecoration: "none", display: "inline-block", marginBottom: 20 }}>
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "block" }}>
              <img loading="lazy" src={logoUrl} alt={siteName} style={{ height: 40, objectFit: "contain", display: "block" }} />
            </GenericEditableImage>
          </a>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: GHOST, margin: "0 0 24px", maxWidth: 240 }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          {/* Social */}
          <div style={{ display: "flex", gap: 14 }}>
            {fbUrl && (
              <a href={fbUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                style={{ color: GHOST, transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = RED)}
                onMouseLeave={e => (e.currentTarget.style.color = GHOST)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            )}
            {igUrl && (
              <a href={igUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                style={{ color: GHOST, transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = RED)}
                onMouseLeave={e => (e.currentTarget.style.color = GHOST)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            )}
          </div>
        </div>

        {/* Navigace */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: GHOST, margin: "0 0 20px" }}>Navigace</p>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {links.map((l, i) => (
              <li key={i}>
                <a
                  href={resolve(l.href)}
                  style={{ fontSize: 13, color: GHOST, textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                  onMouseLeave={e => (e.currentTarget.style.color = GHOST)}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Kontakt */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: GHOST, margin: "0 0 20px" }}>Kontakt</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {address && <p style={{ fontSize: 13, color: GHOST, margin: 0, lineHeight: 1.6 }}>{address}</p>}
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ fontSize: 13, color: GHOST, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                onMouseLeave={e => (e.currentTarget.style.color = GHOST)}
              >{phone}</a>
            )}
            {email && (
              <a href={`mailto:${email}`} style={{ fontSize: 13, color: GHOST, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                onMouseLeave={e => (e.currentTarget.style.color = GHOST)}
              >{email}</a>
            )}
            {hours && <p style={{ fontSize: 12, color: GHOST, margin: "4px 0 0", lineHeight: 1.6 }}>{hours}</p>}
            {ico && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", margin: "8px 0 0" }}>IČO: {ico}</p>}
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", maxWidth: 1200, margin: "0 auto", padding: "20px clamp(20px, 5vw, 60px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }} className="r02-footer-copyright">
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", margin: 0 }}>
          © {year} <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />. <GenericEditableText sectionId={sectionId} field="legalText" value={String(content.legalText ?? "Všechna práva vyhrazena.")} tag="span" />
        </p>
      </div>

      <style>{`
        @media(max-width:768px){ .r02-footer-grid { grid-template-columns: 1fr 1fr !important; } }
        @media(max-width:480px){ .r02-footer-grid { grid-template-columns: 1fr !important; } .r02-footer-copyright { flex-direction: column !important; text-align: center; } }
      `}</style>
    </footer>
  );
}

// ── restaurant-03-footer ──────────────────────────────────────────────────────
// Tmavá zelená (#0c351a), 3-col: logo+tagline+social | nav | kontakt+hodiny
// Zlatá (#b97d26) akcenty, serif Georgia — La Casa Latina style
// ─────────────────────────────────────────────────────────────────────────────
function FooterRestaurant03({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const DARK   = "#0d1b2a";
  const GOLD   = "#e05e3f";
  const WHITE  = "#ffffff";
  const GHOST  = "rgba(255,255,255,0.55)";
  const SERIF  = "Georgia, 'Times New Roman', serif";
  const SANS   = "'Inter', 'Helvetica Neue', Arial, sans-serif";
  const year   = new Date().getFullYear();

  const siteName = String(content.siteName ?? "La Casa Latina");
  const logoUrl  = String(content.logoUrl  ?? "/templates/restaurant-03/logo.svg");
  const tagline  = String(content.tagline  ?? "Latinskoamerická kuchyně v srdci Prahy.");
  const address  = String(content.address  ?? "");
  const phone    = String(content.phone    ?? "");
  const email    = String(content.email    ?? "");
  const hours    = String(content.hours    ?? "");
  const copyright = String(content.copyright ?? `© ${year} ${siteName}`);
  const legal    = String(content.legal    ?? "");
  const fbUrl    = String(content.facebookUrl  ?? "");
  const igUrl    = String(content.instagramUrl ?? "");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <footer data-template="restaurant-03" style={{ backgroundColor: DARK, fontFamily: SANS, color: WHITE, borderTop: "1px solid #1e3a5f" }}>
      {/* Main grid */}
      <div
        style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(48px, 7vw, 88px) clamp(20px, 5vw, 60px) clamp(40px, 5vw, 64px)", display: "grid", gridTemplateColumns: "1.4fr 1fr 1.2fr", gap: "clamp(32px, 5vw, 72px)" }}
        className="r03-footer-grid"
      >
        {/* Col 1: Logo + tagline + social */}
        <div>
          <a href={resolve("/")} style={{ textDecoration: "none", display: "inline-block", marginBottom: 20 }}>
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "block" }}>
              <img loading="lazy" src={logoUrl} alt={siteName} style={{ height: 44, objectFit: "contain", display: "block" }} />
            </GenericEditableImage>
          </a>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: GHOST, margin: "0 0 24px", maxWidth: 240, fontFamily: SERIF, fontStyle: "italic" }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          {/* Social icons */}
          <div style={{ display: "flex", gap: 14 }}>
            {fbUrl && (
              <a href={fbUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                style={{ color: GHOST, transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                onMouseLeave={e => (e.currentTarget.style.color = GHOST)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            )}
            {igUrl && (
              <a href={igUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                style={{ color: GHOST, transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                onMouseLeave={e => (e.currentTarget.style.color = GHOST)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            )}
          </div>
        </div>

        {/* Col 2: Navigation */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD, margin: "0 0 20px" }}>Navigace</p>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {links.map((l, i) => (
              <li key={i}>
                <a
                  href={resolve(l.href)}
                  style={{ fontSize: 13, color: GHOST, textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                  onMouseLeave={e => (e.currentTarget.style.color = GHOST)}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Contact + hours */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD, margin: "0 0 20px" }}>Kontakt</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {address && (
              <p style={{ fontSize: 13, color: GHOST, margin: 0, lineHeight: 1.6 }}>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </p>
            )}
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ fontSize: 13, color: GHOST, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                onMouseLeave={e => (e.currentTarget.style.color = GHOST)}
              >
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} style={{ fontSize: 13, color: GHOST, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                onMouseLeave={e => (e.currentTarget.style.color = GHOST)}
              >
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            )}
            {hours && (
              <p style={{ fontSize: 12, color: GHOST, margin: "4px 0 0", lineHeight: 1.6 }}>
                <span style={{ display: "block", color: GOLD, fontWeight: 600, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Otevírací doba</span>
                <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", maxWidth: 1200, margin: "0 auto", padding: "20px clamp(20px, 5vw, 60px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }} className="r03-footer-copyright">
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", margin: 0 }}>
          <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
        </p>
        {legal && (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="legal" value={legal} tag="span" />
          </p>
        )}
      </div>

      <style>{`
        @media(max-width:768px){ .r03-footer-grid { grid-template-columns: 1fr 1fr !important; } }
        @media(max-width:480px){ .r03-footer-grid { grid-template-columns: 1fr !important; } .r03-footer-copyright { flex-direction: column !important; text-align: center; } }
      `}</style>
    </footer>
  );
}

// ── cafe-03-footer ────────────────────────────────────────────────────────────
// Cathedral Gilded Footer — luxe redesign (2026-07-02)
// Deep noir gradient, gold top hairline + rotated diamond centered ornament,
// Great Vibes wordmark s Cormorant italic tagline nahoře centrovaně,
// 4-col grid: Návštěva (adresa + Maps) · Otevřeno (grid) · Menu (nav) · Sledujte (social),
// bottom rail: hairline + copyright + IČ + WeberoCredit link, gold arch decorative.
// ─────────────────────────────────────────────────────────────────────────────
function FooterCafe03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NOIR    = "#0d0d0d";
  const NOIR_D  = "#050505";
  const GOLD    = "#C69C60";
  const GOLD_LT = "#D8B57A";
  const GOLD_DK = "#8F6A38";
  const CREAM   = "#F5EFE4";
  const MUTED   = "rgba(245,239,228,0.55)";
  const SCRIPT  = "'Great Vibes', cursive";
  const ITAL    = "'Cormorant Garamond', 'Playfair Display', Georgia, serif";
  const SANS    = "'Inter', 'Open Sans', system-ui, sans-serif";

  const siteName  = String(content.siteName  ?? "Cathedral Café");
  const logoUrl   = String(content.logoUrl   ?? "/templates/cafe-03/logo.svg");
  const tagline   = String(content.tagline   ?? "kavárna & restaurace v srdci Starého Města");
  const address   = String(content.address   ?? "Melantrichova 15, 110 00 Praha 1");
  const mapsHref  = String(content.mapsHref  ?? "https://maps.google.com/?q=Melantrichova+15+Praha");
  const phone     = String(content.phone     ?? "+420 704 218 640");
  const phoneHref = String(content.phoneHref ?? "tel:+420704218640");
  const email     = String(content.email     ?? "hello@cathedral-cafe.cz");
  const socialFB  = String(content.socialFacebook  ?? "https://facebook.com/cathedralcafe");
  const socialIG  = String(content.socialInstagram ?? "https://instagram.com/cathedralcafe");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} Cathedral Café · Všechna práva vyhrazena`);
  const ico       = String(content.ico       ?? "IČ 07123456");
  const links     = (content.links as Array<{ label: string; href: string }>) ?? [
    { label: "Domů",       href: "/" },
    { label: "Naše menu",  href: "/nase-menu" },
    { label: "Galerie",    href: "/galerie" },
    { label: "Kontakt",    href: "/kontakt" },
  ];
  const hoursGrid = (content.hoursGrid as Array<{ day: string; time: string }>) ?? [
    { day: "Po — Čt", time: "9:00 — 22:00" },
    { day: "Pá — So", time: "9:00 — 24:00" },
    { day: "Neděle",  time: "9:00 — 21:00" },
  ];

  return (
    <footer data-template="cafe-03" className="c3ft" style={{ backgroundColor: NOIR, backgroundImage: `linear-gradient(180deg, ${NOIR} 0%, ${NOIR_D} 100%)`, fontFamily: SANS, position: "relative", overflow: "hidden" }}>
      {/* Gold top hairline with diamond ornament */}
      <div aria-hidden style={{ position: "relative", height: 1, backgroundColor: `${GOLD}66` }}>
        <span style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%) rotate(45deg)", width: 10, height: 10, backgroundColor: NOIR, border: `1px solid ${GOLD}`, display: "block" }} />
      </div>

      {/* Gothic arch watermark */}
      <svg aria-hidden width="380" height="380" viewBox="0 0 380 380" style={{ position: "absolute", right: -80, top: 60, opacity: 0.06, pointerEvents: "none" }}>
        <path d="M40 360 V 140 A 150 150 0 0 1 340 140 V 360" stroke={GOLD} strokeWidth="1" fill="none" />
        <path d="M100 360 V 180 A 90 90 0 0 1 280 180 V 360" stroke={GOLD} strokeWidth="1" fill="none" />
      </svg>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(60px, 8vw, 96px) clamp(20px, 5vw, 60px) clamp(24px, 3vw, 40px)", position: "relative", zIndex: 1 }}>
        {/* Brand row centered */}
        <div style={{ textAlign: "center", marginBottom: "clamp(40px, 5vw, 64px)" }}>
          <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "inline-flex", marginBottom: 20 }}>
            <img loading="lazy" src={logoUrl} alt={siteName} style={{ height: 60, display: "block", filter: "brightness(0) invert(1)" }} />
          </GenericEditableImage>
          <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="p">
            <p style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: "clamp(17px, 1.5vw, 21px)", color: GOLD_LT, margin: "0 auto", maxWidth: 420, letterSpacing: "0.02em" }}>— {tagline} —</p>
          </GenericEditableText>
        </div>

        {/* 4-col grid */}
        <div className="c3ft-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: "clamp(24px, 4vw, 48px)", paddingTop: 40, paddingBottom: 40, borderTop: `1px solid ${GOLD}33`, borderBottom: `1px solid ${GOLD}33` }}>
          {/* Návštěva */}
          <div>
            <h4 style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, letterSpacing: "0.36em", textTransform: "uppercase", color: GOLD, margin: "0 0 20px" }}>Návštěva</h4>
            <address style={{ fontStyle: "normal", display: "flex", flexDirection: "column", gap: 10 }}>
              <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span">
                <a href={mapsHref} target="_blank" rel="noreferrer" className="c3ft-link" style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: 17, color: CREAM, textDecoration: "none", transition: "color 0.2s" }}>{address}</a>
              </GenericEditableText>
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span">
                <a href={phoneHref} className="c3ft-link" style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: 17, color: CREAM, textDecoration: "none", transition: "color 0.2s" }}>{phone}</a>
              </GenericEditableText>
              <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span">
                <a href={`mailto:${email}`} className="c3ft-link" style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: 17, color: CREAM, textDecoration: "none", transition: "color 0.2s" }}>{email}</a>
              </GenericEditableText>
            </address>
          </div>

          {/* Otevřeno */}
          <div>
            <h4 style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, letterSpacing: "0.36em", textTransform: "uppercase", color: GOLD, margin: "0 0 20px" }}>Otevřeno</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {hoursGrid.map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontFamily: ITAL, fontStyle: "italic", fontSize: 15 }}>
                  <GenericEditableText sectionId={sectionId} field={`hoursGrid.${i}.day`} value={row.day} tag="span">
                    <span style={{ color: MUTED }}>{row.day}</span>
                  </GenericEditableText>
                  <GenericEditableText sectionId={sectionId} field={`hoursGrid.${i}.time`} value={row.time} tag="span">
                    <span style={{ color: GOLD_LT }}>{row.time}</span>
                  </GenericEditableText>
                </div>
              ))}
            </div>
          </div>

          {/* Menu (nav) */}
          <div>
            <h4 style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, letterSpacing: "0.36em", textTransform: "uppercase", color: GOLD, margin: "0 0 20px" }}>Menu</h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {links.map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="c3ft-link" style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, letterSpacing: "0.06em", color: CREAM, textDecoration: "none", transition: "color 0.2s, padding-left 0.2s" }}>
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sledujte */}
          <div>
            <h4 style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, letterSpacing: "0.36em", textTransform: "uppercase", color: GOLD, margin: "0 0 20px" }}>Sledujte</h4>
            <div style={{ display: "flex", gap: 12 }}>
              <a href={socialFB} target="_blank" rel="nofollow noreferrer" aria-label="Facebook" className="c3ft-soc" style={{ width: 40, height: 40, borderRadius: "50%", border: `1px solid ${GOLD}66`, display: "flex", alignItems: "center", justifyContent: "center", color: GOLD_LT, transition: "background-color 0.2s, color 0.2s, border-color 0.2s" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href={socialIG} target="_blank" rel="nofollow noreferrer" aria-label="Instagram" className="c3ft-soc" style={{ width: 40, height: 40, borderRadius: "50%", border: `1px solid ${GOLD}66`, display: "flex", alignItems: "center", justifyContent: "center", color: GOLD_LT, transition: "background-color 0.2s, color 0.2s, border-color 0.2s" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
              </a>
            </div>
            <p style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: 13, color: MUTED, margin: "20px 0 0", lineHeight: 1.6 }}>Novinky ze sálu, degustační večery a klavírní soirée.</p>
          </div>
        </div>

        {/* Bottom rail */}
        <div className="c3ft-legal" style={{ marginTop: 24, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span">
              <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 400, letterSpacing: "0.08em", color: "rgba(245,239,228,0.4)" }}>{copyright}</span>
            </GenericEditableText>
            {ico && (
              <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span">
                <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 400, letterSpacing: "0.08em", color: "rgba(245,239,228,0.4)" }}>{ico}</span>
              </GenericEditableText>
            )}
          </div>
          <WeberoCredit />
        </div>
      </div>

      <style>{`
        [data-template="cafe-03"].c3ft .c3ft-link:hover { color: ${GOLD_LT} !important; }
        [data-template="cafe-03"].c3ft ul .c3ft-link:hover { padding-left: 4px !important; }
        [data-template="cafe-03"].c3ft .c3ft-soc:hover { background-color: ${GOLD} !important; color: ${NOIR} !important; border-color: ${GOLD} !important; }
        @media (max-width: 900px) { [data-template="cafe-03"].c3ft .c3ft-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 520px) { [data-template="cafe-03"].c3ft .c3ft-grid { grid-template-columns: 1fr !important; } [data-template="cafe-03"].c3ft .c3ft-legal { flex-direction: column; align-items: flex-start; } }
      `}</style>
    </footer>
  );
}

// ── bakery-01-footer ──────────────────────────────────────────────────────────
// Simple light footer: logo centered + nav links + copyright line
// ─────────────────────────────────────────────────────────────────────────────
function FooterBakery01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const DARK  = "#393939";
  const MUTED = "#888888";
  const SERIF = "'Josefin Sans', 'Helvetica Neue', sans-serif";

  const logoUrl   = String(content.logoUrl   ?? "/templates/bakery-01/logo.svg");
  const siteName  = String(content.siteName  ?? "Demo Zrno Zrnko");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}`);

  type NavLink = { label?: string; href?: string };
  const links: NavLink[] = Array.isArray(content.links) ? (content.links as NavLink[]) : [];

  return (
    <footer
      style={{
        backgroundColor: "#ffffff",
        borderTop: "1px solid #e8e8e8",
        fontFamily: SERIF,
        padding: "clamp(40px, 6vw, 64px) clamp(24px, 5vw, 60px) clamp(24px, 4vw, 40px)",
        textAlign: "center",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 28 }}>
        <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "inline-block" }}>
          <img loading="lazy" src={logoUrl} alt={siteName} style={{ height: 56, display: "inline-block" }} />
        </GenericEditableImage>
      </div>

      {/* Nav links */}
      {links.length > 0 && (
        <nav style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 24px", marginBottom: 32 }}>
          {links.map((link, i) => (
            <a
              key={i}
              href={link.href ?? "#"}
              style={{
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: DARK,
                textDecoration: "none",
                opacity: 0.75,
              }}
            >
              <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label ?? ""} tag="span" />
            </a>
          ))}
        </nav>
      )}

      {/* Divider */}
      <div style={{ width: 40, height: 1, backgroundColor: "#e0e0e0", margin: "0 auto 24px" }} />

      {/* Copyright */}
      <p style={{ fontSize: 11, letterSpacing: "0.05em", color: MUTED, margin: 0, lineHeight: 1.6 }}>
        <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
      </p>
    </footer>
  );
}

// ── cafe-04-footer ────────────────────────────────────────────────────────────
// Editorial dark footer — brand column + Menu + Follow + Contact + copyright bar
// Coffee-gold hairline dividers, siteName wordmark, hover slide-in, WeberoCredit
// ─────────────────────────────────────────────────────────────────────────────
function FooterCafe04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const logoUrl   = String(content.logoUrl   ?? "/templates/cafe-04/logo.svg");
  const siteName  = String(content.siteName  ?? "Demo Coffee Room");
  const tagline   = String(content.tagline   ?? "Specialty coffee & slow mornings.");
  const menuLabel     = String(content.menuLabel     ?? "Menu");
  const followLabel   = String(content.followLabel   ?? "Sledujte");
  const contactLabel  = String(content.contactLabel  ?? "Kontakt");
  const brandLabel    = String(content.brandLabel    ?? "Coffee Room");
  const links     = (content.links as Array<{ label: string; href: string }>) ?? [];
  const contact   = (content.contact as { email?: string; phone?: string; address?: string }) ?? {};
  const social    = (content.social as { facebook?: string; instagram?: string }) ?? {};
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);
  const icoLabel  = String(content.icoLabel ?? "IČO");
  const ico       = content.ico ? String(content.ico) : null;

  return (
    <footer className="cr04-ft" data-template="cafe-04">
      <div className="cr04-ft-grid">
        {/* Brand column */}
        <div className="cr04-ft-brand">
          <a href="#top" className="cr04-ft-lockup" aria-label={siteName}>
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "block" }}>
              <img loading="lazy" src={logoUrl} alt={siteName} className="cr04-ft-logo" />
            </GenericEditableImage>
            <GenericEditableText sectionId={sectionId} field="brandLabel" value={brandLabel} tag="span" className="cr04-ft-brand-name" />
          </a>
          <p className="cr04-ft-tag">
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
        </div>

        {/* Menu links */}
        <div className="cr04-ft-col">
          <GenericEditableText sectionId={sectionId} field="menuLabel" value={menuLabel} tag="span" className="cr04-ft-head" />
          <ul className="cr04-ft-list">
            {links.map((l, i) => (
              <li key={i}>
                <a href={l.href} className="cr04-ft-link">
                  <span className="cr04-ft-link-rule" aria-hidden />
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Follow us */}
        <div className="cr04-ft-col">
          <GenericEditableText sectionId={sectionId} field="followLabel" value={followLabel} tag="span" className="cr04-ft-head" />
          <ul className="cr04-ft-list">
            {social.instagram && (
              <li>
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="cr04-ft-link">
                  <span className="cr04-ft-link-rule" aria-hidden />
                  Instagram
                </a>
              </li>
            )}
            {social.facebook && (
              <li>
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="cr04-ft-link">
                  <span className="cr04-ft-link-rule" aria-hidden />
                  Facebook
                </a>
              </li>
            )}
          </ul>
        </div>

        {/* Contact */}
        <div className="cr04-ft-col">
          <GenericEditableText sectionId={sectionId} field="contactLabel" value={contactLabel} tag="span" className="cr04-ft-head" />
          <div className="cr04-ft-contact">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="cr04-ft-line">
                <GenericEditableText sectionId={sectionId} field="contact.email" value={contact.email} tag="span" />
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="cr04-ft-line">
                <GenericEditableText sectionId={sectionId} field="contact.phone" value={contact.phone} tag="span" />
              </a>
            )}
            {contact.address && (
              <p className="cr04-ft-addr">
                <GenericEditableText sectionId={sectionId} field="contact.address" value={contact.address} tag="span" />
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="cr04-ft-bottom">
        <span className="cr04-ft-copy">
          <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          {ico && (
            <>
              {" · "}
              <GenericEditableText sectionId={sectionId} field="icoLabel" value={icoLabel} tag="span" />
              {" "}
              <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" />
            </>
          )}
        </span>
        <WeberoCredit />
      </div>
    </footer>
  );
}

// ── reality-02-footer ─────────────────────────────────────────────────────────
// Ref: fermakleri.cz footer
// Tmavé #05303a bg, 4-col: logo+nav / Prodej domu / Prodej bytu / kontakt (tel+email)
// Dolní copyright bar
// ─────────────────────────────────────────────────────────────────────────────
function FooterReality02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const siteName  = String(content.siteName  ?? "Demo FER Makléři");
  const logoUrl   = String(content.logoUrl   ?? "/templates/reality-02/logo.svg");
  const phone     = String(content.phone     ?? "704 123 456");
  const email     = String(content.email     ?? "email@demo.cz");
  const copyright = String(content.copyright ?? `© 2017–${new Date().getFullYear()} Demo FER Makléři s.r.o.`);
  const columns   = (content.columns as Array<{ title?: string; heading?: string; links: Array<{ label: string; href: string }> }>) ?? [];
  const navLinks  = (content.navLinks as Array<{ label: string; href: string }>) ?? [];

  const DARK   = "#05303a";
  const GREEN  = "#3DCE78";
  const WHITE  = "#ffffff";
  const MUTED  = "#a5b2b5";
  const FONT   = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  const resolve = (href: string) => {
    if (!tenantSlug) return href;
    if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    if (href.startsWith("#")) return href;
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
  };

  return (
    <footer data-template="reality-02" style={{ backgroundColor: DARK, fontFamily: FONT }}>
      {/* Main columns */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "56px clamp(16px, 4vw, 48px) 40px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "40px 32px" }}>

        {/* Col 1: Logo + nav links */}
        <div>
          <a href={resolve("/")} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <img loading="lazy" src={logoUrl} alt={siteName} style={{ height: 36, display: "block", flexShrink: 0 }} />
            <span style={{ color: WHITE, fontSize: 17, fontWeight: 700, lineHeight: 1.2 }}>{siteName}</span>
          </a>
          <nav>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {navLinks.map((l, i) => (
                <li key={`r02-fnav-${i}`} style={{ marginBottom: 12 }}>
                  <a href={resolve(l.href)} style={{ color: MUTED, textDecoration: "none", fontSize: 13, fontWeight: 600, transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                    onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                  >{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Col 2+: Nav columns */}
        {columns.map((col, ci) => (
          <div key={`r02-fcol-${ci}`}>
            <GenericEditableText sectionId={sectionId} field={`columns.${ci}.title`} value={col.title ?? col.heading ?? ""} tag="span" style={{ color: WHITE, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 16 }} />
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {col.links.map((l, li) => (
                <li key={`r02-flink-${ci}-${li}`} style={{ marginBottom: 10 }}>
                  <a href={resolve(l.href)} style={{ color: MUTED, textDecoration: "none", fontSize: 13, transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                    onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                  >
                    <GenericEditableText sectionId={sectionId} field={`columns.${ci}.links.${li}.label`} value={l.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Last col: Contact */}
        <div>
          <span style={{ color: WHITE, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 16 }}>Kontakt</span>
          <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ color: MUTED, textDecoration: "none", fontSize: 14, fontWeight: 600, display: "block", marginBottom: 10, transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = GREEN)}
            onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
          >
            <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
          </a>
          <a href={`mailto:${email}`} style={{ color: MUTED, textDecoration: "none", fontSize: 13, fontWeight: 600, display: "block", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = GREEN)}
            onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
          >
            <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
          </a>
        </div>
      </div>

      {/* Copyright bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "20px clamp(16px,4vw,48px)", maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <span style={{ color: MUTED, fontSize: 12 }}>
          <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
        </span>
      </div>
    </footer>
  );
}

// ── reality-03-footer ─────────────────────────────────────────────────────────
// Navy #132538 bg, tři zóny:
// 1) Agent karty — dva makléři vedle sebe s fotkou, jménem, rolí, tel, emailem
// 2) Střední pás — logo vlevo, navigační linky uprostřed, kontakt vpravo
// 3) Spodní proužek — copyright + IČO
// ─────────────────────────────────────────────────────────────────────────────
function FooterReality03({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const agents  = (content.agents  as Array<{ name: string; role: string; phone?: string; email?: string; image?: string }>) ?? [];
  const links   = (content.links   as Array<{ label: string; href: string }>) ?? [];
  const phone   = String(content.phone   ?? "");
  const email   = String(content.email   ?? "");
  const address = String(content.address ?? "");
  const ico     = String(content.ico     ?? "");

  const DARK   = "#132538";
  const OCHRE  = "#e38a6a";
  const WHITE  = "#ffffff";
  const MUTED  = "rgba(255,255,255,0.45)";
  const BORDER = "rgba(255,255,255,0.10)";
  const SANS   = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const resolve = (href: string) => {
    if (!tenantSlug || href.startsWith("#")) return href;
    if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
  };

  return (
    <footer style={{ backgroundColor: DARK, fontFamily: SANS, color: WHITE }}>

      {/* Agent cards */}
      {agents.length > 0 && (
        <div style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(48px, 7vw, 80px) clamp(20px, 4vw, 64px)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: OCHRE, letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 clamp(24px, 4vw, 40px)" }}>
              Váš realitní tým
            </p>
            <div data-r03-agents style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(agents.length, 2)}, 1fr)`, gap: 20 }}>
              {agents.map((agent, i) => (
                <div
                  key={`r03-agent-${i}`}
                  style={{ display: "flex", gap: 20, alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "clamp(20px, 3vw, 28px)", border: `1px solid ${BORDER}` }}
                >
                  {agent.image && (
                    <div style={{ width: "clamp(72px, 10vw, 96px)", height: "clamp(72px, 10vw, 96px)", borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `2px solid rgba(227,138,106,0.4)` }}>
                      <img loading="lazy" src={agent.image} alt={agent.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                    <p style={{ fontSize: "clamp(1rem, 1.4vw, 1.15rem)", fontWeight: 700, color: WHITE, margin: 0, lineHeight: 1.2 }}>{agent.name}</p>
                    <p style={{ fontSize: 12, color: OCHRE, margin: 0, fontWeight: 600, letterSpacing: "0.5px" }}>{agent.role}</p>
                    {agent.phone && (
                      <a href={`tel:${agent.phone.replace(/\s/g, "")}`} style={{ fontSize: 13, color: MUTED, textDecoration: "none", transition: "color 0.2s", marginTop: 2 }}
                        onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                        onMouseLeave={e => (e.currentTarget.style.color = MUTED)}>
                        {agent.phone}
                      </a>
                    )}
                    {agent.email && (
                      <a href={`mailto:${agent.email}`} style={{ fontSize: 13, color: MUTED, textDecoration: "none", transition: "color 0.2s" }}
                        onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                        onMouseLeave={e => (e.currentTarget.style.color = MUTED)}>
                        {agent.email}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main footer row */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(40px, 6vw, 64px) clamp(20px, 4vw, 64px)" }}>
        <div data-r03-footer-grid style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 1fr", gap: "clamp(32px, 5vw, 64px)", alignItems: "start" }}>

          {/* Logo + tagline */}
          <div>
            <a href={resolve("/")} style={{ textDecoration: "none", display: "inline-flex", flexDirection: "column", marginBottom: 16 }}>
              <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 26, fontWeight: 700, color: WHITE, lineHeight: 1.1, letterSpacing: "-0.3px" }}>Reality Premium</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: OCHRE, letterSpacing: "2.5px", marginTop: 4, textTransform: "uppercase" }}>Realitní kancelář</span>
            </a>
            <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.65, margin: 0, maxWidth: 220 }}>
              Rodinná realitní kancelář s osobním přístupem ke každému klientovi.
            </p>
          </div>

          {/* Navigace */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: OCHRE, letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 18px" }}>Navigace</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
              {links.map((l, i) => (
                <a
                  key={`r03-fl-${i}`}
                  href={resolve(l.href)}
                  style={{ fontSize: 13, color: MUTED, textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                  onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Kontakt */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: OCHRE, letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 18px" }}>Kontakt</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {address && (
                <span style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{address}</span>
              )}
              {phone && (
                <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ fontSize: 13, color: MUTED, textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                  onMouseLeave={e => (e.currentTarget.style.color = MUTED)}>
                  {phone}
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} style={{ fontSize: 13, color: MUTED, textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                  onMouseLeave={e => (e.currentTarget.style.color = MUTED)}>
                  {email}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div style={{ borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "18px clamp(20px, 4vw, 64px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontSize: 12, color: MUTED }}>
            © {new Date().getFullYear()} Reality Premium. Všechna práva vyhrazena.
          </span>
          {ico && (
            <span style={{ fontSize: 12, color: MUTED }}>IČO: {ico}</span>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          [data-r03-footer-grid] { grid-template-columns: 1fr !important; }
          [data-r03-agents]      { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}

// ── reality-01-footer ─────────────────────────────────────────────────────────
// Dark #1a3640 bg, gold (#d4a96e) top border 2px
// 3-col: SVG logo + tagline + FB/IG social pills / navigace / kontakt (adresa/tel/email/hodiny/IČO)
// Šedý copyright bar dole
// ─────────────────────────────────────────────────────────────────────────────
function FooterReality01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const siteName  = String(content.siteName  ?? "Luxusní Nemovitosti");
  const tagline   = String(content.tagline   ?? "Prémiová realitní kancelář v Praze od roku 1991.");
  const address   = String(content.address   ?? "Ukázková 123, 110 00 Praha 1");
  const phone     = String(content.phone     ?? "704 123 456");
  const email     = String(content.email     ?? "email@demo.cz");
  const ic        = String(content.ic        ?? "");
  const facebook  = String(content.facebook  ?? "");
  const instagram = String(content.instagram ?? "");
  const links     = (content.links as Array<{ label: string; href: string }>) ?? [];
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);

  const DARK  = "#1a3640";
  const GOLD  = "#d4a96e";
  const WHITE = "#ffffff";
  const MUTED = "rgba(255,255,255,0.5)";
  const FONT  = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  return (
    <footer data-template="reality-01-footer" style={{ backgroundColor: DARK, fontFamily: FONT, borderTop: `2px solid ${GOLD}` }}>
      {/* Main 3-col grid */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "56px clamp(20px, 5vw, 80px) 48px", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: "40px 48px" }} data-r01-footer-grid>

        {/* Col 1: Logo + tagline + social */}
        <div>
          {/* Wordmark logo */}
          <div style={{ marginBottom: 16 }}>
            <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="div"
              style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: WHITE, lineHeight: 1.1 }} />
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.4em", textTransform: "uppercase", color: MUTED, textAlign: "center", marginTop: 3 }}>
              NEMOVITOSTI
            </div>
          </div>
          <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="p"
            style={{ color: MUTED, fontSize: 13, lineHeight: 1.7, marginBottom: 24, maxWidth: 280 }} />
          {/* Social pills */}
          <div style={{ display: "flex", gap: 10 }}>
            {facebook && (
              <a href={facebook} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, border: `1px solid rgba(255,255,255,0.2)`, color: WHITE, textDecoration: "none", fontSize: 12, fontWeight: 600, transition: "border-color 0.2s, color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = WHITE; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                Facebook
              </a>
            )}
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, border: `1px solid rgba(255,255,255,0.2)`, color: WHITE, textDecoration: "none", fontSize: 12, fontWeight: 600, transition: "border-color 0.2s, color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = WHITE; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                Instagram
              </a>
            )}
          </div>
        </div>

        {/* Col 2: Navigace */}
        <div>
          <span style={{ color: WHITE, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 20 }}>Navigace</span>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {links.map((l, i) => (
              <li key={`r01-flink-${i}`} style={{ marginBottom: 14 }}>
                <a href={l.href}
                  style={{ color: MUTED, textDecoration: "none", fontSize: 13, fontWeight: 500, transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                  onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Kontakt */}
        <div>
          <span style={{ color: WHITE, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 20 }}>Kontakt</span>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            <li style={{ marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span"
                style={{ color: MUTED, fontSize: 13, lineHeight: 1.6 }} />
            </li>
            <li style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.34 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.55a16 16 0 0 0 6.05 6.05l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <a href={`tel:+420${phone.replace(/\s/g, "")}`}
                style={{ color: MUTED, textDecoration: "none", fontSize: 13, transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
              >
                <GenericEditableText sectionId={sectionId} field="phone" value={`+420 ${phone}`} tag="span" />
              </a>
            </li>
            <li style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <a href={`mailto:${email}`}
                style={{ color: MUTED, textDecoration: "none", fontSize: 13, transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
              >
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            </li>
            {ic && (
              <li style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                <GenericEditableText sectionId={sectionId} field="ic" value={`IČO: ${ic}`} tag="span"
                  style={{ color: MUTED, fontSize: 13 }} />
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Copyright bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "18px clamp(20px, 5vw, 80px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span"
            style={{ color: MUTED, fontSize: 12 }} />
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>Powered by Webero</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          [data-r01-footer-grid] { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 560px) {
          [data-r01-footer-grid] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}

// ── reality-04-footer ─────────────────────────────────────────────────────────
// Tmavé #1a1a1a bg; 4-col grid: logo + adresa | navigace | služby | kontakt+social
// Spodní lišta: copyright vlevo + GDPR odkaz vpravo
// ─────────────────────────────────────────────────────────────────────────────
function FooterReality04({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const siteName     = String(content.siteName     ?? "Fox Reality");
  const logoUrl      = String(content.logoUrl      ?? "");
  const address      = String(content.address      ?? "");
  const city         = String(content.city         ?? "");
  const ico          = String(content.ico          ?? "");
  const phone        = String(content.phone        ?? "");
  const email        = String(content.email        ?? "");
  const facebookUrl  = String(content.facebookUrl  ?? "");
  const instagramUrl = String(content.instagramUrl ?? "");
  const youtubeUrl   = String(content.youtubeUrl   ?? "");
  const copyright    = String(content.copyright    ?? `© ${siteName}`);
  const links        = (content.links         as Array<{ label: string; href: string }>) ?? [];
  const servicesLinks = (content.servicesLinks as Array<{ label: string; href: string }>) ?? [];

  const BG      = "#1a1a1a";
  const LINE    = "rgba(255,255,255,0.1)";
  const WHITE   = "#ffffff";
  const MUTED   = "rgba(255,255,255,0.55)";
  const GREEN   = "#21b276";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const resolve = (href: string) => {
    if (!tenantSlug || href.startsWith("http") || href.startsWith("#")) return href;
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
  };

  const ColTitle = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 18 }}>{children}</div>
  );

  const FootLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={resolve(href)} style={{ display: "block", fontFamily: SANS, fontSize: 14, color: MUTED, textDecoration: "none", marginBottom: 10, transition: "color 0.15s" }}
      onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
      onMouseLeave={e => (e.currentTarget.style.color = MUTED as string)}
    >{children}</a>
  );

  return (
    <footer style={{ backgroundColor: BG }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(48px, 6vw, 72px) clamp(16px, 3vw, 40px) 0" }}>
        <div className="r04-footer-grid">

          {/* Sloupec 1 — logo + adresa */}
          <div>
            {logoUrl ? (
              <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "block", marginBottom: 20 }}>
                <img loading="lazy" src={logoUrl} alt={siteName} style={{ height: 44, width: "auto", display: "block", filter: "brightness(0) invert(1)" }} />
              </GenericEditableImage>
            ) : (
              <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: WHITE, marginBottom: 20 }}>
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </div>
            )}
            <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED, lineHeight: 1.8 }}>
              <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /><br />
              <GenericEditableText sectionId={sectionId} field="city" value={city} tag="span" /><br />
              {ico && <>IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" /></>}
            </div>
          </div>

          {/* Sloupec 2 — navigace */}
          <div>
            <ColTitle>Navigace</ColTitle>
            {links.map((l, i) => (
              <FootLink key={i} href={l.href}>
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </FootLink>
            ))}
          </div>

          {/* Sloupec 3 — služby */}
          <div>
            <ColTitle>Služby</ColTitle>
            {servicesLinks.map((l, i) => (
              <FootLink key={i} href={l.href}>
                <GenericEditableText sectionId={sectionId} field={`servicesLinks.${i}.label`} value={l.label} tag="span" />
              </FootLink>
            ))}
          </div>

          {/* Sloupec 4 — kontakt + sociální sítě */}
          <div>
            <ColTitle>Kontakt</ColTitle>
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ display: "block", fontFamily: SANS, fontSize: 14, color: MUTED, textDecoration: "none", marginBottom: 10, transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                onMouseLeave={e => (e.currentTarget.style.color = MUTED as string)}
              >
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} style={{ display: "block", fontFamily: SANS, fontSize: 14, color: MUTED, textDecoration: "none", marginBottom: 20, transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                onMouseLeave={e => (e.currentTarget.style.color = MUTED as string)}
              >
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            )}
            {/* Sociální ikonky */}
            <div style={{ display: "flex", gap: 10 }}>
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                  style={{ width: 34, height: 34, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "background-color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = GREEN)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              )}
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                  style={{ width: 34, height: 34, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "background-color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = GREEN)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
              )}
              {youtubeUrl && (
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                  style={{ width: 34, height: 34, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "background-color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = GREEN)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
                    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Spodní lišta */}
        <div style={{ borderTop: `1px solid ${LINE}`, marginTop: "clamp(32px, 4vw, 52px)", padding: "20px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontFamily: SANS, fontSize: 12, color: MUTED }}>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </span>
          <a href="#gdpr" style={{ fontFamily: SANS, fontSize: 12, color: MUTED, textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
            onMouseLeave={e => (e.currentTarget.style.color = MUTED as string)}
          >Ochrana osobních údajů (GDPR)</a>
        </div>
      </div>

      <style>{`
        .r04-footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: clamp(24px, 3vw, 48px); }
        @media (max-width: 900px) { .r04-footer-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .r04-footer-grid { grid-template-columns: 1fr; } }
      `}</style>
    </footer>
  );
}

// ── reality-05-footer ─────────────────────────────────────────────────────────
// Zlatý quick-contact bar nahoře; tmavý 3-col (logo+tagline | nav | kontakt);
// copyright lišta #2a2a2a
// ─────────────────────────────────────────────────────────────────────────────
function FooterReality05({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const siteName         = String(content.siteName         ?? "Pavel Červenka");
  const logoUrl          = String(content.logoUrl          ?? "");
  const tagline          = String(content.tagline          ?? "");
  const quickContactText = String(content.quickContactText ?? "");
  const quickContactCta  = String(content.quickContactCta  ?? "Kontakt");
  const quickContactHref = String(content.quickContactHref ?? "#kontakt");
  const address          = String(content.address          ?? "");
  const phone            = String(content.phone            ?? "");
  const email            = String(content.email            ?? "");
  const ico              = String(content.ico              ?? "");
  const company          = String(content.company          ?? "");
  const facebook         = String(content.facebook         ?? "");
  const instagram        = String(content.instagram        ?? "");
  const copyright        = String(content.copyright        ?? `© ${siteName}`);
  const links            = (content.links as Array<{ label: string; href: string }>) ?? [];

  const GOLD  = "#CFA968";
  const DARK  = "#1c1c1c";
  const BAR   = "#2a2a2a";
  const WHITE = "#ffffff";
  const MUTED = "rgba(255,255,255,0.55)";
  const FONT  = "'Open Sans', sans-serif";

  const resolve = (href: string) => {
    if (!tenantSlug || href.startsWith("http") || href.startsWith("#")) return href;
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
  };

  const FootLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={resolve(href)}
      style={{ display: "block", fontFamily: FONT, fontSize: 14, color: MUTED, textDecoration: "none", marginBottom: 10, transition: "color 0.15s" }}
      onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
      onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
    >{children}</a>
  );

  return (
    <footer data-template="reality-05-footer" style={{ fontFamily: FONT }}>
      {/* Golden quick-contact bar */}
      <div style={{ backgroundColor: GOLD, padding: "clamp(18px,2.5vw,28px) clamp(16px,3vw,40px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <span style={{ fontSize: "clamp(14px,1.3vw,17px)", color: DARK, fontWeight: 600, maxWidth: 640 }}>
          <GenericEditableText sectionId={sectionId} field="quickContactText" value={quickContactText} tag="span" />
        </span>
        <a href={resolve(quickContactHref)}
          style={{ display: "inline-block", backgroundColor: DARK, color: WHITE, fontFamily: FONT, fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", padding: "12px 28px", transition: "opacity 0.2s", flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          <GenericEditableText sectionId={sectionId} field="quickContactCta" value={quickContactCta} tag="span" />
        </a>
      </div>

      {/* Dark 3-col body */}
      <div style={{ backgroundColor: DARK }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(44px,5.5vw,68px) clamp(16px,3vw,40px) clamp(32px,4vw,52px)" }}>
          <div className="r05-footer-grid">

            {/* Col 1 — logo + tagline */}
            <div>
              {logoUrl ? (
                <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "inline-block", marginBottom: 16 }}>
                  <img loading="lazy" src={logoUrl} alt={siteName} style={{ height: 48, width: "auto", display: "block" }} />
                </GenericEditableImage>
              ) : (
                <div style={{ fontSize: 20, fontWeight: 700, color: WHITE, marginBottom: 16 }}>
                  <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
                </div>
              )}
              {tagline && (
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, margin: 0, maxWidth: 260 }}>
                  <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
                </p>
              )}
              {/* Social icons */}
              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                    style={{ width: 36, height: 36, backgroundColor: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "background-color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = GOLD)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)")}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  </a>
                )}
                {instagram && (
                  <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                    style={{ width: 36, height: 36, backgroundColor: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "background-color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = GOLD)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)")}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Col 2 — navigation */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>Navigace</div>
              {links.map((l, i) => (
                <FootLink key={i} href={l.href}>
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </FootLink>
              ))}
            </div>

            {/* Col 3 — contact details */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>Kontakt</div>
              <div style={{ fontSize: 13, color: MUTED, lineHeight: 2 }}>
                {address && <div><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></div>}
                {phone && (
                  <div>
                    <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ color: MUTED, textDecoration: "none", transition: "color 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                      onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                    >
                      <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                    </a>
                  </div>
                )}
                {email && (
                  <div>
                    <a href={`mailto:${email}`} style={{ color: MUTED, textDecoration: "none", transition: "color 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                      onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                    >
                      <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                    </a>
                  </div>
                )}
                {ico && <div>IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" /></div>}
                {company && <div><GenericEditableText sectionId={sectionId} field="company" value={company} tag="span" /></div>}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div style={{ backgroundColor: BAR, padding: "14px clamp(16px,3vw,40px)", textAlign: "center" }}>
        <span style={{ fontSize: 12, color: MUTED, fontFamily: FONT }}>
          <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
        </span>
      </div>

      <style>{`
        .r05-footer-grid { display: grid; grid-template-columns: 1.6fr 1fr 1.4fr; gap: clamp(24px,4vw,56px); }
        @media (max-width: 768px) { .r05-footer-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .r05-footer-grid { grid-template-columns: 1fr; } }
      `}</style>
    </footer>
  );
}

// ── reality-06-footer ─────────────────────────────────────────────────────────
// Ref: jansrubar.cz — tmavě modrá #1C2B6B, agent foto + jméno + pill kontakty + SLUŽBY + NEMOVITOSTI
function FooterReality06({
  content, sectionId, tenantSlug, isAdmin,
}: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const BG      = "#1C2B6B";
  const PRIMARY = "#263A82";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const siteName    = String(content.siteName    ?? "Jan Šrubař");
  const agentImage  = String(content.agentImage  ?? "/clones/srubar/images/jan.png");
  const phone       = String(content.phone       ?? "");
  const email       = String(content.email       ?? "");
  const whatsapp    = String(content.whatsapp    ?? "");
  const copyright   = String(content.copyright   ?? `© ${new Date().getFullYear()} ${siteName}`);
  const fbUrl       = String((content.facebookUrl  as string | undefined) ?? "");
  const igUrl       = String((content.instagramUrl as string | undefined) ?? "");
  const liUrl       = String((content.linkedinUrl  as string | undefined) ?? "");
  const serviceLinks  = (content.serviceLinks  as Array<{ label: string; href: string }>) ?? [];
  const propertyLinks = (content.propertyLinks as Array<{ label: string; href: string }>) ?? [];

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <footer style={{ backgroundColor: BG, color: "#fff" }} data-template="reality-06-footer">
      <style>{`
        .r06f-grid { display: grid; grid-template-columns: auto 1fr 1fr 1fr; gap: 0 40px; align-items: start; padding: 48px 0 36px; }
        @media (max-width: 900px) { .r06f-grid { grid-template-columns: 1fr 1fr; gap: 32px 24px; } .r06f-photo-col { grid-column: 1/-1; display: flex; flex-direction: row; align-items: flex-end; gap: 20px; } }
        @media (max-width: 520px) { .r06f-grid { grid-template-columns: 1fr; } .r06f-photo-col { flex-direction: column; align-items: flex-start; } }
        .r06f-nav-link { font-family: inherit; font-size: 14px; color: rgba(255,255,255,0.72); text-decoration: none; display: block; padding: 4px 0; transition: color 0.18s; line-height: 1.4; }
        .r06f-nav-link:hover { color: #fff; }
        .r06f-col-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(255,255,255,0.38); margin: 0 0 14px; }
        .r06f-pill { display: inline-flex; align-items: center; gap: 7px; padding: 8px 15px; border-radius: 99px; font-family: inherit; font-size: 13px; font-weight: 500; text-decoration: none; box-shadow: 0 1px 4px rgba(0,0,0,0.10); white-space: nowrap; transition: opacity 0.18s, transform 0.18s; color: ${PRIMARY}; }
        .r06f-pill:hover { opacity: 0.85; transform: translateY(-1px); }
        .r06f-social { display: flex; gap: 7px; margin-top: 12px; }
        .r06f-social-btn { width: 32px; height: 32px; border-radius: 6px; background: rgba(255,255,255,0.10); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.65); text-decoration: none; transition: background 0.18s, color 0.18s; }
        .r06f-social-btn:hover { background: rgba(255,255,255,0.22); color: #fff; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <div className="r06f-grid">

          {/* Col 0 — agent photo + squircle blob */}
          <div className="r06f-photo-col" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ position: "relative", width: 148, height: 190, flexShrink: 0 }}>
              <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 128, height: 158, backgroundColor: "#3D50A8", borderRadius: "48px 48px 40px 40px" }} />
              <GenericEditableImage sectionId={sectionId} field="agentImage" src={agentImage} alt={siteName} style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)" }}>
                <img loading="lazy" src={agentImage} alt={siteName} style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 148, height: 190, objectFit: "contain", objectPosition: "bottom center", pointerEvents: "none" }} />
              </GenericEditableImage>
            </div>
          </div>

          {/* Col 1 — jméno + pill kontakty + social */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 8 }}>
            <p style={{ fontFamily: SANS, fontSize: 17, fontWeight: 700, color: "#fff", margin: "0 0 6px", lineHeight: 1.2 }}>
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </p>
            <p style={{ fontFamily: SANS, fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 10px", letterSpacing: "0.04em" }}>Realitní makléř</p>
            {phone && (
              <a href={`tel:+420${phone.replace(/\s/g,"")}`} className="r06f-pill" style={{ background: "#F8F8F0" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><line x1="11" y1="4" x2="13" y2="4"/><line x1="12" y1="17" x2="12" y2="17.01"/></svg>
                Telefon — <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="r06f-pill" style={{ background: "#F0F0F8" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            )}
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="r06f-pill" style={{ background: "#F0F8F0" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0v-1a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
                WhatsApp
              </a>
            )}
            <div className="r06f-social">
              {[
                { url: igUrl, label: "Instagram", icon: (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>) },
                { url: fbUrl, label: "Facebook", icon: (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>) },
                { url: liUrl, label: "LinkedIn", icon: (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>) },
              ].filter(s => s.url).map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="r06f-social-btn">{s.icon}</a>
              ))}
            </div>
          </div>

          {/* Col 2 — SLUŽBY */}
          <div style={{ paddingTop: 8 }}>
            <p className="r06f-col-label">Služby</p>
            {serviceLinks.map((l, i) => (
              <a key={i} href={resolve(l.href)} className="r06f-nav-link">
                <GenericEditableText sectionId={sectionId} field={`serviceLinks.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </div>

          {/* Col 3 — NEMOVITOSTI */}
          <div style={{ paddingTop: 8 }}>
            <p className="r06f-col-label">Nemovitosti</p>
            {propertyLinks.map((l, i) => (
              <a key={i} href={resolve(l.href)} className="r06f-nav-link">
                <GenericEditableText sectionId={sectionId} field={`propertyLinks.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </div>
        </div>

        {/* Copyright bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "14px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <p style={{ fontFamily: SANS, fontSize: 12, color: "rgba(255,255,255,0.38)", margin: 0 }}>{copyright}</p>
          <a href={resolve("/gdpr")} style={{ fontFamily: SANS, fontSize: 12, color: "rgba(255,255,255,0.38)", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}
          >GDPR</a>
        </div>
      </div>
    </footer>
  );
}

// ─── autoservis-02 Footer ────────────────────────────────────────────────────
function FooterAutoservis02({ content, sectionId, tenantSlug, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin?: boolean;
}) {
  const RED  = "#d82a2a";
  const DARK = "#1a1a1a";
  const SANS = "'Open Sans', Arial, sans-serif";

  const siteName   = (content.siteName   as string) || "Demo GARANT Autoservis";
  const logoUrl    = (content.logoUrl    as string) || "";
  const tagline    = (content.tagline    as string) || "";
  const email      = (content.email      as string) || "";
  const phone      = (content.phone      as string) || "";
  const address    = (content.address    as string) || "";
  const hours      = (content.hours      as string) || "";
  const copyright  = (content.copyright  as string) || `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`;
  const facebookUrl  = (content.facebookUrl  as string) || "";
  const instagramUrl = (content.instagramUrl as string) || "";
  const links        = (content.links        as Array<{ label: string; href: string }>) || [];
  const legalLinks   = (content.legalLinks   as Array<{ label: string; href: string }>) || [];
  const contactItems = [
    { field: "address", value: address, icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" },
    { field: "phone",   value: phone,   icon: "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" },
    { field: "email",   value: email,   icon: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" },
    { field: "hours",   value: hours,   icon: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" },
  ].filter(i => i.value);

  function resolve(href: string) {
    if (!tenantSlug || !href.startsWith("/")) return href;
    if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
  }

  return (
    <footer style={{ backgroundColor: DARK, borderTop: `3px solid ${RED}`, fontFamily: SANS }}>
      <div className="a02-footer-grid" style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px 32px", display: "grid", gridTemplateColumns: "1.4fr 1fr 1.2fr", gap: 48 }}>
        {/* Col 1: logo + tagline + social */}
        <div>
          {logoUrl ? (
            <img loading="lazy" src={logoUrl} alt={siteName} style={{ height: 44, marginBottom: 16 }} />
          ) : (
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: 1 }}>{siteName.split(" ")[0]}</span>
              <br />
              <span style={{ fontSize: 9, fontWeight: 600, color: RED, letterSpacing: 4, textTransform: "uppercase" }}>Autoservis</span>
            </div>
          )}
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 20 }}><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></p>
          <div style={{ display: "flex", gap: 12 }}>
            {facebookUrl && (
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer"
                style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none", transition: "background 0.18s" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = RED)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            )}
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none", transition: "background 0.18s" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = RED)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
              </a>
            )}
          </div>
        </div>

        {/* Col 2: nav links */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: RED, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 16 }}>Rychlé odkazy</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {links.map((l, i) => (
              <li key={i}>
                <a href={resolve(l.href)}
                  style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
                ><GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" /></a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: contact */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: RED, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 16 }}>Kontakt</div>
          {contactItems.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill={RED} style={{ flexShrink: 0, marginTop: 2 }}><path d={item.icon} /></svg>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
                <GenericEditableText sectionId={sectionId} field={item.field} value={item.value} tag="span" />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Copyright bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, maxWidth: 1100, margin: "0 auto" }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}><GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" /></span>
        <div style={{ display: "flex", gap: 20 }}>
          {legalLinks.map((l, i) => (
            <a key={i} href={resolve(l.href)}
              style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
            >{l.label}</a>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) { .a02-footer-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 520px) { .a02-footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
}

// ─── autoservis-01 Footer ────────────────────────────────────────────────────
// Tmavé bg #111111, orange border-top, 3-col: logo+tagline+social | nav | kontakt
function FooterAutoservis01({ content, sectionId, tenantSlug, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin?: boolean;
}) {
  const ORANGE = "#FFA500";
  const DARK   = "#111111";
  const SANS   = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const siteName    = (content.siteName    as string) || "APEX Autoservis";
  const logoUrl     = (content.logoUrl     as string) || "";
  const tagline     = (content.tagline     as string) || "";
  const email       = (content.email       as string) || "";
  const phone       = (content.phone       as string) || "";
  const address     = (content.address     as string) || "";
  const copyright   = (content.copyright   as string) || `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`;
  const facebookUrl  = (content.facebookUrl  as string) || "";
  const instagramUrl = (content.instagramUrl as string) || "";
  const links        = (content.links        as Array<{ label: string; href: string }>) || [];
  const legalLinks   = (content.legalLinks   as Array<{ label: string; href: string }>) || [];

  function resolve(href: string) {
    if (!tenantSlug || !href.startsWith("/")) return href;
    if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
  }

  const mutedText: React.CSSProperties = { fontFamily: SANS, fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 };
  const linkStyle: React.CSSProperties = { fontFamily: SANS, fontSize: 14, color: "rgba(255,255,255,0.7)", textDecoration: "none", display: "block", marginBottom: 10, transition: "color 0.18s" };

  return (
    <footer style={{ backgroundColor: DARK, borderTop: `3px solid ${ORANGE}`, fontFamily: SANS }} data-template="autoservis-01-footer">
      <style>{`
        .a01-footer-grid { display: grid; grid-template-columns: 1.6fr 1fr 1.3fr; gap: 48px; }
        @media (max-width: 768px) { .a01-footer-grid { grid-template-columns: 1fr; gap: 36px; } }
        .a01-footer-link:hover { color: #FFA500 !important; }
        .a01-footer-social:hover { background: #FFA500 !important; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px clamp(16px,4vw,48px) 32px" }}>
        <div className="a01-footer-grid">
          {/* Col 1: logo + tagline + social */}
          <div>
            {logoUrl ? (
              <img loading="lazy" src={logoUrl} alt={siteName} style={{ height: 48, marginBottom: 20 }} />
            ) : (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <span style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: SANS, fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1 }}>A</span>
                </span>
                <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                  <span style={{ fontFamily: SANS, fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>APEX</span>
                  <span style={{ display: "block", height: 2.5, backgroundColor: ORANGE, borderRadius: 1, margin: "4px 0" }} />
                  <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "3.5px" }}>AUTOSERVIS</span>
                </span>
              </div>
            )}
            {tagline && <p style={{ ...mutedText, marginBottom: 20, maxWidth: 280 }}><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></p>}
            <div style={{ display: "flex", gap: 10 }}>
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="a01-footer-social"
                  style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none", transition: "background 0.18s" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="a01-footer-social"
                  style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none", transition: "background 0.18s" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Col 2: nav links */}
          <div>
            <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: ORANGE, letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>Navigace</div>
            {links.map((l, i) => (
              <a key={i} href={resolve(l.href)} className="a01-footer-link" style={linkStyle}>
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </div>

          {/* Col 3: contact info */}
          <div>
            <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: ORANGE, letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>Kontakt</div>
            {address && <p style={{ ...mutedText, marginBottom: 12 }}><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></p>}
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="a01-footer-link" style={{ ...linkStyle, marginBottom: 8 }}>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="a01-footer-link" style={linkStyle}>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 48, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ ...mutedText, margin: 0, fontSize: 13 }}><GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" /></p>
          <div style={{ display: "flex", gap: 20 }}>
            {legalLinks.map((l, i) => (
              <a key={i} href={resolve(l.href)} className="a01-footer-link" style={{ ...linkStyle, marginBottom: 0, fontSize: 13 }}>
                <GenericEditableText sectionId={sectionId} field={`legalLinks.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── autoservis-03-footer ──────────────────────────────────────────────────────
function FooterAutoservis03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const SANS = "'Inter', 'Helvetica Neue', sans-serif";
  const ORANGE = "#f97316";

  const siteName   = (content.siteName as string)    || "Autoservis Procházka";
  const logoUrl    = (content.logoUrl as string)     || "";
  const tagline    = (content.tagline as string)     || "BMW specializace";
  const email      = (content.email as string)       || "";
  const phone      = (content.phone as string)       || "";
  const address    = (content.address as string)     || "";
  const fbUrl      = (content.facebookUrl as string) || "";
  const igUrl      = (content.instagramUrl as string)|| "";
  const links      = (content.links as Array<{ label: string; href: string }>) || [];
  const copyright  = (content.copyright as string)   || `© ${new Date().getFullYear()} ${siteName}`;

  return (
    <footer
      data-template="autoservis-03-footer"
      style={{ backgroundColor: "#111827", borderTop: "1px solid rgba(255,255,255,0.06)", fontFamily: SANS }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px 40px" }}>
        <style>{`
          .a03-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
          @media (max-width: 768px) { .a03-footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; } }
          @media (max-width: 480px) { .a03-footer-grid { grid-template-columns: 1fr; gap: 32px; } }
        `}</style>
        {/* Top 3-col */}
        <div className="a03-footer-grid">
          {/* Col 1: brand */}
          <div>
            {logoUrl
              ? <img loading="lazy" src={logoUrl} alt={siteName} style={{ height: 32, marginBottom: 12, objectFit: "contain" }} />
              : <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{siteName}</span>
            }
            <p style={{ fontSize: 13, color: "#9ca3af", margin: "8px 0 20px", lineHeight: 1.7 }}>{tagline}</p>
            {/* Social icons */}
            <div style={{ display: "flex", gap: 12 }}>
              {fbUrl && (
                <a href={fbUrl} target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", textDecoration: "none", transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(249,115,22,0.15)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {igUrl && (
                <a href={igUrl} target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", textDecoration: "none", transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(249,115,22,0.15)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Col 2: quick links */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ORANGE, margin: "0 0 20px" }}>Navigace</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {links.map((l, i) => (
                <li key={i}>
                  <a href={l.href} style={{ fontSize: 14, color: "#9ca3af", textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
                  >
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: contact */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ORANGE, margin: "0 0 20px" }}>Kontakt</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {phone && <a href={`tel:+420${phone.replace(/\s/g,"")}`} style={{ fontSize: 14, color: "#9ca3af", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
              >{phone}</a>}
              {email && <a href={`mailto:${email}`} style={{ fontSize: 14, color: "#9ca3af", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
              >{email}</a>}
              {address && <span style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.5 }}>{address}</span>}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "#6b7280" }}>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </span>
          <span style={{ fontSize: 13, color: "#374151" }}>Powered by Webero</span>
        </div>
      </div>
    </footer>
  );
}

function FooterDental01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const TEAL  = "#14a2a8";
  const DARK  = "#1c2335";
  const FONT  = "'Montserrat', 'Arial', sans-serif";

  const siteName  = String(content.siteName  ?? "Demo Dental Care");
  const tagline   = String(content.tagline   ?? "Špičková stomatologická péče v Praze.");
  const phone     = String(content.phone     ?? "+420 704 123 456");
  const email     = String(content.email     ?? "info@demo.cz");
  const address   = String(content.address   ?? "Ukázková 123, 110 00 Praha 1");
  const hours     = String(content.hours     ?? "Po–Pá 8:00–18:00");
  const fbHref    = String(content.fbHref    ?? "#");
  const igHref    = String(content.igHref    ?? "#");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);
  const links     = (content.links as { label: string; href: string }[]) ?? [];

  return (
    <footer
      data-section-type="footer"
      data-variant="dental-01-footer"
      style={{ backgroundColor: DARK, fontFamily: FONT }}
    >
      {/* Teal top border */}
      <div aria-hidden style={{ height: 4, background: `linear-gradient(90deg, ${TEAL}, #0d7a7f)` }} />

      {/* Main content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(48px,6vw,72px) clamp(20px,5vw,60px) clamp(32px,4vw,48px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(220px,100%),1fr))", gap: "clamp(32px,5vw,60px)", marginBottom: "clamp(32px,4vw,48px)" }}>

          {/* Col 1 — brand */}
          <div>
            {/* Logo — identical to NavbarDental01 */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <svg width="34" height="38" viewBox="0 0 38 42" fill="none" aria-hidden>
                <path d="M19 2C12.4 2 6 7.2 6 14.5c0 3.2 1.1 5.8 2 8C9.9 26.2 10.5 28.5 10.5 31c0 4.2 1.7 7.8 3.2 10.2.7 1.2 1.6 1.8 2.6 1.8 1.2 0 1.9-.9 2.1-2.6L19 35.5l.6 4.9c.3 1.7.9 2.6 2.1 2.6 1 0 1.9-.6 2.6-1.8 1.5-2.4 3.2-6 3.2-10.2 0-2.5.6-4.8 2.5-8.5.9-2.2 2-4.8 2-8C32 7.2 25.6 2 19 2Z" fill={TEAL}/>
                <path d="M14.5 36c0 1.5.3 3.2.8 4.6.2.6.5.9.8.9.4 0 .6-.4.7-1.1l.7-5.4h-3Z" fill={TEAL} opacity="0.6"/>
                <path d="M23.5 36h-3l.7 5.4c.1.7.3 1.1.7 1.1.3 0 .6-.3.8-.9.5-1.4.8-3.1.8-4.6Z" fill={TEAL} opacity="0.6"/>
              </svg>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", letterSpacing: "0.04em", fontFamily: FONT }}><GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" /></span>
              </div>
            </div>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: "0 0 20px" }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            {/* Social icons */}
            <div style={{ display: "flex", gap: 10 }}>
              <a href={fbHref} aria-label="Facebook" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.65)", textDecoration: "none", transition: "background 0.18s" }}
                onMouseEnter={e => (e.currentTarget.style.background = TEAL)}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href={igHref} aria-label="Instagram" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.65)", textDecoration: "none", transition: "background 0.18s" }}
                onMouseEnter={e => (e.currentTarget.style.background = TEAL)}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            </div>
          </div>

          {/* Col 2 — nav links */}
          <div>
            <h4 style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: TEAL, margin: "0 0 18px" }}>Navigace</h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {links.map((l, i) => (
                <li key={i}>
                  <a href={l.href} style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.65)", textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
                  >{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — contact */}
          <div>
            <h4 style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: TEAL, margin: "0 0 18px" }}>Kontakt</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: "M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z", href: `tel:${phone.replace(/\s/g,"")}`, value: phone, field: "phone" },
                { icon: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z", href: `mailto:${email}`, value: email, field: "email" },
                { icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z", href: undefined, value: address, field: "address" },
                { icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z", href: undefined, value: hours, field: "hours" },
              ].map(({ icon, href, value, field }) => (
                <div key={field} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={TEAL} aria-hidden style={{ flexShrink: 0, marginTop: 2 }}>
                    <path d={icon}/>
                  </svg>
                  {href ? (
                    <a href={href} style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", textDecoration: "none", lineHeight: 1.5 }}>
                      <GenericEditableText sectionId={sectionId} field={field} value={value} tag="span" />
                    </a>
                  ) : (
                    <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
                      <GenericEditableText sectionId={sectionId} field={field} value={value} tag="span" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Copyright bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </span>
          <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.2)" }}>Powered by Webero</span>
        </div>
      </div>
    </footer>
  );
}

// ── ortho-01-footer ───────────────────────────────────────────────────────────
// Slate (#244757) bg, logo vlevo, kontakt + sociální sítě, linky, copyright
// ─────────────────────────────────────────────────────────────────────────────
function FooterOrtho01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const TEAL  = "#00b7ad";
  const SLATE = "#244757";
  const FONT  = "'Inter', 'DM Sans', Arial, sans-serif";

  type Link = { label: string; href: string };

  const siteName     = String(content.siteName     ?? "Demo rovnátka");
  const logoLine1    = String(content.logoLine1    ?? "Neviditelná");
  const logoLine2    = String(content.logoLine2    ?? "Rovnátka");
  const tagline      = String(content.tagline      ?? "Neviditelná rovnátka v jakémkoli věku");
  const googleRating = String(content.googleRating ?? "4,8 z 5");
  const address      = String(content.address      ?? "");
  const phone        = String(content.phone        ?? "");
  const email        = String(content.email        ?? "");
  const facebook     = String(content.facebook     ?? "");
  const instagram    = String(content.instagram    ?? "");
  const whatsapp     = String(content.whatsapp     ?? "");
  const copyright    = String(content.copyright    ?? `© ${new Date().getFullYear()} ${siteName}`);
  const contactLabel = String(content.contactLabel ?? "Kontakt");
  const navLabel     = String(content.navLabel     ?? "Navigace");
  const links        = (content.links as Link[])   ?? [];

  const resolve = (href: string) => {
    if (!tenantSlug || !href.startsWith("/")) return href;
    if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
  };

  return (
    <footer
      data-section-type="footer"
      data-variant="ortho-01-footer"
      style={{ backgroundColor: SLATE, color: "#fff", fontFamily: FONT, padding: "clamp(48px, 6vw, 72px) 0 0" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)" }}>

        {/* Top grid: logo+tagline | kontakt | sociální sítě */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: "clamp(32px, 5vw, 64px)", marginBottom: "clamp(36px, 5vw, 56px)" }}
          className="o01-footer-grid">

          {/* Col 1: Logo + tagline + Google */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
              {/* Tooth icon — identický s navbarem */}
              <svg width="40" height="40" viewBox="0 0 36 36" fill="none" aria-hidden>
                <path d="M18 2C13.2 2 9 5.8 9 10.8c0 2.3.7 4.3 1.5 6.2 1.2 2.8 1.5 4.8 1.5 7 0 3.2 1.1 6.4 2.3 8.8.5 1 1.2 1.7 2.2 1.7 1 0 1.6-.8 1.9-2.2l.6-4 .6 4c.3 1.4.9 2.2 1.9 2.2 1 0 1.7-.7 2.2-1.7C27 30.4 27 27.2 27 24c0-2.2.3-4.2 1.5-7 .8-1.9 1.5-3.9 1.5-6.2C30 5.8 22.8 2 18 2Z" fill={TEAL}/>
                <rect x="11" y="12.5" width="14" height="3" rx="0.8" fill={TEAL} opacity=".2"/>
                <rect x="12.5" y="12.5" width="2.4" height="3" rx=".5" fill={TEAL}/>
                <rect x="16.8" y="12.5" width="2.4" height="3" rx=".5" fill={TEAL}/>
                <rect x="21.1" y="12.5" width="2.4" height="3" rx=".5" fill={TEAL}/>
              </svg>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                <span style={{ fontSize: "1.01rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.01em", fontFamily: FONT }}>
                  <GenericEditableText sectionId={sectionId} field="logoLine1" value={logoLine1} tag="span" />
                </span>
                <span style={{ fontSize: "1.01rem", fontWeight: 800, color: TEAL, letterSpacing: "-0.01em", fontFamily: FONT }}>
                  <GenericEditableText sectionId={sectionId} field="logoLine2" value={logoLine2} tag="span" />
                </span>
              </div>
            </div>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: "0 0 20px", maxWidth: 240 }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            {/* Google rating */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 14px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <span style={{ fontSize: "0.8rem", color: TEAL, fontWeight: 700 }}>
                <GenericEditableText sectionId={sectionId} field="googleRating" value={googleRating} tag="span" />
              </span>
            </div>
          </div>

          {/* Col 2: Kontakt */}
          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: TEAL, margin: "0 0 16px" }}>
              <GenericEditableText sectionId={sectionId} field="contactLabel" value={contactLabel} tag="span" />
            </p>
            {address && <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, margin: "0 0 8px" }}>
              <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
            </p>}
            {phone && <a href={`tel:${phone}`} style={{ display: "block", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", textDecoration: "none", marginBottom: 6 }}>
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>}
            {email && <a href={`mailto:${email}`} style={{ display: "block", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", textDecoration: "none", marginBottom: 20 }}>
              <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
            </a>}
            {/* Social */}
            <div style={{ display: "flex", gap: 12 }}>
              {facebook && <a href={facebook} target="_blank" rel="noopener" style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>}
              {instagram && <a href={instagram} target="_blank" rel="noopener" style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>}
              {whatsapp && <a href={whatsapp} target="_blank" rel="noopener" style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              </a>}
            </div>
          </div>

          {/* Col 3: Links */}
          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: TEAL, margin: "0 0 16px" }}>
              <GenericEditableText sectionId={sectionId} field="navLabel" value={navLabel} tag="span" />
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {links.map((l, i) => (
                <a key={i} href={resolve(l.href)} style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", textDecoration: "none", transition: "color 0.18s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}>
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20, paddingBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </span>
          <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.2)" }}>Powered by Webero</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) { .o01-footer-grid { grid-template-columns: 1fr !important; } }
        @media (min-width: 641px) and (max-width: 960px) { .o01-footer-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </footer>
  );
}

// ── ortho-02-footer ───────────────────────────────────────────────────────────
function FooterOrtho02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const BEIGE = "#B7B3A5";
  const DARK  = "#1a1a1a";
  const FONT  = "'Raleway', 'Montserrat', Arial, sans-serif";

  type Link = { label: string; href: string };

  const siteName  = String(content.siteName  ?? "Perfect Smile");
  const tagline   = String(content.tagline   ?? "Ortodoncie Praha");
  const phone     = String(content.phone     ?? "");
  const email     = String(content.email     ?? "");
  const address   = String(content.address   ?? "");
  const hours     = String(content.hours     ?? "");
  const ico       = String(content.ico       ?? "");
  const igHref    = String(content.igHref    ?? "");
  const fbHref    = String(content.fbHref    ?? "");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}`);
  const links     = (content.links as Link[]) ?? [];

  return (
    <footer
      data-section-type="footer"
      data-variant="ortho-02-footer"
      style={{ backgroundColor: DARK, color: "#fff", fontFamily: FONT, padding: "clamp(48px, 6vw, 72px) 0 0" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)" }}>

        {/* Grid: logo+tagline | kontakt | navigace | social */}
        <div className="o02-footer-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: "clamp(28px, 4vw, 56px)", marginBottom: "clamp(36px, 5vw, 56px)" }}>

          {/* Col 1: Wordmark + tagline */}
          <div>
            <div style={{ marginBottom: 18 }}>
              {/* Hidden editable handle — SVG text can't contain React children */}
              <span style={{ display: "none" }}>
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </span>
              <svg viewBox="0 0 300 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ height: 24, display: "block" }}>
                <text x="0" y="26" fontFamily="'Raleway','Helvetica Neue',Arial,sans-serif" fontWeight="300" fontSize="24" letterSpacing="6" fill={BEIGE}>{siteName.toUpperCase()}</text>
              </svg>
            </div>
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", margin: "0 0 20px", lineHeight: 1.6, maxWidth: 220 }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            {/* Social icons */}
            <div style={{ display: "flex", gap: 10 }}>
              {igHref && (
                <a href={igHref} target="_blank" rel="noopener" style={{ width: 34, height: 34, borderRadius: 2, border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.18s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = BEIGE; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
              )}
              {fbHref && (
                <a href={fbHref} target="_blank" rel="noopener" style={{ width: 34, height: 34, borderRadius: 2, border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.18s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = BEIGE; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Kontakt */}
          <div>
            <p style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: BEIGE, margin: "0 0 16px" }}>Kontakt</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {address && <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </span>}
              {phone && <a href={`tel:${phone}`} style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>}
              {email && <a href={`mailto:${email}`} style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>}
            </div>
          </div>

          {/* Col 3: Provozní doba */}
          <div>
            <p style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: BEIGE, margin: "0 0 16px" }}>Ordinační hodiny</p>
            <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
              <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
            </span>
            {ico && <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", margin: "16px 0 0" }}>IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" /></p>}
          </div>

          {/* Col 4: Navigace */}
          <div>
            <p style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: BEIGE, margin: "0 0 16px" }}>Navigace</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {links.map((l, i) => (
                <a key={i} href={l.href} style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.18s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "18px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }}>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </span>
          <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.15)" }}>Powered by Webero</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .o02-footer-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 480px) { .o02-footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
}

/* ─── FooterLawyer01 ─────────────────────────────────────────── */
function FooterLawyer01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY    = "#141760";
  const CRIMSON = "#a70336";
  const HEADING = "'Raleway','Montserrat','Helvetica Neue',Arial,sans-serif";
  const BODY    = "'Open Sans','Helvetica Neue',Arial,sans-serif";

  const siteName   = String(content.siteName  ?? "SVOBODA & PARTNERS");
  const tagline    = String(content.tagline   ?? "");
  const logoUrl    = String(content.logoUrl   ?? "");
  const email      = String(content.email     ?? "");
  const phone      = String(content.phone     ?? "");
  const address    = String(content.address   ?? "");
  const ico        = String(content.ico       ?? "");
  const copyright  = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}`);
  const links      = Array.isArray(content.links)      ? content.links      as Array<{ label: string; href: string }> : [];
  const legalLinks = Array.isArray(content.legalLinks) ? content.legalLinks as Array<{ label: string; href: string }> : [];
  const socials    = Array.isArray(content.socials)    ? content.socials    as Array<{ icon: string; href: string; label: string }> : [];

  const SocialIcon = ({ name }: { name: string }) => {
    const p = { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    if (name === "linkedin") return <svg {...p}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;
    if (name === "facebook") return <svg {...p}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
    return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>;
  };

  const displayName = siteName.replace(/^Demo\s+/i, "");

  return (
    <footer data-variant="lawyer-01-footer" style={{ backgroundColor: NAVY, color: "#fff" }}>
      <style>{`
        @media (max-width: 860px) {
          .l01-footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 540px) {
          .l01-footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Main footer body */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "64px 32px 48px" }}>
        <div
          className="l01-footer-grid"
          style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "clamp(32px,5vw,72px)" }}
        >
          {/* Brand col */}
          <div>
            {logoUrl ? (
              <img loading="lazy" src={logoUrl} alt={displayName} style={{ height: 36, marginBottom: 20, filter: "brightness(0) invert(1)" }} />
            ) : (
              <p style={{ fontFamily: HEADING, fontSize: "1.15rem", fontWeight: 700, color: "#fff", margin: "0 0 20px", letterSpacing: "0.06em" }}>
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </p>
            )}
            {tagline && (
              <p style={{ fontFamily: BODY, fontSize: "0.875rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.65, margin: "0 0 28px", maxWidth: 280 }}>
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </p>
            )}
            {/* contact info */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {phone && (
                <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ fontFamily: BODY, fontSize: "0.875rem", color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} style={{ fontFamily: BODY, fontSize: "0.875rem", color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              )}
              {address && (
                <span style={{ fontFamily: BODY, fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                </span>
              )}
              {ico && (
                <span style={{ fontFamily: BODY, fontSize: "0.8rem", color: "rgba(255,255,255,0.45)" }}>
                  IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" />
                </span>
              )}
            </div>
            {/* socials */}
            {socials.length > 0 && (
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                {socials.map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    aria-label={s.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.75)", transition: "border-color 0.18s, color 0.18s" }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = CRIMSON; el.style.color = "#fff"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = "rgba(255,255,255,0.25)"; el.style.color = "rgba(255,255,255,0.75)"; }}
                  >
                    <SocialIcon name={s.icon} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Nav links col */}
          <div>
            <p style={{ fontFamily: HEADING, fontSize: "0.78rem", fontWeight: 700, color: CRIMSON, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 20px" }}>Navigace</p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {links.map((l, i) => (
                <li key={i}>
                  <a href={l.href} style={{ fontFamily: BODY, fontSize: "0.88rem", color: "rgba(255,255,255,0.72)", textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.72)"; }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links col */}
          {legalLinks.length > 0 && (
            <div>
              <p style={{ fontFamily: HEADING, fontSize: "0.78rem", fontWeight: 700, color: CRIMSON, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 20px" }}>Právní informace</p>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {legalLinks.map((l, i) => (
                  <li key={i}>
                    <a href={l.href} style={{ fontFamily: BODY, fontSize: "0.88rem", color: "rgba(255,255,255,0.72)", textDecoration: "none", transition: "color 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.72)"; }}
                    >
                      <GenericEditableText sectionId={sectionId} field={`legalLinks.${i}.label`} value={l.label} tag="span" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontFamily: BODY, fontSize: "0.8rem", color: "rgba(255,255,255,0.45)" }}>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </span>
          <div style={{ width: 36, height: 2, backgroundColor: CRIMSON }} />
        </div>
      </div>
    </footer>
  );
}

// ─── Stavba-01 Footer ─────────────────────────────────────────────────────────
function FooterStavba01({ content, sectionId, tenantSlug, isAdmin }: Props) {
  const ORANGE = "#FF6F0D";
  const DARK   = "#1a1a1a";
  const WHITE  = "#ffffff";
  const FONT   = "'Inter', sans-serif";

  const siteName    = String(content.siteName    ?? "Stavební Firma");
  const tagline     = String(content.tagline     ?? "");
  const email       = String(content.email       ?? "");
  const phone       = String(content.phone       ?? "");
  const address     = String(content.address     ?? "");
  const companyName = String(content.companyName ?? "");
  const ico         = String(content.ico         ?? "");
  const links       = (content.links as Array<{ label: string; href: string }>) ?? [];

  const resolve = (href: string) => {
    if (!href || href.startsWith("http") || href.startsWith("#")) return href;
    if (tenantSlug) return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href.startsWith("/") ? href : "/" + href}`;
    return href;
  };

  const LogoMark = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 44" fill="none" style={{ width: 200, height: 34 }} aria-label={siteName}>
      <rect x="2" y="4"  width="13" height="9"  rx="2" fill={ORANGE}/>
      <rect x="2" y="15" width="21" height="9"  rx="2" fill={WHITE}/>
      <rect x="2" y="26" width="29" height="9"  rx="2" fill={WHITE}/>
      <rect x="2" y="37" width="29" height="4"  rx="2" fill={ORANGE}/>
      <text fontFamily="'Inter', sans-serif" fontWeight="700" fontSize="19" fill={WHITE} letterSpacing="-0.3">
        <tspan x="40" y="28">STAVEBNÍ</tspan>
        <tspan fill={ORANGE} fontWeight="500" fontSize="18" dx="6">FIRMA</tspan>
      </text>
    </svg>
  );

  return (
    <footer style={{ backgroundColor: DARK, fontFamily: FONT, paddingTop: "clamp(56px,7vw,88px)" }} data-template="stavba-01">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        <div className="stavba-footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, paddingBottom: 56 }}>

          {/* Brand column */}
          <div>
            <LogoMark />
            {tagline && <p style={{ color: "rgba(255,255,255,0.50)", fontSize: "0.875rem", lineHeight: 1.65, margin: "16px 0 24px", maxWidth: 320 }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {phone && <a href={`tel:+420${phone.replace(/\s/g,"")}`} style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.875rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 8, transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = WHITE)} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12.25 19.79 19.79 0 0 1 1.17 3.63 2 2 0 0 1 3.15 1.45h3a2 2 0 0 1 2 1.72c.12.97.33 1.93.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.88.37 1.84.58 2.81.7A2 2 0 0 1 21 16.92z"/></svg>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>}
              {email && <a href={`mailto:${email}`} style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.875rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 8, transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = WHITE)} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>}
              {address && <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.875rem", margin: 0, whiteSpace: "pre-line", display: "flex", alignItems: "flex-start", gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </p>}
            </div>
          </div>

          {/* Nav links */}
          <div>
            <h4 style={{ color: WHITE, fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", margin: "0 0 20px" }}>Navigace</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {links.map((l, i) => (
                <a key={i} href={resolve(l.href)} style={{ color: "rgba(255,255,255,0.60)", fontSize: "0.875rem", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = WHITE)} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.60)")}>
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ color: WHITE, fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", margin: "0 0 20px" }}>Firma</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {companyName && <span style={{ color: "rgba(255,255,255,0.60)", fontSize: "0.875rem" }}>
                <GenericEditableText sectionId={sectionId} field="companyName" value={companyName} tag="span" />
              </span>}
              {ico && <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem" }}>
                IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" />
              </span>}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.78rem" }}>© {new Date().getFullYear()} <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />. <GenericEditableText sectionId={sectionId} field="legalText" value={String(content.legalText ?? "Všechna práva vyhrazena.")} tag="span" /></span>
          <div style={{ width: 32, height: 3, backgroundColor: ORANGE, borderRadius: 2 }} />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .stavba-footer-grid { grid-template-columns: 1fr !important; gap: 36px !important; } }
      `}</style>
    </footer>
  );
}

// ── legal-02-footer ───────────────────────────────────────────────────────────
function FooterLegal02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY    = "#143171";
  const ORANGE  = "#EB5C2E";
  const BOLD    = "bw_gradualbold, Georgia, serif";
  const REG     = "bw_gradualregular, Georgia, serif";

  const siteName  = String(content.siteName  ?? "Demo ROWAN LEGAL");
  const tagline   = String(content.tagline   ?? "");
  const email     = String(content.email     ?? "");
  const phone     = String(content.phone     ?? "");
  const address   = String(content.address   ?? "");
  const ico       = String(content.ico       ?? "");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}`);
  const links     = Array.isArray(content.links) ? content.links as Array<{ label: string; href: string }> : [];

  const SocialIcon = ({ name }: { name: string }) => {
    const p = { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    if (name === "linkedin") return <svg {...p}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;
    if (name === "facebook") return <svg {...p}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
    return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>;
  };

  const socials: Array<{ icon: string; href: string; label: string }> = [];
  if (content.linkedin) socials.push({ icon: "linkedin", href: String(content.linkedin), label: "LinkedIn" });
  if (content.facebook) socials.push({ icon: "facebook", href: String(content.facebook), label: "Facebook" });
  if (content.instagram) socials.push({ icon: "instagram", href: String(content.instagram), label: "Instagram" });

  return (
    <footer data-variant="legal-02-footer" style={{ backgroundColor: NAVY, color: "#fff" }}>
      <style>{`
        @media (max-width: 860px) { .l02-footer-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 540px) { .l02-footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "72px 80px 56px", boxSizing: "border-box" }}>
        <div className="l02-footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "clamp(32px,5vw,72px)" }}>

          {/* Brand col */}
          <div>
            {/* Text wordmark — ADVOKÁTNÍ / KANCELÁŘ in white */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.15, marginBottom: 24 }}>
              <span style={{ fontFamily: BOLD, fontWeight: 700, fontSize: 22, color: "#fff", letterSpacing: "0.04em", textTransform: "uppercase" }}>ADVOKÁTNÍ</span>
              <span style={{ fontFamily: BOLD, fontWeight: 700, fontSize: 22, color: "#fff", letterSpacing: "0.04em", textTransform: "uppercase" }}>KANCELÁŘ</span>
            </div>
            {tagline && (
              <p style={{ fontFamily: REG, fontSize: "0.875rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.65, margin: "0 0 28px", maxWidth: 280 }}>
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {phone && (
                <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ fontFamily: REG, fontSize: "0.875rem", color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} style={{ fontFamily: REG, fontSize: "0.875rem", color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              )}
              {address && (
                <span style={{ fontFamily: REG, fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                </span>
              )}
              {ico && (
                <span style={{ fontFamily: REG, fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
                  IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" />
                </span>
              )}
            </div>
            {socials.length > 0 && (
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                {socials.map((s, i) => (
                  <a key={i} href={s.href} aria-label={s.label} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.75)", transition: "border-color 0.18s, color 0.18s" }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = ORANGE; el.style.color = "#fff"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = "rgba(255,255,255,0.25)"; el.style.color = "rgba(255,255,255,0.75)"; }}
                  >
                    <SocialIcon name={s.icon} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Nav links */}
          <div>
            <p style={{ fontFamily: BOLD, fontSize: "0.72rem", letterSpacing: "0.12em", color: ORANGE, textTransform: "uppercase", margin: "0 0 20px" }}>Navigace</p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {links.map((l, i) => (
                <li key={i}>
                  <a href={l.href} style={{ fontFamily: REG, fontSize: "0.88rem", color: "rgba(255,255,255,0.72)", textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.72)"; }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Empty third col — reserved for future legal links */}
          <div />

        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "18px 80px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, boxSizing: "border-box" }}>
          <span style={{ fontFamily: REG, fontSize: "0.8rem", color: "rgba(255,255,255,0.45)" }}>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </span>
          <div style={{ width: 36, height: 2, backgroundColor: ORANGE }} />
        </div>
      </div>
    </footer>
  );
}

// ── elektro-01-footer ────────────────────────────────────────────────────────
// Tmavý footer: logo + tagline vlevo, navigace uprostřed, kontakt vpravo
// Spodní lišta: copyright + IČ
// ─────────────────────────────────────────────────────────────────────────────
function FooterElektro01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const RED   = "#dd0808";
  const DARK  = "#0f0f0f";
  const WHITE = "#ffffff";
  const FONT  = "'Montserrat', Arial, sans-serif";

  const siteName = String(content.siteName ?? "Váš elektrikář");
  const tagline  = String(content.tagline  ?? "Elektroinstalace a hromosvody Praha a okolí");
  const phone    = String(content.phone    ?? "704 123 456");
  const email    = String(content.email    ?? "info@demo.cz");
  const address  = String(content.address  ?? "");
  const ic       = String(content.ic       ?? "");
  const facebook = String(content.facebook ?? "");
  const instagram = String(content.instagram ?? "");
  const links    = (content.links as { label: string; href: string }[]) ?? [];
  const year     = new Date().getFullYear();

  const resolve = (href: string) => {
    if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("tel:") || href.startsWith("mailto:")) return href;
    if (tenantSlug) {
      const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
      return base + (href.startsWith("/") ? href : "/" + href);
    }
    return href;
  };

  const LogoMark = () => (
    <svg viewBox="0 0 252 52" style={{ width: 200, height: 42 }} aria-label={siteName}>
      <circle cx="26" cy="26" r="26" fill={RED}/>
      <rect x="19" y="9"  width="4" height="11" rx="1.5" fill={WHITE}/>
      <rect x="29" y="9"  width="4" height="11" rx="1.5" fill={WHITE}/>
      <rect x="15" y="20" width="22" height="14" rx="3"   fill={WHITE}/>
      <rect x="23" y="34" width="6"  height="9"  rx="1.5" fill={WHITE}/>
      <text fontFamily="'Montserrat',Arial,sans-serif" fontWeight="800" fontSize="17.5" fill={WHITE} letterSpacing="0.4">
        <tspan x="62" y="31">{siteName.toUpperCase()}</tspan>
      </text>
    </svg>
  );

  return (
    <footer data-template="elektro-01" style={{ backgroundColor: DARK, fontFamily: FONT, paddingTop: 60, paddingBottom: 0 }}>

      {/* Červená čára nahoře */}
      <div style={{ height: 3, backgroundColor: RED, margin: "0 0 60px" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", display: "grid", gridTemplateColumns: "1.6fr 1fr 1.2fr", gap: 48 }} className="elektro-footer-grid">

        {/* Sloupec 1 — logo + tagline */}
        <div>
          <a href={resolve("/")} style={{ display: "inline-block", textDecoration: "none", marginBottom: 16 }}>
            <LogoMark />
          </a>
          <p style={{ color: "rgba(255,255,255,0.50)", fontSize: "0.85rem", lineHeight: 1.65, margin: "0 0 24px", maxWidth: 280, fontFamily: "'Roboto',sans-serif" }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          {/* Sociální sítě */}
          <div style={{ display: "flex", gap: 10 }}>
            {facebook && (
              <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background-color 0.18s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = RED; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(255,255,255,0.08)"; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={WHITE} aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            )}
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background-color 0.18s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = RED; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(255,255,255,0.08)"; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Sloupec 2 — navigace */}
        <div>
          <h4 style={{ color: WHITE, fontSize: "0.70rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", margin: "0 0 20px", paddingBottom: 10, borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
            <GenericEditableText sectionId={sectionId} field="navLabel" value={String(content.navLabel ?? "Navigace")} tag="span" />
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {links.map((l, i) => (
              <li key={i}>
                <a href={resolve(l.href)}
                  style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Roboto',sans-serif", fontSize: "0.88rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, transition: "color 0.18s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = RED; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.55)"; }}
                >
                  <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: RED, flexShrink: 0 }} />
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Sloupec 3 — kontakt */}
        <div>
          <h4 style={{ color: WHITE, fontSize: "0.70rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", margin: "0 0 20px", paddingBottom: 10, borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
            <GenericEditableText sectionId={sectionId} field="contactLabel" value={String(content.contactLabel ?? "Kontakt")} tag="span" />
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <a href={`tel:+420${phone.replace(/\s/g, "")}`}
              style={{ color: "rgba(255,255,255,0.80)", fontFamily: "'Roboto',sans-serif", fontSize: "0.92rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 10, transition: "color 0.18s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = RED; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.80)"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12.25 19.79 19.79 0 0 1 1.17 3.63 2 2 0 0 1 3.15 1.45h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/>
              </svg>
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
            <a href={`mailto:${email}`}
              style={{ color: "rgba(255,255,255,0.80)", fontFamily: "'Roboto',sans-serif", fontSize: "0.92rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 10, transition: "color 0.18s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = RED; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.80)"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
            </a>
            {address && (
              <div style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Roboto',sans-serif", fontSize: "0.88rem", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Spodní lišta */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: 48 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <p style={{ color: "rgba(255,255,255,0.30)", fontFamily: "'Roboto',sans-serif", fontSize: "0.78rem", margin: 0 }}>
            © {year} <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />. <GenericEditableText sectionId={sectionId} field="legalText" value={String(content.legalText ?? "Všechna práva vyhrazena.")} tag="span" />
          </p>
          {ic && (
            <p style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Roboto',sans-serif", fontSize: "0.78rem", margin: 0 }}>
              IČ: <GenericEditableText sectionId={sectionId} field="ic" value={ic} tag="span" />
            </p>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .elektro-footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 560px) {
          .elektro-footer-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
        }
      `}</style>
    </footer>
  );
}

// ─── STAVBA-03 FOOTER ─────────────────────────────────────────────────────────
function FooterStavba03({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const ORANGE = "#fa7d19";
  const DARK = "#1b1a1a";
  const FONT = "'Roboto', sans-serif";

  const siteName  = (content.siteName  as string) ?? "Demo BauRekStav";
  const tagline   = (content.tagline   as string) ?? "";
  const phone     = (content.phone     as string) ?? "";
  const email     = (content.email     as string) ?? "";
  const address   = (content.address   as string) ?? "";
  const ico       = (content.ico       as string) ?? "";
  const copyright = (content.copyright as string) ?? `© ${new Date().getFullYear()} ${siteName}`;
  const rawLinks  = Array.isArray(content.links) ? content.links as { label: string; href: string }[] : [];

  function resolveHref(href: string) {
    if (!tenantSlug || !href.startsWith("/")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return `${base}${href === "/" ? "" : href}`;
  }

  return (
    <footer style={{ background: "#111", color: "#ccc", fontFamily: FONT }}>
      {/* Main footer */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px 48px", display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr", gap: 48 }} className="stavba03-footer-grid">

        {/* Col 1 — brand */}
        <div>
          <div style={{ marginBottom: 16 }}>
            <a href={resolveHref("/")} style={{ textDecoration: "none" }}>
              <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 16, letterSpacing: "2.2px", color: "#fff", textTransform: "uppercase" }}>
                <GenericEditableText sectionId={sectionId} field="logoText" value={String(content.logoText ?? "Rekonstrukce")} tag="span" />
              </span>
            </a>
          </div>
          {tagline && (
            <p style={{ color: "#999", fontSize: "0.875rem", lineHeight: 1.75, maxWidth: 280, margin: "0 0 24px" }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
          )}
          {/* Social placeholders */}
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { title: "Facebook", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
              { title: "Instagram", path: "M16 2H8C4.686 2 2 4.686 2 8v8c0 3.314 2.686 6 6 6h8c3.314 0 6-2.686 6-6V8c0-3.314-2.686-6-6-6zm.75 14a.75.75 0 110-1.5.75.75 0 010 1.5zM12 8.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7z" },
            ].map((s, i) => (
              <a key={i} href="#" title={s.title} style={{ width: 36, height: 36, borderRadius: "50%", background: "#222", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", textDecoration: "none", transition: "background 0.2s, color 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = ORANGE; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#222"; (e.currentTarget as HTMLElement).style.color = "#999"; }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d={s.path}/></svg>
              </a>
            ))}
          </div>
        </div>

        {/* Col 2 — links */}
        <div>
          <h4 style={{ color: "#fff", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 20px" }}>
            <GenericEditableText sectionId={sectionId} field="navLabel" value={String(content.navLabel ?? "Navigace")} tag="span" />
          </h4>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {rawLinks.map((link, i) => (
              <li key={i}>
                <a href={resolveHref(link.href)} style={{ color: "#999", fontSize: "0.875rem", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = ORANGE}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#999"}>
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — contact */}
        <div>
          <h4 style={{ color: "#fff", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 20px" }}>
            <GenericEditableText sectionId={sectionId} field="contactLabel" value={String(content.contactLabel ?? "Kontakt")} tag="span" />
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ color: "#999", fontSize: "0.875rem", textDecoration: "none", display: "flex", gap: 10, alignItems: "center" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} style={{ color: "#999", fontSize: "0.875rem", textDecoration: "none", display: "flex", gap: 10, alignItems: "center" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            )}
            {address && (
              <p style={{ color: "#999", fontSize: "0.875rem", margin: 0, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </p>
            )}
            {ico && (
              <p style={{ color: "#666", fontSize: "0.8rem", margin: 0 }}>
                IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" />
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid #222", padding: "18px 24px", textAlign: "center" }}>
        <p style={{ color: "#555", fontSize: "0.8rem", margin: 0 }}>
          <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
        </p>
      </div>

      <style>{`
        @media (max-width: 860px) { .stavba03-footer-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 560px) { .stavba03-footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
}

// ── stavba-02-footer ──────────────────────────────────────────────────────────
// Dark brown #2D1A0F bg, brown #674832 3px border-top
// 3-col: logo+tagline+IČO+FB | Kontakt (tel/email/adresa) | Navigace
// Bottom copyright bar
// ─────────────────────────────────────────────────────────────────────────────
function FooterStavba02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const BROWN = "#674832";
  const DARK  = "#2D1A0F";
  const FONT  = "'Roboto', sans-serif";
  const TEXT  = "rgba(255,255,255,0.7)";
  const WHITE = "#fff";

  const siteName  = String(content.siteName  ?? "Rekonstrukce Bytů");
  const tagline   = String(content.tagline   ?? "Profesionální rekonstrukce bytů, bytových jader a domů.");
  const ico       = String(content.ico       ?? "");
  const dic       = String(content.dic       ?? "");
  const phone     = String(content.phone     ?? "");
  const email     = String(content.email     ?? "");
  const address   = String(content.address   ?? "");
  const facebook  = String(content.facebook  ?? "");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);

  type NavLink = { label: string; href: string };
  const links: NavLink[] = Array.isArray(content.links)
    ? (content.links as Array<Record<string, unknown>>).map(l => ({ label: String(l.label ?? ""), href: String(l.href ?? "#") }))
    : [];

  return (
    <footer id={String(content.id ?? "kontakt")} style={{ backgroundColor: DARK, fontFamily: FONT, borderTop: `3px solid ${BROWN}` }} data-template="stavba-02">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(48px, 6vw, 72px) 32px 0" }}>
        <div className="s02-footer-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 48 }}>

          {/* Col 1 — Brand */}
          <div>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, color: WHITE, letterSpacing: "-0.3px" }}>
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </span>
            </div>
            <p style={{ color: TEXT, fontSize: "0.875rem", lineHeight: 1.65, margin: "0 0 16px", maxWidth: 280 }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            {(ico || dic) && (
              <p style={{ color: TEXT, fontSize: "0.78rem", lineHeight: 1.8, margin: "0 0 16px" }}>
                {ico && <><span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>IČO: </span><GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" /><br /></>}
                {dic && <><span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>DIČ: </span><GenericEditableText sectionId={sectionId} field="dic" value={dic} tag="span" /></>}
              </p>
            )}
            {facebook && (
              <a href={facebook} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, color: TEXT, fontSize: "0.83rem", textDecoration: "none", transition: "color 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.color = WHITE; }}
                onMouseLeave={e => { e.currentTarget.style.color = TEXT; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                Facebook
              </a>
            )}
          </div>

          {/* Col 2 — Kontakt */}
          <div>
            <h3 style={{ color: WHITE, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 20px" }}>Kontakt</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {phone && (
                <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ display: "flex", alignItems: "center", gap: 10, color: TEXT, fontSize: "0.875rem", textDecoration: "none", transition: "color 0.18s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = WHITE; }}
                  onMouseLeave={e => { e.currentTarget.style.color = TEXT; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={BROWN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72 12.7 12.7 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.19-1.19a2 2 0 012.11-.45 12.7 12.7 0 002.81.7A2 2 0 0122 14.92z"/></svg>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} style={{ display: "flex", alignItems: "center", gap: 10, color: TEXT, fontSize: "0.875rem", textDecoration: "none", transition: "color 0.18s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = WHITE; }}
                  onMouseLeave={e => { e.currentTarget.style.color = TEXT; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={BROWN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              )}
              {address && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, color: TEXT, fontSize: "0.875rem" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={BROWN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                </div>
              )}
            </div>
          </div>

          {/* Col 3 — Navigation */}
          <div>
            <h3 style={{ color: WHITE, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 20px" }}>Navigace</h3>
            <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {links.map((link, i) => (
                <a key={i} href={link.href} style={{ color: TEXT, fontSize: "0.875rem", textDecoration: "none", transition: "color 0.18s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = WHITE; }}
                  onMouseLeave={e => { e.currentTarget.style.color = TEXT; }}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Copyright bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 48, padding: "20px 0", textAlign: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.78rem" }}>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) { .s02-footer-grid { grid-template-columns: 1fr 1fr !important; gap: 36px !important; } }
        @media (max-width: 560px) { .s02-footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
}

function FooterInstala01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const YELLOW = "#FFC527";
  const DARK = "#1e293b";

  const siteName = (content.siteName as string) || "";
  const logoUrl = (content.logoUrl as string) || "";
  const tagline = (content.tagline as string) || "";
  const phone = (content.phone as string) || "";
  const email = (content.email as string) || "";
  const address = (content.address as string) || "";
  const ico = (content.ico as string) || "";
  const facebook = (content.facebook as string) || "";
  const instagram = (content.instagram as string) || "";
  const copyright = (content.copyright as string) || "";
  const links = (content.links as Array<{ label: string; href: string }>) || [];
  const legalLinks = (content.legalLinks as Array<{ label: string; href: string }>) || [];

  return (
    <footer id={String(sectionId)} style={{ background: DARK, color: "#fff", padding: "64px 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        <div className="i01-footer-grid" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr", gap: 48, marginBottom: 48 }}>

          {/* Col 1: brand */}
          <div>
            {logoUrl && (
              <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} className="relative overflow-hidden" style={{}}>
                <img loading="lazy" src={logoUrl} alt={siteName} style={{ height: 44, marginBottom: 20, display: "block" }} />
              </GenericEditableImage>
            )}
            {tagline && (
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, marginBottom: 24, maxWidth: 320 }}>
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </p>
            )}
            {/* Contact details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {phone && (
                <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: 15 }}>
                  <span style={{ color: YELLOW }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 6 6l.9-.9a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 16z"/>
                    </svg>
                  </span>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: 15 }}>
                  <span style={{ color: YELLOW }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              )}
              {address && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, color: "rgba(255,255,255,0.8)", fontSize: 15 }}>
                  <span style={{ color: YELLOW, marginTop: 2, flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </span>
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                </div>
              )}
              {ico && (
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                  IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" />
                </p>
              )}
            </div>

            {/* Social */}
            {(facebook || instagram) && (
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener noreferrer" style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </a>
                )}
                {instagram && (
                  <a href={instagram} target="_blank" rel="noopener noreferrer" style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Col 2: services links */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: YELLOW, marginBottom: 20 }}>Služby</p>
            <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {links.map((link, i) => (
                <a key={i} href={link.href} style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
                </a>
              ))}
            </nav>
          </div>

          {/* Col 3: legal + info */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: YELLOW, marginBottom: 20 }}>Informace</p>
            <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {legalLinks.map((link, i) => (
                <a key={i} href={link.href} style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                >
                  <GenericEditableText sectionId={sectionId} field={`legalLinks.${i}.label`} value={link.label} tag="span" />
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Copyright bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "20px 0", textAlign: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) { .i01-footer-grid { grid-template-columns: 1fr 1fr !important; gap: 36px !important; } }
        @media (max-width: 540px) { .i01-footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
}

// ─── florist-01 Footer ───────────────────────────────────────────────────────
// Botanical Atelier Editorial luxe footer:
// - Deep moss #2f4a3a bg + olive-gold hairline separators + ivory type
// - Top eyebrow strip s botanickým mottem
// - 4-col grid: BRAND (wordmark Atelier Petala + tagline + newsletter form)
//   + KATALOG links + STUDIO info + KDE NÁS NAJDETE (adresa + hours + social kruhy)
// - Wordmark: Georgia italic 44px "Atelier Petala" + tracked "BOTANICAL STUDIO · BRNO"
// - Newsletter form: ivory underline-only input + moss submit s petal-blush sweep
// - Bottom bar s copyright + IČO + WeberoCredit
function FooterFlorist01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const MOSS   = "#2f4a3a";
  const MOSSD  = "#243a2e";
  const SAGE   = "#5c8a6a";
  const IVORY  = "#faf7f2";
  const IVORY82 = "rgba(250,247,242,0.82)";
  const IVORY50 = "rgba(250,247,242,0.55)";
  const IVORY30 = "rgba(250,247,242,0.32)";
  const GOLD   = "#c9b78a";
  const GOLDBRIGHT = "#e5cd8d";
  const BLUSH  = "#e8c5c0";
  const GEORGIA = "Georgia, 'Times New Roman', serif";
  const INTER   = "Inter, system-ui, sans-serif";

  const logoText     = String(content.logoText     ?? "Atelier Petala");
  const tagline      = String(content.tagline      ?? "Čerstvě vázané kytice s doručením po celém Brně od roku 2015.");
  const brandKicker  = String(content.brandKicker  ?? "BOTANICAL STUDIO · BRNO");
  const motto        = String(content.motto        ?? "Květiny, které mluví za vás.");
  const instagram    = String(content.instagram    ?? "@atelier.petala");
  const instagramUrl = String(content.instagramUrl ?? "https://instagram.com/atelier.petala");
  const facebookUrl  = String(content.facebookUrl  ?? "https://facebook.com/atelier.petala");
  const pinterestUrl = String(content.pinterestUrl ?? "https://pinterest.com/atelier.petala");
  const address      = String(content.address      ?? "Veveří 42, 602 00 Brno");
  const phone        = String(content.phone        ?? "+420 731 456 789");
  const email        = String(content.email        ?? "atelier@petala.cz");
  const hours        = String(content.hours        ?? "Po–Pá 8—20 · So–Ne 9—18");
  const ico          = String(content.ico          ?? "12345678");
  const dic          = String(content.dic          ?? "CZ12345678");
  const copyright    = String(content.copyright    ?? `© ${new Date().getFullYear()} Atelier Petala. Ručně vázané v Brně.`);

  const catalogLinks = (content.catalogLinks as Array<{ label: string; href: string }>) ?? [
    { label: "Kytice růží",         href: "/katalog" },
    { label: "Signature kolekce",    href: "/katalog" },
    { label: "Svatební floristika",  href: "/katalog" },
    { label: "Sušené & interiér",    href: "/katalog" },
    { label: "Firemní zakázky",      href: "/kontakt" },
  ];
  const studioLinks = (content.studioLinks as Array<{ label: string; href: string }>) ?? [
    { label: "O ateliéru",   href: "/onas"    },
    { label: "Doručení",     href: "/doruceni" },
    { label: "Časté dotazy", href: "/faq"     },
    { label: "Kontakt",      href: "/kontakt" },
    { label: "Blog & inspirace", href: "/katalog" },
  ];

  const newsletterEyebrow = String(content.newsletterEyebrow ?? "PŘIHLASTE SE K ODBĚRU");
  const newsletterCopy    = String(content.newsletterCopy    ?? "Sezónní novinky, inspirace a příležitostné slevy jednou za měsíc.");
  const newsletterPh      = String(content.newsletterPh      ?? "Váš e-mail");
  const newsletterCta     = String(content.newsletterCta     ?? "Odebírat");

  const resolve = (href: string) => {
    if (!href) return "#";
    if (href.startsWith("http") || href.startsWith("mailto") || href.startsWith("tel") || href.startsWith("#")) return href;
    if (isAdmin) return `/demo/${tenantSlug}/admin${href}`;
    if (tenantSlug) return `/demo/${tenantSlug}${href}`;
    return href;
  };

  return (
    <footer data-template="florist-01" className="f01ft" style={{ background: MOSS, color: IVORY, fontFamily: INTER, position: "relative", overflow: "hidden" }}>
      <style>{`
        .f01ft::before { content:""; position:absolute; top:-160px; right:-160px; width:320px; height:320px; border:1px solid ${GOLD}; opacity:0.14; transform: rotate(45deg); pointer-events:none; }
        .f01ft::after  { content:""; position:absolute; bottom:-140px; left:-140px; width:280px; height:280px; border:1px solid ${GOLD}; opacity:0.12; transform: rotate(45deg); pointer-events:none; }
        .f01ft-inner { max-width: 1280px; margin: 0 auto; padding: 84px 24px 0; position:relative; z-index:1; }

        .f01ft-motto { display:flex; align-items:center; gap:22px; padding-bottom: 44px; border-bottom: 1px solid ${GOLD}; margin-bottom: 56px; }
        .f01ft-motto-eye { font-family:${INTER}; font-weight:500; font-size:10.5px; letter-spacing:0.34em; text-transform:uppercase; color:${GOLDBRIGHT}; white-space:nowrap; display:inline-flex; align-items:center; gap:12px; }
        .f01ft-motto-eye i { width:20px; height:1px; background:${GOLD}; display:inline-block; }
        .f01ft-motto-txt { font-family:${GEORGIA}; font-style:italic; font-weight:400; font-size:clamp(22px, 2.4vw, 32px); color:${IVORY}; margin:0; letter-spacing:-0.008em; line-height:1.2; flex:1; }
        .f01ft-motto-txt::after { content: "  ✿"; color:${GOLD}; font-style:normal; font-size:0.7em; margin-left: 8px; }

        .f01ft-grid { display:grid; grid-template-columns: 1.5fr 1fr 1fr 1.15fr; gap: 56px; padding-bottom: 60px; }

        /* BRAND col */
        .f01ft-brand { display:flex; flex-direction:column; gap: 18px; }
        .f01ft-logo { font-family:${GEORGIA}; font-style:italic; font-weight:400; font-size:40px; line-height:1; color:${IVORY}; letter-spacing:-0.01em; margin:0; }
        .f01ft-brand-kick { display:inline-flex; align-items:center; gap:8px; font-family:${INTER}; font-weight:500; font-size:10px; letter-spacing:0.32em; text-transform:uppercase; color:${GOLDBRIGHT}; }
        .f01ft-brand-kick i { width:20px; height:1px; background:${GOLD}; display:inline-block; }
        .f01ft-tagline { font-family:${INTER}; font-weight:300; font-size:14px; line-height:1.7; color:${IVORY82}; margin:0; max-width:340px; }

        .f01ft-nl { margin-top: 14px; display:flex; flex-direction:column; gap: 10px; }
        .f01ft-nl-eye { font-family:${INTER}; font-weight:500; font-size:10.5px; letter-spacing:0.32em; text-transform:uppercase; color:${GOLDBRIGHT}; }
        .f01ft-nl-copy { font-family:${INTER}; font-weight:300; font-size:12.5px; line-height:1.6; color:${IVORY50}; max-width:320px; margin:0 0 6px; }
        .f01ft-nl-form { display:flex; align-items:center; gap:0; max-width:340px; border-bottom: 1px solid ${GOLD}; padding: 6px 0; }
        .f01ft-nl-form input { flex:1; background:transparent; border:none; outline:none; padding: 6px 4px; font-family:${INTER}; font-weight:400; font-size:14px; color:${IVORY}; }
        .f01ft-nl-form input::placeholder { color:${IVORY50}; font-style:italic; font-family:${GEORGIA}; }
        .f01ft-nl-btn { position:relative; overflow:hidden; background:transparent; border:none; color:${GOLDBRIGHT}; cursor:pointer; font-family:${INTER}; font-weight:500; font-size:11px; letter-spacing:0.24em; text-transform:uppercase; padding: 6px 12px; transition: color 0.35s ease; display:inline-flex; align-items:center; gap:8px; }
        .f01ft-nl-btn:hover { color:${IVORY}; }
        .f01ft-nl-btn .arr { transition: transform 0.4s ease; }
        .f01ft-nl-btn:hover .arr { transform: translateX(4px); }

        /* Nav columns */
        .f01ft-col-eye { font-family:${INTER}; font-weight:500; font-size:10.5px; letter-spacing:0.32em; text-transform:uppercase; color:${GOLDBRIGHT}; margin: 0 0 24px; display:inline-flex; align-items:center; gap:10px; }
        .f01ft-col-eye i { width:18px; height:1px; background:${GOLD}; display:inline-block; }
        .f01ft-nav { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap: 12px; }
        .f01ft-nav a { position:relative; display:inline-block; font-family:${GEORGIA}; font-style:italic; font-weight:400; font-size:16px; color:${IVORY82}; text-decoration:none; transition: color 0.3s ease, padding 0.3s ease; padding-left: 0; letter-spacing:-0.005em; }
        .f01ft-nav a::before { content:""; position:absolute; left:0; top:50%; width:0; height:1px; background:${GOLDBRIGHT}; transition: width 0.4s cubic-bezier(.6,.05,.35,1); }
        .f01ft-nav a:hover { color:${GOLDBRIGHT}; padding-left: 20px; }
        .f01ft-nav a:hover::before { width: 14px; }

        /* CONTACT col */
        .f01ft-info { display:flex; flex-direction:column; gap: 14px; margin-bottom: 24px; }
        .f01ft-info-row { display:flex; align-items:flex-start; gap:12px; }
        .f01ft-info-icon { width:16px; color:${GOLDBRIGHT}; margin-top: 3px; flex-shrink:0; }
        .f01ft-info-val { font-family:${GEORGIA}; font-style:italic; font-size:14px; color:${IVORY82}; text-decoration:none; line-height:1.55; letter-spacing:-0.005em; transition: color 0.3s ease; }
        a.f01ft-info-val:hover { color:${IVORY}; }

        .f01ft-social { display:flex; gap: 10px; margin-top: 10px; }
        .f01ft-social a { display:inline-flex; align-items:center; justify-content:center; width:38px; height:38px; border-radius:50%; border: 1px solid ${GOLD}; color:${IVORY82}; background:transparent; transition: background 0.4s ease, color 0.4s ease, transform 0.4s ease; text-decoration:none; }
        .f01ft-social a:hover { background: ${IVORY}; color: ${MOSS}; transform: translateY(-2px); }
        .f01ft-social-tag { font-family:${GEORGIA}; font-style:italic; font-size:13px; color:${IVORY50}; margin-top: 12px; display:block; }

        /* Bottom bar */
        .f01ft-bot { border-top: 1px solid ${GOLD}; padding: 26px 0 34px; display:grid; grid-template-columns: 1fr auto auto; align-items:center; gap: 24px; }
        .f01ft-copy { font-family:${GEORGIA}; font-style:italic; font-size:12.5px; color:${IVORY50}; letter-spacing:-0.005em; }
        .f01ft-legal { display:inline-flex; align-items:center; gap: 16px; font-family:${INTER}; font-weight:400; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:${IVORY30}; }
        .f01ft-legal span { color:${IVORY50}; }
        .f01ft-credit { justify-self:end; }

        @media(max-width:1100px){ .f01ft-grid { grid-template-columns: 1fr 1fr; gap: 44px; } }
        @media(max-width:700px){
          .f01ft-inner { padding: 60px 20px 0; }
          .f01ft-motto { flex-direction:column; align-items:flex-start; gap: 14px; padding-bottom: 32px; margin-bottom: 40px; }
          .f01ft-grid { grid-template-columns: 1fr; gap: 40px; padding-bottom: 40px; }
          .f01ft-bot { grid-template-columns: 1fr; text-align: left; }
          .f01ft-logo { font-size: 34px; }
        }
      `}</style>

      <div className="f01ft-inner">
        {/* Top motto strip */}
        <div className="f01ft-motto">
          <span className="f01ft-motto-eye"><i /> AT&#8203;ELIER · MMXV</span>
          <p className="f01ft-motto-txt">
            <GenericEditableText sectionId={sectionId} field="motto" value={motto} tag="span" />
          </p>
        </div>

        <div className="f01ft-grid">
          {/* BRAND + newsletter */}
          <div className="f01ft-brand">
            <h3 className="f01ft-logo">
              <GenericEditableText sectionId={sectionId} field="logoText" value={logoText} tag="span" />
            </h3>
            <span className="f01ft-brand-kick"><i />
              <GenericEditableText sectionId={sectionId} field="brandKicker" value={brandKicker} tag="span" />
            </span>
            <p className="f01ft-tagline">
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>

            <div className="f01ft-nl">
              <span className="f01ft-nl-eye">
                <GenericEditableText sectionId={sectionId} field="newsletterEyebrow" value={newsletterEyebrow} tag="span" />
              </span>
              <p className="f01ft-nl-copy">
                <GenericEditableText sectionId={sectionId} field="newsletterCopy" value={newsletterCopy} tag="span" />
              </p>
              <form className="f01ft-nl-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder={newsletterPh} aria-label="E-mail" />
                <button type="submit" className="f01ft-nl-btn">
                  <GenericEditableText sectionId={sectionId} field="newsletterCta" value={newsletterCta} tag="span" />
                  <span className="arr" aria-hidden>→</span>
                </button>
              </form>
            </div>
          </div>

          {/* KATALOG */}
          <div>
            <div className="f01ft-col-eye"><i /> Katalog</div>
            <ul className="f01ft-nav">
              {catalogLinks.map((link, i) => (
                <li key={i}>
                  <a href={resolve(link.href)}>
                    <GenericEditableText sectionId={sectionId} field={`catalogLinks.${i}.label`} value={link.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* STUDIO */}
          <div>
            <div className="f01ft-col-eye"><i /> Studio</div>
            <ul className="f01ft-nav">
              {studioLinks.map((link, i) => (
                <li key={i}>
                  <a href={resolve(link.href)}>
                    <GenericEditableText sectionId={sectionId} field={`studioLinks.${i}.label`} value={link.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT + social */}
          <div>
            <div className="f01ft-col-eye"><i /> Kde nás najdete</div>
            <div className="f01ft-info">
              <div className="f01ft-info-row">
                <svg className="f01ft-info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.3"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                <span className="f01ft-info-val">
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                </span>
              </div>
              <div className="f01ft-info-row">
                <svg className="f01ft-info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <span className="f01ft-info-val">
                  <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
                </span>
              </div>
              <div className="f01ft-info-row">
                <svg className="f01ft-info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                <a className="f01ft-info-val" href={`tel:${phone.replace(/\s+/g,"")}`}>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              </div>
              <div className="f01ft-info-row">
                <svg className="f01ft-info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 6h16v12H4z M4 6l8 6 8-6" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                </svg>
                <a className="f01ft-info-val" href={`mailto:${email}`}>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              </div>
            </div>

            <div className="f01ft-social">
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href={pinterestUrl} target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 22l4-10 4 10 M12 12v4" strokeLinecap="round"/>
                </svg>
              </a>
            </div>
            <span className="f01ft-social-tag">
              <GenericEditableText sectionId={sectionId} field="instagram" value={instagram} tag="span" />
            </span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="f01ft-bot">
          <span className="f01ft-copy">
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </span>
          <div className="f01ft-legal">
            <span>IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" /></span>
            <span aria-hidden>·</span>
            <span>DIČ: <GenericEditableText sectionId={sectionId} field="dic" value={dic} tag="span" /></span>
          </div>
          <div className="f01ft-credit">
            <WeberoCredit />
          </div>
        </div>
      </div>
    </footer>
  );
}


// ── catering-01-footer ────────────────────────────────────────────────────────
// Velmi tmavý teal #0d1a1c, 3 sloupce: logo+popis | nav | kontakt, spodní bar s IČO/DIČ
// ─────────────────────────────────────────────────────────────────────────────
// ── catering-01-footer ────────────────────────────────────────────────────────
// Nordic Minimal Gastro:
// - Dark forest green bg, 3-col grid, Fraunces brand, Inter nav/contact
// - Terracotta accents, stone border, WeberoCredit bottom right
// ─────────────────────────────────────────────────────────────────────────────
function FooterCatering01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const GREEN  = "#1e3329";
  const TERRA  = "#c4755b";
  const WARM   = "#f8f5f0";
  const STONE  = "#e8e2d8";
  const SERIF  = "'Fraunces', Georgia, serif";
  const SANS   = "'Inter', system-ui, sans-serif";

  const siteName  = String(content.siteName  ?? "Saveur & Co.");
  const logoUrl   = String(content.logoUrl   ?? "");
  const company   = String(content.company   ?? "");
  const address   = String(content.address   ?? "");
  const ico       = String(content.ico       ?? "");
  const dic       = String(content.dic       ?? "");
  const phone     = String(content.phone     ?? "");
  const email     = String(content.email     ?? "");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);

  function resolveHref(href: string) {
    if (!tenantSlug || href.startsWith("http")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return href === "/" ? base : `${base}${href}`;
  }

  const navLinks = [
    { label: "Úvod",        href: "/" },
    { label: "Naše služby", href: "/sluzby" },
    { label: "O nás",       href: "/o-nas" },
    { label: "Galerie",     href: "/galerie" },
    { label: "Kontakt",     href: "/kontakt" },
  ];

  return (
    <footer
      data-template="catering-01"
      data-variant="catering-01-footer"
      style={{ background: GREEN }}
    >
      <style>{`
        .ct1ft-wrap{max-width:1200px;margin:0 auto;padding:4rem 1.5rem 0}
        .ct1ft-grid{display:grid;grid-template-columns:1fr;gap:2.5rem;padding-bottom:3rem;border-bottom:1px solid rgba(232,226,216,.12)}
        .ct1ft-brand{font-family:${SERIF};font-weight:400;font-size:1.4rem;color:${WARM};margin:0 0 .6rem;letter-spacing:-.01em}
        .ct1ft-desc{font-family:${SANS};font-size:.8rem;line-height:1.7;color:rgba(248,245,240,.4);margin:0}
        .ct1ft-col-title{font-family:${SANS};font-size:.6rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:${TERRA};margin:0 0 1rem}
        .ct1ft-nav{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.55rem}
        .ct1ft-nav a{font-family:${SANS};font-size:.85rem;color:rgba(248,245,240,.5);text-decoration:none;transition:color .2s}
        .ct1ft-nav a:hover{color:${TERRA}}
        .ct1ft-contact{display:flex;flex-direction:column;gap:.6rem}
        .ct1ft-ci{display:flex;gap:.6rem;align-items:center}
        .ct1ft-cicon{flex-shrink:0;color:${TERRA};opacity:.7}
        .ct1ft-cval{font-family:${SANS};font-size:.85rem;color:rgba(248,245,240,.55);text-decoration:none;margin:0;transition:color .2s}
        a.ct1ft-cval:hover{color:${WARM}}
        .ct1ft-bar{display:flex;flex-direction:column;gap:.4rem;padding:1.2rem 0 1.8rem}
        .ct1ft-bot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.5rem}
        .ct1ft-copy{font-family:${SANS};font-size:.7rem;color:rgba(248,245,240,.22);margin:0}
        .ct1ft-legal{display:flex;flex-wrap:wrap;gap:.3rem 1rem}
        .ct1ft-legal span{font-family:${SANS};font-size:.65rem;color:rgba(248,245,240,.18)}
        @media(min-width:640px){.ct1ft-grid{grid-template-columns:1fr 1fr}}
        @media(min-width:900px){.ct1ft-grid{grid-template-columns:2fr 1fr 1.4fr;gap:3.5rem}}
      `}</style>

      <div className="ct1ft-wrap">
        <div className="ct1ft-grid">
          <div>
            <div style={{ marginBottom: "0.9rem" }}>
              <CateringSaveurLogo color={WARM} accent={TERRA} height="3.2rem" />
            </div>
            {logoUrl && <span style={{ display: "none" }} data-field="logoUrl">{logoUrl}</span>}
            {/* Screen-reader-only brand name for editability parity */}
            <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </span>
            {company && (
              <p className="ct1ft-desc">
                <GenericEditableText sectionId={sectionId} field="company" value={company} tag="span" />
              </p>
            )}
          </div>

          <div>
            <p className="ct1ft-col-title">Navigace</p>
            <ul className="ct1ft-nav">
              {navLinks.map(l => (
                <li key={l.href}><a href={resolveHref(l.href)}>{l.label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="ct1ft-col-title">Kontakt</p>
            <div className="ct1ft-contact">
              {phone && (
                <div className="ct1ft-ci">
                  <span className="ct1ft-cicon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </span>
                  <a href={`tel:${phone.replace(/\s/g,"")}`} className="ct1ft-cval">
                    <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                  </a>
                </div>
              )}
              {email && (
                <div className="ct1ft-ci">
                  <span className="ct1ft-cicon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </span>
                  <a href={`mailto:${email}`} className="ct1ft-cval">
                    <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                  </a>
                </div>
              )}
              {address && (
                <div className="ct1ft-ci">
                  <span className="ct1ft-cicon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </span>
                  <p className="ct1ft-cval">
                    <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="ct1ft-bar">
          <div className="ct1ft-bot">
            <div>
              <p className="ct1ft-copy">
                <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
              </p>
              {(ico || dic) && (
                <div className="ct1ft-legal">
                  {ico && <span>IČO: {ico}</span>}
                  {dic && <span>DIČ: {dic}</span>}
                </div>
              )}
            </div>
            <WeberoCredit />
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── bakery-02-footer ─────────────────────────────────────────────────────────
function FooterBakery02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const FONT = "'Lato','Helvetica Neue',Arial,sans-serif";
  const logoUrl      = String(content.logoUrlDark ?? "/templates/bakery-02/logo-dark.svg");
  const siteName     = String(content.siteName    ?? "Demo Pekářství");
  const email        = String(content.email       ?? "info@demo.cz");
  const phone        = String(content.phone       ?? "+420 704 123 456");
  const fbHref       = String(content.fbHref      ?? "https://facebook.com/demo");
  const igHref       = String(content.igHref      ?? "https://instagram.com/demo");
  const companyName  = String(content.companyName ?? "Demo Pekářství s.r.o.");
  const ico          = String(content.ico         ?? "");

  const rawAddressCols = Array.isArray(content.addressCols) ? content.addressCols as Array<Array<{ name?: string; address?: string; phone?: string }>> : [];
  const addressCols = rawAddressCols.length > 0 ? rawAddressCols : [
    [{ name: "Praha 1 – Centrum", address: "Ukázková 123", phone: "+420 704 123 456" }, { name: "Praha 2 – Vinohrady", address: "Vzorová 456", phone: "+420 704 123 456" }],
    [{ name: "Praha 3 – Žižkov", address: "Demonstrační 789", phone: "+420 704 123 456" }],
  ];

  const rawLinks = Array.isArray(content.links) ? content.links as Array<{ label?: string; href?: string }> : [];
  const links = rawLinks.length > 0 ? rawLinks : [
    { label: "O pekářství", href: "/o-nas" },
    { label: "Aktuální nabídka", href: "/aktualni-nabidka" },
    { label: "Naše pečivo", href: "/nase-pecivo" },
    { label: "Kariéra", href: "/kariera" },
    { label: "Kde nás najdete", href: "/pobocky" },
    { label: "Ochrana osobních údajů", href: "/gdpr" },
  ];

  return (
    <footer
      data-variant="bakery-02-footer"
      style={{ backgroundColor: "#f7f5f0", borderTop: "1px solid #e5e2d9" }}
    >
      <style>{`
        [data-variant="bakery-02-footer"] .b02f-top {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(32px, 4vw, 48px);
          max-width: 1200px;
          margin: 0 auto;
          padding: clamp(48px, 6vw, 80px) clamp(24px, 6vw, 72px) clamp(36px, 5vw, 56px);
        }
        @media (min-width: 768px) {
          [data-variant="bakery-02-footer"] .b02f-top {
            grid-template-columns: 180px 1fr 1fr 180px;
            align-items: start;
          }
        }
        [data-variant="bakery-02-footer"] .b02f-col-title {
          font-family: 'Lato','Helvetica Neue',Arial,sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #999;
          margin: 0 0 16px;
        }
        [data-variant="bakery-02-footer"] .b02f-branch {
          margin-bottom: 20px;
        }
        [data-variant="bakery-02-footer"] .b02f-branch:last-child { margin-bottom: 0; }
        [data-variant="bakery-02-footer"] .b02f-branch-name {
          font-family: 'Lato','Helvetica Neue',Arial,sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #222;
          margin: 0 0 4px;
          letter-spacing: 0.5px;
        }
        [data-variant="bakery-02-footer"] .b02f-branch-detail {
          font-family: 'Lato','Helvetica Neue',Arial,sans-serif;
          font-size: 13px;
          font-weight: 300;
          color: #666;
          margin: 0;
          line-height: 1.6;
        }
        [data-variant="bakery-02-footer"] .b02f-nav-link {
          display: block;
          font-family: 'Lato','Helvetica Neue',Arial,sans-serif;
          font-size: 13px;
          font-weight: 400;
          color: #555;
          text-decoration: none;
          margin-bottom: 9px;
          transition: color 0.2s;
        }
        [data-variant="bakery-02-footer"] .b02f-nav-link:hover { color: #111; }
        [data-variant="bakery-02-footer"] .b02f-contact-link {
          display: block;
          font-family: 'Lato','Helvetica Neue',Arial,sans-serif;
          font-size: 13px;
          font-weight: 300;
          color: #555;
          text-decoration: none;
          line-height: 1.8;
          transition: color 0.2s;
        }
        [data-variant="bakery-02-footer"] .b02f-contact-link:hover { color: #111; }
        [data-variant="bakery-02-footer"] .b02f-social {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }
        [data-variant="bakery-02-footer"] .b02f-social-link {
          display: flex; align-items: center; justify-content: center;
          width: 34px; height: 34px;
          border: 1px solid #d5d1c8;
          color: #555;
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s;
        }
        [data-variant="bakery-02-footer"] .b02f-social-link:hover { border-color: #222; color: #111; }
        [data-variant="bakery-02-footer"] .b02f-bottom {
          border-top: 1px solid #e5e2d9;
          padding: 18px clamp(24px, 6vw, 72px);
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          max-width: 1200px;
          margin: 0 auto;
        }
        [data-variant="bakery-02-footer"] .b02f-bottom-text {
          font-family: 'Lato','Helvetica Neue',Arial,sans-serif;
          font-size: 11px;
          color: #aaa;
          font-weight: 300;
          letter-spacing: 0.5px;
        }
      `}</style>

      <div className="b02f-top">

        {/* Col 1 — Logo + social */}
        <div>
          <GenericEditableImage sectionId={sectionId} field="logoUrlDark" src={logoUrl} alt={siteName} style={{ display: "block", marginBottom: 8 }}>
            <img loading="lazy" src={logoUrl} alt={siteName} style={{ height: 44, width: "auto", display: "block" }} />
          </GenericEditableImage>
          <p style={{ fontFamily: "'Lato','Helvetica Neue',Arial,sans-serif", fontSize: 11, fontWeight: 300, color: "#aaa", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 16px" }}>
            <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
          </p>
          <div className="b02f-social">
            <a href={fbHref} className="b02f-social-link" aria-label="Facebook">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
            </a>
            <a href={igHref} className="b02f-social-link" aria-label="Instagram">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
          </div>
        </div>

        {/* Cols 2+3 — address columns */}
        {addressCols.slice(0, 2).map((col, ci) => (
          <div key={`b02f-acol-${ci}`}>
            {ci === 0 && <p className="b02f-col-title">Kde nás najdete</p>}
            {col.map((branch, bi) => (
              <div key={`b02f-branch-${ci}-${bi}`} className="b02f-branch">
                <p className="b02f-branch-name">
                  <GenericEditableText sectionId={sectionId} field={`addressCols.${ci}.${bi}.name`} value={branch.name ?? ""} tag="span" />
                </p>
                <p className="b02f-branch-detail">
                  <GenericEditableText sectionId={sectionId} field={`addressCols.${ci}.${bi}.address`} value={branch.address ?? ""} tag="span" />
                </p>
                {branch.phone && (
                  <p className="b02f-branch-detail">
                    <GenericEditableText sectionId={sectionId} field={`addressCols.${ci}.${bi}.phone`} value={branch.phone} tag="span" />
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}

        {/* Col 4 — nav links + contact */}
        <div>
          <p className="b02f-col-title">Menu</p>
          {links.slice(0, 5).map((l, li) => (
            <a key={`b02f-link-${li}`} href={l.href ?? "#"} className="b02f-nav-link">
              <GenericEditableText sectionId={sectionId} field={`links.${li}.label`} value={l.label ?? ""} tag="span" />
            </a>
          ))}
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #e5e2d9" }}>
            <a href={`mailto:${email}`} className="b02f-contact-link">
              <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
            </a>
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="b02f-contact-link">
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid #e5e2d9" }}>
        <div className="b02f-bottom">
          <span className="b02f-bottom-text">
            © {new Date().getFullYear()}{" "}
            <GenericEditableText sectionId={sectionId} field="companyName" value={companyName} tag="span" />
            {ico && <>, IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" /></>}
          </span>
          <span className="b02f-bottom-text">Vytvořeno v systému Webero</span>
        </div>
      </div>
    </footer>
  );
}


// ─── sweet-01 Footer — černý centered, sociální kruhy, nav linky ─────────────
function FooterSweet01({
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
  interface NavLink { label: string; href: string; }
  const siteName  = String(content.siteName  ?? "Cukrárna Eliška");
  const tagline   = String(content.tagline   ?? "Cukrárna & Pekárna");
  const fbHref    = String(content.fbHref    ?? "");
  const igHref    = String(content.igHref    ?? "");
  const ytHref    = String(content.ytHref    ?? "");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}`);
  const links     = (content.links as NavLink[]) ?? [];

  const RED  = "#e30613";
  const FONT = "'Roboto','Helvetica Neue',Arial,sans-serif";

  function resolveHref(href: string) {
    if (!tenantSlug || !href || href.startsWith("http")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return href === "/" ? base : `${base}${href}`;
  }

  return (
    <footer
      data-variant="sweet-01-footer"
      style={{ background: "#000", color: "#fefefe", padding: "2rem 0 0", fontFamily: FONT }}
    >
      <style>{`
        @media (max-width: 480px) {
          [data-variant="sweet-01-footer"] { padding: 1.5rem 0 0; }
          [data-variant="sweet-01-footer"] p:first-child { font-size: 1.4rem !important; }
        }
      `}</style>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>

        {/* Nadpis */}
        <p style={{ fontSize: "1.8rem", fontWeight: 700, margin: "0 0 10px", color: "#fefefe", lineHeight: 1.2 }}>
          <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
        </p>
        <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.55)", margin: "0 0 28px", letterSpacing: "2px", textTransform: "uppercase" }}>
          <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
        </p>

        {/* Sociální ikonky */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 28 }}>
          {fbHref && (
            <a href={fbHref} target="_blank" rel="noreferrer" aria-label="Facebook"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 50, height: 50, border: "2px solid #fefefe", borderRadius: "50%", color: "#fefefe", textDecoration: "none", transition: "border-color .2s, color .2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#4267b2"; (e.currentTarget as HTMLAnchorElement).style.color = "#4267b2"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#fefefe"; (e.currentTarget as HTMLAnchorElement).style.color = "#fefefe"; }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
            </a>
          )}
          {igHref && (
            <a href={igHref} target="_blank" rel="noreferrer" aria-label="Instagram"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 50, height: 50, border: "2px solid #fefefe", borderRadius: "50%", color: "#fefefe", textDecoration: "none", transition: "border-color .2s, color .2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#833ab4"; (e.currentTarget as HTMLAnchorElement).style.color = "#833ab4"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#fefefe"; (e.currentTarget as HTMLAnchorElement).style.color = "#fefefe"; }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
          )}
          {ytHref && (
            <a href={ytHref} target="_blank" rel="noreferrer" aria-label="YouTube"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 50, height: 50, border: "2px solid #fefefe", borderRadius: "50%", color: "#fefefe", textDecoration: "none", transition: "border-color .2s, color .2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#f00"; (e.currentTarget as HTMLAnchorElement).style.color = "#f00"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#fefefe"; (e.currentTarget as HTMLAnchorElement).style.color = "#fefefe"; }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#000"/></svg>
            </a>
          )}
        </div>

        {/* Nav linky */}
        {links.length > 0 && (
          <nav style={{ padding: "1.5rem 0 2.5rem", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 24px" }}>
            {links.map((l, i) => (
              <a key={i} href={resolveHref(l.href)}
                style={{ fontSize: "0.8rem", color: "#fff", textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = RED; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>
        )}
      </div>

      {/* Copyright bar */}
      <div style={{ background: "#000", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "12px 24px", textAlign: "center" }}>
        <p style={{ fontFamily: FONT, fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>
          <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
        </p>
      </div>
    </footer>
  );
}

// ─── autoskola-01 Footer — tmavý 3-col, oranžový border-top ──────────────────
function FooterAutoskola01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const siteName  = String(content.siteName  ?? "Autoškola DRIVE CZ");
  const tagline   = String(content.tagline   ?? "Řidičský průkaz skupiny B s garancí složení zkoušky.");
  const phone     = String(content.phone     ?? "777 888 999");
  const email     = String(content.email     ?? "info@drivecz.cz");
  const address   = String(content.address   ?? "Hlavní 47, 602 00 Brno");
  const ico       = String(content.ico       ?? "");
  const facebook  = String(content.facebook  ?? "");
  const instagram = String(content.instagram ?? "");
  const youtube   = String(content.youtube   ?? "");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);
  const links     = ((content.links as { label?: string; href?: string }[]) ?? []);

  const ORANGE = "#f16823";
  const FONT   = "'Roboto', sans-serif";
  const BG     = "#2a2a2a";

  const logoName = siteName.replace(/^autoškola\s*/i, "").toUpperCase() || "DRIVE CZ";

  const resolve = (href: string) => (tenantSlug && !isAdmin) ? `/demo/${tenantSlug}${href}` : href;

  const SocialLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    if (!href) return null;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)", color: "#fff", transition: "background 0.2s" }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = ORANGE; }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(255,255,255,0.08)"; }}
      >{children}</a>
    );
  };

  return (
    <footer id={String(sectionId)} style={{ backgroundColor: BG, borderTop: `4px solid ${ORANGE}`, padding: "64px clamp(16px, 5vw, 80px) 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* 3 sloupce */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "clamp(32px, 4vw, 64px)", marginBottom: 48 }}>

          {/* Sloupec 1 — Logo + tagline + social */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <span style={{ fontFamily: FONT, fontWeight: 400, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: ORANGE }}>AUTOŠKOLA</span>
              <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff", marginTop: 1 }}>{logoName}</span>
            </div>
            <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: "0.875rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: 0 }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <SocialLink href={youtube}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="#fff"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#2a2a2a"/></svg>
              </SocialLink>
              <SocialLink href={facebook}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="#fff"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </SocialLink>
              <SocialLink href={instagram}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </SocialLink>
            </div>
          </div>

          {/* Sloupec 2 — Navigace */}
          <div>
            <h4 style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", color: ORANGE, margin: "0 0 20px" }}>Navigace</h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {links.map((link, i) => (
                <li key={i}>
                  <a href={resolve(link.href ?? "/")}
                    style={{ fontFamily: FONT, fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.6)"; }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label ?? ""} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sloupec 3 — Kontakt */}
          <div>
            <h4 style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", color: ORANGE, margin: "0 0 20px" }}>Kontakt</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { v: phone,   d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.36 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z", field: "phone" },
                { v: email,   d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6", field: "email" },
                { v: address, d: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z", field: "address" },
              ].filter(x => x.v).map(({ v, d, field }) => (
                <div key={field} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                    <path d={d}/>
                  </svg>
                  <span style={{ fontFamily: FONT, fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.55 }}>
                    <GenericEditableText sectionId={sectionId} field={field} value={v} tag="span" />
                  </span>
                </div>
              ))}
              {ico && <p style={{ fontFamily: FONT, fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>IČO: {ico}</p>}
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24, textAlign: "center" }}>
          <p style={{ fontFamily: FONT, fontSize: 12, color: "rgba(255,255,255,0.35)", margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── lang-01-footer ────────────────────────────────────────────────────────────
// 1:1 jipka.cz footer:
// - #1a1a2e bg, padding 60px 40px 30px, color #a0a0b0
// - 4-col grid (2fr 1fr 1fr 1fr): logo+tagline / Kurzy / Kontakt / Sledujte nás
// - H3: bílé, 14px, letter-spacing 1.5px, uppercase
// - Logo col: 20px, text-transform none, letter-spacing -0.5px
// - Linky: 14px, #a0a0b0, hover #e63946, line-height 1.9
// - Bottom bar: border-top #2a2a3e, font-size 13px, text-align center
// ─────────────────────────────────────────────────────────────────────────────
function FooterLang01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const FONT = "'Inter', -apple-system, sans-serif";
  const RED  = "#e63946";
  const DARK = "#1a1a2e";

  const siteName  = String(content.siteName  ?? "Demo Jazykové kurzy");
  const tagline   = String(content.tagline   ?? "Jazyková škola s 35 lety zkušeností. 9 jazyků pro děti, dospělé i firmy.");
  const phone     = String(content.phone     ?? "704 123 456");
  const email     = String(content.email     ?? "info@demo.cz");
  const hours     = String(content.hours     ?? "Po–Pá 9:00–18:00");
  const facebook  = String(content.facebook  ?? "https://facebook.com/demo");
  const instagram = String(content.instagram ?? "https://instagram.com/demo");
  const linkedin  = String(content.linkedin  ?? "https://linkedin.com/demo");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName} · Všechna práva vyhrazena`);

  const navGroups = (content.navGroups as Array<{ label: string; links: Array<{ label: string; href: string }> }>) ?? [
    { label: "Kurzy", links: [
      { label: "Skupinové",    href: "/kurzy" },
      { label: "Individuální", href: "/kurzy" },
      { label: "Firemní",      href: "/kurzy" },
      { label: "Letní tábory", href: "/tabory" },
    ]},
  ];

  const resolve = (href: string) => {
    if (!href || href.startsWith("http") || href.startsWith("#")) return href;
    if (isAdmin && tenantSlug) return `/demo/${tenantSlug}${href}`;
    return href;
  };

  const displayName = siteName.replace(/^demo\s*/i, "") || "Jazykové kurzy";

  return (
    <>
      <style>{`
        .lang01foot{background:${DARK};color:#a0a0b0;padding:60px 40px 30px;font-family:${FONT};}
        .lang01foot-inner{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px;}
        .lang01foot h3{color:#fff;font-size:14px;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 18px;font-family:${FONT};}
        .lang01foot-logo-name{color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.5px;text-transform:none;display:block;margin-bottom:12px;}
        .lang01foot p,.lang01foot a{font-size:14px;color:#a0a0b0;text-decoration:none;line-height:1.9;display:block;}
        .lang01foot a:hover{color:${RED};}
        .lang01foot-bar{border-top:1px solid #2a2a3e;margin-top:32px;padding-top:24px;text-align:center;font-size:13px;color:#a0a0b0;}
        @media(max-width:900px){
          .lang01foot-inner{grid-template-columns:1fr 1fr;gap:32px;}
          .lang01foot{padding:44px 20px 24px;}
        }
        @media(max-width:500px){
          .lang01foot-inner{grid-template-columns:1fr;}
        }
      `}</style>
      <footer className="lang01foot" id="kontakt" data-template="lang-01">
        <div className="lang01foot-inner">
          {/* col 1 — logo + tagline */}
          <div>
            <span className="lang01foot-logo-name">
              <GenericEditableText sectionId={sectionId} field="siteName" value={displayName} tag="span" />
            </span>
            <p>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
          </div>

          {/* col 2+ — nav groups */}
          {navGroups.map((group, gi) => (
            <div key={gi}>
              <h3>
                <GenericEditableText sectionId={sectionId} field={`navGroups.${gi}.label`} value={group.label} tag="span" />
              </h3>
              {group.links.map((link, li) => (
                <a key={li} href={resolve(link.href)}>
                  <GenericEditableText sectionId={sectionId} field={`navGroups.${gi}.links.${li}.label`} value={link.label} tag="span" />
                </a>
              ))}
            </div>
          ))}

          {/* Kontakt col */}
          <div>
            <h3>Kontakt</h3>
            <a href={`tel:+420${phone.replace(/\s/g, "")}`}>
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
            <a href={`mailto:${email}`}>
              <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
            </a>
            <p>
              <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
            </p>
          </div>

          {/* Social col */}
          <div>
            <h3>Sledujte nás</h3>
            <a href={instagram}>
              <GenericEditableText sectionId={sectionId} field="instagram" value={instagram} tag="span">Instagram</GenericEditableText>
            </a>
            <a href={facebook}>
              <GenericEditableText sectionId={sectionId} field="facebook" value={facebook} tag="span">Facebook</GenericEditableText>
            </a>
            <a href={linkedin}>
              <GenericEditableText sectionId={sectionId} field="linkedin" value={linkedin} tag="span">LinkedIn</GenericEditableText>
            </a>
          </div>
        </div>

        <div className="lang01foot-bar">
          <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
        </div>
      </footer>
    </>
  );
}

// ── edu-01-footer ─────────────────────────────────────────────────────────────
// Navy (#132339) bg, 4 sloupce: brand+popis+socials, 3× link sloupce.
// Spodní bar: copyright + IČO. Stejné téma jako navbar.
// ─────────────────────────────────────────────────────────────────────────────
function FooterEdu01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const NAVY  = "#132339";
  const BLUE  = "#0059df";
  const LIGHT = "#91bae4";
  const WHITE = "#ffffff";
  const FONT  = "'Libre Franklin', Arial, sans-serif";

  const siteName   = String(content.siteName   ?? "Demo Akademie");
  const description = String(content.description ?? "Individuální doučování na míru pro žáky ZŠ, SŠ i VŠ po celé České republice.");
  const phone      = String(content.phone      ?? "+420 704 123 456");
  const email      = String(content.email      ?? "info@demo.cz");
  const facebook   = String(content.facebook   ?? "");
  const instagram  = String(content.instagram  ?? "");
  const copyright  = String(content.copyright  ?? "© 2026 Demo Studio s.r.o.");
  const ico        = String(content.ico        ?? "12345678");
  const columns    = (content.columns as Array<{ title: string; links: Array<{ label: string; href: string }> }>) ?? [];

  const resolve = (href: string) => {
    if (href.startsWith("http")) return href;
    return (tenantSlug && !isAdmin) ? `/demo/${tenantSlug}${href}` : href;
  };

  return (
    <>
      <style>{`
        .edu01ft{background:${NAVY};font-family:${FONT};color:${WHITE};}
        .edu01ft-main{max-width:1280px;margin:0 auto;padding:72px 40px 48px;display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:48px;}
        /* Brand col */
        .edu01ft-logo{font-size:22px;font-weight:800;color:${WHITE};letter-spacing:-0.4px;margin-bottom:14px;}
        .edu01ft-desc{font-size:14px;color:rgba(255,255,255,0.55);line-height:1.7;margin:0 0 20px;max-width:260px;}
        .edu01ft-contact a{display:flex;align-items:center;gap:8px;font-size:13px;color:rgba(255,255,255,0.65);text-decoration:none;margin-bottom:8px;transition:color 0.15s;}
        .edu01ft-contact a:hover{color:${WHITE};}
        .edu01ft-socials{display:flex;gap:10px;margin-top:20px;}
        .edu01ft-social{width:36px;height:36px;border-radius:8px;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.7);display:flex;align-items:center;justify-content:center;text-decoration:none;transition:background 0.15s,color 0.15s;}
        .edu01ft-social:hover{background:${BLUE};color:${WHITE};}
        /* Link cols */
        .edu01ft-col h4{font-size:13px;font-weight:700;color:${WHITE};letter-spacing:1.5px;text-transform:uppercase;margin:0 0 20px;}
        .edu01ft-col ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px;}
        .edu01ft-col ul li a{font-size:14px;color:rgba(255,255,255,0.55);text-decoration:none;transition:color 0.15s;}
        .edu01ft-col ul li a:hover{color:${LIGHT};}
        /* Bottom bar */
        .edu01ft-bar{border-top:1px solid rgba(255,255,255,0.08);max-width:1280px;margin:0 auto;padding:20px 40px;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:rgba(255,255,255,0.35);}
        .edu01ft-bar a{color:rgba(255,255,255,0.35);text-decoration:none;}
        .edu01ft-bar a:hover{color:rgba(255,255,255,0.6);}
        @media(max-width:960px){
          .edu01ft-main{grid-template-columns:1fr 1fr;gap:36px;}
          .edu01ft-bar{flex-direction:column;gap:8px;text-align:center;}
        }
        @media(max-width:560px){
          .edu01ft-main{grid-template-columns:1fr;padding:48px 24px 32px;}
          .edu01ft-bar{padding:16px 24px;}
        }
      `}</style>

      <footer id={String(sectionId)} className="edu01ft" data-template="edu-01-footer">
        <div className="edu01ft-main">
          {/* Brand column */}
          <div>
            <div className="edu01ft-logo">
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </div>
            <p className="edu01ft-desc">
              <GenericEditableText sectionId={sectionId} field="description" value={description} tag="span" />
            </p>
            <div className="edu01ft-contact">
              <a href={`tel:${phone.replace(/\s/g, "")}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
              <a href={`mailto:${email}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            </div>
            {(facebook || instagram) && (
              <div className="edu01ft-socials">
                {facebook && (
                  <a href={facebook} className="edu01ft-social" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </a>
                )}
                {instagram && (
                  <a href={instagram} className="edu01ft-social" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Link columns */}
          {columns.map((col, ci) => (
            <div key={ci} className="edu01ft-col">
              <h4>
                <GenericEditableText sectionId={sectionId} field={`columns.${ci}.title`} value={col.title} tag="span" />
              </h4>
              <ul>
                {col.links.map((link, li) => (
                  <li key={li}>
                    <a href={resolve(link.href)}>
                      <GenericEditableText sectionId={sectionId} field={`columns.${ci}.links.${li}.label`} value={link.label} tag="span" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="edu01ft-bar">
          <span>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
            {ico && <> · IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" /></>}
          </span>
          <span>
            <a href={resolve("/podminky")}>Obchodní podmínky</a>
            {" · "}
            <a href={resolve("/gdpr")}>GDPR</a>
          </span>
        </div>
      </footer>
    </>
  );
}

/* ─── kids-01-footer ────────────────────────────────────────────────────── */
function FooterKids01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const siteName   = String((content as any).siteName   ?? "Demo Kroužky");
  const logoUrl    = String((content as any).logoUrl    ?? "");
  const tagline    = String((content as any).tagline    ?? "");
  const columns    = ((content as any).columns as Array<{ title: string; links: Array<{ label: string; href: string }> }>) ?? [];
  const phone      = String((content as any).phone      ?? "");
  const email      = String((content as any).email      ?? "");
  const address    = String((content as any).address    ?? "");
  const facebook   = String((content as any).facebook   ?? "");
  const instagram  = String((content as any).instagram  ?? "");
  const legalName  = String((content as any).legalName  ?? "");
  const ico        = String((content as any).ico        ?? "");
  const dic        = String((content as any).dic        ?? "");
  const legalAddr  = String((content as any).legalAddress ?? "");
  const privacyHref= String((content as any).privacyHref ?? "/ochrana-udaju");
  const cookiesHref= String((content as any).cookiesHref ?? "/cookies");

  const GREEN  = "#1f5c38";
  const LGREEN = "#baeb92";
  const DARK   = "#132b1d";
  const FONT   = "'Gotham Rounded', 'Nunito', 'Trebuchet MS', sans-serif";

  return (
    <footer id={`section-${sectionId}`} style={{ background: DARK, padding: "64px 24px 32px", fontFamily: FONT }}>
      <style>{`
        .k01foot-link {
          color: rgba(255,255,255,0.65);
          text-decoration: none;
          font-size: 0.88rem;
          line-height: 2;
          display: block;
          transition: color 0.2s ease;
        }
        .k01foot-link:hover { color: ${LGREEN}; }
        .k01foot-social {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px; height: 38px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          text-decoration: none;
          font-size: 1.05rem;
          transition: background 0.22s ease, transform 0.22s ease;
        }
        .k01foot-social:hover {
          background: ${LGREEN};
          transform: translateY(-2px);
        }
        @media (max-width: 768px) {
          .k01foot-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .k01foot-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Top row */}
        <div className="k01foot-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", gap: "40px", marginBottom: 48 }}>

          {/* Brand column */}
          <div>
            <div style={{ marginBottom: 16 }}>
              {logoUrl ? (
                <img loading="lazy" src={logoUrl} alt={siteName} style={{ height: 48 }} />
              ) : (
                <span style={{ color: LGREEN, fontWeight: 800, fontSize: "1.25rem" }}>
                  <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
                </span>
              )}
            </div>
            {tagline && (
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.88rem", lineHeight: 1.65, margin: "0 0 20px", maxWidth: 260 }}>
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </p>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              {facebook && <a href={facebook} className="k01foot-social" target="_blank" rel="noopener noreferrer">f</a>}
              {instagram && <a href={instagram} className="k01foot-social" target="_blank" rel="noopener noreferrer">✦</a>}
            </div>
          </div>

          {/* Nav columns */}
          {columns.map((col, ci) => (
            <div key={ci}>
              <p style={{ color: LGREEN, fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 12px" }}>
                <GenericEditableText sectionId={sectionId} field={`columns.${ci}.title`} value={col.title} tag="span" />
              </p>
              {col.links.map((lnk, li) => (
                <a key={li} href={lnk.href} className="k01foot-link">
                  <GenericEditableText sectionId={sectionId} field={`columns.${ci}.links.${li}.label`} value={lnk.label} tag="span" />
                </a>
              ))}
            </div>
          ))}

          {/* Contact column */}
          <div>
            <p style={{ color: LGREEN, fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 12px" }}>Kontakt</p>
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="k01foot-link">
                📞 <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="k01foot-link">
                ✉ <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            )}
            {address && (
              <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.88rem", lineHeight: 2, display: "block" }}>
                🏢 <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24, display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.78rem", margin: 0 }}>
            © {new Date().getFullYear()} {legalName || siteName}
            {ico && <> | IČO: {ico}</>}
            {dic && <> | DIČ: {dic}</>}
            {legalAddr && <> | {legalAddr}</>}
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            <a href={privacyHref} className="k01foot-link" style={{ fontSize: "0.78rem" }}>Ochrana osobních údajů</a>
            <a href={cookiesHref} className="k01foot-link" style={{ fontSize: "0.78rem" }}>Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── vet-01-footer ─────────────────────────────────────────────────────────────
// Tmavý teal (#0d7486) bg, 3px border-top #42aaba
// 3-col: SVG logo+tagline+social (FB/IG) / nav linky / kontakt (tel/email/adresa/hodiny)
// Copyright bar dole
// ─────────────────────────────────────────────────────────────────────────────
function FooterVet01({
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
  const siteName       = String(content.siteName       ?? "Váš Veterinář");
  const logoUrl        = String(content.logoUrl        ?? "/templates/vet-01/logo-white.svg");
  const tagline        = String(content.tagline        ?? "Péče o vaše mazlíčky s láskou a odborností.");
  const phone          = String(content.phone          ?? "");
  const email          = String(content.email          ?? "");
  const address        = String(content.address        ?? "");
  const hours          = String(content.hours          ?? "");
  const fbHref         = String(content.fbHref         ?? "#");
  const igHref         = String(content.igHref         ?? "#");
  const copyright      = String(content.copyright      ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);
  const colTitleNav    = String(content.colTitleNav    ?? "Navigace");
  const colTitleContact= String(content.colTitleContact?? "Kontakt");
  const links          = (content.links as Array<{ label: string; href: string }>) ?? [];

  const TEAL_D  = "#0d7486";
  const TEAL_L  = "#42aaba";
  const FONT_H  = "'Forum', 'Georgia', serif";
  const FONT_B  = "'Roboto Condensed', 'Roboto', sans-serif";

  const resolve = (href: string) =>
    tenantSlug && !isAdmin && href.startsWith("/") ? `/demo/${tenantSlug}${href}` : href;

  return (
    <footer
      id={String(sectionId)}
      data-variant="vet-01-footer"
      style={{ background: TEAL_D, borderTop: `3px solid ${TEAL_L}` }}
    >
      <style>{`
        .v01ft-inner { max-width: 1140px; margin: 0 auto; padding: 56px clamp(20px,5vw,40px) 32px; }
        .v01ft-grid  { display: grid; grid-template-columns: 1.4fr 1fr 1.2fr; gap: 48px; margin-bottom: 40px; }
        .v01ft-col-title { font-family: ${FONT_B}; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${TEAL_L}; margin: 0 0 16px; }
        .v01ft-link  { display: block; font-family: ${FONT_B}; font-size: 14px; color: rgba(255,255,255,0.7); text-decoration: none; line-height: 2; transition: color 0.15s; }
        .v01ft-link:hover { color: #fff; }
        .v01ft-social { display: flex; gap: 12px; margin-top: 20px; }
        .v01ft-social a { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); text-decoration: none; transition: background 0.15s; }
        .v01ft-social a:hover { background: ${TEAL_L}; color: #fff; }
        .v01ft-bar   { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
        .v01ft-copy  { font-family: ${FONT_B}; font-size: 13px; color: rgba(255,255,255,0.4); margin: 0; }
        @media (max-width: 820px) { .v01ft-grid { grid-template-columns: 1fr 1fr; gap: 32px; } }
        @media (max-width: 520px) { .v01ft-grid { grid-template-columns: 1fr; gap: 28px; } }
      `}</style>

      <div className="v01ft-inner">
        <div className="v01ft-grid">

          {/* Col 1: Logo + tagline + social */}
          <div>
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "inline-block", marginBottom: 16 }}>
              <img
                src={logoUrl}
                alt={siteName}
                style={{ height: 40, display: "block" }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </GenericEditableImage>
            <p style={{ fontFamily: FONT_H, fontSize: "1rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.6, margin: 0 }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            <div className="v01ft-social">
              {fbHref && fbHref !== "#" && (
                <a href={fbHref} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                </a>
              )}
              {igHref && igHref !== "#" && (
                <a href={igHref} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Nav linky */}
          <div>
            <p className="v01ft-col-title">
              <GenericEditableText sectionId={sectionId} field="colTitleNav" value={colTitleNav} tag="span" />
            </p>
            {links.map((l, i) => (
              <a key={i} href={resolve(l.href)} className="v01ft-link">
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </div>

          {/* Col 3: Kontakt */}
          <div>
            <p className="v01ft-col-title">
              <GenericEditableText sectionId={sectionId} field="colTitleContact" value={colTitleContact} tag="span" />
            </p>
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="v01ft-link">
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="v01ft-link">
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            )}
            {address && (
              <span className="v01ft-link" style={{ cursor: "default" }}>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </span>
            )}
            {hours && (
              <span className="v01ft-link" style={{ cursor: "default" }}>
                <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
              </span>
            )}
          </div>
        </div>

        {/* Copyright bar */}
        <div className="v01ft-bar">
          <p className="v01ft-copy">
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </p>
        </div>
      </div>
    </footer>
  );
}


// ── pethotel-01-footer ────────────────────────────────────────────────────────
// Tmavý #712419 bg: logo + tlapka vlevo, nav linky uprostřed, kontakt + social vpravo.
// Copyright bar #5a1c14 dole.
// ─────────────────────────────────────────────────────────────────────────────
function FooterPethotel01({
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
  const siteName  = String(content.siteName  ?? "Psí školka");
  const tagline   = String(content.tagline   ?? "Psí hotel a školka — staráme se o vaše mazlíčky jako o vlastní.");
  const address   = String(content.address   ?? "");
  const legal     = String(content.legal     ?? "");
  const phone     = String(content.phone     ?? "");
  const phoneNote = String(content.phoneNote ?? "");
  const facebook  = String(content.facebook  ?? "");
  const instagram = String(content.instagram ?? "");
  const youtube   = String(content.youtube   ?? "");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);
  const links     = (content.links as Array<{ label: string; href: string }>) ?? [];

  const BROWN = "#712419";
  const DARK  = "#5a1c14";
  const RED   = "#D6123D";
  const CREAM = "#fff5ee";
  const MUTED = "rgba(255,245,238,0.55)";
  const FONT  = "'Quicksand', Arial, sans-serif";

  function resolve(href: string) {
    if (!tenantSlug || href.startsWith("http")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return href === "/" ? base : `${base}${href}`;
  }

  const PawSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 120 120" aria-hidden="true" style={{ opacity: 0.6, flexShrink: 0 }}>
      <circle cx="36" cy="26" r="12" fill={CREAM}/>
      <circle cx="60" cy="16" r="12" fill={CREAM}/>
      <circle cx="84" cy="26" r="12" fill={CREAM}/>
      <ellipse cx="60" cy="68" rx="26" ry="22" fill={CREAM}/>
      <circle cx="46" cy="88" r="10" fill={CREAM}/>
      <circle cx="74" cy="88" r="10" fill={CREAM}/>
    </svg>
  );

  const FbIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
  const IgIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/>
    </svg>
  );
  const YtIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/>
    </svg>
  );

  return (
    <>
      <style>{`
        .ph01ft { background: ${BROWN}; font-family: ${FONT}; color: ${CREAM}; }
        .ph01ft-body { max-width: 1100px; margin: 0 auto; padding: 72px 32px 56px; display: grid; grid-template-columns: 1.2fr 1fr 1.1fr; gap: 48px; }
        @media(max-width:860px){ .ph01ft-body { grid-template-columns: 1fr; gap: 36px; padding: 52px 24px 40px; } }

        /* Logo col */
        .ph01ft-logo-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .ph01ft-logo-name { font-size: 22px; font-weight: 800; color: ${CREAM}; line-height: 1.1; }
        .ph01ft-tagline { font-size: 14px; color: ${MUTED}; font-weight: 500; line-height: 1.55; margin: 0 0 20px; }
        .ph01ft-address { font-size: 13px; color: ${MUTED}; font-weight: 500; line-height: 1.6; margin: 0; }
        .ph01ft-legal { font-size: 12px; color: ${MUTED}; margin: 6px 0 0; }

        /* Nav col */
        .ph01ft-nav-title { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: ${MUTED}; margin: 0 0 20px; }
        .ph01ft-nav-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
        .ph01ft-nav-list a { color: ${CREAM}; text-decoration: none; font-size: 15px; font-weight: 600; transition: color 0.2s; }
        .ph01ft-nav-list a:hover { color: #F9C93D; }

        /* Contact col */
        .ph01ft-ct-title { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: ${MUTED}; margin: 0 0 20px; }
        .ph01ft-phone { font-size: 26px; font-weight: 800; color: ${CREAM}; text-decoration: none; display: block; margin-bottom: 6px; transition: color 0.2s; }
        .ph01ft-phone:hover { color: #F9C93D; }
        .ph01ft-phone-note { font-size: 13px; color: ${MUTED}; font-weight: 500; margin: 0 0 28px; line-height: 1.5; }
        .ph01ft-social { display: flex; gap: 12px; }
        .ph01ft-social-btn {
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(255,245,238,0.12); color: ${CREAM};
          text-decoration: none; transition: background 0.2s, color 0.2s;
        }
        .ph01ft-social-btn:hover { background: ${RED}; color: #fff; }

        /* Bar */
        .ph01ft-bar { background: ${DARK}; }
        .ph01ft-bar-inner { max-width: 1100px; margin: 0 auto; padding: 18px 32px; display: flex; align-items: center; justify-content: center; }
        .ph01ft-copy { font-size: 13px; color: ${MUTED}; font-weight: 500; margin: 0; text-align: center; }
      `}</style>

      <footer className="ph01ft" data-template="pethotel-01-footer">
        <div className="ph01ft-body">

          {/* Logo + adresa */}
          <div>
            <div className="ph01ft-logo-row">
              <PawSvg />
              <span className="ph01ft-logo-name">
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </span>
            </div>
            <p className="ph01ft-tagline">
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            {address && (
              <p className="ph01ft-address">
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </p>
            )}
            {legal && (
              <p className="ph01ft-legal">
                <GenericEditableText sectionId={sectionId} field="legal" value={legal} tag="span" />
              </p>
            )}
          </div>

          {/* Navigace */}
          <nav>
            <p className="ph01ft-nav-title">Navigace</p>
            <ul className="ph01ft-nav-list">
              {links.map((link, i) => (
                <li key={i}>
                  <a href={resolve(link.href)}>
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kontakt + social */}
          <div>
            <p className="ph01ft-ct-title">Kontakt</p>
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="ph01ft-phone">
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            )}
            {phoneNote && (
              <p className="ph01ft-phone-note">
                <GenericEditableText sectionId={sectionId} field="phoneNote" value={phoneNote} tag="span" />
              </p>
            )}
            <div className="ph01ft-social">
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" className="ph01ft-social-btn" aria-label="Facebook">
                  <FbIcon />
                </a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" className="ph01ft-social-btn" aria-label="Instagram">
                  <IgIcon />
                </a>
              )}
              {youtube && (
                <a href={youtube} target="_blank" rel="noopener noreferrer" className="ph01ft-social-btn" aria-label="YouTube">
                  <YtIcon />
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="ph01ft-bar">
          <div className="ph01ft-bar-inner">
            <p className="ph01ft-copy">
              <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

function FooterGrooming01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const GOLD  = "#d0aa57";
  const DARK  = "#101417";
  const FONT  = "'Hanken Grotesk', 'Inter', sans-serif";

  function resolveDemoHref(href: string) {
    if (!tenantSlug || !href.startsWith("/")) return href;
    if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
  }

  const siteName  = String(content.siteName  ?? "Psí Salón");
  const tagline   = String(content.tagline   ?? "Prémiová péče o Vaše miláčky");
  const phone     = String(content.phone     ?? "");
  const email     = String(content.email     ?? "");
  const address   = String(content.address   ?? "");
  const ico       = String(content.ico       ?? "");
  const hours     = String(content.hours     ?? "");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}`);

  type NavLink = { label?: string; href?: string };
  type Social  = { icon?: string; label?: string; href?: string };
  const links   = (content.links   as NavLink[]) ?? [];
  const socials = (content.socials as Social[])  ?? [];

  return (
    <footer data-template="grooming-01-footer" style={{ background: DARK, fontFamily: FONT, borderTop: `2px solid ${GOLD}` }}>
      <style>{`
        .gr01ft-body{max-width:1280px;margin:0 auto;padding:clamp(48px,6vw,72px) clamp(24px,4vw,56px) clamp(32px,5vw,56px);display:grid;grid-template-columns:1.4fr 1fr 1.2fr;gap:48px;}
        .gr01ft-logo{display:flex;align-items:center;gap:10px;margin-bottom:16px;text-decoration:none;}
        .gr01ft-logo-name{font-size:18px;font-weight:700;color:#fff;letter-spacing:0.5px;}
        .gr01ft-tagline{font-size:13px;color:rgba(255,255,255,0.5);margin:0 0 24px;line-height:1.5;}
        .gr01ft-social{display:flex;gap:10px;}
        .gr01ft-social a{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;border:1.5px solid rgba(208,170,87,0.35);transition:border-color 0.2s,background 0.2s;}
        .gr01ft-social a:hover{border-color:${GOLD};background:rgba(208,170,87,0.12);}
        .gr01ft-col-title{font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:${GOLD};margin:0 0 20px;}
        .gr01ft-links{display:flex;flex-direction:column;gap:10px;}
        .gr01ft-links a{font-size:14px;color:rgba(255,255,255,0.6);text-decoration:none;transition:color 0.2s;}
        .gr01ft-links a:hover{color:#fff;}
        .gr01ft-info{display:flex;flex-direction:column;gap:10px;}
        .gr01ft-info-row{display:flex;align-items:flex-start;gap:10px;}
        .gr01ft-info-val{font-size:13px;color:rgba(255,255,255,0.6);line-height:1.5;}
        .gr01ft-info-val a{color:rgba(255,255,255,0.6);text-decoration:none;}
        .gr01ft-bar{border-top:1px solid rgba(255,255,255,0.08);margin:0 clamp(24px,4vw,56px);}
        .gr01ft-bar-inner{max-width:1280px;margin:0 auto;padding:20px 0;display:flex;justify-content:center;}
        .gr01ft-copy{font-size:12px;color:rgba(255,255,255,0.3);margin:0;}
        @media(max-width:800px){
          .gr01ft-body{grid-template-columns:1fr;gap:36px;}
        }
      `}</style>

      <div className="gr01ft-body">
        {/* Col 1 — logo + tagline + social */}
        <div>
          <a href={resolveDemoHref("/")} className="gr01ft-logo">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <ellipse cx="8"  cy="8"  rx="4"  ry="5.5" fill={GOLD}/>
              <ellipse cx="24" cy="8"  rx="4"  ry="5.5" fill={GOLD}/>
              <ellipse cx="4"  cy="20" rx="3.5" ry="4.5" fill={GOLD}/>
              <ellipse cx="28" cy="20" rx="3.5" ry="4.5" fill={GOLD}/>
              <ellipse cx="16" cy="22" rx="8"  ry="7"   fill={GOLD}/>
            </svg>
            <span className="gr01ft-logo-name">
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </span>
          </a>
          <p className="gr01ft-tagline">
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          {socials.length > 0 && (
            <div className="gr01ft-social">
              {socials.map((s, i) => (
                <a key={i} href={s.href ?? "#"} target="_blank" rel="noopener noreferrer" aria-label={s.label ?? s.icon ?? ""}>
                  {s.icon === "facebook" ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill={GOLD}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Col 2 — nav links */}
        <div>
          <p className="gr01ft-col-title">Menu</p>
          <nav className="gr01ft-links">
            {links.map((l, i) => (
              <a key={i} href={l.href ?? "#"}>
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label ?? ""} tag="span" />
              </a>
            ))}
          </nav>
        </div>

        {/* Col 3 — contact info */}
        <div>
          <p className="gr01ft-col-title">Kontakt</p>
          <div className="gr01ft-info">
            {phone && (
              <div className="gr01ft-info-row">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginTop:2,flexShrink:0}}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 13.5 19.79 19.79 0 0 1 1 4.82 2 2 0 0 1 3 2.67h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.92z"/></svg>
                <span className="gr01ft-info-val"><a href={`tel:${phone.replace(/\s/g,"")}`}><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" /></a></span>
              </div>
            )}
            {email && (
              <div className="gr01ft-info-row">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginTop:2,flexShrink:0}}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <span className="gr01ft-info-val"><a href={`mailto:${email}`}><GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" /></a></span>
              </div>
            )}
            {address && (
              <div className="gr01ft-info-row">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginTop:2,flexShrink:0}}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span className="gr01ft-info-val"><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></span>
              </div>
            )}
            {hours && (
              <div className="gr01ft-info-row">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginTop:2,flexShrink:0}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className="gr01ft-info-val"><GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" /></span>
              </div>
            )}
            {ico && (
              <div className="gr01ft-info-row">
                <span className="gr01ft-info-val" style={{paddingLeft:23}}>IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" /></span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="gr01ft-bar">
        <div className="gr01ft-bar-inner">
          <p className="gr01ft-copy">
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── ucetni-02-footer ──────────────────────────────────────────────────────────
// grantex.cz style: dark green #004835 bg, gold 3px border-top
// 3-col: logo+tagline+socials / nav links / contact info
// Bottom bar: copyright + legal links
// ─────────────────────────────────────────────────────────────────────────────
function FooterUcetni02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const GREEN  = "#004835";
  const GOLD   = "#bca160";
  const FONT_H = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const FONT_B = "'Open Sans', Arial, sans-serif";

  const siteName  = String(content.siteName  ?? "Demo Daňový Poradce");
  const tagline   = String(content.tagline   ?? "Váš spolehlivý partner pro daňové poradenství a vedení účetnictví.");
  const logoUrl   = String(content.logoUrl   ?? "");
  const email     = String(content.email     ?? "email@demo.cz");
  const phone     = String(content.phone     ?? "+420 704 123 456");
  const address   = String(content.address   ?? "Ukázková 123, 110 00 Praha 1");
  const ico       = String(content.ico       ?? "");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}`);

  type LinkItem   = { label?: string; href?: string };
  type SocialItem = { icon?: string; href?: string; label?: string };

  const links      = (content.links      as LinkItem[])   ?? [];
  const legalLinks = (content.legalLinks as LinkItem[])   ?? [];
  const socials    = (content.socials    as SocialItem[]) ?? [];

  const resolveHref = (href: string) => {
    if (!tenantSlug || href.startsWith("#") || href.startsWith("http")) return href;
    if (href === "/") return isAdmin ? `/admin/${tenantSlug}` : `/demo/${tenantSlug}`;
    return isAdmin ? `/admin/${tenantSlug}${href}` : `/demo/${tenantSlug}${href}`;
  };

  const SOCIAL_ICONS: Record<string, string> = {
    linkedin:  `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
    facebook:  `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
    instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
  };

  return (
    <>
      <style>{`
        .ucn02ft-footer {
          background: ${GREEN};
          border-top: 3px solid ${GOLD};
          font-family: ${FONT_B};
          color: rgba(255,255,255,0.7);
        }
        .ucn02ft-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 64px 40px 48px;
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 56px;
        }
        /* Col 1 */
        .ucn02ft-logo { height: 48px; width: auto; margin-bottom: 18px; display: block; }
        .ucn02ft-tagline {
          font-size: 0.88rem;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          margin: 0 0 24px 0;
          max-width: 280px;
        }
        .ucn02ft-socials { display: flex; gap: 8px; }
        .ucn02ft-social {
          width: 36px; height: 36px;
          border-radius: 6px;
          border: 1px solid rgba(188,161,96,0.35);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.55);
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .ucn02ft-social:hover { border-color: ${GOLD}; color: ${GOLD}; background: rgba(188,161,96,0.1); }
        /* Col headers */
        .ucn02ft-col-title {
          font-family: ${FONT_H};
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: ${GOLD};
          margin: 0 0 20px 0;
        }
        /* Nav links */
        .ucn02ft-nav { display: flex; flex-direction: column; gap: 10px; list-style: none; margin: 0; padding: 0; }
        .ucn02ft-nav a {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          transition: color 0.2s;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .ucn02ft-nav a::before {
          content: '';
          display: inline-block;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: ${GOLD};
          opacity: 0.5;
          transition: opacity 0.2s;
          flex-shrink: 0;
        }
        .ucn02ft-nav a:hover { color: #fff; }
        .ucn02ft-nav a:hover::before { opacity: 1; }
        /* Contact items */
        .ucn02ft-contact-list { display: flex; flex-direction: column; gap: 14px; }
        .ucn02ft-contact-item { display: flex; flex-direction: column; gap: 2px; }
        .ucn02ft-contact-label {
          font-family: ${FONT_H};
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: ${GOLD};
          font-weight: 600;
          opacity: 0.75;
        }
        .ucn02ft-contact-value {
          font-size: 0.88rem;
          color: rgba(255,255,255,0.72);
        }
        /* Bottom bar */
        .ucn02ft-bar { border-top: 1px solid rgba(255,255,255,0.08); }
        .ucn02ft-bar-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .ucn02ft-copy { font-size: 0.78rem; color: rgba(255,255,255,0.3); margin: 0; }
        .ucn02ft-legal { display: flex; gap: 20px; }
        .ucn02ft-legal a {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.3);
          text-decoration: none;
          transition: color 0.2s;
        }
        .ucn02ft-legal a:hover { color: rgba(255,255,255,0.6); }
        @media (max-width: 900px) {
          .ucn02ft-main { grid-template-columns: 1fr 1fr; gap: 40px; padding: 48px 24px 40px; }
        }
        @media (max-width: 600px) {
          .ucn02ft-main { grid-template-columns: 1fr; gap: 32px; padding: 40px 20px 32px; }
          .ucn02ft-bar-inner { flex-direction: column; align-items: flex-start; padding: 16px 20px; }
        }
      `}</style>

      <footer className="ucn02ft-footer" data-template="ucetni-02-footer">
        <div className="ucn02ft-main">

          {/* Col 1: logo + tagline + socials */}
          <div>
            {logoUrl ? (
              <img loading="lazy" src={logoUrl} alt={siteName} className="ucn02ft-logo" />
            ) : (
              <span style={{ fontFamily: FONT_H, fontWeight: 800, fontSize: "1.1rem", color: "#fff", display: "block", marginBottom: 18 }}>{siteName}</span>
            )}
            <p className="ucn02ft-tagline">
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            {socials.length > 0 && (
              <div className="ucn02ft-socials">
                {socials.map((s, i) => (
                  <a key={i} href={s.href ?? "#"} aria-label={s.label ?? ""} className="ucn02ft-social" target="_blank" rel="noopener noreferrer"
                    dangerouslySetInnerHTML={{ __html: SOCIAL_ICONS[s.icon ?? ""] ?? "" }} />
                ))}
              </div>
            )}
          </div>

          {/* Col 2: nav links */}
          <div>
            <div className="ucn02ft-col-title">Navigace</div>
            <ul className="ucn02ft-nav">
              {links.map((l, i) => (
                <li key={i}>
                  <a href={resolveHref(l.href ?? "#")}>
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={String(l.label ?? "")} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: contact */}
          <div>
            <div className="ucn02ft-col-title">Kontakt</div>
            <div className="ucn02ft-contact-list">
              {phone && (
                <div className="ucn02ft-contact-item">
                  <span className="ucn02ft-contact-label">Telefon</span>
                  <span className="ucn02ft-contact-value">
                    <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                  </span>
                </div>
              )}
              {email && (
                <div className="ucn02ft-contact-item">
                  <span className="ucn02ft-contact-label">E-mail</span>
                  <span className="ucn02ft-contact-value">
                    <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                  </span>
                </div>
              )}
              {address && (
                <div className="ucn02ft-contact-item">
                  <span className="ucn02ft-contact-label">Adresa</span>
                  <span className="ucn02ft-contact-value">
                    <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                  </span>
                </div>
              )}
              {ico && (
                <div className="ucn02ft-contact-item">
                  <span className="ucn02ft-contact-label">IČO</span>
                  <span className="ucn02ft-contact-value">
                    <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" />
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="ucn02ft-bar">
          <div className="ucn02ft-bar-inner">
            <p className="ucn02ft-copy">
              <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
            </p>
            {legalLinks.length > 0 && (
              <div className="ucn02ft-legal">
                {legalLinks.map((l, i) => (
                  <a key={i} href={resolveHref(l.href ?? "#")}>
                    <GenericEditableText sectionId={sectionId} field={`legalLinks.${i}.label`} value={String(l.label ?? "")} tag="span" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}

// ── ucetni-03-footer ──────────────────────────────────────────────────────────
// gpf.cz style: dark #002000 bg, green #8ec63f 3px border-top
// 3-col: logo+tagline+socials / nav links / contact info
// Bottom bar: copyright + legal links
// ─────────────────────────────────────────────────────────────────────────────
function FooterUcetni03({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const DARK   = "#002000";
  const GREEN  = "#8ec63f";
  const FONT_H = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const FONT_B = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  const siteName  = String(content.siteName  ?? "Demo Hypoteční Poradce");
  const tagline   = String(content.tagline   ?? "Váš spolehlivý partner pro výběr hypotéky a financování nemovitostí.");
  const logoUrl   = String(content.logoUrl   ?? "");
  const email     = String(content.email     ?? "email@demo.cz");
  const phone     = String(content.phone     ?? "+420 704 123 456");
  const address   = String(content.address   ?? "Ukázková 123, 110 00 Praha 1");
  const ico       = String(content.ico       ?? "");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}`);

  type LinkItem    = { label?: string; href?: string };
  type SocialItem  = { icon?: string; href?: string; label?: string };

  const links      = (content.links      as LinkItem[])   ?? [];
  const legalLinks = (content.legalLinks as LinkItem[])   ?? [];
  const socials    = (content.socials    as SocialItem[]) ?? [];

  const resolveHref = (href: string) => {
    if (!tenantSlug || href.startsWith("#") || href.startsWith("http")) return href;
    if (href === "/") return isAdmin ? `/admin/${tenantSlug}` : `/demo/${tenantSlug}`;
    return isAdmin ? `/admin/${tenantSlug}${href}` : `/demo/${tenantSlug}${href}`;
  };

  const SOCIAL_ICONS: Record<string, string> = {
    linkedin:  `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
    facebook:  `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
    instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
  };

  return (
    <>
      <style>{`
        .ucn03ft-footer {
          background: ${DARK};
          border-top: 3px solid ${GREEN};
          font-family: ${FONT_B};
          color: rgba(255,255,255,0.75);
        }
        .ucn03ft-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 64px 40px 48px;
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr;
          gap: 56px;
        }
        .ucn03ft-logo-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .ucn03ft-logo { height: 48px; width: auto; }
        .ucn03ft-tagline {
          font-size: 0.88rem;
          color: rgba(255,255,255,0.55);
          line-height: 1.65;
          margin: 0 0 24px 0;
          max-width: 280px;
        }
        .ucn03ft-socials { display: flex; gap: 10px; }
        .ucn03ft-social {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .ucn03ft-social:hover { border-color: ${GREEN}; color: ${GREEN}; background: rgba(142,198,63,0.08); }
        .ucn03ft-col-title {
          font-family: ${FONT_H};
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: ${GREEN};
          margin: 0 0 20px 0;
        }
        .ucn03ft-nav { display: flex; flex-direction: column; gap: 10px; list-style: none; margin: 0; padding: 0; }
        .ucn03ft-nav a {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.65);
          text-decoration: none;
          transition: color 0.2s;
        }
        .ucn03ft-nav a:hover { color: ${GREEN}; }
        .ucn03ft-contact-list { display: flex; flex-direction: column; gap: 12px; }
        .ucn03ft-contact-item { display: flex; flex-direction: column; gap: 2px; }
        .ucn03ft-contact-label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: rgba(255,255,255,0.35);
          font-weight: 600;
        }
        .ucn03ft-contact-value {
          font-size: 0.88rem;
          color: rgba(255,255,255,0.75);
        }
        /* Bottom bar */
        .ucn03ft-bar {
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .ucn03ft-bar-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .ucn03ft-copy {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.35);
          margin: 0;
        }
        .ucn03ft-legal { display: flex; gap: 20px; }
        .ucn03ft-legal a {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          transition: color 0.2s;
        }
        .ucn03ft-legal a:hover { color: rgba(255,255,255,0.65); }
        @media (max-width: 900px) {
          .ucn03ft-main { grid-template-columns: 1fr 1fr; gap: 40px; padding: 48px 24px 40px; }
        }
        @media (max-width: 600px) {
          .ucn03ft-main { grid-template-columns: 1fr; gap: 32px; padding: 40px 20px 32px; }
          .ucn03ft-bar-inner { flex-direction: column; align-items: flex-start; padding: 16px 20px; }
        }
      `}</style>

      <footer className="ucn03ft-footer" data-template="ucetni-03-footer">
        <div className="ucn03ft-main">

          {/* Col 1: logo + tagline + socials */}
          <div>
            <div className="ucn03ft-logo-wrap">
              {logoUrl ? (
                <img loading="lazy" src={logoUrl} alt={siteName} className="ucn03ft-logo" />
              ) : (
                <span style={{ fontFamily: FONT_H, fontWeight: 800, fontSize: "1.1rem", color: "#fff" }}>{siteName}</span>
              )}
            </div>
            <p className="ucn03ft-tagline">
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            {socials.length > 0 && (
              <div className="ucn03ft-socials">
                {socials.map((s, i) => (
                  <a key={i} href={s.href ?? "#"} className="ucn03ft-social" aria-label={s.label ?? ""} target="_blank" rel="noopener noreferrer"
                    dangerouslySetInnerHTML={{ __html: SOCIAL_ICONS[s.icon ?? ""] ?? "" }} />
                ))}
              </div>
            )}
          </div>

          {/* Col 2: navigation */}
          <div>
            <div className="ucn03ft-col-title">Navigace</div>
            <ul className="ucn03ft-nav">
              {links.map((link, i) => (
                <li key={i}>
                  <a href={resolveHref(link.href ?? "#")}>
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={String(link.label ?? "")} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: contact */}
          <div>
            <div className="ucn03ft-col-title">Kontakt</div>
            <div className="ucn03ft-contact-list">
              {[
                { label: "Telefon", value: phone, field: "phone" },
                { label: "E-mail",  value: email, field: "email" },
                { label: "Adresa",  value: address, field: "address" },
                ...(ico ? [{ label: "IČO", value: ico, field: "ico" }] : []),
              ].map((item, i) => (
                <div key={i} className="ucn03ft-contact-item">
                  <span className="ucn03ft-contact-label">{item.label}</span>
                  <span className="ucn03ft-contact-value">
                    <GenericEditableText sectionId={sectionId} field={item.field} value={item.value} tag="span" />
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="ucn03ft-bar">
          <div className="ucn03ft-bar-inner">
            <p className="ucn03ft-copy">
              <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
            </p>
            {legalLinks.length > 0 && (
              <div className="ucn03ft-legal">
                {legalLinks.map((link, i) => (
                  <a key={i} href={link.href ?? "#"}>
                    <GenericEditableText sectionId={sectionId} field={`legalLinks.${i}.label`} value={String(link.label ?? "")} tag="span" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}

// ── ucetni-01-footer ──────────────────────────────────────────────────────────
// ucetnictvispravne.cz style: dark #202124 bg, yellow #FFB500 accent
// 3-col: logo+tagline+socials / nav links / contact info (email/phone/address/ico)
// Bottom bar: border-top #46484E + copyright center
// ─────────────────────────────────────────────────────────────────────────────
function FooterUcetni01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const DARK    = "#202124";
  const YELLOW  = "#FFB500";
  const BORDER  = "#46484E";
  const FONT_H  = "'Space Grotesk', 'Helvetica Neue', Arial, sans-serif";
  const FONT_B  = "'Inter', 'Helvetica Neue', Arial, sans-serif";

  const siteName  = String(content.siteName  ?? "Demo Účetnictví");
  const tagline   = String(content.tagline   ?? "Váš spolehlivý partner pro vedení účetnictví a daňové poradenství.");
  const logoUrl   = String(content.logoUrl   ?? "");
  const email     = String(content.email     ?? "email@demo.cz");
  const phone     = String(content.phone     ?? "+420 704 123 456");
  const address   = String(content.address   ?? "Ukázková 123, 110 00 Praha 1");
  const ico       = String(content.ico       ?? "");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}`);

  type LinkItem   = { label?: string; href?: string };
  type SocialItem = { icon?: string; href?: string; label?: string };

  const links      = (content.links      as LinkItem[])   ?? [];
  const legalLinks = (content.legalLinks as LinkItem[])   ?? [];
  const socials    = (content.socials    as SocialItem[]) ?? [];

  const resolveHref = (href: string) => {
    if (!tenantSlug || href.startsWith("#") || href.startsWith("http")) return href;
    if (href === "/") return isAdmin ? `/admin/${tenantSlug}` : `/demo/${tenantSlug}`;
    return isAdmin ? `/admin/${tenantSlug}${href}` : `/demo/${tenantSlug}${href}`;
  };

  const SOCIAL_ICONS: Record<string, string> = {
    linkedin:  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
    facebook:  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
    instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
  };

  return (
    <>
      <style>{`
        .ucn01ft-footer {
          background: ${DARK};
          font-family: ${FONT_B};
          color: rgba(255,255,255,0.7);
        }
        .ucn01ft-main {
          max-width: 1320px;
          margin: 0 auto;
          padding: 100px 40px 0;
          display: grid;
          grid-template-columns: 1.4fr 1fr 1.2fr;
          gap: 56px;
          border-bottom: 2px solid ${BORDER};
          padding-bottom: 57px;
        }
        .ucn01ft-logo {
          height: 48px;
          width: auto;
          margin-bottom: 16px;
          display: block;
        }
        .ucn01ft-sitename {
          font-family: ${FONT_H};
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 12px 0;
        }
        .ucn01ft-tagline {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          margin: 0 0 28px 0;
          max-width: 300px;
        }
        .ucn01ft-socials { display: flex; gap: 10px; }
        .ucn01ft-social {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.55);
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .ucn01ft-social:hover {
          border-color: ${YELLOW};
          color: ${YELLOW};
          background: rgba(255,181,0,0.08);
        }
        .ucn01ft-col-heading {
          font-family: ${FONT_H};
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          margin: 0 0 20px 0;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .ucn01ft-nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ucn01ft-nav-link {
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          font-size: 1rem;
          font-weight: 400;
          transition: color 0.2s;
        }
        .ucn01ft-nav-link:hover { color: ${YELLOW}; }
        .ucn01ft-contact-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .ucn01ft-contact-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: rgba(255,255,255,0.75);
          font-size: 1rem;
          font-weight: 400;
        }
        .ucn01ft-contact-icon {
          flex-shrink: 0;
          margin-top: 2px;
          color: rgba(255,255,255,0.5);
        }
        .ucn01ft-contact-link {
          color: rgba(255,255,255,0.75);
          text-decoration: none;
          transition: color 0.2s;
        }
        .ucn01ft-contact-link:hover { color: ${YELLOW}; }
        .ucn01ft-bar {
          max-width: 1320px;
          margin: 0 auto;
          padding: 25px 40px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .ucn01ft-copy {
          font-family: ${FONT_H};
          font-size: 0.9rem;
          color: #6E7077;
          margin: 0;
        }
        .ucn01ft-legal { display: flex; gap: 20px; }
        .ucn01ft-legal-link {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          transition: color 0.2s;
        }
        .ucn01ft-legal-link:hover { color: ${YELLOW}; }
        @media (max-width: 900px) {
          .ucn01ft-main {
            grid-template-columns: 1fr;
            padding: 40px 24px 30px;
            gap: 36px;
          }
          .ucn01ft-tagline { max-width: 100%; }
          .ucn01ft-bar { padding: 20px 24px 16px; flex-direction: column; align-items: center; text-align: center; }
        }
      `}</style>
      <footer className="ucn01ft-footer">
        <div className="ucn01ft-main">

          {/* Col 1: Logo / sitename + tagline + socials */}
          <div>
            {logoUrl ? (
              <img loading="lazy" src={logoUrl} alt={siteName} className="ucn01ft-logo" />
            ) : (
              <p className="ucn01ft-sitename">
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </p>
            )}
            <p className="ucn01ft-tagline">
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            {socials.length > 0 && (
              <div className="ucn01ft-socials">
                {socials.map((s, i) => {
                  const icon = SOCIAL_ICONS[s.icon ?? ""] ?? "";
                  return (
                    <a key={i} href={s.href ?? "#"} target="_blank" rel="noopener noreferrer"
                       className="ucn01ft-social" title={s.label ?? ""}
                       dangerouslySetInnerHTML={{ __html: icon }} />
                  );
                })}
              </div>
            )}
          </div>

          {/* Col 2: Nav links */}
          {links.length > 0 && (
            <div>
              <p className="ucn01ft-col-heading">Navigace</p>
              <ul className="ucn01ft-nav-list">
                {links.map((l, i) => (
                  <li key={i}>
                    <a href={resolveHref(l.href ?? "#")} className="ucn01ft-nav-link">
                      <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label ?? ""} tag="span" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Col 3: Contact */}
          <div>
            <p className="ucn01ft-col-heading">Kontakt</p>
            <ul className="ucn01ft-contact-list">
              {email && (
                <li>
                  <div className="ucn01ft-contact-row">
                    <span className="ucn01ft-contact-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
                    </span>
                    <a href={`mailto:${email}`} className="ucn01ft-contact-link">
                      <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                    </a>
                  </div>
                </li>
              )}
              {phone && (
                <li>
                  <div className="ucn01ft-contact-row">
                    <span className="ucn01ft-contact-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.27 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.11a16 16 0 0 0 7.8 7.8l1.41-1.41a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </span>
                    <a href={`tel:${phone.replace(/\s/g, "")}`} className="ucn01ft-contact-link">
                      <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                    </a>
                  </div>
                </li>
              )}
              {address && (
                <li>
                  <div className="ucn01ft-contact-row">
                    <span className="ucn01ft-contact-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    </span>
                    <span><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></span>
                  </div>
                </li>
              )}
              {ico && (
                <li>
                  <div className="ucn01ft-contact-row" style={{ paddingLeft: 26 }}>
                    <span>IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" /></span>
                  </div>
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="ucn01ft-bar">
          <p className="ucn01ft-copy">
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </p>
          {legalLinks.length > 0 && (
            <div className="ucn01ft-legal">
              {legalLinks.map((l, i) => (
                <a key={i} href={resolveHref(l.href ?? "#")} className="ucn01ft-legal-link">
                  <GenericEditableText sectionId={sectionId} field={`legalLinks.${i}.label`} value={l.label ?? ""} tag="span" />
                </a>
              ))}
            </div>
          )}
        </div>
      </footer>
    </>
  );
}

// ── solar-01-footer ───────────────────────────────────────────────────────────
// solar-01 — Premium 4-col dark navy footer.
// Col 1 (brand, wide): SunMark logo w/ orbit + tagline + contact rows (phone/email
// w/ icon boxes) + social buttons w/ gradient hover.
// Col 2 (services): links list w/ orange hairline slide-in on hover.
// Col 3 (company): links list.
// Col 4 (info): address, IČ, hours w/ orange labels.
// Bottom bar: copyright + legal links + WeberoCredit (SEO backlink).
// resolveNavHref for multipage/onepage support.
// ─────────────────────────────────────────────────────────────────────────────
function FooterSolar01({ content, sectionId, tenantSlug, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin?: boolean;
}) {
  type LinkItem = { label?: string; href?: string };
  const siteMode      = String(content.siteMode ?? "multipage");
  const siteName      = String(content.siteName ?? "HeliosTech");
  const tagline       = String(content.tagline  ?? "Fotovoltaika & tepelná čerpadla");
  const tagName       = String(content.tagName  ?? "Solar Systems");
  const description   = String(content.description ?? "Kompletní realizace fotovoltaických elektráren a tepelných čerpadel po celé České republice — od návrhu po předání do provozu.");
  const phone         = String(content.phone   ?? "800 123 456");
  const email         = String(content.email   ?? "info@heliostech-demo.cz");
  const address       = String(content.address ?? "Energetická 42, 602 00 Brno");
  const ic            = String(content.ic      ?? "87654321");
  const hours         = String(content.hours   ?? "Po–Pá 8:00–17:00");
  const facebook      = String(content.facebook  ?? "https://facebook.com/demo");
  const instagram     = String(content.instagram ?? "https://instagram.com/demo");
  const linkedin      = String(content.linkedin  ?? "https://linkedin.com/company/demo");
  const servicesTitle = String(content.servicesTitle ?? "Služby");
  const companyTitle  = String(content.companyTitle  ?? "Společnost");
  const infoTitle     = String(content.infoTitle     ?? "Kontakt & sídlo");
  const addressLabel  = String(content.addressLabel  ?? "Sídlo firmy");
  const icLabel       = String(content.icLabel       ?? "IČO");
  const hoursLabel    = String(content.hoursLabel    ?? "Otevírací doba");
  const rawServices   = ((content.links as LinkItem[]) ?? []).slice(0, 5);
  const services      = rawServices.length > 0 ? rawServices : [
    { label: "Fotovoltaika s baterií",  href: "/sluzby" },
    { label: "Fotovoltaika do sítě",    href: "/sluzby" },
    { label: "Tepelná čerpadla",        href: "/sluzby" },
    { label: "Solární ohřev vody",      href: "/sluzby" },
  ];
  const rawCompany    = (content.companyLinks as LinkItem[]) ?? [];
  const company       = rawCompany.length > 0 ? rawCompany : [
    { label: "O nás",       href: "/onas"    },
    { label: "Reference",   href: "/recenze" },
    { label: "Dotace NZÚ",  href: "/dotace"  },
    { label: "Kontakt",     href: "/kontakt" },
  ];
  const legal = (content.legalLinks as LinkItem[]) ?? [
    { label: "Ochrana údajů", href: "/gdpr"     },
    { label: "Cookies",       href: "/cookies"  },
  ];
  const copyright = String(content.copyright ?? "Všechna práva vyhrazena.");
  const year = new Date().getFullYear();
  // Local resolveNavHref (multipage/onepage compat) — matches NavbarSection helper.
  const resolve = (href: string): string => {
    if (!href) return "#";
    if (siteMode === "onepage") {
      // pages -> anchors: /sluzby -> /#sluzby
      if (href.startsWith("/") && href !== "/") {
        const slug = href.replace(/^\//, "");
        return tenantSlug ? (isAdmin ? `/demo/${tenantSlug}/admin#${slug}` : `/demo/${tenantSlug}#${slug}`) : `/#${slug}`;
      }
      if (href.startsWith("#")) {
        return tenantSlug ? (isAdmin ? `/demo/${tenantSlug}/admin${href}` : `/demo/${tenantSlug}${href}`) : href;
      }
      return href;
    }
    // multipage: anchors -> pages, /sluzby stays /sluzby
    if (href.startsWith("#")) {
      const slug = href.replace(/^#/, "");
      return tenantSlug ? (isAdmin ? `/demo/${tenantSlug}/${slug}/admin` : `/demo/${tenantSlug}/${slug}`) : `/${slug}`;
    }
    if (href.startsWith("/") && tenantSlug) {
      return isAdmin ? `/demo/${tenantSlug}${href === "/" ? "" : href}/admin` : `/demo/${tenantSlug}${href === "/" ? "" : href}`;
    }
    return href;
  };
  const phoneTel = phone.replace(/\s+/g, "");

  const NAVY = "#0d2a3a";

  const IconPhone = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72a2 2 0 0 1 1.72 2z"/>
    </svg>
  );
  const IconMail = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  );
  const IconFacebook = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
  const IconInstagram = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
  const IconLinkedin = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4 4h4v16H4zM6 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM10 8h4v2a4 4 0 0 1 8 0v10h-4v-9a2 2 0 0 0-4 0v9h-4z"/>
    </svg>
  );

  return (
    <footer className="s01ft" data-template="solar-01">
      <div className="s01ft-inner">
        <div className="s01ft-grid">
          {/* Brand col */}
          <div className="s01ft-brand">
            <a href={resolve("/")} className="s01ft-brand-logo" aria-label={siteName}>
              <span className="s01ft-brand-mark">
                <span className="s01ft-brand-orbit" />
                <span className="s01ft-brand-sun">
                  <svg viewBox="0 0 26 26" fill="none" aria-hidden="true">
                    <g stroke="#ff7a00" strokeWidth="2" strokeLinecap="round">
                      <line x1="13" y1="2" x2="13" y2="5"/>
                      <line x1="13" y1="21" x2="13" y2="24"/>
                      <line x1="2" y1="13" x2="5" y2="13"/>
                      <line x1="21" y1="13" x2="24" y2="13"/>
                      <line x1="4.5" y1="4.5" x2="7" y2="7"/>
                      <line x1="19" y1="19" x2="21.5" y2="21.5"/>
                      <line x1="21.5" y1="4.5" x2="19" y2="7"/>
                      <line x1="7" y1="19" x2="4.5" y2="21.5"/>
                    </g>
                    <circle cx="13" cy="13" r="5" fill="#ff7a00"/>
                  </svg>
                </span>
              </span>
              <span className="s01ft-brand-name">
                <span className="s01ft-brand-name-txt">
                  <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
                </span>
                <span className="s01ft-brand-name-tag">
                  <GenericEditableText sectionId={sectionId} field="tagName" value={tagName} tag="span" />
                </span>
              </span>
            </a>
            <p className="s01ft-brand-tagline">
              <GenericEditableText sectionId={sectionId} field="description" value={description} tag="span" />
            </p>
            <div className="s01ft-brand-contact">
              <a href={`tel:${phoneTel}`} className="s01ft-brand-contact-item">
                <span className="s01ft-brand-contact-icon"><IconPhone /></span>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
              <a href={`mailto:${email}`} className="s01ft-brand-contact-item">
                <span className="s01ft-brand-contact-icon"><IconMail /></span>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            </div>
            <div className="s01ft-social">
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener" className="s01ft-soc-btn" aria-label="Facebook">
                  <IconFacebook />
                </a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener" className="s01ft-soc-btn" aria-label="Instagram">
                  <IconInstagram />
                </a>
              )}
              {linkedin && (
                <a href={linkedin} target="_blank" rel="noopener" className="s01ft-soc-btn" aria-label="LinkedIn">
                  <IconLinkedin />
                </a>
              )}
            </div>
          </div>

          {/* Services col */}
          <div>
            <p className="s01ft-col-title">
              <GenericEditableText sectionId={sectionId} field="servicesTitle" value={servicesTitle} tag="span" />
            </p>
            <ul className="s01ft-links">
              {services.map((l, i) => (
                <li key={`sv-${i}`}>
                  <a href={resolve(l.href ?? "#")}>
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label ?? ""} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company col */}
          <div>
            <p className="s01ft-col-title">
              <GenericEditableText sectionId={sectionId} field="companyTitle" value={companyTitle} tag="span" />
            </p>
            <ul className="s01ft-links">
              {company.map((l, i) => (
                <li key={`co-${i}`}>
                  <a href={resolve(l.href ?? "#")}>
                    <GenericEditableText sectionId={sectionId} field={`companyLinks.${i}.label`} value={l.label ?? ""} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info col */}
          <div>
            <p className="s01ft-col-title">
              <GenericEditableText sectionId={sectionId} field="infoTitle" value={infoTitle} tag="span" />
            </p>
            <div className="s01ft-info">
              <div className="s01ft-info-row">
                <span className="s01ft-info-lbl">
                  <GenericEditableText sectionId={sectionId} field="addressLabel" value={addressLabel} tag="span" />
                </span>
                <span>
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                </span>
              </div>
              <div className="s01ft-info-row">
                <span className="s01ft-info-lbl">
                  <GenericEditableText sectionId={sectionId} field="icLabel" value={icLabel} tag="span" />
                </span>
                <span>
                  <GenericEditableText sectionId={sectionId} field="ic" value={ic} tag="span" />
                </span>
              </div>
              <div className="s01ft-info-row">
                <span className="s01ft-info-lbl">
                  <GenericEditableText sectionId={sectionId} field="hoursLabel" value={hoursLabel} tag="span" />
                </span>
                <span>
                  <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="s01ft-bar">
          <div className="s01ft-bar-left">
            <span>
              © {year}{" "}
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              {" · "}
              <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
            </span>
            <span className="s01ft-bar-legal">
              {legal.map((l, i) => (
                <a key={`lg-${i}`} href={resolve(l.href ?? "#")}>
                  <GenericEditableText sectionId={sectionId} field={`legalLinks.${i}.label`} value={l.label ?? ""} tag="span" />
                </a>
              ))}
            </span>
          </div>
          <div className="s01ft-bar-right">
            <WeberoCredit />
          </div>
        </div>
      </div>
      {/* Avoid unused const warning for NAVY */}
      <span style={{ display: "none" }} data-navy={NAVY} />
    </footer>
  );
}

// ── arch-01-footer ────────────────────────────────────────────────────────────
// 1:1 karesarch.cz footer:
// - černé pozadí
// - 3 sloupce: col1 = logo + nav links, col2 = 2× ateliér adresy + legal,
//   col3 = email + telefon + socials + copyright
// ─────────────────────────────────────────────────────────────────────────────
function FooterArch01({ content, sectionId, tenantSlug }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string }) {
  type Link    = { label?: string; href?: string };
  type Office  = { name?: string; address?: string };
  type Social  = { icon?: string; href?: string };

  const siteName    = String(content.siteName   ?? "ARCHITEKTA");
  const logoUrl     = String(content.logoUrl    ?? "");
  const links       = (content.links    as Link[])   ?? [];
  const offices     = (content.offices  as Office[]) ?? [];
  const email       = String(content.email      ?? "");
  const phone       = String(content.phone      ?? "");
  const socials     = (content.socials  as Social[]) ?? [];
  const legalName   = String(content.legalName  ?? "");
  const ico         = String(content.ico        ?? "");
  const gdprHref    = String(content.gdprHref   ?? "/gdpr");
  const cookiesHref = String(content.cookiesHref ?? "/cookies");
  const copyright   = String(content.copyright  ?? "");

  const resolve = (href: string) =>
    tenantSlug && href.startsWith("/")
      ? `/demo/${tenantSlug}${href === "/" ? "" : href}`
      : href;

  const FONT  = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const WHITE = "#ffffff";

  const SocialIcon = ({ icon }: { icon: string }) => {
    if (icon === "instagram") return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    );
    if (icon === "facebook") return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    );
    if (icon === "youtube") return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill={WHITE} stroke="none" points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02"/>
      </svg>
    );
    if (icon === "pinterest") return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={WHITE} stroke="none">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
      </svg>
    );
    return null;
  };

  const styles = `
    .a01foot {
      background: #000;
      color: ${WHITE};
      font-family: ${FONT};
      padding: 60px 0 32px;
    }
    .a01foot-inner {
      padding: 0 3.5rem;
    }
    .a01foot-grid {
      display: grid;
      grid-template-columns: 1fr 2fr 1fr;
      gap: 0 48px;
      margin-bottom: 48px;
    }
    /* col 1 - logo + nav */
    .a01foot-logo {
      display: block;
      margin-bottom: 32px;
    }
    .a01foot-logo img {
      height: 28px;
      width: auto;
    }
    .a01foot-nav {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .a01foot-nav a {
      font-size: 13px;
      font-weight: 300;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.55);
      text-decoration: none;
      transition: color 0.2s;
    }
    .a01foot-nav a:hover { color: ${WHITE}; }
    /* col 2 - offices */
    .a01foot-offices {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 32px;
    }
    .a01foot-office-name {
      font-size: 11px;
      font-weight: 400;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.4);
      margin: 0 0 10px;
    }
    .a01foot-office-addr {
      font-size: 14px;
      font-weight: 300;
      color: rgba(255,255,255,0.75);
      line-height: 1.65;
      margin: 0 0 32px;
      white-space: pre-line;
    }
    .a01foot-legal {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .a01foot-legal p {
      font-size: 12px;
      font-weight: 300;
      color: rgba(255,255,255,0.35);
      margin: 0;
    }
    /* col 3 - contact + social */
    .a01foot-contact {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 28px;
    }
    .a01foot-contact a {
      font-size: 14px;
      font-weight: 300;
      color: rgba(255,255,255,0.75);
      text-decoration: none;
      transition: color 0.2s;
    }
    .a01foot-contact a:hover { color: ${WHITE}; }
    .a01foot-socials {
      display: flex;
      gap: 16px;
      margin-bottom: 32px;
    }
    .a01foot-social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.6;
      transition: opacity 0.2s;
    }
    .a01foot-social-link:hover { opacity: 1; }
    /* bottom bar */
    .a01foot-bar {
      border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .a01foot-copyright {
      font-size: 11px;
      font-weight: 300;
      color: rgba(255,255,255,0.3);
      margin: 0;
    }
    .a01foot-legal-links {
      display: flex;
      gap: 20px;
    }
    .a01foot-legal-links a {
      font-size: 11px;
      font-weight: 300;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.3);
      text-decoration: none;
      transition: color 0.2s;
    }
    .a01foot-legal-links a:hover { color: rgba(255,255,255,0.7); }
    @media (max-width: 900px) {
      .a01foot-grid { grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; }
      .a01foot-inner { padding: 0 2rem; }
    }
    @media (max-width: 540px) {
      .a01foot-grid { grid-template-columns: 1fr; }
      .a01foot-inner { padding: 0 1.25rem; }
      .a01foot-offices { grid-template-columns: 1fr; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <footer className="a01foot" data-template="arch-01-footer">
        <div className="a01foot-inner">
          <div className="a01foot-grid">
            {/* col 1 – logo + nav */}
            <div>
              <a href={resolve("/")} className="a01foot-logo" aria-label={siteName}>
                <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "block" }}>
                  {logoUrl
                    ? <img loading="lazy" src={logoUrl} alt={siteName} />
                    : <span style={{ fontFamily: FONT, fontSize: 20, fontWeight: 300, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                        <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
                      </span>
                  }
                </GenericEditableImage>
              </a>
              <ul className="a01foot-nav">
                {links.map((l, i) => (
                  <li key={i}>
                    <a href={resolve(l.href ?? "#")}>
                      <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label ?? ""} tag="span" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* col 2 – offices + legal */}
            <div>
              <div className="a01foot-offices">
                {offices.map((o, i) => (
                  <div key={i}>
                    <p className="a01foot-office-name">
                      <GenericEditableText sectionId={sectionId} field={`offices.${i}.name`} value={o.name ?? ""} tag="span" />
                    </p>
                    <p className="a01foot-office-addr">
                      <GenericEditableText sectionId={sectionId} field={`offices.${i}.address`} value={o.address ?? ""} tag="span" />
                    </p>
                  </div>
                ))}
              </div>
              <div className="a01foot-legal">
                {legalName && <p><GenericEditableText sectionId={sectionId} field="legalName" value={legalName} tag="span" /></p>}
                {ico && <p>IČO {ico}</p>}
              </div>
            </div>

            {/* col 3 – contact + social */}
            <div>
              <div className="a01foot-contact">
                {email && <a href={`mailto:${email}`}><GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" /></a>}
                {phone && <a href={`tel:${phone.replace(/\s/g,"")}`}><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" /></a>}
              </div>
              <div className="a01foot-socials">
                {socials.map((s, i) => (
                  <a key={i} href={s.href ?? "#"} className="a01foot-social-link" target="_blank" rel="noopener noreferrer" aria-label={s.icon}>
                    <SocialIcon icon={s.icon ?? ""} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* bottom bar */}
          <div className="a01foot-bar">
            <p className="a01foot-copyright">
              <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
            </p>
            <div className="a01foot-legal-links">
              <a href={resolve(gdprHref)}>GDPR</a>
              <a href={resolve(cookiesHref)}>Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

// ── ucetni-04-footer ──────────────────────────────────────────────────────────
// bcas.cz pixel-perfect: white bg, 3-col grid (1.1fr 2fr 1.9fr)
// Col1: logo + address + IČO  |  Col2: 2-col nav links  |  Col3: contact info
// ftr2 bottom bar: copyright | social icons | legal links
// ──────────────────────────────────────────────────────────────────────────────
function FooterUcetni04({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const NAVY    = "#1B3A6B";
  const RED     = "#F4403F";
  const DARK    = "#171F22";
  const MUTED   = "#486A72";
  const BORDER  = "#e5e5e5";
  const FONT    = "'Plus Jakarta Sans', Arial, 'Helvetica Neue', sans-serif";

  const siteName       = String(content.siteName       ?? "Demo Finanční Poradce");
  const logoUrl        = String(content.logoUrl        ?? "/templates/ucetni-04/logo.svg");
  const tagline        = String(content.tagline        ?? "Komplexní finanční a realitní poradenství.");
  const facebook       = String(content.facebook       ?? "");
  const instagram      = String(content.instagram      ?? "");
  const linkedin       = String(content.linkedin       ?? "");
  const navHeading     = String(content.navHeading     ?? "Navigace");
  const contactHeading = String(content.contactHeading ?? "Kontakt");
  const address        = String(content.address        ?? "Ukázková 123");
  const city           = String(content.city           ?? "110 00 Praha 1");
  const phone          = String(content.phone          ?? "704 123 456");
  const email          = String(content.email          ?? "email@demo.cz");
  const ico            = String(content.ico            ?? "12345678");
  const web            = String(content.web            ?? "");
  const copyright      = String(content.copyright      ?? `© ${new Date().getFullYear()} Demo Finanční Poradce, s.r.o.`);
  const rawLinks       = Array.isArray(content.links) ? content.links as Array<{ label: string; href: string }> : [
    { label: "Úvod",       href: "/" },
    { label: "Služby",     href: "/" },
    { label: "O nás",      href: "/o-nas" },
    { label: "Vzdělávání", href: "/" },
    { label: "Kontakt",    href: "/kontakt" },
  ];
  const legalLinks = Array.isArray(content.legal) ? content.legal as Array<{ label: string; href: string }> : [
    { label: "Ochrana osobních údajů", href: "/" },
    { label: "Cookies",                href: "/" },
  ];

  const resolve = (href: string) => {
    if (href.startsWith("http") || href.startsWith("#") || href === "/") return href;
    if (tenantSlug) return isAdmin ? `/demo/${tenantSlug}${href}/admin` : `/demo/${tenantSlug}${href}`;
    return href;
  };

  const SVG_FB = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`;
  const SVG_IG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`;
  const SVG_LI = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`;

  const mid   = Math.ceil(rawLinks.length / 2);
  const col1L = rawLinks.slice(0, mid);
  const col2L = rawLinks.slice(mid);

  return (
    <>
      <style>{`
        .ucn04ft {
          background: #ffffff;
          font-family: ${FONT};
          color: ${DARK};
          border-top: 1px solid ${BORDER};
        }
        /* ── main grid ── */
        .ucn04ft-inner {
          max-width: 1256px;
          margin: 0 auto;
          padding: clamp(48px,6vw,80px) clamp(20px,4vw,48px) clamp(40px,5vw,64px);
          display: grid;
          grid-template-columns: 1.1fr 2fr 1.9fr;
          gap: 96px clamp(16px,5vw,64px);
          align-items: start;
        }
        /* ── Col 1: about ── */
        .ucn04ft-about {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          line-height: 1.5;
        }
        .ucn04ft-about-hdr {
          font-size: 1.125rem;
          font-weight: 600;
          color: ${DARK};
          margin: 0;
        }
        .ucn04ft-logo-img { max-width: 160px; height: auto; display: block; }
        .ucn04ft-address {
          font-size: 0.9rem;
          color: ${MUTED};
          font-style: normal;
          line-height: 1.65;
        }
        .ucn04ft-tagline-text {
          font-size: 0.88rem;
          color: ${MUTED};
          line-height: 1.6;
          margin: 0;
          font-style: italic;
        }
        .ucn04ft-meta {
          font-size: 0.85rem;
          color: ${MUTED};
          line-height: 1.65;
        }
        /* ── Col 2: links ── */
        .ucn04ft-links {
          display: grid;
          grid-template-columns: 1.25fr 1fr;
          grid-template-rows: auto 1fr;
          gap: 1.5rem;
        }
        .ucn04ft-links-hdr {
          font-size: 1.125rem;
          font-weight: 600;
          color: ${DARK};
          margin: 0;
          grid-column: span 2;
        }
        .ucn04ft-menu {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .ucn04ft-menu a {
          font-size: 0.9rem;
          font-weight: 600;
          color: ${DARK};
          text-decoration: none;
          transition: color 0.15s;
        }
        .ucn04ft-menu a:hover { color: ${RED}; }
        /* ── Col 3: contact ── */
        .ucn04ft-contact-col {}
        .ucn04ft-contact-hdr {
          font-size: 1.125rem;
          font-weight: 600;
          color: ${DARK};
          margin: 0 0 1.5rem 0;
        }
        .ucn04ft-contact-items {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          font-size: 0.9rem;
          color: ${MUTED};
          line-height: 1.6;
        }
        .ucn04ft-contact-items a {
          color: ${MUTED};
          text-decoration: none;
          transition: color 0.15s;
        }
        .ucn04ft-contact-items a:hover { color: ${NAVY}; }
        /* ── ftr2 bottom bar ── */
        .ucn04ft2 {
          border-top: 1px solid ${BORDER};
          margin-top: 0;
        }
        .ucn04ft2-inner {
          max-width: 1256px;
          margin: 0 auto;
          padding: 20px clamp(20px,4vw,48px);
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 1em;
        }
        .ucn04ft2-copy {
          font-size: 0.875rem;
          color: ${MUTED};
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .ucn04ft2-soc {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .ucn04ft2-soc a {
          width: 40px;
          height: 40px;
          border: 1.5px solid ${BORDER};
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${DARK};
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s;
        }
        .ucn04ft2-soc a:hover { border-color: ${NAVY}; color: ${NAVY}; }
        .ucn04ft2-legal {
          display: flex;
          gap: 20px;
        }
        .ucn04ft2-legal a {
          font-size: 0.8rem;
          color: ${MUTED};
          text-decoration: none;
          transition: color 0.15s;
        }
        .ucn04ft2-legal a:hover { color: ${DARK}; }
        /* responsive */
        @media (max-width: 960px) {
          .ucn04ft-inner { grid-template-columns: 1fr 2fr; }
          .ucn04ft-contact-col { grid-column: span 2; }
        }
        @media (max-width: 640px) {
          .ucn04ft-inner { grid-template-columns: 1fr; gap: 40px; }
          .ucn04ft-contact-col { grid-column: auto; }
          .ucn04ft2-inner { flex-direction: column; align-items: flex-start; gap: 16px; }
        }
      `}</style>

      <footer className="ucn04ft" data-template="ucetni-04-footer">
        <div className="ucn04ft-inner">

          {/* Col 1: O společnosti */}
          <div className="ucn04ft-about">
            <h5 className="ucn04ft-about-hdr">O společnosti</h5>
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} className="ucn04ft-logo-img" style={{ display: "block" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" src={logoUrl} alt={siteName} className="ucn04ft-logo-img" />
            </GenericEditableImage>
            <address className="ucn04ft-address">
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" /><br />
              <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /><br />
              <GenericEditableText sectionId={sectionId} field="city" value={city} tag="span" />
            </address>
            {tagline && (
              <p className="ucn04ft-tagline-text">
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </p>
            )}
            <div className="ucn04ft-meta">
              {ico && <>IČ <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" /><br /></>}
              {web && <><a href={web} target="_blank" rel="noopener noreferrer" style={{ color: MUTED }}>{web.replace(/^https?:\/\//, "")}</a></>}
            </div>
          </div>

          {/* Col 2: Důležité odkazy — 2 sloupce */}
          <div className="ucn04ft-links">
            <h5 className="ucn04ft-links-hdr">
              <GenericEditableText sectionId={sectionId} field="navHeading" value={navHeading} tag="span" />
            </h5>
            <ul className="ucn04ft-menu">
              {col1L.map((lnk, i) => (
                <li key={i}><a href={resolve(lnk.href)}><GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={lnk.label} tag="span" /></a></li>
              ))}
            </ul>
            <ul className="ucn04ft-menu">
              {col2L.map((lnk, i) => (
                <li key={i}><a href={resolve(lnk.href)}><GenericEditableText sectionId={sectionId} field={`links.${i + col1L.length}.label`} value={lnk.label} tag="span" /></a></li>
              ))}
            </ul>
          </div>

          {/* Col 3: Kontakt */}
          <div className="ucn04ft-contact-col">
            <h5 className="ucn04ft-contact-hdr">
              <GenericEditableText sectionId={sectionId} field="contactHeading" value={contactHeading} tag="span" />
            </h5>
            <div className="ucn04ft-contact-items">
              <span>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />{", "}
                <GenericEditableText sectionId={sectionId} field="city" value={city} tag="span" />
              </span>
              <a href={`tel:${phone.replace(/\s/g, "")}`}>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
              <a href={`mailto:${email}`}>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            </div>
          </div>

        </div>

        {/* ftr2: bottom bar */}
        <div className="ucn04ft2">
          <div className="ucn04ft2-inner">
            <span className="ucn04ft2-copy">
              <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
            </span>
            <div className="ucn04ft2-soc">
              {facebook  && <a href={facebook}  target="_blank" rel="noopener noreferrer" dangerouslySetInnerHTML={{ __html: SVG_FB }} />}
              {instagram && <a href={instagram} target="_blank" rel="noopener noreferrer" dangerouslySetInnerHTML={{ __html: SVG_IG }} />}
              {linkedin  && <a href={linkedin}  target="_blank" rel="noopener noreferrer" dangerouslySetInnerHTML={{ __html: SVG_LI }} />}
            </div>
            <div className="ucn04ft2-legal">
              {legalLinks.map((lnk, i) => (
                <a key={i} href={resolve(lnk.href)}><GenericEditableText sectionId={sectionId} field={`legal.${i}.label`} value={lnk.label} tag="span" /></a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

// ── clean-01-footer ───────────────────────────────────────────────────────────
// Prémiový footer: zelený CTA pruh nahoře → tmavý 4-col main → černý copyright bar
// ─────────────────────────────────────────────────────────────────────────────
function FooterClean01({ content, sectionId, tenantSlug }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string }) {
  const GREEN = "#69be28";
  const DARK  = "#0d1a20";
  const DARK2 = "#0a1318";
  const FONT  = "Arial, Helvetica, sans-serif";

  const ctaStripTitle   = String(content.ctaStripTitle   ?? "Máte zájem o spolupráci?");
  const ctaStripSubtitle= String(content.ctaStripSubtitle?? "Ozvěte se nám — připravíme nabídku na míru.");
  const servicesLabel   = String(content.servicesLabel   ?? "Služby");
  const infoLabel       = String(content.infoLabel       ?? "Informace");
  const siteName        = String(content.siteName        ?? "Demo Clean s.r.o.");
  const tagline         = String(content.tagline         ?? "Partner pro čistotu");
  const address         = String(content.address         ?? "Ukázková 123, 110 00 Praha 1");
  const phone           = String(content.phone           ?? "+420 704 123 456");
  const email           = String(content.email           ?? "email@demo.cz");
  const ico             = String(content.ico             ?? "12345678");
  const facebook        = String(content.facebook        ?? "");
  const instagram       = String(content.instagram       ?? "");
  const openingHours    = String(content.openingHours    ?? "Po–Pá 7:00–17:00");
  const copyright       = String(content.copyright       ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);

  type Link = { label: string; href: string };
  const links     = (content.links     as Link[] | undefined) ?? [];
  const linksCol2 = (content.linksCol2 as Link[] | undefined) ?? [];

  function resolve(href: string) {
    if (!tenantSlug || !href.startsWith("/")) return href;
    return `/demo/${tenantSlug}${href}`;
  }

  const styles = `
    .c01ft-footer { font-family: ${FONT}; }

    /* ── Zelený CTA pruh ── */
    .c01ft-cta-strip {
      background: ${GREEN};
      padding: 3.5rem 1.5rem;
    }
    .c01ft-cta-inner {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      flex-wrap: wrap;
    }
    .c01ft-cta-text h3 {
      font-size: clamp(1.3rem, 2.5vw, 1.9rem);
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.35rem;
      line-height: 1.2;
    }
    .c01ft-cta-text p {
      font-size: 0.97rem;
      color: rgba(255,255,255,0.8);
      margin: 0;
    }
    .c01ft-cta-contacts {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .c01ft-cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      background: ${DARK};
      color: #ffffff;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.92rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.8rem 1.8rem;
      border-radius: 4px;
      transition: background 0.18s, transform 0.15s;
      white-space: nowrap;
    }
    .c01ft-cta-btn:hover { background: #020d11; transform: translateY(-2px); }
    .c01ft-cta-btn svg { flex-shrink: 0; }

    /* ── Main tmavý footer ── */
    .c01ft-main {
      background: ${DARK};
      padding: 5rem 1.5rem 4rem;
      border-top: 3px solid ${GREEN};
    }
    .c01ft-grid {
      display: grid;
      grid-template-columns: 1.6fr 1fr 1fr 1.3fr;
      gap: 3.5rem;
      max-width: 1100px;
      margin: 0 auto;
    }
    @media (max-width: 75rem) {
      .c01ft-grid { grid-template-columns: 1fr 1fr; gap: 2.5rem; }
    }
    @media (max-width: 39.99rem) {
      .c01ft-grid { grid-template-columns: 1fr; gap: 2rem; }
    }

    /* Brand col */
    .c01ft-brand-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.4rem;
      letter-spacing: 0.02em;
    }
    .c01ft-brand-bar {
      display: block;
      width: 3rem;
      height: 3px;
      background: ${GREEN};
      border-radius: 2px;
      margin: 0.6rem 0 1rem;
    }
    .c01ft-brand-tagline {
      font-size: 0.88rem;
      color: rgba(255,255,255,0.5);
      margin: 0 0 1.6rem;
      line-height: 1.6;
      max-width: 260px;
    }
    .c01ft-social {
      display: flex;
      gap: 0.55rem;
    }
    .c01ft-social a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      border: 1.5px solid rgba(255,255,255,0.15);
      color: rgba(255,255,255,0.6);
      text-decoration: none;
      transition: border-color 0.18s, color 0.18s, background 0.18s;
    }
    .c01ft-social a:hover {
      border-color: ${GREEN};
      color: #ffffff;
      background: ${GREEN};
    }

    /* Link cols */
    .c01ft-col-title {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: ${GREEN};
      margin: 0 0 1.4rem;
      padding-bottom: 0.7rem;
      border-bottom: 1px solid rgba(105,190,40,0.25);
    }
    .c01ft-links {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
    }
    .c01ft-links li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .c01ft-links li::before {
      content: "";
      display: block;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: ${GREEN};
      flex-shrink: 0;
      opacity: 0.7;
    }
    .c01ft-links a {
      font-size: 0.9rem;
      color: rgba(255,255,255,0.6);
      text-decoration: none;
      transition: color 0.15s, padding-left 0.15s;
    }
    .c01ft-links a:hover { color: #ffffff; padding-left: 3px; }

    /* Contact col */
    .c01ft-contact-item {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      margin-bottom: 1.1rem;
    }
    .c01ft-contact-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.2rem;
      height: 2.2rem;
      border-radius: 50%;
      background: rgba(105,190,40,0.12);
      border: 1px solid rgba(105,190,40,0.25);
      flex-shrink: 0;
      color: ${GREEN};
    }
    .c01ft-contact-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255,255,255,0.35);
      margin-bottom: 0.15rem;
    }
    .c01ft-contact-value {
      font-size: 0.9rem;
      color: rgba(255,255,255,0.75);
      line-height: 1.4;
    }
    .c01ft-contact-value a {
      color: rgba(255,255,255,0.75);
      text-decoration: none;
      transition: color 0.15s;
    }
    .c01ft-contact-value a:hover { color: ${GREEN}; }

    /* Divider */
    .c01ft-divider {
      max-width: 1100px;
      margin: 0 auto;
      border: none;
      border-top: 1px solid rgba(255,255,255,0.07);
      margin-top: 3.5rem;
    }

    /* Copyright bar */
    .c01ft-bar {
      background: ${DARK2};
      padding: 1.2rem 1.5rem;
      font-family: ${FONT};
    }
    .c01ft-bar-inner {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .c01ft-copyright {
      font-size: 0.82rem;
      color: rgba(255,255,255,0.3);
    }
    .c01ft-ico-badge {
      font-size: 0.78rem;
      color: rgba(255,255,255,0.2);
      letter-spacing: 0.04em;
    }
  `;

  return (
    <footer className="c01ft-footer">
      <style>{styles}</style>

      {/* ── Zelený CTA pruh ── */}
      <div className="c01ft-cta-strip">
        <div className="c01ft-cta-inner">
          <div className="c01ft-cta-text">
            <h3><GenericEditableText sectionId={sectionId} field="ctaStripTitle" value={ctaStripTitle} tag="span" /></h3>
            <p><GenericEditableText sectionId={sectionId} field="ctaStripSubtitle" value={ctaStripSubtitle} tag="span" /></p>
          </div>
          <div className="c01ft-cta-contacts">
            <a href={`tel:${phone.replace(/\s/g,"")}`} className="c01ft-cta-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.08 11.93 19.79 19.79 0 0 1 1 3.36 2 2 0 0 1 2.96 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.38a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 15.42Z"/></svg>
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
            <a href={`mailto:${email}`} className="c01ft-cta-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
            </a>
          </div>
        </div>
      </div>

      {/* ── Hlavní tmavý footer ── */}
      <div className="c01ft-main">
        <div className="c01ft-grid">

          {/* Col 1 — Brand */}
          <div>
            <p className="c01ft-brand-name">
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </p>
            <span className="c01ft-brand-bar" />
            <p className="c01ft-brand-tagline">
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            <div className="c01ft-social">
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Col 2 — Služby */}
          <div>
            <p className="c01ft-col-title">
              <GenericEditableText sectionId={sectionId} field="servicesLabel" value={servicesLabel} tag="span" />
            </p>
            <ul className="c01ft-links">
              {links.map((lnk, i) => (
                <li key={i}>
                  <a href={resolve(lnk.href)}>
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={lnk.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Informace */}
          <div>
            <p className="c01ft-col-title">
              <GenericEditableText sectionId={sectionId} field="infoLabel" value={infoLabel} tag="span" />
            </p>
            <ul className="c01ft-links">
              {linksCol2.map((lnk, i) => (
                <li key={i}>
                  <a href={resolve(lnk.href)}>
                    <GenericEditableText sectionId={sectionId} field={`linksCol2.${i}.label`} value={lnk.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Kontakt */}
          <div>
            <p className="c01ft-col-title">Kontakt</p>
            <div className="c01ft-contact-item">
              <span className="c01ft-contact-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </span>
              <div>
                <div className="c01ft-contact-label">Adresa</div>
                <div className="c01ft-contact-value">
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                </div>
              </div>
            </div>
            <div className="c01ft-contact-item">
              <span className="c01ft-contact-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.08 11.93 19.79 19.79 0 0 1 1 3.36 2 2 0 0 1 2.96 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.38a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 15.42Z"/></svg>
              </span>
              <div>
                <div className="c01ft-contact-label">Telefon</div>
                <div className="c01ft-contact-value">
                  <a href={`tel:${phone.replace(/\s/g,"")}`}>
                    <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                  </a>
                </div>
              </div>
            </div>
            <div className="c01ft-contact-item">
              <span className="c01ft-contact-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </span>
              <div>
                <div className="c01ft-contact-label">E-mail</div>
                <div className="c01ft-contact-value">
                  <a href={`mailto:${email}`}>
                    <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                  </a>
                </div>
              </div>
            </div>
            <div className="c01ft-contact-item">
              <span className="c01ft-contact-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </span>
              <div>
                <div className="c01ft-contact-label">Provozní hodiny</div>
                <div className="c01ft-contact-value">
                  <GenericEditableText sectionId={sectionId} field="openingHours" value={openingHours} tag="span" />
                </div>
              </div>
            </div>
          </div>

        </div>
        <hr className="c01ft-divider" />
      </div>

      {/* ── Copyright bar ── */}
      <div className="c01ft-bar">
        <div className="c01ft-bar-inner">
          <span className="c01ft-copyright">
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </span>
          <span className="c01ft-ico-badge">
            IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" />
          </span>
        </div>
      </div>
    </footer>
  );
}

// ─── instala-02 Footer ───────────────────────────────────────────────────────
function FooterInstala02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const c = content as Record<string, unknown>;

  const RED    = "#ee4036";
  const WHITE  = "#ffffff";
  const FONT_H = "'Montserrat', sans-serif";
  const FONT_B = "'Roboto', sans-serif";

  const siteName        = String(c.siteName        ?? "ThermoPlus Praha");
  const logoUrl         = String(c.logoUrl         ?? "/templates/instala-02/logo.svg");
  const tagline         = String(c.tagline         ?? "Vytápění, voda a elektro — poctivě a načas");
  const phone           = String(c.phone           ?? "+420 704 123 456");
  const email           = String(c.email           ?? "info@demo.cz");
  const address         = String(c.address         ?? "Ukázková 123, 110 00 Praha 1");
  const ico             = String(c.ico             ?? "12345678");
  const dic             = String(c.dic             ?? "CZ12345678");
  const companyName     = String(c.companyName     ?? "Demo Studio s.r.o.");
  const copyright       = String(c.copyright       ?? `© ${new Date().getFullYear()} ${companyName}. Všechna práva vyhrazena.`);
  const stripText       = String(c.stripText       ?? "Potřebujete pomoc? Zavolejte nám hned teď.");
  const hours           = String(c.hours           ?? "Po–Pá 7:00–17:00");
  const hoursEmergency  = String(c.hoursEmergency  ?? "Havarijní výjezdy operativně");
  const links           = (c.links as Array<{ label: string; href: string }>) ?? [];
  const socials         = (c.socials as Array<{ icon: string; href: string; label: string }>) ?? [];

  const resolveHref = (href: string) => {
    if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("tel:") || href.startsWith("mailto:")) return href;
    if (tenantSlug) {
      const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
      return base + (href.startsWith("/") ? href : "/" + href);
    }
    return href;
  };

  const SocialIcon = ({ icon, color }: { icon: string; color: string }) => {
    if (icon === "facebook") return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill={color} aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    );
    if (icon === "instagram") return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    );
    return null;
  };

  return (
    <footer data-template="instala-02-footer" style={{ backgroundColor: WHITE, fontFamily: FONT_B }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Roboto:wght@400;500&display=swap" />
      <style>{`
        /* ── CTA strip ── */
        .i2ft-strip {
          background: ${RED};
          padding: 0 60px;
          display: flex;
          align-items: stretch;
          justify-content: space-between;
          min-height: 76px;
        }
        .i2ft-strip-left { display: flex; align-items: center; gap: 14px; }
        .i2ft-strip-icon {
          width: 40px; height: 40px;
          background: rgba(255,255,255,0.16);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .i2ft-strip-text {
          font-family: ${FONT_H};
          font-size: 15px;
          font-weight: 700;
          color: ${WHITE};
          letter-spacing: -0.01em;
        }
        .i2ft-strip-right { display: flex; align-items: center; }
        .i2ft-strip-phone {
          font-family: ${FONT_H};
          font-size: 22px;
          font-weight: 800;
          color: ${WHITE};
          text-decoration: none;
          letter-spacing: -0.02em;
          display: flex; align-items: center; gap: 10px;
          padding: 0 32px;
          height: 100%;
          background: rgba(0,0,0,0.14);
          transition: background .2s;
        }
        .i2ft-strip-phone:hover { background: rgba(0,0,0,0.24); }

        /* ── brand bar — white with subtle border ── */
        .i2ft-brand-bar {
          background: ${WHITE};
          border-bottom: 1.5px solid #e8e8e8;
        }
        .i2ft-brand-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 32px 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        .i2ft-brand-left { display: flex; align-items: center; gap: 20px; }
        .i2ft-logo { height: 44px; width: auto; display: block; }
        .i2ft-vdivider { width: 1px; height: 36px; background: #e8e8e8; flex-shrink: 0; }
        .i2ft-brand-name {
          font-family: ${FONT_H};
          font-size: 17px;
          font-weight: 800;
          color: #111;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .i2ft-brand-tagline { font-size: 12px; color: #999; margin-top: 4px; }
        .i2ft-socials { display: flex; gap: 8px; }
        .i2ft-social {
          width: 36px; height: 36px;
          background: #f7f7f7;
          border: 1.5px solid #e8e8e8;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          text-decoration: none;
          transition: background .2s, border-color .2s;
        }
        .i2ft-social:hover { background: ${RED}; border-color: ${RED}; }
        .i2ft-social:hover svg { fill: ${WHITE} !important; stroke: ${WHITE} !important; }

        /* ── main columns ── */
        .i2ft-cols {
          max-width: 1280px;
          margin: 0 auto;
          padding: 56px 60px 52px;
          display: grid;
          grid-template-columns: 1.5fr 1fr 1.2fr;
          gap: 60px;
        }

        /* kicker — same pattern as About section */
        .i2ft-kicker {
          font-family: ${FONT_H};
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: ${RED};
          margin: 0 0 22px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .i2ft-kicker-line { display: inline-block; width: 36px; height: 2px; background: ${RED}; flex-shrink: 0; }

        /* ── contact col — feat-card style from About ── */
        .i2ft-feat {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          background: #f7f7f7;
          border-radius: 12px;
          border: 1px solid #eee;
          margin-bottom: 12px;
          transition: box-shadow .2s;
        }
        .i2ft-feat:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.07); }
        .i2ft-feat-icon {
          width: 36px; height: 36px;
          background: ${RED};
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .i2ft-feat-label {
          font-family: ${FONT_H};
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #999;
          margin-bottom: 3px;
        }
        .i2ft-feat-val { font-size: 13px; color: #333; line-height: 1.45; }
        .i2ft-feat-link { font-size: 13px; color: #333; text-decoration: none; transition: color .2s; }
        .i2ft-feat-link:hover { color: ${RED}; }

        /* ── nav col ── */
        .i2ft-nav { list-style: none; margin: 0; padding: 0; }
        .i2ft-nav li a {
          display: flex;
          align-items: center;
          gap: 0;
          font-size: 14px;
          color: #555;
          text-decoration: none;
          padding: 9px 0;
          border-bottom: 1px solid #f0f0f0;
          transition: color .2s;
          font-family: ${FONT_B};
        }
        .i2ft-nav li:last-child a { border-bottom: none; }
        .i2ft-nav li a::before {
          content: '';
          display: inline-block;
          width: 0;
          height: 2px;
          background: ${RED};
          border-radius: 1px;
          margin-right: 0;
          transition: width .18s, margin-right .18s;
          flex-shrink: 0;
        }
        .i2ft-nav li a:hover { color: #111; }
        .i2ft-nav li a:hover::before { width: 14px; margin-right: 8px; }

        /* ── info col — statsbox style from About ── */
        .i2ft-statsbox {
          border: 1.5px solid #e8e8e8;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        .i2ft-stat-row { display: flex; }
        .i2ft-stat-row + .i2ft-stat-row { border-top: 1.5px solid #e8e8e8; }
        .i2ft-stat-cell { flex: 1; padding: 12px 16px; }
        .i2ft-stat-cell + .i2ft-stat-cell { border-left: 1.5px solid #e8e8e8; }
        .i2ft-stat-lbl {
          font-family: ${FONT_H};
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #bbb;
          margin-bottom: 4px;
        }
        .i2ft-stat-val { font-size: 13px; color: #333; font-family: ${FONT_H}; font-weight: 600; }

        /* hours — feat card with red left accent */
        .i2ft-hours {
          padding: 14px 16px 14px 20px;
          background: #f7f7f7;
          border-radius: 12px;
          border: 1px solid #eee;
          position: relative;
          overflow: hidden;
        }
        .i2ft-hours::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: ${RED};
          border-radius: 0 2px 2px 0;
        }
        .i2ft-hours-title {
          font-family: ${FONT_H};
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${RED};
          margin-bottom: 6px;
        }
        .i2ft-hours-val {
          font-family: ${FONT_H};
          font-size: 13px;
          font-weight: 700;
          color: #111;
          margin-bottom: 5px;
        }
        .i2ft-hours-sub { font-size: 12px; color: #999; display: flex; align-items: center; gap: 7px; }
        .i2ft-hours-dot {
          width: 7px; height: 7px;
          background: ${RED};
          border-radius: 50%;
          flex-shrink: 0;
          animation: i2ft-pulse 2s ease-in-out infinite;
        }
        @keyframes i2ft-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.6); }
        }

        /* ── bottom bar ── */
        .i2ft-bottom { background: #f7f7f7; border-top: 1.5px solid #e8e8e8; }
        .i2ft-bottom-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 20px 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .i2ft-copy { font-size: 12px; color: #aaa; }
        .i2ft-built { font-size: 11px; color: #ccc; display: flex; align-items: center; gap: 6px; }
        .i2ft-built-dot { width: 4px; height: 4px; background: ${RED}; border-radius: 50%; opacity: 0.45; }

        /* ── responsive ── */
        @media (max-width: 1024px) {
          .i2ft-strip { padding: 0 32px; }
          .i2ft-brand-inner { padding: 28px 32px; }
          .i2ft-cols { padding: 44px 32px 40px; gap: 40px; }
          .i2ft-bottom-inner { padding: 18px 32px; }
        }
        @media (max-width: 768px) {
          .i2ft-strip { padding: 0 20px; min-height: auto; flex-direction: column; align-items: flex-start; }
          .i2ft-strip-left { padding: 16px 0 10px; }
          .i2ft-strip-right { width: 100%; }
          .i2ft-strip-phone { padding: 14px 0; width: 100%; justify-content: center; background: rgba(0,0,0,0.14); border-top: 1px solid rgba(255,255,255,0.15); }
          .i2ft-brand-inner { padding: 22px 20px; flex-direction: column; align-items: flex-start; gap: 16px; }
          .i2ft-cols { grid-template-columns: 1fr 1fr; gap: 32px; padding: 36px 20px 28px; }
          .i2ft-bottom-inner { padding: 16px 20px; flex-direction: column; align-items: flex-start; gap: 6px; }
        }
        @media (max-width: 480px) {
          .i2ft-cols { grid-template-columns: 1fr; }
          .i2ft-strip-text { font-size: 13px; }
          .i2ft-strip-phone { font-size: 18px; }
          .i2ft-brand-name { font-size: 15px; }
          .i2ft-brand-tagline { font-size: 11px; }
        }
      `}</style>

      {/* ── CTA strip ── */}
      <div className="i2ft-strip">
        <div className="i2ft-strip-left">
          <div className="i2ft-strip-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.09 6.09l1.11-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="i2ft-strip-text">
            <GenericEditableText sectionId={sectionId} field="stripText" value={stripText} tag="span" />
          </span>
        </div>
        <div className="i2ft-strip-right">
          <a href={resolveHref(`tel:${phone.replace(/\s/g,"")}`)} className="i2ft-strip-phone">
            <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.5 }}>
              <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>

      {/* ── Brand bar ── */}
      <div className="i2ft-brand-bar">
        <div className="i2ft-brand-inner">
          <div className="i2ft-brand-left">
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "block" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" src={logoUrl} alt={siteName} className="i2ft-logo" />
            </GenericEditableImage>
            <div className="i2ft-vdivider" />
            <div>
              <div className="i2ft-brand-name">
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </div>
              <div className="i2ft-brand-tagline">
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </div>
            </div>
          </div>
          {socials.length > 0 && (
            <div className="i2ft-socials">
              {socials.map((s, i) => (
                <a key={i} href={s.href} className="i2ft-social" aria-label={s.label} target="_blank" rel="noopener noreferrer">
                  <SocialIcon icon={s.icon} color="#666" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 3 columns ── */}
      <div className="i2ft-cols">

        {/* Kontakt */}
        <div>
          <p className="i2ft-kicker"><span className="i2ft-kicker-line" />Kontakt</p>
          <div className="i2ft-feat">
            <div className="i2ft-feat-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="white" strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <div className="i2ft-feat-label">Adresa</div>
              <div className="i2ft-feat-val">
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </div>
            </div>
          </div>
          <div className="i2ft-feat">
            <div className="i2ft-feat-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="white" strokeWidth="2"/><polyline points="22,6 12,13 2,6" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <div className="i2ft-feat-label">E-mail</div>
              <a href={`mailto:${email}`} className="i2ft-feat-link">
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            </div>
          </div>
        </div>

        {/* Navigace */}
        <div>
          <p className="i2ft-kicker"><span className="i2ft-kicker-line" />Navigace</p>
          <ul className="i2ft-nav">
            {links.map((l, i) => (
              <li key={i}>
                <a href={resolveHref(l.href)}>
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Firemní údaje */}
        <div>
          <p className="i2ft-kicker"><span className="i2ft-kicker-line" />Firemní údaje</p>
          <div className="i2ft-statsbox">
            <div className="i2ft-stat-row">
              <div className="i2ft-stat-cell">
                <div className="i2ft-stat-lbl">Společnost</div>
                <div className="i2ft-stat-val">
                  <GenericEditableText sectionId={sectionId} field="companyName" value={companyName} tag="span" />
                </div>
              </div>
            </div>
            <div className="i2ft-stat-row">
              <div className="i2ft-stat-cell">
                <div className="i2ft-stat-lbl">IČO</div>
                <div className="i2ft-stat-val">
                  <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" />
                </div>
              </div>
              <div className="i2ft-stat-cell">
                <div className="i2ft-stat-lbl">DIČ</div>
                <div className="i2ft-stat-val">
                  <GenericEditableText sectionId={sectionId} field="dic" value={dic} tag="span" />
                </div>
              </div>
            </div>
          </div>
          <div className="i2ft-hours">
            <div className="i2ft-hours-title">Pracovní doba</div>
            <div className="i2ft-hours-val">
              <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
            </div>
            <div className="i2ft-hours-sub">
              <span className="i2ft-hours-dot" />
              <GenericEditableText sectionId={sectionId} field="hoursEmergency" value={hoursEmergency} tag="span" />
            </div>
          </div>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div className="i2ft-bottom">
        <div className="i2ft-bottom-inner">
          <span className="i2ft-copy">
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </span>
          <span className="i2ft-built">
            <span className="i2ft-built-dot" />
            Vytvořeno v systému Webero
          </span>
        </div>
      </div>
    </footer>
  );
}

// ── klima-01-footer ───────────────────────────────────────────────────────────
// 1:1 pragoclima.cz: navy bg (#182545), 4 sloupce
// Col 1: červený oval logo + tagline + soc. sítě
// Col 2: Navigace (rychlé linky)
// Col 3: Kontaktní informace (tel, email, adresa, hodiny)
// Col 4: IČO/DIČ + web
// Spodní bar: copyright, oddělená čára
// ─────────────────────────────────────────────────────────────────────────────
function FooterKlima01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const siteName  = String(content.siteName  ?? "Klima Servis");
  const tagline   = String(content.tagline   ?? "Klimatizace & tepelná čerpadla od roku 1990");
  const email     = String(content.email     ?? "");
  const phone     = String(content.phone     ?? "");
  const address   = String(content.address   ?? "");
  const facebook  = String(content.facebook  ?? "");
  const instagram = String(content.instagram ?? "");
  const ico       = String(content.ico       ?? "");
  const dic       = String(content.dic       ?? "");
  const hours     = String(content.hours     ?? "");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}`);
  const links     = ((content.links as Array<{ label: string; href: string }>) ?? []);

  const RED  = "#e30016";
  const NAVY = "#182545";
  const FONT = "'Outfit', -apple-system, sans-serif";
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const LogoOval = () => (
    <div style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      backgroundColor: RED, color: "#fff",
      borderRadius: 21, padding: "0 20px", height: 42, minWidth: 110,
    }}>
      <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
        <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
      </span>
    </div>
  );

  const PhoneIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12.25 19.79 19.79 0 0 1 1.17 3.63 2 2 0 0 1 3.15 1.45h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/>
    </svg>
  );
  const MailIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  );
  const PinIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
  const ClockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );

  const colTitle = (text: string) => (
    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)", margin: "0 0 18px" }}>{text}</p>
  );

  const contactRow = (icon: React.ReactNode, children: React.ReactNode) => (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12, color: "rgba(255,255,255,0.75)", fontSize: 14 }}>
      <span style={{ color: RED, marginTop: 1 }}>{icon}</span>
      <span>{children}</span>
    </div>
  );

  return (
    <>
    <style>{`
      @media (max-width: 768px) {
        .klima-footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
      }
      @media (max-width: 480px) {
        .klima-footer-grid { grid-template-columns: 1fr !important; }
        .klima-footer-bar { flex-direction: column !important; gap: 8px !important; text-align: center; }
      }
    `}</style>
    <footer style={{ backgroundColor: NAVY, fontFamily: FONT, color: "#fff" }} data-template="klima-01">

      {/* Hlavní tělo */}
      <div className="klima-footer-grid" style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 32px 48px", display: "grid", gridTemplateColumns: "1.4fr 1fr 1.3fr 1fr", gap: 48 }}>

        {/* Col 1: Logo + tagline + soc. sítě */}
        <div>
          <a href={resolve("/")} style={{ textDecoration: "none", display: "inline-block", marginBottom: 16 }}>
            <LogoOval />
          </a>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.6)", margin: "0 0 24px", maxWidth: 260 }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          {/* Soc. sítě */}
          <div style={{ display: "flex", gap: 12 }}>
            {facebook && (
              <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none", transition: "background-color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = RED)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            )}
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none", transition: "background-color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = RED)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            )}
          </div>
        </div>

        {/* Col 2: Navigace */}
        <div>
          {colTitle("Navigace")}
          <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {links.map((l, i) => (
              <a
                key={i}
                href={resolve(l.href)}
                style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14, transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>
        </div>

        {/* Col 3: Kontakt */}
        <div>
          {colTitle("Kontakt")}
          {phone   && contactRow(<PhoneIcon />, <a href={`tel:${phone.replace(/\s/g,"")}`} style={{ color: "inherit", textDecoration: "none" }}><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" /></a>)}
          {email   && contactRow(<MailIcon />, <a href={`mailto:${email}`} style={{ color: "inherit", textDecoration: "none" }}><GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" /></a>)}
          {address && contactRow(<PinIcon />, <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />)}
          {hours   && contactRow(<ClockIcon />, <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />)}
        </div>

        {/* Col 4: Firemní údaje */}
        <div>
          {colTitle("Firemní údaje")}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
            {ico && <span>IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" /></span>}
            {dic && <span>DIČ: <GenericEditableText sectionId={sectionId} field="dic" value={dic} tag="span" /></span>}
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "20px 32px" }}>
        <div className="klima-footer-bar" style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", margin: 0 }}>
            Vytvořeno v systému <span style={{ color: "rgba(255,255,255,0.5)" }}>Webero</span>
          </p>
        </div>
      </div>
    </footer>
    </>
  );
}

// ── floors-01-footer ──────────────────────────────────────────────────────────
// Newsletter pruh (zelený) + 4-sloupcový tmavý footer + copyright
// ─────────────────────────────────────────────────────────────────────────────
function FooterFloors01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const GREEN   = "#007d47";
  const DARK_BG = "#1a1a1a";
  const WHITE   = "#ffffff";
  const MUTED   = "rgba(255,255,255,0.55)";
  const BORDER  = "rgba(255,255,255,0.1)";
  const FONT    = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";

  const newsletterTitle       = String(content.newsletterTitle       ?? "Novinky, inspirace a zajímavosti ze světa podlah přímo do vaší schránky!");
  const newsletterPlaceholder = String(content.newsletterPlaceholder ?? "Zadejte váš e-mail");
  const newsletterCta         = String(content.newsletterCta         ?? "Odebírat");
  const copyright             = String(content.copyright             ?? "© 2026 Demo Podlahy. Všechna práva vyhrazena.");

  type ColLink = { label: string; href: string };
  type Col     = { title: string; links: ColLink[] };
  const columns = (content.columns as Col[]) ?? [];

  type Contact = { address: string; phone: string; email: string };
  const contact = (content.contact as Contact) ?? { address: "Ukázková 123, 110 00 Praha 1", phone: "+420 704 123 456", email: "info@demo.cz" };

  const resolve = (href: string) => {
    if (!tenantSlug) return href;
    const base = `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    if (href.startsWith("http") || href.startsWith("#")) return href;
    return `${base}${href.startsWith("/") ? href : "/" + href}`;
  };

  return (
    <>
      <style>{`
        .f01ft-link { color: ${MUTED}; text-decoration: none; font-size: 13.5px; transition: color 0.15s; display: block; padding: 4px 0; }
        .f01ft-link:hover { color: ${WHITE}; }
        .f01ft-nl-input::placeholder { color: rgba(255,255,255,0.55); }
        .f01ft-nl-input:focus { outline: none; border-color: rgba(255,255,255,0.8) !important; }
        @media (max-width: 640px) {
          .f01ft-nl-form { flex-direction: column !important; }
          .f01ft-nl-input { width: 100% !important; border-right: 1.5px solid rgba(255,255,255,0.5) !important; border-bottom: none !important; border-radius: 4px 4px 0 0 !important; }
          .f01ft-nl-btn { border-radius: 0 0 4px 4px !important; width: 100% !important; }
          .f01ft-cols { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* Newsletter strip */}
      <div style={{ background: GREEN, padding: "36px 20px", fontFamily: FONT }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
          <GenericEditableText sectionId={sectionId} field="newsletterTitle" value={newsletterTitle} tag="p"
            style={{ color: WHITE, fontSize: 15, fontWeight: 600, margin: 0, flex: "1 1 300px", lineHeight: 1.5 }}>
            {newsletterTitle}
          </GenericEditableText>
          <form className="f01ft-nl-form" style={{ display: "flex", gap: 0, flex: "0 0 auto" }} onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder={newsletterPlaceholder}
              className="f01ft-nl-input"
              style={{ width: 260, height: 44, border: "1.5px solid rgba(255,255,255,0.5)", borderRight: "none", borderRadius: "4px 0 0 4px", background: "rgba(255,255,255,0.15)", color: WHITE, paddingLeft: 16, fontSize: 14, fontFamily: FONT }}
            />
            <button type="submit" className="f01ft-nl-btn" style={{ height: 44, padding: "0 22px", background: DARK_BG, color: WHITE, border: "none", borderRadius: "0 4px 4px 0", fontWeight: 700, fontSize: 13, cursor: "pointer", letterSpacing: "0.04em", fontFamily: FONT }}>
              {newsletterCta}
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <footer style={{ background: DARK_BG, fontFamily: FONT, padding: "56px 20px 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="f01ft-cols" style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(160px, 1fr))`, gap: "40px 32px", paddingBottom: 48, borderBottom: `1px solid ${BORDER}` }}>

            {columns.map((col, ci) => (
              <div key={ci}>
                <p style={{ color: WHITE, fontSize: 13, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 16px" }}>{col.title}</p>
                {col.links.map((l, li) => (
                  <a key={li} href={resolve(l.href)} className="f01ft-link">{l.label}</a>
                ))}
              </div>
            ))}

            {/* Contact column */}
            <div>
              <p style={{ color: WHITE, fontSize: 13, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 16px" }}>Kontakt</p>
              <GenericEditableText sectionId={sectionId} field="contact.address" value={contact.address} tag="p"
                style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.6, margin: "0 0 12px" }}>
                {contact.address}
              </GenericEditableText>
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="f01ft-link" style={{ color: WHITE, fontWeight: 600 }}>{contact.phone}</a>
              <a href={`mailto:${contact.email}`} className="f01ft-link">{contact.email}</a>
            </div>

          </div>

          {/* Copyright */}
          <div style={{ padding: "20px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="p"
              style={{ color: MUTED, fontSize: 12.5, margin: 0 }}>
              {copyright}
            </GenericEditableText>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, margin: 0 }}>
              Powered by <span style={{ color: "rgba(255,255,255,0.35)" }}>Webero</span>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

// ── solar-03-footer ───────────────────────────────────────────────────────────
function FooterSolar03({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const ORANGE  = "#ff8b00";
  const WHITE   = "#ffffff";

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  type LinkItem = { label: string; href: string };
  const siteName   = String(content.siteName   ?? "SolarPro");
  const tagline    = String(content.tagline    ?? "Tepelná čerpadla & fotovoltaika");
  const brandLede  = String(content.brandLede  ?? "Český výrobce energetických řešení. Vlastní servisní síť po celé republice a garantovaná návratnost do sedmi let.");
  const ctaEyebrow = String(content.ctaEyebrow ?? "Rozhodujete se?");
  const ctaTitle   = String(content.ctaTitle   ?? "Získejte nezávazný návrh systému do 48 hodin");
  const ctaText    = String(content.ctaText    ?? "Bezplatná konzultace");
  const ctaHref    = String(content.ctaHref    ?? "/kontakt");
  const phone      = String(content.phone      ?? "+420 800 555 234");
  const phoneNote  = String(content.phoneNote  ?? "Po–Pá 8:00–18:00");
  const email      = String(content.email      ?? "info@solarpro.cz");
  const emailNote  = String(content.emailNote  ?? "Odpovídáme do 4 h");
  const address    = String(content.address    ?? "Průmyslová 1428, 370 01 České Budějovice");
  const addressNote = String(content.addressNote ?? "Výrobní závod & showroom");
  const copyright  = String(content.copyright  ?? `© ${new Date().getFullYear()} SolarPro Energetika, s.r.o.`);
  const legal1     = String(content.legal1     ?? "Ochrana osobních údajů");
  const legal1Href = String(content.legal1Href ?? "/kontakt");
  const legal2     = String(content.legal2     ?? "Obchodní podmínky");
  const legal2Href = String(content.legal2Href ?? "/kontakt");
  const col1Title  = String(content.col1Title  ?? "Řešení");
  const col1Links  = (content.col1Links  as LinkItem[] | undefined) ?? [];
  const col2Title  = String(content.col2Title  ?? "Produkty");
  const col2Links  = (content.col2Links  as LinkItem[] | undefined) ?? [];
  const col3Title  = String(content.col3Title  ?? "Společnost");
  const col3Links  = (content.col3Links  as LinkItem[] | undefined) ?? [];
  const fbHref     = String(content.fbHref     ?? "#");
  const igHref     = String(content.igHref     ?? "#");
  const ytHref     = String(content.ytHref     ?? "#");
  const liHref     = String(content.liHref     ?? "#");

  const FbIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>;
  const IgIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>;
  const YtIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>;
  const LiIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.56c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.65H9.35V9h3.42v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 010-4.13 2.07 2.07 0 010 4.13zM7.11 20.45H3.55V9h3.56v11.45z"/></svg>;

  const socials = [
    { href: fbHref, Icon: FbIcon, label: "Facebook" },
    { href: igHref, Icon: IgIcon, label: "Instagram" },
    { href: ytHref, Icon: YtIcon, label: "YouTube" },
    { href: liHref, Icon: LiIcon, label: "LinkedIn" },
  ];

  return (
    <footer className="s03ft-footer" data-template="solar-03">
      <div className="s03ft-inner">
        {/* CTA strip */}
        <div className="s03ft-cta">
          <div className="s03ft-cta-body">
            <span className="s03ft-cta-eyebrow">
              <span className="s03ft-cta-eyebrow-dot" aria-hidden="true" />
              <GenericEditableText sectionId={sectionId} field="ctaEyebrow" value={ctaEyebrow} tag="span" />
            </span>
            <h3 className="s03ft-cta-title">
              <GenericEditableText sectionId={sectionId} field="ctaTitle" value={ctaTitle} tag="span" />
            </h3>
          </div>
          <a href={resolve(ctaHref)} className="s03ft-cta-btn" data-btn="primary">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <span aria-hidden="true" style={{ marginLeft: 8, display: "inline-flex" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </span>
          </a>
        </div>

        {/* Grid: brand + 3 cols */}
        <div className="s03ft-grid">
          <div className="s03ft-brand">
            <div className="s03ft-logo">
              <span className="s03ft-logo-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="9" r="3" />
                  <line x1="12" y1="2.5" x2="12" y2="4"/>
                  <line x1="4.9" y1="4.9" x2="6" y2="6"/>
                  <line x1="19.1" y1="4.9" x2="18" y2="6"/>
                  <line x1="2.5" y1="9" x2="4" y2="9"/>
                  <line x1="20" y1="9" x2="21.5" y2="9"/>
                  <path d="M3 17c1.8-1.6 3.6-1.6 5.4 0s3.6 1.6 5.4 0 3.6-1.6 5.4 0" />
                </svg>
              </span>
              <div className="s03ft-logo-text">
                <span className="s03ft-logo-name">
                  <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
                </span>
                <span className="s03ft-logo-tag">
                  <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
                </span>
              </div>
            </div>
            <p className="s03ft-lede">
              <GenericEditableText sectionId={sectionId} field="brandLede" value={brandLede} tag="span" />
            </p>

            <ul className="s03ft-contact">
              <li>
                <span className="s03ft-contact-icon" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0122 16.92z"/></svg>
                </span>
                <div>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="s03ft-contact-primary">
                    <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                  </a>
                  <span className="s03ft-contact-note">
                    <GenericEditableText sectionId={sectionId} field="phoneNote" value={phoneNote} tag="span" />
                  </span>
                </div>
              </li>
              <li>
                <span className="s03ft-contact-icon" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                <div>
                  <a href={`mailto:${email}`} className="s03ft-contact-primary">
                    <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                  </a>
                  <span className="s03ft-contact-note">
                    <GenericEditableText sectionId={sectionId} field="emailNote" value={emailNote} tag="span" />
                  </span>
                </div>
              </li>
              <li>
                <span className="s03ft-contact-icon" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </span>
                <div>
                  <span className="s03ft-contact-primary">
                    <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                  </span>
                  <span className="s03ft-contact-note">
                    <GenericEditableText sectionId={sectionId} field="addressNote" value={addressNote} tag="span" />
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {[
            { title: col1Title, links: col1Links, prefix: "col1Links" },
            { title: col2Title, links: col2Links, prefix: "col2Links" },
            { title: col3Title, links: col3Links, prefix: "col3Links" },
          ].map((col, ci) => (
            <div className="s03ft-col" key={ci}>
              <p className="s03ft-col-title">
                <GenericEditableText sectionId={sectionId} field={ci === 0 ? "col1Title" : ci === 1 ? "col2Title" : "col3Title"} value={col.title} tag="span" />
              </p>
              <ul className="s03ft-col-links">
                {col.links.map((l, i) => (
                  <li key={i}>
                    <a href={resolve(l.href)} className="s03ft-link">
                      <GenericEditableText sectionId={sectionId} field={`${col.prefix}.${i}.label`} value={l.label} tag="span" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="s03ft-bar">
          <div className="s03ft-bar-left">
            <span className="s03ft-copy">
              <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
            </span>
            <span className="s03ft-legal">
              <a href={resolve(legal1Href)} className="s03ft-legal-link">
                <GenericEditableText sectionId={sectionId} field="legal1" value={legal1} tag="span" />
              </a>
              <span aria-hidden="true">·</span>
              <a href={resolve(legal2Href)} className="s03ft-legal-link">
                <GenericEditableText sectionId={sectionId} field="legal2" value={legal2} tag="span" />
              </a>
            </span>
          </div>
          <div className="s03ft-bar-right">
            <div className="s03ft-socials">
              {socials.map(({ href, Icon, label }, i) => (
                <a key={i} href={resolve(href)} aria-label={label} className="s03ft-social">
                  <Icon />
                </a>
              ))}
            </div>
            <WeberoCredit />
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── FooterSolar02 ─── solar-02 Greenia ────────────────────────────────── */
function FooterSolar02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const siteName  = String(content.siteName  ?? "GREENIA");
  const tagline   = String(content.tagline   ?? "Chytrá energetická řešení pro firmy, obce i bytové domy.");
  const phone     = String(content.phone     ?? "777 234 890");
  const email     = String(content.email     ?? "info@demo.cz");
  const address   = String(content.address   ?? "Brno · Praha · Ostrava");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);
  const navTitle    = String(content.navTitle    ?? "Řešení");
  const supTitle    = String(content.supTitle    ?? "Společnost");
  const contactTitle = String(content.contactTitle ?? "Kontakt");
  const ctaText     = String(content.ctaText  ?? "Bezplatná konzultace");
  const ctaHref     = String(content.ctaHref  ?? "/kontakt");
  const links = (content.links as Array<{ label: string; href: string }> | undefined) ?? [
    { label: "Fotovoltaika",       href: "/sluzby"    },
    { label: "PPA — bez investice",href: "/moznosti"  },
    { label: "Baterie BESS",       href: "/bess"      },
    { label: "Reference",          href: "/reference" },
    { label: "O nás",              href: "/onas"      },
    { label: "Kontakt",            href: "/kontakt"   },
  ];
  const solutionLinks = links.slice(0, 3);
  const companyLinks  = links.slice(3);

  const GREEN = "#79c44f";

  return (
    <footer className="s02ft" data-template="solar-02">
      <div className="s02ft-glow" aria-hidden="true" />
      <div className="s02ft-inner">
        <div className="s02ft-top">
          {/* Brand */}
          <div className="s02ft-brand">
            <a className="s02ft-logo" href={ctaHref}>
              <svg width="30" height="30" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path d="M14 3C8.477 3 4 7.477 4 13c0 3.5 1.8 6.6 4.5 8.4C9.8 22.3 11.8 23 14 23s4.2-.7 5.5-1.6C22.2 19.6 24 16.5 24 13c0-5.523-4.477-10-10-10z" fill={GREEN} fillOpacity="0.2"/>
                <path d="M14 6c-1.8 2-3 4.5-3 7s1.2 5 3 7c1.8-2 3-4.5 3-7s-1.2-5-3-7z" fill={GREEN}/>
                <path d="M8 10c2 1 4.5 1.5 6 3s2.5 4 2 6c-2-1-4.5-1.5-6-3S7.5 12 8 10z" fill={GREEN} fillOpacity="0.7"/>
                <path d="M20 10c-2 1-4.5 1.5-6 3s-2.5 4-2 6c2-1 4.5-1.5 6-3S20.5 12 20 10z" fill={GREEN} fillOpacity="0.5"/>
              </svg>
              <span className="s02ft-wordmark">
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </span>
            </a>
            <p className="s02ft-tagline">
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            <a href={ctaHref} className="s02ft-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          </div>

          {/* Solutions */}
          <div className="s02ft-col">
            <p className="s02ft-col-title">
              <GenericEditableText sectionId={sectionId} field="navTitle" value={navTitle} tag="span" />
            </p>
            <ul className="s02ft-nav">
              {solutionLinks.map((l, i) => (
                <li key={i}>
                  <a href={l.href} className="s02ft-navlink">
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="s02ft-col">
            <p className="s02ft-col-title">
              <GenericEditableText sectionId={sectionId} field="supTitle" value={supTitle} tag="span" />
            </p>
            <ul className="s02ft-nav">
              {companyLinks.map((l, i) => (
                <li key={i}>
                  <a href={l.href} className="s02ft-navlink">
                    <GenericEditableText sectionId={sectionId} field={`links.${i + 3}.label`} value={l.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="s02ft-col">
            <p className="s02ft-col-title">
              <GenericEditableText sectionId={sectionId} field="contactTitle" value={contactTitle} tag="span" />
            </p>
            <ul className="s02ft-nav">
              <li>
                <a href={`tel:+420${phone.replace(/\s/g, "")}`} className="s02ft-navlink">
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="s02ft-navlink">
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              </li>
              <li>
                <span className="s02ft-static">
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="s02ft-bottom">
          <span className="s02ft-copy">
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </span>
          <WeberoCredit />
        </div>
      </div>
    </footer>
  );
}

// ── malir-01-footer ───────────────────────────────────────────────────────────
// 1:1 petrovomalovani.cz footer (is-copy):
// - Černé pozadí #000000, padding 30px 20px
// - Desktop: flex row, justify space-between
//   vlevo: © copyright, vpravo: adresa + telefon
// - Mobile: flex column, centered
// - Font 18px, bílý text, Raleway
// ─────────────────────────────────────────────────────────────────────────────
function FooterMalir01({ content, sectionId, isAdmin: _isAdmin }: { content: Record<string, unknown>; sectionId: number; isAdmin?: boolean }) {
  const WHITE   = "#ffffff";
  const RALEWAY = "'Raleway', sans-serif";

  const copyright = String(content.copyright ?? "© 2025 Demo Malování");
  const address   = String(content.address   ?? "Ukázková 123, 110 00 Praha 1");
  const phone     = String(content.phone     ?? "704 123 456");
  const siteName  = String(content.siteName  ?? "Demo Malování");

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;600&display=swap" />
      <style>{`        .m01ft-footer { background: #000000; font-family: ${RALEWAY}; }
        .m01ft-inner { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px 20px; max-width: 1230px; margin: 0 auto; gap: 6px; text-align: center; }
        .m01ft-text { font-size: 18px; color: ${WHITE}; margin: 0; line-height: 1.5; }
        @media (min-width: 868px) {
          .m01ft-inner { flex-direction: row; align-items: flex-end; justify-content: space-between; text-align: left; gap: 30px; }
        }
      `}</style>

      <footer id="kontakt" className="m01ft-footer" data-template="malir-01">
        <div className="m01ft-inner">
          <p className="m01ft-text">
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span">{copyright}</GenericEditableText>
          </p>
          <p className="m01ft-text">
            <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span">{siteName}</GenericEditableText>
            {", "}
            <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span">{address}</GenericEditableText>
            {", Telefon: "}
            <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span">{phone}</GenericEditableText>
          </p>
        </div>
      </footer>
    </>
  );
}

// ── klempir-01-footer ─────────────────────────────────────────────────────────
// 1:1 klempirzprahy.cz footer:
// - #3a3a3a dark bg, white text, padding 40px 0 20px
// - 3-col grid (1fr 2fr 1fr): brand | services 2-col grid | contact links
//   - Section h4: white 16px + silver 40px underline
//   - Brand: logo (50px) + tagline silver
//   - Services: 2-col grid of silver links, hover white + padding-left 5px
//   - Contact: phone / email / address links with emoji icons
// - Footer bottom: border-top + copyright + webero credit
// ─────────────────────────────────────────────────────────────────────────────
interface FooterK01Props {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}

function FooterKlempir01({ content, sectionId, tenantSlug, isAdmin }: FooterK01Props) {
  const FONT   = "'Montserrat', sans-serif";
  const SILVER = "#c0c0c0";
  const DARK   = "#3a3a3a";
  const WHITE  = "#ffffff";

  const siteName  = String(content.siteName  ?? "Klempíř z Prahy");
  const logoUrl   = String(content.logoUrl   ?? "/templates/klempir-01/logo.svg");
  const tagline   = String(content.tagline   ?? "Profesionální klempířské, pokrývačské a tesařské práce.");
  const phone     = String(content.phone     ?? "+420 704 123 456");
  const email     = String(content.email     ?? "info@demo.cz");
  const address   = String(content.address   ?? "Praha a okolí");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} Klempíř z Prahy. Všechna práva vyhrazena.`);
  const services  = (Array.isArray(content.services) ? content.services : []) as string[];

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <>
      <style>{`
        .k01-footer { background: ${DARK}; color: ${WHITE}; padding: 40px 0 20px; font-family: ${FONT}; }
        .k01-footer-container { width: 90%; max-width: 1200px; margin: 0 auto; padding: 0 15px; }
        .k01-footer-grid { display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 40px; margin-bottom: 30px; }
        .k01-fsec h4 { color: ${WHITE}; font-size: 16px; font-weight: 600; margin-bottom: 20px; position: relative; padding-bottom: 10px; font-family: ${FONT}; }
        .k01-fsec h4::after { content: ''; position: absolute; bottom: 0; left: 0; width: 40px; height: 2px; background: ${SILVER}; }
        .k01-fsec p { font-size: 14px; color: ${SILVER}; line-height: 1.6; margin: 0; }
        .k01-footer-logo { max-height: 50px; width: auto; display: block; margin-bottom: 12px; }
        .k01-svc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; }
        .k01-svc-grid a { color: ${SILVER}; font-size: 13px; text-decoration: none; display: block; padding: 2px 0; transition: color 0.2s, padding-left 0.2s; }
        .k01-svc-grid a:hover { color: ${WHITE}; padding-left: 5px; }
        .k01-contact-link { display: flex; align-items: center; gap: 10px; color: ${SILVER}; font-size: 14px; margin-bottom: 10px; text-decoration: none; transition: color 0.2s; }
        .k01-contact-link:hover { color: ${WHITE}; }
        .k01-footer-bottom { text-align: center; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 10px; }
        .k01-footer-bottom p { font-size: 14px; color: ${SILVER}; margin: 0 0 8px; }
        .k01-footer-credit { font-size: 13px; color: rgba(192,192,192,0.7); }
        .k01-footer-credit a { color: ${SILVER}; text-decoration: none; transition: color 0.2s; }
        .k01-footer-credit a:hover { color: ${WHITE}; text-decoration: underline; }
        @media (max-width: 992px) { .k01-footer-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 768px) { .k01-footer-grid { grid-template-columns: 1fr; } }
      `}</style>

      <footer className="k01-footer" data-template="klempir-01">
        <div className="k01-footer-container">
          <div className="k01-footer-grid">
            {/* Brand */}
            <div className="k01-fsec">
              <img loading="lazy" src={logoUrl} alt={siteName} className="k01-footer-logo" />
              <p>
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </p>
            </div>

            {/* Services */}
            <div className="k01-fsec">
              <h4>Služby</h4>
              <div className="k01-svc-grid">
                {services.map((svc, i) => (
                  <a key={i} href={resolve("/sluzby")}>
                    <GenericEditableText sectionId={sectionId} field={`services.${i}`} value={svc} tag="span" />
                  </a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="k01-fsec">
              <h4>Kontakt</h4>
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="k01-contact-link">
                <span>📞</span>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
              <a href={`mailto:${email}`} className="k01-contact-link">
                <span>✉️</span>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
              <div className="k01-contact-link" style={{ cursor: "default" }}>
                <span>📍</span>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="k01-footer-bottom">
            <p>
              <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
            </p>
            <div className="k01-footer-credit">
              Vytvořeno na platformě <a href="https://webero.cz" target="_blank" rel="noopener">Webero.cz</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

// ── garden-01-footer ─────────────────────────────────────────────────────────
function FooterGarden01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const siteName   = String(content.siteName   ?? "Demo Gerberra s.r.o.");
  const tagline    = String(content.tagline    ?? "Zahradnické služby — Praha a okolí");
  const phone      = String(content.phone      ?? "+420 704 123 456");
  const email      = String(content.email      ?? "info@demo.cz");
  const address    = String(content.address    ?? "Praha a okolí");
  const ico        = String(content.ico        ?? "");
  const copyright  = String(content.copyright  ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);
  const ctaTitle   = String(content.ctaTitle   ?? "Máte zájem o realizaci nebo údržbu zahrady?");
  const ctaText    = String(content.ctaText    ?? "Kontaktujte nás a připravíme nabídku na míru.");
  const ctaHref    = String(content.ctaHref    ?? "#kontakt");
  const ctaBtn     = String(content.ctaButtonText ?? "Nezávazná poptávka");
  const col1Title  = String(content.linksCol1Title ?? "Služby");
  const col2Title  = String(content.linksCol2Title ?? "Navigace");
  const col1Links  = Array.isArray(content.linksCol1) ? content.linksCol1 as Array<{label:string;href:string}> : [];
  const col2Links  = Array.isArray(content.linksCol2) ? content.linksCol2 as Array<{label:string;href:string}> : [];

  return (
    <>
      <style>{`
        .g01f-footer {
          background: #202714;
          color: #f2f2f2;
          font-family: 'Inter', Arial, sans-serif;
        }
        .g01f-top {
          max-width: 1200px;
          margin: 0 auto;
          padding: 64px 48px 48px;
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr 1.4fr;
          gap: 48px;
          box-sizing: border-box;
        }
        .g01f-col-heading {
          font-family: 'Cardo', Georgia, serif;
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 20px 0;
        }
        .g01f-brand-name {
          font-family: 'Cardo', Georgia, serif;
          font-size: 22px;
          font-weight: 700;
          color: #ffffff;
          margin: 16px 0 6px 0;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .g01f-brand-tagline {
          font-size: 13px;
          color: #bcba63;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0 0 0 0;
        }
        .g01f-logo-svg {
          width: 52px;
          height: 52px;
        }
        .g01f-contact-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .g01f-contact-list li {
          font-size: 14px;
          color: #f2f2f2;
          line-height: 1.5;
        }
        .g01f-contact-list a {
          color: #f2f2f2;
          text-decoration: none;
        }
        .g01f-contact-list a:hover { color: #bcba63; }
        .g01f-link-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .g01f-link-list a {
          font-size: 14px;
          color: #f2f2f2;
          text-decoration: none;
          transition: color 0.2s;
        }
        .g01f-link-list a:hover { color: #bcba63; }
        .g01f-cta-text {
          font-size: 14px;
          color: #f2f2f2;
          line-height: 1.6;
          margin: 0 0 24px 0;
        }
        .g01f-cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #6a961f;
          color: #ffffff;
          font-family: 'Lato', Arial, sans-serif;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 24px;
          letter-spacing: 0.4px;
          line-height: 1em;
          text-transform: capitalize;
          transition: background 0.2s;
        }
        .g01f-cta-btn:hover { background: #5a7e18; }
        .g01f-bottom {
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .g01f-bottom-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 48px;
          font-size: 13px;
          color: #8a8a8a;
          box-sizing: border-box;
        }

        @media (max-width: 1023px) {
          .g01f-top { grid-template-columns: 1fr 1fr; gap: 32px; padding: 48px 32px 32px; }
        }
        @media (max-width: 767px) {
          .g01f-top { grid-template-columns: 1fr; gap: 32px; padding: 40px 20px 32px; }
          .g01f-bottom-inner { padding: 20px; }
        }
      `}</style>

      <footer className="g01f-footer">
        <div className="g01f-top">
          {/* Col 1 — brand */}
          <div>
            <svg className="g01f-logo-svg" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="26" cy="26" r="25" stroke="#bcba63" strokeWidth="1.5" fill="#2e3a1a"/>
              <g stroke="#bcba63" strokeWidth="1.2" fill="none">
                <path d="M26 38 C26 38 16 30 16 22 C16 16.5 20.5 12 26 12 C31.5 12 36 16.5 36 22 C36 30 26 38 26 38Z" fill="#6a961f" stroke="#bcba63" strokeWidth="1"/>
                <path d="M26 38 L26 42" stroke="#bcba63" strokeWidth="1.2"/>
                <path d="M21 20 C21 20 18 17 19 14" stroke="#bcba63" strokeWidth="0.8" opacity="0.7"/>
                <path d="M31 20 C31 20 34 17 33 14" stroke="#bcba63" strokeWidth="0.8" opacity="0.7"/>
              </g>
            </svg>
            <GenericEditableText tag="p" className="g01f-brand-name" value={siteName} sectionId={sectionId} field="siteName" />
            <GenericEditableText tag="p" className="g01f-brand-tagline" value={tagline} sectionId={sectionId} field="tagline" />
          </div>

          {/* Col 2 — kontakt */}
          <div>
            <GenericEditableText tag="h3" className="g01f-col-heading" value="Kontakt" sectionId={sectionId} field="linksCol2Title" />
            <ul className="g01f-contact-list">
              <li>{address}</li>
              <li><a href={`tel:${phone.replace(/\s/g,"")}`}>{phone}</a></li>
              <li><a href={`mailto:${email}`}>{email}</a></li>
              {ico && <li>IČO: {ico}</li>}
            </ul>
          </div>

          {/* Col 3 — služby */}
          <div>
            <GenericEditableText tag="h3" className="g01f-col-heading" value={col1Title} sectionId={sectionId} field="linksCol1Title" />
            <ul className="g01f-link-list">
              {col1Links.map((l, i) => (
                <li key={i}><a href={l.href}>{l.label}</a></li>
              ))}
            </ul>
          </div>

          {/* Col 4 — CTA */}
          <div>
            <GenericEditableText tag="h3" className="g01f-col-heading" value={ctaTitle} sectionId={sectionId} field="ctaTitle" />
            <GenericEditableText tag="p" className="g01f-cta-text" value={ctaText} sectionId={sectionId} field="ctaText" />
            <a href={ctaHref} data-btn="primary" className="g01f-cta-btn">{ctaBtn}</a>
          </div>
        </div>

        <div className="g01f-bottom">
          <div className="g01f-bottom-inner">{copyright}</div>
        </div>
      </footer>
    </>
  );
}

// ── clean-02-footer ───────────────────────────────────────────────────────────
function FooterClean02({ content, sectionId, tenantSlug }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string }) {
  const NAVY    = "#0e0e53";
  const PRIMARY = "#019dff";
  const FONT_H  = "'Bricolage Grotesque', sans-serif";
  const FONT_B  = "'Onest', sans-serif";

  const siteName     = String(content.siteName     ?? "Demo Modrý Žralok s.r.o.");
  const tagline      = String(content.tagline      ?? "Profesionální úklidová firma Praha");
  const address      = String(content.address      ?? "Ukázková 123, 110 00 Praha 1");
  const phone        = String(content.phone        ?? "+420 704 123 456");
  const email        = String(content.email        ?? "email@demo.cz");
  const ico          = String(content.ico          ?? "12345678");
  const openingHours = String(content.openingHours ?? "Po–Pá 8:00–16:00");
  const servicesLabel= String(content.servicesLabel?? "Služby");
  const infoLabel    = String(content.infoLabel    ?? "Informace");
  const copyright    = String(content.copyright    ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);
  const facebook     = String(content.facebook     ?? "");
  const instagram    = String(content.instagram    ?? "");

  type Link = { label: string; href: string };
  const links     = (content.links     as Link[] | undefined) ?? [];
  const linksCol2 = (content.linksCol2 as Link[] | undefined) ?? [];

  function resolve(href: string) {
    if (!tenantSlug || !href.startsWith("/")) return href;
    return `/demo/${tenantSlug}${href}`;
  }

  return (
    <>
      <style>{`
        .c02ft-footer { font-family: ${FONT_B}; background: ${NAVY}; color: rgba(255,255,255,0.8); }
        .c02ft-top-bar { height: 5px; background: linear-gradient(90deg,#2bbbff,#1c91ff 40%,#2559e2); }
        .c02ft-main { max-width: 80rem; margin: 0 auto; padding: 4rem 5% 3rem; display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 3rem; }
        .c02ft-logo { font-family: ${FONT_H}; font-size: 1.35rem; font-weight: 800; color: #fff; margin: 0 0 .3rem; display: flex; align-items: center; gap: .5rem; }
        .c02ft-logo-dot { width: 8px; height: 8px; border-radius: 50%; background: ${PRIMARY}; flex-shrink: 0; }
        .c02ft-tagline { font-size: .84rem; color: rgba(255,255,255,.45); margin: 0 0 1.75rem; }
        .c02ft-row { display: flex; align-items: flex-start; gap: .65rem; margin-bottom: .8rem; font-size: .875rem; color: rgba(255,255,255,.7); text-decoration: none; }
        a.c02ft-row:hover { color: ${PRIMARY}; }
        .c02ft-row svg { flex-shrink: 0; width: 15px; height: 15px; margin-top: 2px; color: ${PRIMARY}; }
        .c02ft-ico { font-size: .78rem; color: rgba(255,255,255,.32); margin-top: 1.25rem; }
        .c02ft-socials { display: flex; gap: .6rem; margin-top: 1.5rem; }
        .c02ft-social { width: 36px; height: 36px; border-radius: 8px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12); display: flex; align-items: center; justify-content: center; transition: background .2s, border-color .2s; text-decoration: none; }
        .c02ft-social:hover { background: rgba(1,157,255,.2); border-color: ${PRIMARY}; }
        .c02ft-social svg { width: 16px; height: 16px; fill: rgba(255,255,255,.7); }
        .c02ft-heading { font-family: ${FONT_H}; font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: rgba(255,255,255,.38); margin: 0 0 1.25rem; }
        .c02ft-links { list-style: none; padding: 0; margin: 0; }
        .c02ft-links li { margin-bottom: .65rem; }
        .c02ft-links a { color: rgba(255,255,255,.68); text-decoration: none; font-size: .9rem; transition: color .2s; }
        .c02ft-links a:hover { color: ${PRIMARY}; }
        .c02ft-bottom { border-top: 1px solid rgba(255,255,255,.1); }
        .c02ft-bottom-inner { max-width: 80rem; margin: 0 auto; padding: 1.25rem 5%; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; font-size: .8rem; color: rgba(255,255,255,.32); }
        @media(max-width:768px) { .c02ft-main { grid-template-columns: 1fr; gap: 2rem; padding: 2.5rem 5% 2rem; } .c02ft-bottom-inner { flex-direction: column; text-align: center; } }
      `}</style>
      <footer className="c02ft-footer" id={`section-${sectionId}`}>
        <div className="c02ft-top-bar" />
        <div className="c02ft-main">
          <div>
            <p className="c02ft-logo"><span className="c02ft-logo-dot" /><GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" /></p>
            <p className="c02ft-tagline"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></p>
            <a href={`tel:${phone.replace(/\s/g,"")}`} className="c02ft-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
            <a href={`mailto:${email}`} className="c02ft-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
            </a>
            <div className="c02ft-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
            </div>
            <div className="c02ft-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
              <GenericEditableText sectionId={sectionId} field="openingHours" value={openingHours} tag="span" />
            </div>
            <p className="c02ft-ico">IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" /></p>
            {(facebook || instagram) && (
              <div className="c02ft-socials">
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener" className="c02ft-social" aria-label="Facebook">
                    <svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </a>
                )}
                {instagram && (
                  <a href={instagram} target="_blank" rel="noopener" className="c02ft-social" aria-label="Instagram">
                    <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  </a>
                )}
              </div>
            )}
          </div>
          <div>
            <p className="c02ft-heading"><GenericEditableText sectionId={sectionId} field="servicesLabel" value={servicesLabel} tag="span" /></p>
            <ul className="c02ft-links">
              {links.map((l, i) => <li key={i}><a href={resolve(l.href)}><GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" /></a></li>)}
            </ul>
          </div>
          <div>
            <p className="c02ft-heading"><GenericEditableText sectionId={sectionId} field="infoLabel" value={infoLabel} tag="span" /></p>
            <ul className="c02ft-links">
              {linksCol2.map((l, i) => <li key={i}><a href={resolve(l.href)}><GenericEditableText sectionId={sectionId} field={`linksCol2.${i}.label`} value={l.label} tag="span" /></a></li>)}
            </ul>
          </div>
        </div>
        <div className="c02ft-bottom">
          <div className="c02ft-bottom-inner">
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
            <span>Vytvořeno s Webero</span>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ─── garden-02: Footer — tmavý 4-col ─────────────────────────────────────── */
function FooterGarden02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  function resolve(href: string) {
    if (!tenantSlug || !href.startsWith("/")) return href;
    if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
  }

  const siteName      = (content.siteName      as string) ?? "";
  const tagline       = (content.tagline       as string) ?? "";
  const phone         = (content.phone         as string) ?? "";
  const email         = (content.email         as string) ?? "";
  const address       = (content.address       as string) ?? "";
  const ico           = (content.ico           as string) ?? "";
  const hours         = (content.hours         as string) ?? "";
  const facebook      = (content.facebook      as string) ?? "";
  const instagram     = (content.instagram     as string) ?? "";
  const copyright     = (content.copyright     as string) ?? "";
  const linksCol1Title = (content.linksCol1Title as string) ?? "";
  const linksCol2Title = (content.linksCol2Title as string) ?? "";
  const linksCol1 = ((content.linksCol1 as Array<{ label: string; href: string }>) ?? []);
  const linksCol2 = ((content.linksCol2 as Array<{ label: string; href: string }>) ?? []);

  const PRIMARY = "#95c11f";
  const DARK    = "#1a2a0a";
  const FONT    = "'Inter', Arial, sans-serif";

  return (
    <>
      <style>{`
        .g02ft-footer  { background: ${DARK}; color: rgba(255,255,255,0.8); font-family: ${FONT}; padding: 72px 0 0; }
        .g02ft-inner   { max-width: 1140px; margin: 0 auto; padding: 0 24px; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; }
        @media (max-width: 900px) { .g02ft-inner { grid-template-columns: 1fr 1fr; gap: 32px; } }
        @media (max-width: 560px) { .g02ft-inner { grid-template-columns: 1fr; gap: 28px; } }
        .g02ft-brand-name { font-size: 1.2rem; font-weight: 800; color: #fff; margin: 0 0 6px; }
        .g02ft-brand-tag  { font-size: 0.85rem; color: rgba(255,255,255,0.5); margin: 0 0 20px; }
        .g02ft-contact    { display: flex; flex-direction: column; gap: 8px; font-size: 0.875rem; }
        .g02ft-contact a  { color: rgba(255,255,255,0.75); text-decoration: none; transition: color 0.15s; }
        .g02ft-contact a:hover { color: ${PRIMARY}; }
        .g02ft-social  { display: flex; gap: 10px; margin-top: 16px; }
        .g02ft-social a { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.1); color: #fff; text-decoration: none; font-size: 0.78rem; font-weight: 700; transition: background 0.15s; }
        .g02ft-social a:hover { background: ${PRIMARY}; }
        .g02ft-col-title { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: ${PRIMARY}; margin: 0 0 14px; }
        .g02ft-col ul  { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 9px; }
        .g02ft-col ul a { font-size: 0.875rem; color: rgba(255,255,255,0.65); text-decoration: none; transition: color 0.15s; }
        .g02ft-col ul a:hover { color: ${PRIMARY}; }
        .g02ft-bottom  { border-top: 1px solid rgba(255,255,255,0.1); margin-top: 56px; padding: 20px 24px; text-align: center; font-size: 0.78rem; color: rgba(255,255,255,0.35); max-width: 1140px; margin-left: auto; margin-right: auto; }
      `}</style>
      <footer className="g02ft-footer">
        <div className="g02ft-inner">
          {/* Col 1 — brand */}
          <div>
            <p className="g02ft-brand-name"><GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" /></p>
            <p className="g02ft-brand-tag"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></p>
            <div className="g02ft-contact">
              {phone   && <a href={`tel:${phone.replace(/\s/g, "")}`}><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" /></a>}
              {email   && <a href={`mailto:${email}`}><GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" /></a>}
              {address && <span><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></span>}
              {ico     && <span>IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" /></span>}
              {hours   && <span><GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" /></span>}
            </div>
            {(facebook || instagram) && (
              <div className="g02ft-social">
                {facebook  && <a href={facebook}  target="_blank" rel="noopener noreferrer" aria-label="Facebook">fb</a>}
                {instagram && <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">ig</a>}
              </div>
            )}
          </div>
          {/* Col 2 — links 1 */}
          {linksCol1.length > 0 && (
            <div className="g02ft-col">
              <p className="g02ft-col-title">{linksCol1Title}</p>
              <ul>
                {linksCol1.map((link, i) => (
                  <li key={i}><a href={resolve(link.href)}>{link.label}</a></li>
                ))}
              </ul>
            </div>
          )}
          {/* Col 3 — links 2 */}
          {linksCol2.length > 0 && (
            <div className="g02ft-col">
              <p className="g02ft-col-title">{linksCol2Title}</p>
              <ul>
                {linksCol2.map((link, i) => (
                  <li key={i}><a href={resolve(link.href)}>{link.label}</a></li>
                ))}
              </ul>
            </div>
          )}
          {/* Col 4 — empty placeholder for spacing */}
          <div />
        </div>
        <div className="g02ft-bottom">
          <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
        </div>
      </footer>
    </>
  );
}

// ── arbo-01-footer ────────────────────────────────────────────────────────────
// 1:1 lesarb.cz:
// - Dark green #0d3320 bg, 4-col desktop: logo+contact | Informace | Služby | CTA
// - Bottom bar: copyright in muted text
// ─────────────────────────────────────────────────────────────────────────────
function FooterArbo01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const siteName  = String(content.siteName  ?? "Demo Arborist s.r.o.");
  const logoUrl   = String(content.logoUrl   ?? "/templates/arbo-01/logo.svg");
  const phone     = String(content.phone     ?? "+420 704 123 456");
  const email     = String(content.email     ?? "email@demo.cz");
  const address   = String(content.address   ?? "Ukázková 123\n110 00 Praha 1");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);
  const ctaText   = String(content.ctaText   ?? "Nezávazná poptávka");
  const ctaHref   = String(content.ctaHref   ?? "#kontakt");
  const links     = (content.links     as Array<{ label: string; href: string }>) ?? [];
  const services  = (content.services  as Array<{ label: string; href: string }>) ?? [];

  return (
    <>
      <style>{`
        .arbo01-ft {
          background: #0d3320;
          padding: 4rem 1.5rem 0;
          font-family: "AlanSans","Inter",system-ui,sans-serif;
          color: rgba(255,255,255,0.75);
        }
        .arbo01-ft-inner {
          max-width: 1370px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem 3rem;
          padding-bottom: 3rem;
        }
        @media (min-width: 640px)  { .arbo01-ft-inner { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 1024px) { .arbo01-ft-inner { grid-template-columns: 2fr 1fr 1fr 1.2fr; } }

        /* Col 1: logo + contact */
        .arbo01-ft-brand { display: flex; flex-direction: column; gap: 1.25rem; }
        .arbo01-ft-logo img { max-height: 52px; width: auto; display: block; filter: brightness(0) invert(1); opacity: 0.9; }
        .arbo01-ft-contact { display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.875rem; }
        .arbo01-ft-contact a, .arbo01-ft-contact span {
          color: rgba(255,255,255,0.72);
          text-decoration: none;
          line-height: 1.5;
          display: block;
          transition: color 0.15s;
        }
        .arbo01-ft-contact a:hover { color: #62D76A; }

        /* Col 2 & 3: link lists */
        .arbo01-ft-col { display: flex; flex-direction: column; gap: 0.75rem; }
        .arbo01-ft-col-title {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #fff;
          margin-bottom: 0.25rem;
        }
        .arbo01-ft-col a {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.65);
          text-decoration: none;
          line-height: 1.5;
          transition: color 0.15s;
          display: block;
        }
        .arbo01-ft-col a:hover { color: #62D76A; }

        /* Col 4: CTA */
        .arbo01-ft-cta-col { display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; }
        .arbo01-ft-cta-text { font-size: 0.875rem; line-height: 1.55; color: rgba(255,255,255,0.7); }
        .arbo01-ft-cta-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: #009739; color: #fff;
          font-size: 0.875rem; font-weight: 700;
          text-decoration: none; padding: 0.65rem 1.25rem;
          border-radius: 6px; transition: background 0.2s; white-space: nowrap;
        }
        .arbo01-ft-cta-btn:hover { background: #15472a; }

        /* Bottom bar */
        .arbo01-ft-bottom {
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: 1.25rem 0;
          max-width: 1370px;
          margin: 0 auto;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.4);
          text-align: center;
        }
      `}</style>

      <footer className="arbo01-ft" id={String(sectionId)} data-template="arbo-01-footer">
        <div className="arbo01-ft-inner">
          {/* Col 1: logo + contact */}
          <div className="arbo01-ft-brand">
            <a href="/" className="arbo01-ft-logo" aria-label={siteName}>
              <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{}}>
                <img loading="lazy" src={logoUrl} alt={siteName} style={{ maxHeight: "52px", width: "auto", display: "block", filter: "brightness(0) invert(1)", opacity: 0.9 }} />
              </GenericEditableImage>
            </a>
            <div className="arbo01-ft-contact">
              <a href={`tel:${phone.replace(/\s/g, "")}`}>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
              <a href={`mailto:${email}`}>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
              <span style={{ whiteSpace: "pre-line" }}>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </span>
            </div>
          </div>

          {/* Col 2: Informace */}
          {links.length > 0 && (
            <div className="arbo01-ft-col">
              <div className="arbo01-ft-col-title">Informace</div>
              {links.map((l, i) => <a key={i} href={l.href}>{l.label}</a>)}
            </div>
          )}

          {/* Col 3: Služby */}
          {services.length > 0 && (
            <div className="arbo01-ft-col">
              <div className="arbo01-ft-col-title">Služby</div>
              {services.map((s, i) => <a key={i} href={s.href}>{s.label}</a>)}
            </div>
          )}

          {/* Col 4: CTA */}
          <div className="arbo01-ft-cta-col">
            <p className="arbo01-ft-cta-text">Máte zájem o naše služby? Kontaktujte nás pro nezávaznou poptávku.</p>
            <a href={ctaHref} data-btn="primary" className="arbo01-ft-cta-btn">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              {" →"}
            </a>
          </div>
        </div>

        <div className="arbo01-ft-bottom">
          <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
        </div>
      </footer>
    </>
  );
}

// ─── ddd-01-footer ─────────────────────────────────────────────────────────
function FooterDdd01({ content, sectionId }: {
  content: Record<string, unknown>;
  sectionId: number;
}) {
  const c = content as {
    siteName?: string; tagline?: string; logoUrl?: string;
    address?: string; phone?: string; email?: string; web?: string;
    ico?: string; facebook?: string; instagram?: string;
    openingHours?: string;
    servicesLabel?: string; infoLabel?: string;
    links?: { label: string; href: string }[];
    linksCol2?: { label: string; href: string }[];
    copyright?: string;
  };

  const siteName     = c.siteName     ?? "Demo Deratizace s.r.o.";
  const tagline      = c.tagline      ?? "Profesionální DDD služby";
  const logoUrl      = c.logoUrl      ?? "/templates/ddd-01/logo.svg";
  const address      = c.address      ?? "Ukázková 123, 110 00 Praha 1";
  const phone        = c.phone        ?? "+420 704 123 456";
  const email        = c.email        ?? "info@demo.cz";
  const ico          = c.ico          ?? "12345678";
  const openingHours = c.openingHours ?? "Po–Pá 8:00–18:00, So 9:00–14:00";
  const servicesLabel = c.servicesLabel ?? "Nejčastěji řešíme";
  const infoLabel    = c.infoLabel    ?? "Informace pro vás";
  const links        = (c.links     as { label: string; href: string }[]) ?? [];
  const linksCol2    = (c.linksCol2 as { label: string; href: string }[]) ?? [];
  const copyright    = c.copyright    ?? "© 2026 Demo Deratizace s.r.o. Všechna práva vyhrazena.";
  const facebook     = c.facebook     ?? "";
  const instagram    = c.instagram    ?? "";

  const DARK    = "#064e86";
  const DARK2   = "#07294a";
  const PRIMARY = "#0c93eb";
  const FONT    = "'Figtree', system-ui, sans-serif";

  return (
    <>
      <style>{`
        .ddd01ft-footer {
          background: ${DARK2};
          color: rgba(255,255,255,0.78);
          font-family: ${FONT};
          padding: 72px 24px 0;
        }
        .ddd01ft-top {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr;
          gap: 48px;
          padding-bottom: 56px;
          border-bottom: 1px solid rgba(255,255,255,0.12);
        }
        .ddd01ft-logo-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }
        .ddd01ft-logo-wrap img { width: 44px; height: 44px; }
        .ddd01ft-sitename {
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
        }
        .ddd01ft-tagline {
          font-size: 0.875rem;
          color: ${PRIMARY};
          font-weight: 600;
          margin-bottom: 20px;
        }
        .ddd01ft-contact-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.875rem;
        }
        .ddd01ft-contact-row a {
          color: rgba(255,255,255,0.78);
          text-decoration: none;
          transition: color 0.15s;
        }
        .ddd01ft-contact-row a:hover { color: #fff; }
        .ddd01ft-contact-row span {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .ddd01ft-contact-row span b { color: rgba(255,255,255,0.45); font-size: 0.78rem; min-width: 36px; font-weight: 400; }
        .ddd01ft-social-row {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }
        .ddd01ft-social-row a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
          color: #fff;
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 700;
          transition: background 0.15s;
        }
        .ddd01ft-social-row a:hover { background: ${PRIMARY}; }
        .ddd01ft-col-title {
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #fff;
          margin-bottom: 18px;
        }
        .ddd01ft-link-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ddd01ft-link-list a {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.72);
          text-decoration: none;
          transition: color 0.15s;
        }
        .ddd01ft-link-list a:hover { color: #fff; }
        .ddd01ft-bottom {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.42);
        }
        .ddd01ft-bottom-ico { font-size: 0.78rem; }
        @media (max-width: 900px) {
          .ddd01ft-top { grid-template-columns: 1fr 1fr; gap: 36px; }
        }
        @media (max-width: 560px) {
          .ddd01ft-top { grid-template-columns: 1fr; }
          .ddd01ft-bottom { flex-direction: column; align-items: flex-start; gap: 6px; }
        }
      `}</style>
      <footer className="ddd01ft-footer">
        <div className="ddd01ft-top">
          {/* Sloupec 1 — logo + kontakty */}
          <div>
            <div className="ddd01ft-logo-wrap">
              <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ width: 44, height: 44 }}>
                <img loading="lazy" src={logoUrl} alt={siteName} width={44} height={44} />
              </GenericEditableImage>
              <span className="ddd01ft-sitename">
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </span>
            </div>
            <div className="ddd01ft-tagline">
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </div>
            <div className="ddd01ft-contact-row">
              <span><b>Tel.</b><a href={`tel:${phone.replace(/\s/g, "")}`}><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" /></a></span>
              <span><b>E-mail</b><a href={`mailto:${email}`}><GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" /></a></span>
              <span><b>Adresa</b><span style={{color:"rgba(255,255,255,0.78)"}}><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></span></span>
              <span><b>Hod.</b><span style={{color:"rgba(255,255,255,0.78)"}}><GenericEditableText sectionId={sectionId} field="openingHours" value={openingHours} tag="span" /></span></span>
            </div>
            {(facebook || instagram) && (
              <div className="ddd01ft-social-row">
                {facebook  && <a href={facebook}  target="_blank" rel="noopener noreferrer" title="Facebook">f</a>}
                {instagram && <a href={instagram} target="_blank" rel="noopener noreferrer" title="Instagram">in</a>}
              </div>
            )}
          </div>

          {/* Sloupec 2 — Nejčastěji řešíme */}
          <div>
            <div className="ddd01ft-col-title">
              <GenericEditableText sectionId={sectionId} field="servicesLabel" value={servicesLabel} tag="span" />
            </div>
            <ul className="ddd01ft-link-list">
              {links.map((l, i) => (
                <li key={i}><a href={l.href}><GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" /></a></li>
              ))}
            </ul>
          </div>

          {/* Sloupec 3 — Informace */}
          <div>
            <div className="ddd01ft-col-title">
              <GenericEditableText sectionId={sectionId} field="infoLabel" value={infoLabel} tag="span" />
            </div>
            <ul className="ddd01ft-link-list">
              {linksCol2.map((l, i) => (
                <li key={i}><a href={l.href}><GenericEditableText sectionId={sectionId} field={`linksCol2.${i}.label`} value={l.label} tag="span" /></a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="ddd01ft-bottom">
          <span>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </span>
          {ico && <span className="ddd01ft-bottom-ico">IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" /></span>}
        </div>
      </footer>
    </>
  );
}

// ── hotel-01-footer ───────────────────────────────────────────────────────────
function FooterHotel01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c         = (content ?? {}) as Record<string, any>;
  const siteName  = c.siteName  ?? "GRAND HOTEL AURORA";
  const logoUrl   = c.logoUrl   ?? "";
  const tagline   = c.tagline   ?? "";
  const address   = c.address   ?? "";
  const city      = c.city      ?? "";
  const phone     = c.phone     ?? "";
  const email     = c.email     ?? "";
  const facebook  = c.facebook  ?? "";
  const instagram = c.instagram ?? "";
  const copyright = c.copyright ?? "";
  const links: { label: string; href: string }[] = Array.isArray(c.links) ? c.links : [];

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Poppins:wght@300;400;500&display=swap" />
      <style>{`
        .h01ft {
          background: #14110e;
          color: rgba(255,255,255,0.75);
          font-family: 'Poppins', sans-serif;
          padding: 0;
          position: relative;
        }
        .h01ft-cta-strip {
          background: linear-gradient(135deg, #a98763 0%, #c4a274 50%, #a98763 100%);
          display: flex; align-items: center; justify-content: center; gap: 24px;
          padding: 22px clamp(20px,5vw,80px);
          flex-wrap: wrap;
        }
        .h01ft-cta-label {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic; font-size: 17px; color: #fff;
          letter-spacing: 0.02em;
        }
        .h01ft-cta-btn {
          display: inline-flex; align-items: center; gap: 10px;
          background: transparent; border: 1px solid rgba(255,255,255,.6);
          color: #fff; font-family: 'Playfair Display', Georgia, serif;
          font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
          padding: 11px 28px; text-decoration: none;
          transition: background .3s, border-color .3s;
        }
        .h01ft-cta-btn:hover { background: rgba(255,255,255,.15); border-color: #fff; }

        .h01ft-main {
          padding: 72px clamp(20px,5vw,80px) 0;
        }
        .h01ft-grid {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr; gap: 48px;
          padding-bottom: 56px; border-bottom: 1px solid rgba(169,135,99,.15);
        }
        .h01ft-brand-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; margin-bottom: 20px;
        }
        .h01ft-brand-logo img { height: 40px; width: auto; filter: brightness(0) invert(1); opacity: 0.9; }
        .h01ft-brand-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 16px; letter-spacing: 0.2em; color: #fff;
          text-transform: uppercase;
        }
        .h01ft-tagline {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic; font-weight: 400;
          font-size: 14px; color: rgba(212,176,136,.6);
          margin: 0 0 24px; line-height: 1.6; letter-spacing: 0.03em;
        }
        .h01ft-socials { display: flex; gap: 12px; }
        .h01ft-social {
          width: 36px; height: 36px;
          border: 1px solid rgba(169,135,99,.3);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          color: rgba(212,176,136,.6); text-decoration: none;
          transition: border-color 0.3s, color 0.3s, background 0.3s;
        }
        .h01ft-social:hover { border-color: #d4b088; color: #d4b088; background: rgba(169,135,99,.1); }

        .h01ft-col-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic; font-weight: 400;
          font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase;
          color: #d4b088; margin: 0 0 22px;
        }
        .h01ft-col-title::after {
          content: ''; display: block; width: 24px; height: 1px;
          background: rgba(169,135,99,.5); margin-top: 12px;
        }
        .h01ft-links { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
        .h01ft-links a {
          font-size: 13px; font-weight: 300; color: rgba(255,255,255,0.6);
          text-decoration: none; letter-spacing: 0.04em;
          transition: color 0.3s, padding-left 0.3s;
        }
        .h01ft-links a:hover { color: #d4b088; padding-left: 6px; }

        .h01ft-contact { display: flex; flex-direction: column; gap: 14px; }
        .h01ft-contact-item {
          display: flex; gap: 12px; align-items: flex-start;
          font-size: 13px; font-weight: 300; color: rgba(255,255,255,0.6);
          line-height: 1.5;
        }
        .h01ft-contact-item svg { flex-shrink: 0; margin-top: 2px; color: rgba(212,176,136,.6); }
        .h01ft-contact-item a { color: rgba(255,255,255,0.6); text-decoration: none; transition: color .3s; }
        .h01ft-contact-item a:hover { color: #d4b088; }

        .h01ft-hours-col { display: flex; flex-direction: column; gap: 12px; }
        .h01ft-hours-item {
          font-size: 13px; font-weight: 300; color: rgba(255,255,255,.55);
          line-height: 1.5;
        }
        .h01ft-hours-label {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic; color: rgba(212,176,136,.55);
          font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
          display: block; margin-bottom: 2px;
        }

        .h01ft-bottom {
          max-width: 1200px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px clamp(20px,5vw,80px) 22px 0; flex-wrap: wrap; gap: 8px;
          font-size: 11px; color: rgba(255,255,255,0.3); font-weight: 300;
          letter-spacing: 0.04em;
        }
        .h01ft-webero {
          color: rgba(255,255,255,.3); text-decoration: none; transition: color .3s;
        }
        .h01ft-webero:hover { color: rgba(212,176,136,.6); }

        @media (max-width: 900px) {
          .h01ft-grid { grid-template-columns: 1fr 1fr; gap: 40px; }
        }
        @media (max-width: 540px) {
          .h01ft-grid { grid-template-columns: 1fr; }
          .h01ft-cta-strip { flex-direction: column; text-align: center; gap: 14px; }
        }
      `}</style>

      <footer className="h01ft" data-template="hotel-01-footer">
        <div className="h01ft-cta-strip">
          <span className="h01ft-cta-label">Rezervujte svůj pobyt v Grand Hotelu Aurora</span>
          <a href="#kontakt" className="h01ft-cta-btn">Rezervovat →</a>
        </div>

        <div className="h01ft-main">
          <div className="h01ft-grid">
            <div>
              <a href="#" className="h01ft-brand-logo">
                {logoUrl
                  ? <img loading="lazy" src={logoUrl} alt={siteName} />
                  : <span className="h01ft-brand-name"><GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" /></span>
                }
                {logoUrl && <span className="h01ft-brand-name"><GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" /></span>}
              </a>
              {tagline && <p className="h01ft-tagline"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></p>}
              <div className="h01ft-socials">
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener noreferrer" className="h01ft-social" aria-label="Facebook">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </a>
                )}
                {instagram && (
                  <a href={instagram} target="_blank" rel="noopener noreferrer" className="h01ft-social" aria-label="Instagram">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  </a>
                )}
              </div>
            </div>

            <div>
              <p className="h01ft-col-title">Navigace</p>
              <ul className="h01ft-links">
                {links.map((l, i) => (
                  <li key={i}>
                    <a href={l.href}>
                      <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="h01ft-col-title">Kontakt</p>
              <div className="h01ft-contact">
                {(address || city) && (
                  <div className="h01ft-contact-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>
                      <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                      {city && <>{", "}<GenericEditableText sectionId={sectionId} field="city" value={city} tag="span" /></>}
                    </span>
                  </div>
                )}
                {phone && (
                  <div className="h01ft-contact-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.7 16.94Z"/></svg>
                    <a href={`tel:${phone.replace(/\s/g,"")}`}>
                      <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                    </a>
                  </div>
                )}
                {email && (
                  <div className="h01ft-contact-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    <a href={`mailto:${email}`}>
                      <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="h01ft-col-title">Otevírací doba</p>
              <div className="h01ft-hours-col">
                <div className="h01ft-hours-item">
                  <span className="h01ft-hours-label">Recepce</span>
                  24 hodin denně
                </div>
                <div className="h01ft-hours-item">
                  <span className="h01ft-hours-label">Bistro Aurora</span>
                  7:00 – 23:00
                </div>
                <div className="h01ft-hours-item">
                  <span className="h01ft-hours-label">Vinný sklep</span>
                  16:00 – 24:00
                </div>
              </div>
            </div>
          </div>

          <div className="h01ft-bottom">
            <span>
              <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
            </span>
            <a className="h01ft-webero" href="https://webero.cz" target="_blank" rel="noopener noreferrer">
              Web vytvořil Webero.cz
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

// ── chalet-01-footer ──────────────────────────────────────────────────────────
function FooterChalet01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c = (content ?? {}) as Record<string, any>;
  const siteName  = String(c.siteName  ?? "Demo Chalet");
  const tagline   = String(c.tagline   ?? "Horský chalet k pronájmu v Krkonoších");
  const address   = String(c.address   ?? "Ukázková 123, 542 27 Malá Úpa");
  const phone     = String(c.phone     ?? "+420 704 123 456");
  const email     = String(c.email     ?? "email@demo.cz");
  const facebook  = String(c.facebook  ?? "https://facebook.com/demo");
  const instagram = String(c.instagram ?? "https://instagram.com/demo");
  const copyright = String(c.copyright ?? `© ${new Date().getFullYear()} Demo Chalet. Všechna práva vyhrazena.`);
  const links: Array<{ label: string; href: string }> = Array.isArray(c.links) ? c.links : [];
  const logoUrl   = String(c.logoUrl   ?? "/templates/chalet-01/logo.svg");

  const BEIGE  = "#c0bbad";
  const DARK   = "#1e2329";
  const FONT_H = "'Josefin Sans', system-ui, sans-serif";
  const FONT_B = "'Plus Jakarta Sans', system-ui, sans-serif";

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" />
      <style>{`        .ch01ft {
          background: #111518;
          padding: clamp(3.5rem, 7vw, 6rem) 1.5rem 0;
          font-family: ${FONT_B};
        }
        .ch01ft-top {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr;
          gap: clamp(2rem, 5vw, 4rem);
          padding-bottom: clamp(3rem, 6vw, 5rem);
          border-bottom: 1px solid rgba(192,187,173,0.12);
        }
        /* col 1 — brand */
        .ch01ft-brand {}
        .ch01ft-logo-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.1rem;
          text-decoration: none;
        }
        .ch01ft-logo-circle {
          width: 48px; height: 48px;
          border-radius: 50%;
          border: 1.5px solid rgba(192,187,173,0.4);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ch01ft-logo-wordmark {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }
        .ch01ft-logo-name {
          font-family: ${FONT_H};
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #fff;
        }
        .ch01ft-logo-sub {
          font-family: ${FONT_H};
          font-size: 0.55rem;
          font-weight: 300;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
        }
        .ch01ft-tagline {
          font-size: 0.82rem;
          line-height: 1.7;
          color: rgba(255,255,255,0.42);
          margin: 0 0 1.5rem;
          max-width: 280px;
        }
        .ch01ft-socials {
          display: flex;
          gap: 0.5rem;
        }
        .ch01ft-social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px; height: 34px;
          border-radius: 50%;
          border: 1px solid rgba(192,187,173,0.25);
          color: rgba(255,255,255,0.55);
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s;
        }
        .ch01ft-social-btn:hover {
          border-color: ${BEIGE};
          color: ${BEIGE};
        }
        /* col 2 — nav */
        .ch01ft-col-title {
          font-family: ${FONT_H};
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: ${BEIGE};
          margin: 0 0 1.25rem;
        }
        .ch01ft-nav {
          list-style: none;
          margin: 0; padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .ch01ft-nav a {
          font-size: 0.83rem;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: color 0.18s;
        }
        .ch01ft-nav a:hover { color: #fff; }
        /* col 3 — kontakt */
        .ch01ft-contact-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .ch01ft-contact-row {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          font-size: 0.83rem;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          transition: color 0.18s;
          line-height: 1.5;
        }
        a.ch01ft-contact-row:hover { color: rgba(255,255,255,0.85); }
        .ch01ft-contact-row svg { margin-top: 2px; flex-shrink: 0; color: ${BEIGE}; }
        /* bottom bar */
        .ch01ft-bottom {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.25rem 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .ch01ft-copyright {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.28);
          letter-spacing: 0.04em;
        }
        .ch01ft-made {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.04em;
        }
        @media (max-width: 768px) {
          .ch01ft-top { grid-template-columns: 1fr 1fr; }
          .ch01ft-brand { grid-column: span 2; }
        }
        @media (max-width: 480px) {
          .ch01ft-top { grid-template-columns: 1fr; }
          .ch01ft-brand { grid-column: span 1; }
        }
      `}</style>

      <footer className="ch01ft" data-template="chalet-01-footer">
        <div className="ch01ft-top">
          {/* Brand */}
          <div className="ch01ft-brand">
            <a href="#" className="ch01ft-logo-row">
              <div className="ch01ft-logo-circle">
                <GenericEditableImage
                  sectionId={sectionId}
                  field="logoUrl"
                  src={logoUrl}
                  alt={siteName}
                  className="relative overflow-hidden"
                  style={{ width: 32, height: 32 }}
                >
                  <img loading="lazy" src={logoUrl} alt={siteName} style={{ width: 32, height: 32, objectFit: "contain" }} />
                </GenericEditableImage>
              </div>
              <span className="ch01ft-logo-wordmark">
                <span className="ch01ft-logo-name">
                  <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
                </span>
                <span className="ch01ft-logo-sub">chalet</span>
              </span>
            </a>
            <p className="ch01ft-tagline">
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            <div className="ch01ft-socials">
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="ch01ft-social-btn" aria-label="Instagram">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a href={facebook} target="_blank" rel="noopener noreferrer" className="ch01ft-social-btn" aria-label="Facebook">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Nav links */}
          <div>
            <p className="ch01ft-col-title">Navigace</p>
            <ul className="ch01ft-nav">
              {links.map((l, i) => (
                <li key={i}>
                  <a href={l.href}>
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="ch01ft-col-title">Kontakt</p>
            <div className="ch01ft-contact-list">
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="ch01ft-contact-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1.02-.24 11.4 11.4 0 0 0 3.58.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.03Z"/>
                </svg>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
              <a href={`mailto:${email}`} className="ch01ft-contact-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
              <div className="ch01ft-contact-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </div>
            </div>
          </div>
        </div>

        <div className="ch01ft-bottom">
          <span className="ch01ft-copyright">
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </span>
          <span className="ch01ft-made">Vytvořeno s ♥</span>
        </div>
      </footer>
    </>
  );
}

// ── hotel-02-footer ───────────────────────────────────────────────────────────
function FooterHotel02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c              = (content ?? {}) as Record<string, any>;
  const siteName       = c.siteName       ?? "RELAX HOTEL";
  const siteMark       = c.siteMark       ?? "&";
  const logoUrl        = c.logoUrl        ?? "";
  const tagline        = c.tagline        ?? "";
  const ctaTitle       = c.ctaTitle       ?? "Připraveni na odpočinek?";
  const ctaText        = c.ctaText        ?? "Rezervovat pobyt";
  const ctaHref        = c.ctaHref        ?? "#kontakt";
  const address        = c.address        ?? "";
  const city           = c.city           ?? "";
  const phone          = c.phone          ?? "";
  const phone2         = c.phone2         ?? "";
  const email          = c.email          ?? "";
  const emailBooking   = c.emailBooking   ?? "";
  const facebook       = c.facebook       ?? "";
  const instagram      = c.instagram      ?? "";
  const copyright      = c.copyright      ?? "";
  const links: { label: string; href: string }[]          = Array.isArray(c.links)          ? c.links          : [];
  const importantLinks: { label: string; href: string }[] = Array.isArray(c.importantLinks) ? c.importantLinks : [];

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Montserrat:wght@300;400;500;600&display=swap" />
      <style>{`
        /* CTA strip */
        .h02ft-cta {
          background: #0f1622; position: relative; overflow: hidden;
          padding: clamp(48px,6vw,72px) clamp(20px,5vw,80px);
          text-align: center;
        }
        .h02ft-cta::before {
          content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 60px; height: 1px; background: #96A1AC;
        }
        .h02ft-cta-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(26px,3vw,40px); font-weight: 300; font-style: italic;
          color: #fff; margin: 0 0 28px; line-height: 1.2;
        }
        .h02ft-cta-btn {
          display: inline-block; padding: 14px 44px;
          font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 500;
          letter-spacing: 2.5px; text-transform: uppercase;
          color: #fff; background: transparent; border: 1px solid #96A1AC;
          text-decoration: none; position: relative; overflow: hidden;
          transition: color 0.35s ease;
        }
        .h02ft-cta-btn::before {
          content: ''; position: absolute; inset: 0;
          background: #96A1AC; transform: translateY(100%);
          transition: transform 0.35s ease; z-index: 0;
        }
        .h02ft-cta-btn:hover { color: #1a2332; }
        .h02ft-cta-btn:hover::before { transform: translateY(0); }
        .h02ft-cta-btn span { position: relative; z-index: 1; }

        /* Footer body */
        .h02ft {
          background: #1a2332;
          color: rgba(255,255,255,0.65);
          font-family: 'Montserrat', sans-serif;
          padding: clamp(56px,7vw,88px) clamp(20px,5vw,80px) 0;
        }
        .h02ft-grid {
          max-width: 1260px; margin: 0 auto;
          display: grid; grid-template-columns: 1.8fr 1fr 1fr 1fr; gap: 52px;
          padding-bottom: 52px; border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .h02ft-logo-wrap {
          display: flex; align-items: center; gap: 0;
          text-decoration: none; margin-bottom: 20px;
        }
        .h02ft-logo-wrap img {
          height: 46px; width: auto;
          filter: brightness(0) invert(1); opacity: 0.9;
        }
        .h02ft-logo-text {
          font-family: 'Montserrat', sans-serif;
          font-size: 14px; font-weight: 600; letter-spacing: 0.22em;
          color: #fff; text-transform: uppercase;
        }
        .h02ft-logo-mark {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 20px; font-weight: 300; font-style: italic;
          color: #96A1AC; margin: 0 6px;
        }
        .h02ft-tagline {
          font-size: 13px; font-weight: 300; color: rgba(255,255,255,0.4);
          margin: 0 0 28px; line-height: 1.7; max-width: 260px;
        }
        .h02ft-socials { display: flex; gap: 10px; }
        .h02ft-social {
          width: 36px; height: 36px;
          border: 1px solid rgba(150,161,172,0.25);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.45); text-decoration: none;
          transition: border-color 0.3s, color 0.3s, background 0.3s;
        }
        .h02ft-social:hover { border-color: #96A1AC; color: #fff; background: rgba(150,161,172,0.1); }

        .h02ft-col-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 10px; font-weight: 600; letter-spacing: 0.24em;
          text-transform: uppercase; color: #96A1AC;
          margin: 0 0 22px; display: block;
        }
        .h02ft-links { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 11px; }
        .h02ft-links a {
          font-size: 13px; font-weight: 300; color: rgba(255,255,255,0.55);
          text-decoration: none; transition: color 0.2s;
        }
        .h02ft-links a:hover { color: #fff; }

        .h02ft-contact { display: flex; flex-direction: column; gap: 14px; }
        .h02ft-ci {
          display: flex; gap: 11px; align-items: flex-start;
          font-size: 13px; font-weight: 300; color: rgba(255,255,255,0.55); line-height: 1.5;
        }
        .h02ft-ci svg { flex-shrink: 0; margin-top: 2px; color: #96A1AC; }
        .h02ft-ci a { color: rgba(255,255,255,0.55); text-decoration: none; transition: color 0.2s; }
        .h02ft-ci a:hover { color: #96A1AC; }

        .h02ft-bottom {
          max-width: 1260px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 10px;
          padding: 22px 0;
          font-size: 11px; color: rgba(255,255,255,0.45); font-weight: 300;
        }
        .h02ft-bottom a {
          color: rgba(255,255,255,0.45); text-decoration: none; transition: color 0.2s;
        }
        .h02ft-bottom a:hover { color: rgba(255,255,255,0.75); }
        .h02ft-bottom-links { display: flex; gap: 20px; flex-wrap: wrap; }
        .h02ft-bottom-links a { font-size: 11px; }
        .h02ft-credit {
          font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 0.5px;
        }
        .h02ft-credit a { color: rgba(255,255,255,0.3); }
        .h02ft-credit a:hover { color: rgba(255,255,255,0.6); }

        @media (max-width: 1024px) {
          .h02ft-grid { grid-template-columns: 1fr 1fr; gap: 40px; }
        }
        @media (max-width: 560px) {
          .h02ft-grid { grid-template-columns: 1fr; gap: 36px; }
          .h02ft-bottom { flex-direction: column; align-items: flex-start; gap: 8px; }
        }
      `}</style>

      {/* CTA strip above footer */}
      <div className="h02ft-cta">
        <h3 className="h02ft-cta-title">
          <GenericEditableText sectionId={sectionId} field="ctaTitle" value={ctaTitle} tag="span" />
        </h3>
        <a href={ctaHref} className="h02ft-cta-btn">
          <span><GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" /></span>
        </a>
      </div>

      <footer className="h02ft" data-template="hotel-02-footer">
        <div className="h02ft-grid">
          {/* Brand */}
          <div>
            <a href="#" className="h02ft-logo-wrap">
              {logoUrl
                ? <img loading="lazy" src={logoUrl} alt={siteName} />
                : <span className="h02ft-logo-text">
                    <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
                    {siteMark && <span className="h02ft-logo-mark">{siteMark}</span>}
                  </span>
              }
            </a>
            {tagline && (
              <p className="h02ft-tagline">
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </p>
            )}
            <div className="h02ft-socials">
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" className="h02ft-social" aria-label="Facebook">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" className="h02ft-social" aria-label="Instagram">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <span className="h02ft-col-title">Navigace</span>
            <ul className="h02ft-links">
              {links.map((l, i) => (
                <li key={i}>
                  <a href={l.href}>
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <span className="h02ft-col-title">Kontakt</span>
            <div className="h02ft-contact">
              {(address || city) && (
                <div className="h02ft-ci">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>
                    <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />{city && <><br /><GenericEditableText sectionId={sectionId} field="city" value={city} tag="span" /></>}
                  </span>
                </div>
              )}
              {phone && (
                <div className="h02ft-ci">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <span>
                    <a href={`tel:${phone}`}><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" /></a>
                    {phone2 && <><br /><a href={`tel:${phone2}`}><GenericEditableText sectionId={sectionId} field="phone2" value={phone2} tag="span" /></a></>}
                  </span>
                </div>
              )}
              {email && (
                <div className="h02ft-ci">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <span>
                    <a href={`mailto:${email}`}><GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" /></a>
                    {emailBooking && <><br /><a href={`mailto:${emailBooking}`}><GenericEditableText sectionId={sectionId} field="emailBooking" value={emailBooking} tag="span" /></a></>}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Important links */}
          <div>
            <span className="h02ft-col-title">Důležité</span>
            <ul className="h02ft-links">
              {importantLinks.map((l, i) => (
                <li key={i}>
                  <a href={l.href}>
                    <GenericEditableText sectionId={sectionId} field={`importantLinks.${i}.label`} value={l.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="h02ft-bottom">
          <span>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </span>
          <div className="h02ft-bottom-links">
            {importantLinks.slice(0, 2).map((l, i) => (
              <a key={i} href={l.href}>{l.label}</a>
            ))}
          </div>
          <span className="h02ft-credit">
            Web vytvořil <a href="https://webero.cz" target="_blank" rel="noopener noreferrer">Webero.cz</a>
          </span>
        </div>
      </footer>
    </>
  );
}

// ─── photo-01 Footer ─────────────────────────────────────────────────────────
function FooterPhoto01({ content, sectionId }: { content: unknown; sectionId: number }) {
  const c         = content as Record<string, unknown>;
  const siteName  = (c.siteName  as string) ?? "";
  const tagline   = (c.tagline   as string) ?? "";
  const phone     = (c.phone     as string) ?? "";
  const email     = (c.email     as string) ?? "";
  const address   = (c.address   as string) ?? "";
  const ico       = (c.ico       as string) ?? "";
  const vatNote   = (c.vatNote   as string) ?? "";
  const copyright = (c.copyright as string) ?? "";
  const links     = (c.links     as { label: string; href: string }[]) ?? [];
  const instagram = (c.instagram as string) ?? "";
  const facebook  = (c.facebook  as string) ?? "";

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;500&display=swap" />
      <style>{`        .ph01ft { background: #111; color: #bbb; padding: 72px 5% 0; }
        .ph01ft-inner {
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: 1.4fr 1fr 1fr;
          gap: 56px; padding-bottom: 56px;
        }

        /* col 1 — brand */
        .ph01ft-name {
          font-family: 'Cinzel', Georgia, serif;
          font-size: 20px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: #fff; margin: 0 0 10px;
        }
        .ph01ft-tagline {
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 300;
          color: #777; letter-spacing: 0.04em; margin: 0 0 36px;
        }
        .ph01ft-social { display: flex; gap: 14px; }
        .ph01ft-social a {
          display: flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border: 1px solid #333; border-radius: 50%;
          color: #888; transition: color 0.2s, border-color 0.2s;
        }
        .ph01ft-social a:hover { color: #fff; border-color: #666; }

        /* col 2 — navigace */
        .ph01ft-col-title {
          font-family: 'Cinzel', Georgia, serif; font-size: 11px;
          letter-spacing: 0.2em; text-transform: uppercase; color: #fff;
          margin: 0 0 20px;
        }
        .ph01ft-nav { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .ph01ft-nav a {
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 300;
          color: #888; text-decoration: none; letter-spacing: 0.03em;
          transition: color 0.2s;
        }
        .ph01ft-nav a:hover { color: #fff; }

        /* col 3 — kontakt */
        .ph01ft-contact-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
        .ph01ft-contact-item {
          display: flex; align-items: flex-start; gap: 10px;
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 300; color: #888;
        }
        .ph01ft-contact-item a { color: #888; text-decoration: none; transition: color 0.2s; }
        .ph01ft-contact-item a:hover { color: #fff; }
        .ph01ft-contact-icon { flex-shrink: 0; margin-top: 1px; color: #555; }

        /* bottom bar */
        .ph01ft-bottom {
          max-width: 1100px; margin: 0 auto;
          border-top: 1px solid #222; padding: 22px 0;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 8px;
        }
        .ph01ft-bottom-copy {
          font-family: 'Inter', sans-serif; font-size: 12px; color: #444;
        }
        .ph01ft-bottom-meta {
          font-family: 'Inter', sans-serif; font-size: 12px; color: #444;
        }

        @media (max-width: 900px) {
          .ph01ft-inner { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 600px) {
          .ph01ft-inner { grid-template-columns: 1fr; gap: 36px; }
          .ph01ft-bottom { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <footer className="ph01ft" id="kontakt" data-template="photo-01-footer">
        <div className="ph01ft-inner">

          {/* col 1 — brand */}
          <div>
            <p className="ph01ft-name">
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </p>
            <p className="ph01ft-tagline">
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            <div className="ph01ft-social">
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4.5"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* col 2 — navigace */}
          <div>
            <p className="ph01ft-col-title">Navigace</p>
            <ul className="ph01ft-nav">
              {links.map((l, i) => (
                <li key={i}>
                  <a href={l.href}>
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* col 3 — kontakt */}
          <div>
            <p className="ph01ft-col-title">Kontakt</p>
            <ul className="ph01ft-contact-list">
              {phone && (
                <li className="ph01ft-contact-item">
                  <svg className="ph01ft-contact-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1.02-.24 11.4 11.4 0 0 0 3.58.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.03Z"/>
                  </svg>
                  <a href={`tel:${phone.replace(/\s/g, "")}`}>
                    <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                  </a>
                </li>
              )}
              {email && (
                <li className="ph01ft-contact-item">
                  <svg className="ph01ft-contact-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  <a href={`mailto:${email}`}>
                    <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                  </a>
                </li>
              )}
              {address && (
                <li className="ph01ft-contact-item">
                  <svg className="ph01ft-contact-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                </li>
              )}
            </ul>
          </div>

        </div>

        <div className="ph01ft-bottom">
          <span className="ph01ft-bottom-copy">
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </span>
          {(ico || vatNote) && (
            <span className="ph01ft-bottom-meta">
              {ico && <>IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" /></>}
              {ico && vatNote ? " · " : ""}
              {vatNote && <GenericEditableText sectionId={sectionId} field="vatNote" value={vatNote} tag="span" />}
            </span>
          )}
        </div>
      </footer>
    </>
  );
}

// ── malir-02-footer ───────────────────────────────────────────────────────────
function FooterMalir02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const ORANGE  = "#ff914d";
  const DARK    = "#1a1a1a";
  const POPPINS = "'Poppins', sans-serif";

  const siteName  = typeof content.siteName  === "string" ? content.siteName  : "Demo Malářství";
  const logoUrl   = typeof content.logoUrl   === "string" ? content.logoUrl   : "/templates/malir-02/logo.svg";
  const copyright = typeof content.copyright === "string" ? content.copyright : `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`;
  const tagline   = typeof content.tagline   === "string" ? content.tagline   : "Profesionální malířské a lakýrnické práce. Kvalita, čistota a férová cena.";
  const ctaTitle  = typeof content.ctaTitle  === "string" ? content.ctaTitle  : "Poptejte nás ještě dnes";
  const ctaSub    = typeof content.ctaSub    === "string" ? content.ctaSub    : "Přijedeme se podívat a nabídneme vám cenu zdarma, bez závazků.";
  const ctaLabel  = typeof content.ctaLabel  === "string" ? content.ctaLabel  : "Napište nám";
  const ctaHref   = typeof content.ctaHref   === "string" ? content.ctaHref   : "#kontakty";
  const email     = typeof content.email     === "string" ? content.email     : "email@demo.cz";
  const phone     = typeof content.phone     === "string" ? content.phone     : "704 123 456";
  const address   = typeof content.address   === "string" ? content.address   : "Ukázková 123, 110 00 Praha 1";

  type Link = { label: string; href: string };
  const links: Link[] = Array.isArray(content.links) && content.links.length
    ? content.links as Link[]
    : [
        { label: "Služby",  href: "#sluzby" },
        { label: "Galerie", href: "#galerie" },
        { label: "Ceník",   href: "#cenik" },
        { label: "Kontakt", href: "#kontakty" },
      ];

  return (
    <>
      <style>{`
        .m02ft-footer { background: ${DARK}; }
        .m02ft-top {
          max-width: 1200px; margin: 0 auto; padding: 64px 40px 48px;
          display: grid; grid-template-columns: 2fr 1fr 1.4fr; gap: 60px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        /* col 1 – brand */
        .m02ft-logo { height: 44px; width: auto; display: block; margin-bottom: 20px; filter: brightness(10); }
        .m02ft-tagline {
          font-family: ${POPPINS}; font-size: 14px; color: rgba(255,255,255,0.45);
          line-height: 1.7; margin: 0 0 24px; max-width: 280px;
        }
        .m02ft-contact-item {
          display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
        }
        .m02ft-contact-item svg { color: ${ORANGE}; flex-shrink: 0; }
        .m02ft-contact-item a, .m02ft-contact-item span {
          font-family: ${POPPINS}; font-size: 13px; color: rgba(255,255,255,0.6);
          text-decoration: none; transition: color 0.2s;
        }
        .m02ft-contact-item a:hover { color: ${ORANGE}; }
        /* col 2 – nav */
        .m02ft-col-head {
          font-family: ${POPPINS}; font-weight: 700; font-size: 11px;
          letter-spacing: 0.16em; text-transform: uppercase; color: ${ORANGE};
          margin: 0 0 20px;
        }
        .m02ft-nav { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
        .m02ft-nav a {
          font-family: ${POPPINS}; font-size: 14px; color: rgba(255,255,255,0.5);
          text-decoration: none; transition: color 0.2s;
          display: flex; align-items: center; gap: 6px;
        }
        .m02ft-nav a::before { content: '—'; color: ${ORANGE}; font-size: 11px; }
        .m02ft-nav a:hover { color: #fff; }
        /* col 3 – CTA box */
        .m02ft-cta-box {
          background: ${ORANGE}; padding: 32px 28px;
        }
        .m02ft-cta-title {
          font-family: ${POPPINS}; font-weight: 800; font-size: 18px; color: #fff;
          line-height: 1.3; margin: 0 0 10px;
        }
        .m02ft-cta-sub {
          font-family: ${POPPINS}; font-size: 13px; color: rgba(255,255,255,0.8);
          line-height: 1.6; margin: 0 0 22px;
        }
        .m02ft-cta-btn {
          display: inline-block; background: ${DARK}; color: #fff;
          font-family: ${POPPINS}; font-weight: 700; font-size: 12px;
          letter-spacing: 0.08em; text-transform: uppercase;
          text-decoration: none; padding: 12px 24px;
          transition: background 0.2s;
        }
        .m02ft-cta-btn:hover { background: #000; }
        /* bottom bar */
        .m02ft-bottom {
          max-width: 1200px; margin: 0 auto; padding: 20px 40px;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
        }
        .m02ft-copy {
          font-family: ${POPPINS}; font-size: 12px; color: rgba(255,255,255,0.25);
        }
        .m02ft-badge {
          font-family: ${POPPINS}; font-size: 11px; color: rgba(255,255,255,0.2);
          letter-spacing: 0.06em;
        }
        @media (max-width: 900px) {
          .m02ft-top { grid-template-columns: 1fr 1fr; gap: 40px; padding: 48px 24px 36px; }
          .m02ft-cta-box { grid-column: 1 / -1; }
          .m02ft-bottom { padding: 18px 24px; flex-direction: column; text-align: center; gap: 8px; }
        }
        @media (max-width: 500px) {
          .m02ft-top { grid-template-columns: 1fr; }
        }
      `}</style>

      <footer className="m02ft-footer" data-template="malir-02">
        <div className="m02ft-top">
          {/* col 1 – brand + kontakt */}
          <div>
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "block" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" src={logoUrl} alt={siteName} className="m02ft-logo" />
            </GenericEditableImage>
            <p className="m02ft-tagline">
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span">{tagline}</GenericEditableText>
            </p>
            <div className="m02ft-contact-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 13.6 19.79 19.79 0 0 1 1 4.82 2 2 0 0 1 2.98 2.6h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"/></svg>
              <a href={`tel:${phone.replace(/\s/g, "")}`}><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span">{phone}</GenericEditableText></a>
            </div>
            <div className="m02ft-contact-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <a href={`mailto:${email}`}><GenericEditableText sectionId={sectionId} field="email" value={email} tag="span">{email}</GenericEditableText></a>
            </div>
            <div className="m02ft-contact-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span">{address}</GenericEditableText></span>
            </div>
          </div>

          {/* col 2 – navigace */}
          <div>
            <p className="m02ft-col-head">Navigace</p>
            <ul className="m02ft-nav">
              {links.map((l, i) => (
                <li key={i}><a href={l.href}><GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span">{l.label}</GenericEditableText></a></li>
              ))}
            </ul>
          </div>

          {/* col 3 – CTA box */}
          <div className="m02ft-cta-box">
            <p className="m02ft-cta-title"><GenericEditableText sectionId={sectionId} field="ctaTitle" value={ctaTitle} tag="span">{ctaTitle}</GenericEditableText></p>
            <p className="m02ft-cta-sub"><GenericEditableText sectionId={sectionId} field="ctaSub" value={ctaSub} tag="span">{ctaSub}</GenericEditableText></p>
            <a href={ctaHref} data-btn="primary" className="m02ft-cta-btn"><GenericEditableText sectionId={sectionId} field="ctaLabel" value={ctaLabel} tag="span">{ctaLabel}</GenericEditableText></a>
          </div>
        </div>

        <div className="m02ft-bottom">
          <span className="m02ft-copy">
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span">{copyright}</GenericEditableText>
          </span>
          <span className="m02ft-badge">MALÍŘSKÉ PRÁCE</span>
        </div>
      </footer>
    </>
  );
}

// ── events-01-footer ──────────────────────────────────────────────────────────
// Prémiová event-agentura: dark bg s gold hairline top border, 3-col (brand +
// nav + kontakt), Playfair italic tagline, gold ring social icons, refined
// hover polish, WeberoCredit v bottom baru. Awwwards polish 2026-07-01.
// ─────────────────────────────────────────────────────────────────────────────
function FooterEvents01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const GOLD = "#d4b896";
  const siteName    = String(content.siteName    ?? "DEMO EVENTS");
  const tagline     = String(content.tagline     ?? "Eventová agentura Praha");
  const phone       = String(content.phone       ?? "704 123 456");
  const email       = String(content.email       ?? "email@demo.cz");
  const address     = String(content.address     ?? "Ukázková 123, 110 00 Praha 1");
  const ico         = String(content.ico         ?? "12345678");
  const icoLabel    = String(content.icoLabel    ?? "IČO");
  const copyright   = String(content.copyright   ?? "© 2026 Demo Events. Všechna práva vyhrazena.");
  const navLabel    = String(content.navLabel    ?? "Navigace");
  const contactLabel= String(content.contactLabel?? "Kontakt");
  const facebook    = String(content.facebook    ?? "https://facebook.com/demo");
  const instagram   = String(content.instagram   ?? "https://instagram.com/demo");
  const siteMode    = String(content.siteMode    ?? "multipage");
  const links       = (content.links as Array<{ label: string; href: string }>) ?? [];
  const resolveHref = (href: string) => {
    if (!href.startsWith("/")) return href;
    if (!tenantSlug) return href;
    if (siteMode === "onepage") {
      if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
      return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}#${href.replace(/^\//, "")}`;
    }
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
  };

  return (
    <>
      <style>{`
        .ev01ft {
          position: relative;
          background: linear-gradient(180deg, #050505 0%, #000 100%);
          color: rgba(255,255,255,0.55);
          padding: 90px 40px 30px;
        }
        .ev01ft::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(212,184,150,0.28) 50%, transparent 100%);
        }
        .ev01ft-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 72px;
        }
        .ev01ft-col-head {
          color: ${GOLD};
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 3.5px;
          text-transform: uppercase;
          margin: 0 0 24px;
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        .ev01ft-col-head::before {
          content: "";
          display: block;
          width: 22px;
          height: 1px;
          background: ${GOLD};
        }
        .ev01ft p,
        .ev01ft-list a,
        .ev01ft-nav-link {
          font-family: 'Inter', sans-serif;
          font-size: 13.5px;
          color: rgba(255,255,255,0.58);
          text-decoration: none;
          line-height: 1.9;
          margin: 0;
          display: block;
          transition: color 0.35s cubic-bezier(.32,.72,0,1), padding-left 0.4s cubic-bezier(.32,.72,0,1);
          position: relative;
        }
        .ev01ft-nav-link { padding: 3px 0; }
        .ev01ft-list a::before,
        .ev01ft-nav-link::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          width: 6px;
          height: 1px;
          background: ${GOLD};
          transform: translateY(-50%) scaleX(0);
          transform-origin: left center;
          transition: transform 0.4s cubic-bezier(.32,.72,0,1);
        }
        .ev01ft-list a:hover,
        .ev01ft-nav-link:hover { color: ${GOLD}; padding-left: 14px; }
        .ev01ft-list a:hover::before,
        .ev01ft-nav-link:hover::before { transform: translateY(-50%) scaleX(1); }
        .ev01ft-brand {
          font-family: 'Inter', sans-serif;
          font-size: 20px;
          font-weight: 600;
          color: #fff;
          letter-spacing: 4px;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          text-decoration: none;
        }
        .ev01ft-brand::before {
          content: "";
          display: block;
          width: 6px;
          height: 6px;
          background: ${GOLD};
          border-radius: 50%;
          box-shadow: 0 0 0 3px rgba(212,184,150,0.12);
        }
        .ev01ft-tagline {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: 15px;
          color: ${GOLD};
          margin: 0 0 26px;
          letter-spacing: 0.1px;
          display: block;
        }
        .ev01ft-list { display: flex; flex-direction: column; gap: 2px; }
        .ev01ft-ico { color: rgba(255,255,255,0.4); font-size: 12px; letter-spacing: 1.5px; margin-top: 16px; }
        .ev01ft-social {
          display: flex;
          gap: 12px;
          margin-top: 26px;
        }
        .ev01ft-social a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: 1px solid rgba(212,184,150,0.24);
          color: rgba(255,255,255,0.62);
          text-decoration: none;
          transition: color 0.4s cubic-bezier(.32,.72,0,1), border-color 0.4s cubic-bezier(.32,.72,0,1), background 0.4s cubic-bezier(.32,.72,0,1), box-shadow 0.4s cubic-bezier(.32,.72,0,1), transform 0.4s cubic-bezier(.32,.72,0,1);
        }
        .ev01ft-social a:hover {
          color: ${GOLD};
          border-color: ${GOLD};
          background: rgba(212,184,150,0.06);
          box-shadow: 0 0 0 4px rgba(212,184,150,0.08);
          transform: translateY(-2px);
        }
        .ev01ft-bottom {
          border-top: 1px solid rgba(212,184,150,0.1);
          margin-top: 60px;
          padding-top: 26px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.35);
        }
        @media (max-width: 900px) {
          .ev01ft { padding: 70px 24px 24px; }
          .ev01ft-inner { grid-template-columns: 1fr; gap: 44px; }
          .ev01ft-bottom { flex-direction: column; gap: 14px; text-align: center; }
        }
      `}</style>
      <footer className="ev01ft" id="footer" data-template="events-01-footer">
        <div className="ev01ft-inner">
          <div>
            <span className="ev01ft-brand">
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span">{siteName}</GenericEditableText>
            </span>
            <span className="ev01ft-tagline">
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span">{tagline}</GenericEditableText>
            </span>
            <div className="ev01ft-list">
              <GenericEditableText sectionId={sectionId} field="address" value={address} tag="p"><p>{address}</p></GenericEditableText>
              <a href={`tel:${phone.replace(/\s/g,"")}`}>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span">{phone}</GenericEditableText>
              </a>
              <a href={`mailto:${email}`}>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span">{email}</GenericEditableText>
              </a>
            </div>
            <p className="ev01ft-ico">
              <GenericEditableText sectionId={sectionId} field="icoLabel" value={icoLabel} tag="span">{icoLabel}</GenericEditableText>
              {" "}
              <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span">{ico}</GenericEditableText>
            </p>
            <div className="ev01ft-social">
              <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 22v-8h3l1-4h-4V7c0-1.1.4-2 2-2h2V1.1C16.7 1 15.4 1 14 1c-3 0-5 1.9-5 5.3V10H6v4h3v8h4z"/></svg>
              </a>
              <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.9" fill="currentColor"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h3 className="ev01ft-col-head">
              <GenericEditableText sectionId={sectionId} field="navLabel" value={navLabel} tag="span">{navLabel}</GenericEditableText>
            </h3>
            <div className="ev01ft-list">
              {links.map((l, i) => (
                <a key={i} href={resolveHref(l.href)} className="ev01ft-nav-link">
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span">{l.label}</GenericEditableText>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="ev01ft-col-head">
              <GenericEditableText sectionId={sectionId} field="contactLabel" value={contactLabel} tag="span">{contactLabel}</GenericEditableText>
            </h3>
            <div className="ev01ft-list">
              <p>{address}</p>
              <a href={`tel:${phone.replace(/\s/g,"")}`}>{phone}</a>
              <a href={`mailto:${email}`}>{email}</a>
            </div>
          </div>
        </div>
        <div className="ev01ft-bottom">
          <span>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span">{copyright}</GenericEditableText>
          </span>
          <WeberoCredit />
        </div>
      </footer>
    </>
  );
}

// ── dj-01-footer ─────────────────────────────────────────────────────────────
// LUXE REDESIGN (Neon Nocturne — vasdj.cz Awwwards edition):
// - Preserved: dark bg + orange top border + brand block + divider + nav + contact row + socials + bottom copyright
// - Enhanced: midnight #08080b + gradient orange→amber 2px top rule + EQ-bar brand icon (match navbar)
// - Space Grotesk wordmark + JBM Mono nav/labels/copyright + subtle orange radial glow bottom
// - Nav: gradient underline slide-in hover; contact: minimalist mono stroke icons; socials: outline→gradient hover
// - Powinná <WeberoCredit /> v bottom bar (per playbook)
// ──────────────────────────────────────────────────────────────────────────────
function FooterDj01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const ORANGE = "#f15a24";

  const siteName  = String(content.siteName  ?? "NOKTURN");
  const tagline   = String(content.tagline   ?? "Půlnoční rezidenti pro váš zvuk.");
  const copyright = String(content.copyright ?? "© 2026 Nokturn Sound Collective · Praha");
  const facebook  = String(content.facebook  ?? "https://facebook.com/nokturn");
  const youtube   = String(content.youtube   ?? "https://youtube.com/nokturn");
  const instagram = String(content.instagram ?? "https://instagram.com/nokturn");
  const email     = String(content.email     ?? "booking@nokturn.cz");
  const phone     = String(content.phone     ?? "+420 731 456 789");

  const navLinks = [
    { label: "Sety",      href: "#sluzby" },
    { label: "Klienti",   href: "#reference" },
    { label: "Studio",    href: "#o-nas" },
    { label: "Booking",   href: "#kontakt" },
  ];

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" />
      <style>{`
        .dj01ft {
          position: relative;
          background: #08080b;
          font-family: 'Space Grotesk', -apple-system, sans-serif;
          overflow: hidden;
          isolation: isolate;
        }
        .dj01ft::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, #f15a24 20%, #ff8347 50%, #f15a24 80%, transparent 100%);
          z-index: 3;
        }
        .dj01ft::after {
          content: "";
          position: absolute;
          left: 50%; bottom: -30%;
          width: 90vw; max-width: 1200px; height: 55vh;
          background: radial-gradient(closest-side, rgba(241,90,36,0.18) 0%, rgba(241,90,36,0.03) 45%, rgba(241,90,36,0) 72%);
          transform: translateX(-50%);
          z-index: 0;
          pointer-events: none;
        }

        @keyframes dj01ft-fadeup { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        .dj01ft-animate { opacity: 0; transform: translateY(28px); }
        .dj01ft-animate.dj01ft-visible { animation: dj01ft-fadeup 0.7s cubic-bezier(.2,.7,.2,1) forwards; }
        .dj01ft-animate.dj01ft-visible:nth-child(2) { animation-delay: 0.08s; }
        .dj01ft-animate.dj01ft-visible:nth-child(3) { animation-delay: 0.16s; }
        .dj01ft-animate.dj01ft-visible:nth-child(4) { animation-delay: 0.24s; }
        .dj01ft-animate.dj01ft-visible:nth-child(5) { animation-delay: 0.32s; }

        .dj01ft-body {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
          padding: 4.5rem 2rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* ── brand ── */
        .dj01ft-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.15rem;
          margin-bottom: 2.5rem;
        }
        .dj01ft-icon {
          display: inline-flex;
          align-items: flex-end;
          justify-content: center;
          gap: 4px;
          width: 68px;
          height: 68px;
          background: rgba(241,90,36,0.08);
          border: 1px solid rgba(241,90,36,0.4);
          padding: 14px 12px;
          box-sizing: border-box;
          box-shadow: 0 0 32px rgba(241,90,36,0.25);
        }
        .dj01ft-icon span {
          display: block;
          width: 4px;
          background: linear-gradient(180deg, #ff8347 0%, ${ORANGE} 100%);
          transform-origin: bottom center;
          animation: dj01ft-eq 1.6s cubic-bezier(.4,.0,.2,1) infinite;
        }
        .dj01ft-icon span:nth-child(1) { height: 55%; animation-delay:   0ms; }
        .dj01ft-icon span:nth-child(2) { height: 100%;animation-delay: 120ms; }
        .dj01ft-icon span:nth-child(3) { height: 70%; animation-delay: 240ms; }
        .dj01ft-icon span:nth-child(4) { height: 88%; animation-delay: 360ms; }
        @keyframes dj01ft-eq {
          0%,100% { transform: scaleY(0.4); }
          50%     { transform: scaleY(1); }
        }
        .dj01ft-wordmark {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2rem, 4vw, 2.85rem);
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          margin: 0;
          line-height: 1;
          color: #fff;
        }
        .dj01ft-wordmark .dj01ft-dot { color: ${ORANGE}; }
        .dj01ft-tagline {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          font-weight: 500;
          color: rgba(255,255,255,0.55);
          letter-spacing: 0.32em;
          text-transform: uppercase;
          margin: 0;
        }

        .dj01ft-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.14) 20%, rgba(255,255,255,0.14) 80%, transparent);
          margin: 0 0 2.5rem;
        }

        /* ── nav ── */
        .dj01ft-nav {
          display: flex;
          align-items: center;
          gap: 2.5rem;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .dj01ft-nav a {
          font-family: 'JetBrains Mono', monospace;
          color: rgba(255,255,255,0.65);
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 0.35rem 0;
          transition: color 260ms cubic-bezier(.2,.7,.2,1);
          position: relative;
        }
        .dj01ft-nav a::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0;
          width: 0; height: 2px;
          background: linear-gradient(90deg, ${ORANGE} 0%, #ff8347 100%);
          transition: width 320ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01ft-nav a:hover { color: ${ORANGE}; }
        .dj01ft-nav a:hover::after { width: 100%; }

        /* ── contact ── */
        .dj01ft-contact {
          display: flex;
          align-items: center;
          gap: 3rem;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .dj01ft-contact-item {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          transition: transform 260ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01ft-contact-item:hover { transform: translateY(-1px); }
        .dj01ft-contact-icon {
          width: 34px; height: 34px;
          border: 1px solid rgba(255,255,255,0.15);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: border-color 260ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01ft-contact-item:hover .dj01ft-contact-icon { border-color: ${ORANGE}; }
        .dj01ft-contact-icon svg { display: block; }
        .dj01ft-contact-icon svg path, .dj01ft-contact-icon svg rect, .dj01ft-contact-icon svg polyline, .dj01ft-contact-icon svg line {
          stroke: ${ORANGE};
        }
        .dj01ft-contact-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.82rem;
          font-weight: 500;
          color: rgba(255,255,255,0.88);
          letter-spacing: 0.06em;
          transition: color 260ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01ft-contact-item:hover .dj01ft-contact-label { color: #fff; }

        /* ── socials ── */
        .dj01ft-social {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 3rem;
        }
        .dj01ft-social a {
          position: relative;
          width: 44px; height: 44px;
          border: 1px solid rgba(255,255,255,0.15);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          overflow: hidden;
          transition: border-color 320ms cubic-bezier(.2,.7,.2,1), transform 260ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01ft-social a::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, ${ORANGE} 0%, #ff8347 100%);
          transform: scale(0);
          transform-origin: center;
          transition: transform 320ms cubic-bezier(.2,.7,.2,1);
          border-radius: 50%;
          z-index: 0;
        }
        .dj01ft-social a:hover {
          border-color: ${ORANGE};
          transform: translateY(-3px);
        }
        .dj01ft-social a:hover::before { transform: scale(2.5); border-radius: 0; }
        .dj01ft-social a svg { position: relative; z-index: 1; display: block; }
        .dj01ft-social a svg path, .dj01ft-social a svg circle, .dj01ft-social a svg rect, .dj01ft-social a svg line, .dj01ft-social a svg polygon {
          fill: rgba(255,255,255,0.7);
          transition: fill 320ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01ft-social a:hover svg path,
        .dj01ft-social a:hover svg circle,
        .dj01ft-social a:hover svg rect,
        .dj01ft-social a:hover svg line,
        .dj01ft-social a:hover svg polygon { fill: #fff; }

        /* ── bottom bar ── */
        .dj01ft-bottom {
          width: 100%;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .dj01ft-copy {
          font-family: 'JetBrains Mono', monospace;
          color: rgba(255,255,255,0.4);
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          margin: 0;
          text-align: left;
        }
        .dj01ft-credit {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.4);
        }
        .dj01ft-credit a { color: rgba(255,255,255,0.55); transition: color 260ms cubic-bezier(.2,.7,.2,1); }
        .dj01ft-credit a:hover { color: ${ORANGE}; }

        @media (max-width: 640px) {
          .dj01ft-body { padding: 3rem 1.25rem 1.75rem; }
          .dj01ft-contact { gap: 1.5rem; flex-direction: column; }
          .dj01ft-nav { gap: 1.25rem; }
          .dj01ft-bottom { flex-direction: column; justify-content: center; }
          .dj01ft-copy, .dj01ft-credit { text-align: center; }
        }
        @media (prefers-reduced-motion: reduce) {
          .dj01ft-animate, .dj01ft-icon span { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      <footer className="dj01ft" data-template="dj-01-footer">
        <Dj01FooterInner
          sectionId={sectionId}
          siteName={siteName}
          tagline={tagline}
          copyright={copyright}
          facebook={facebook}
          youtube={youtube}
          instagram={instagram}
          email={email}
          phone={phone}
          navLinks={navLinks}
        />
      </footer>
    </>
  );
}

function Dj01FooterInner({
  sectionId, siteName, tagline, copyright, facebook, youtube, instagram, email, phone, navLinks,
}: {
  sectionId: number;
  siteName: string;
  tagline: string;
  copyright: string;
  facebook: string;
  youtube: string;
  instagram: string;
  email: string;
  phone: string;
  navLinks: { label: string; href: string }[];
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>(".dj01ft-animate");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("dj01ft-visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    items.forEach((item) => obs.observe(item));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="dj01ft-body" ref={wrapRef}>
      {/* Brand block */}
      <div className="dj01ft-brand dj01ft-animate">
        <div className="dj01ft-icon" aria-hidden>
          <span /><span /><span /><span />
        </div>
        <h2 className="dj01ft-wordmark">
          <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span">
            {siteName}
          </GenericEditableText>
          <span className="dj01ft-dot">.</span>
        </h2>
        <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="p" className="dj01ft-tagline">
          {tagline}
        </GenericEditableText>
      </div>

      <div className="dj01ft-divider dj01ft-animate" />

      {/* Nav links */}
      <nav className="dj01ft-nav dj01ft-animate" aria-label="Footer navigation">
        {navLinks.map((link) => (
          <a key={link.label} href={link.href}>{link.label}</a>
        ))}
      </nav>

      {/* Contact row */}
      <div className="dj01ft-contact dj01ft-animate">
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="dj01ft-contact-item">
          <span className="dj01ft-contact-icon" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" className="dj01ft-contact-label">
            {phone}
          </GenericEditableText>
        </a>
        <a href={`mailto:${email}`} className="dj01ft-contact-item">
          <span className="dj01ft-contact-icon" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" strokeWidth="1.6" strokeLinejoin="round"/>
              <polyline points="3 7 12 13 21 7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" className="dj01ft-contact-label">
            {email}
          </GenericEditableText>
        </a>
      </div>

      {/* Social */}
      <div className="dj01ft-social dj01ft-animate">
        <a href={facebook} title="Facebook" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
          </svg>
        </a>
        <a href={youtube} title="YouTube" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
            <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#08080b"/>
          </svg>
        </a>
        <a href={instagram} title="Instagram" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="#08080b"/>
            <circle cx="17.5" cy="6.5" r="1" fill="#08080b"/>
          </svg>
        </a>
      </div>

      {/* Bottom bar */}
      <div className="dj01ft-bottom">
        <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="p" className="dj01ft-copy">
          {copyright}
        </GenericEditableText>
        <span className="dj01ft-credit"><WeberoCredit /></span>
      </div>
    </div>
  );
}

// ── restaurant-04-footer ─────────────────────────────────────────────────────
// Tmavé pozadí #0d1f0a, červená linka nahoře 2px, 3-col layout:
// sloupec 1: inline Pizza Factory logo + tagline + social icons
// sloupec 2: kontaktní info (adresa, tel, email, hodiny)
// sloupec 3: navigační linky
// copyright bar dole
// ─────────────────────────────────────────────────────────────────────────────
function FooterRestaurant04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const siteName   = String(content.siteName   ?? "Corleone");
  const tagline    = String(content.tagline    ?? "Autentická italská kuchyně v Praze");
  const address    = String(content.address    ?? "Ukázková 123, 110 00 Praha 1");
  const phone      = String(content.phone      ?? "704 123 456");
  const email      = String(content.email      ?? "info@demo.cz");
  const hours      = String(content.hours      ?? "Po–Pá 10:00–23:00, So–Ne 11:00–23:00");
  const copyright  = String(content.copyright  ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);
  const fbUrl      = String((content as any).facebookUrl  ?? "");
  const igUrl      = String((content as any).instagramUrl ?? "");
  const links      = ((content as any).links as Array<{ label: string; href: string }>) ?? [];

  const DARK   = "#0d1f0a";
  const RED    = "#c41c1c";
  const CREAM  = "#f5f0e8";
  const MUTED  = "#8fa889";
  const MUTED2 = "#5a7a56";
  const SERIF  = "'Fraunces', Georgia, 'Times New Roman', serif";
  const SANS   = "'Nunito Sans', 'Helvetica Neue', Arial, sans-serif";

  const LogoSvg = () => (
    <svg viewBox="0 0 200 46" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ height: 40, display: "block" }}>
      <path d="M8 38 L22 10 L36 38 Z" fill={RED} opacity="0.9" />
      <circle cx="22" cy="21" r="3.5" fill={CREAM} opacity="0.9" />
      <circle cx="17" cy="30" r="2.5" fill={CREAM} opacity="0.7" />
      <circle cx="28" cy="29" r="2" fill={CREAM} opacity="0.7" />
      <text x="44" y="26" fontFamily="Georgia, serif" fontSize="18" fontWeight="700"
            fill={CREAM} letterSpacing="3" style={{ fontStyle: "italic" }}>PIZZA</text>
      <rect x="44" y="29" width="84" height="1.2" fill={RED} opacity="0.8" />
      <text x="44" y="40" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="9.5"
            fontWeight="600" fill={CREAM} letterSpacing="5" opacity="0.85">FACTORY</text>
    </svg>
  );

  const IconFb = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  const IconIg = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke={MUTED} strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="4" stroke={MUTED} strokeWidth="1.5"/>
      <circle cx="17.5" cy="6.5" r="1" fill={MUTED}/>
    </svg>
  );

  return (
    <footer style={{ background: DARK, borderTop: `2px solid ${RED}` }}>
      {/* Hlavní obsah */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(48px, 8vw, 80px) clamp(24px, 6vw, 80px) clamp(32px, 5vw, 56px)" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: "clamp(32px, 5vw, 72px)",
        }} className="r04-footer-grid">

          {/* Sloupec 1: Logo + tagline + social */}
          <div>
            <div style={{ marginBottom: 16 }}><LogoSvg /></div>
            <p style={{
              fontFamily: SANS, fontSize: 13, color: MUTED,
              lineHeight: 1.6, margin: "0 0 28px", maxWidth: 260,
            }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            {(fbUrl || igUrl) && (
              <div style={{ display: "flex", gap: 12 }}>
                {fbUrl && (
                  <a href={fbUrl} target="_blank" rel="noopener noreferrer"
                    style={{
                      width: 36, height: 36, borderRadius: "50%",
                      border: `1px solid ${MUTED2}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "border-color 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = RED)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = MUTED2)}
                  ><IconFb /></a>
                )}
                {igUrl && (
                  <a href={igUrl} target="_blank" rel="noopener noreferrer"
                    style={{
                      width: 36, height: 36, borderRadius: "50%",
                      border: `1px solid ${MUTED2}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "border-color 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = RED)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = MUTED2)}
                  ><IconIg /></a>
                )}
              </div>
            )}
          </div>

          {/* Sloupec 2: Kontakt */}
          <div>
            <h4 style={{
              fontFamily: SERIF, fontSize: 14, fontWeight: 400, fontStyle: "italic",
              color: CREAM, margin: "0 0 20px", letterSpacing: "0.04em",
            }}>Kontakt</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { field: "address", label: address },
                { field: "phone",   label: phone,  href: `tel:${phone.replace(/\s/g, "")}` },
                { field: "email",   label: email,  href: `mailto:${email}` },
                { field: "hours",   label: hours },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8 }}>
                  <div style={{ width: 3, background: RED, borderRadius: 1, flexShrink: 0, marginTop: 3 }} />
                  {item.href ? (
                    <a href={item.href} style={{ fontFamily: SANS, fontSize: 13, color: MUTED, textDecoration: "none", lineHeight: 1.5 }}>
                      <GenericEditableText sectionId={sectionId} field={item.field} value={item.label} tag="span" />
                    </a>
                  ) : (
                    <span style={{ fontFamily: SANS, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
                      <GenericEditableText sectionId={sectionId} field={item.field} value={item.label} tag="span" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sloupec 3: Navigace */}
          <div>
            <h4 style={{
              fontFamily: SERIF, fontSize: 14, fontWeight: 400, fontStyle: "italic",
              color: CREAM, margin: "0 0 20px", letterSpacing: "0.04em",
            }}>Navigace</h4>
            <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  style={{
                    fontFamily: SANS, fontSize: 13, color: MUTED,
                    textDecoration: "none", transition: "color 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = CREAM)}
                  onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div style={{
        borderTop: `1px solid #1e3a1a`,
        padding: "18px clamp(24px, 6vw, 80px)",
        maxWidth: "100%",
      }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <p style={{ fontFamily: SANS, fontSize: 12, color: MUTED2, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .r04-footer-grid { grid-template-columns: 1fr !important; } }
        @media (min-width: 601px) and (max-width: 768px) { .r04-footer-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   video-01-footer  — 1:1 honzakamenar.cz
   Very dark bg #1a1410, 3-col grid:
   col1: site name + tagline + socials
   col2: nav links
   col3: contact (phone, email, IČO)
   Bottom bar: copyright
───────────────────────────────────────────── */
function FooterVideo01({ content, sectionId, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  isAdmin: boolean;
}) {
  const c = content as {
    siteName?: string; tagline?: string;
    phone?: string; email?: string; address?: string; ico?: string;
    copyright?: string;
    links?: { label: string; href: string }[];
    instagram?: string; facebook?: string; youtube?: string;
  };
  const siteName  = c.siteName  ?? "VÁŠ KAMERAMAN";
  const tagline   = c.tagline   ?? "Svatební kameraman — Česká republika";
  const phone     = c.phone     ?? "704 123 456";
  const email     = c.email     ?? "email@demo.cz";
  const ico       = c.ico       ?? "12345678";
  const copyright = c.copyright ?? "© 2026 Demo Kameraman. Všechna práva vyhrazena.";
  const links     = c.links     ?? [];
  const instagram = c.instagram ?? "";
  const facebook  = c.facebook  ?? "";
  const youtube   = c.youtube   ?? "";

  const BG    = "#1a1410";
  const GOLD  = "#C49A6C";
  const MUTED = "rgba(255,255,255,0.45)";
  const WHITE = "#ffffff";

  return (
    <footer id={String(sectionId)} style={{ background: BG }}>
      <style>{`
        .vd01ft-inner {
          max-width: 980px;
          margin: 0 auto;
          padding: 64px 24px 40px;
        }
        .vd01ft-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 48px;
          padding-bottom: 48px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .vd01ft-brand-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 18px;
          font-weight: 400;
          letter-spacing: 0.08em;
          color: ${WHITE};
          margin: 0 0 8px;
          display: block;
        }
        .vd01ft-tagline {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 300;
          color: ${MUTED};
          margin: 0 0 28px;
        }
        .vd01ft-socials {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .vd01ft-socials a {
          color: ${MUTED};
          transition: color 0.2s;
          display: flex;
        }
        .vd01ft-socials a:hover { color: ${GOLD}; }
        .vd01ft-col-label {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: ${GOLD};
          margin: 0 0 18px;
          display: block;
        }
        .vd01ft-links {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .vd01ft-links a {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 300;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          transition: color 0.2s;
        }
        .vd01ft-links a:hover { color: ${WHITE}; }
        .vd01ft-contact-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 14px;
        }
        .vd01ft-contact-label {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: ${MUTED};
        }
        .vd01ft-contact-value {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: rgba(255,255,255,0.85);
          text-decoration: none;
        }
        .vd01ft-contact-value:hover { color: ${GOLD}; }
        .vd01ft-bottom {
          padding-top: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .vd01ft-copyright {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 300;
          color: ${MUTED};
          margin: 0;
        }
        @media (max-width: 680px) {
          .vd01ft-grid { grid-template-columns: 1fr; gap: 36px; }
          .vd01ft-bottom { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="vd01ft-inner">
        <div className="vd01ft-grid">
          {/* col 1 — brand + socials */}
          <div>
            <span className="vd01ft-brand-name">
              {isAdmin ? <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" /> : siteName}
            </span>
            <p className="vd01ft-tagline">
              {isAdmin ? <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /> : tagline}
            </p>
            <div className="vd01ft-socials">
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                  </svg>
                </a>
              )}
              {youtube && (
                <a href={youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.2 2.8 12 2.8 12 2.8s-4.2 0-6.8.1C4.6 3 3.3 3 2.2 4.2 1.3 5 1 7 1 7S.7 9.3.7 11.5v2.1c0 2.2.3 4.4.3 4.4s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.3 22.2 12 22.2 12 22.2s4.2 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.2.3-4.4v-2c0-2.2-.3-4.5-.3-4.5zM9.7 15.5V8.4l8 3.6-8 3.5z"/>
                  </svg>
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* col 2 — nav links */}
          <div>
            <span className="vd01ft-col-label">Navigace</span>
            <ul className="vd01ft-links">
              {links.map((l, i) => (
                <li key={i}>
                  <a href={l.href}>
                    {isAdmin ? <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" /> : l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* col 3 — contact */}
          <div>
            <span className="vd01ft-col-label">Kontakt</span>
            <div className="vd01ft-contact-item">
              <span className="vd01ft-contact-label">Telefon</span>
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="vd01ft-contact-value">
                {isAdmin ? <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" /> : phone}
              </a>
            </div>
            <div className="vd01ft-contact-item">
              <span className="vd01ft-contact-label">E-mail</span>
              <a href={`mailto:${email}`} className="vd01ft-contact-value">
                {isAdmin ? <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" /> : email}
              </a>
            </div>
            {ico && (
              <div className="vd01ft-contact-item">
                <span className="vd01ft-contact-label">IČO</span>
                <span className="vd01ft-contact-value">
                  {isAdmin ? <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" /> : ico}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="vd01ft-bottom">
          <p className="vd01ft-copyright">
            {isAdmin ? <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" /> : copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
