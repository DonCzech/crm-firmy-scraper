"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import { GenericEditableImage } from "@/components/tenant/GenericEditableImage";
import { ResizableImage } from "@/components/core/editable/ResizableImage";
import { shouldSkipNextImageOptimization } from "@/lib/image-source";

interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  image?: string;
}

interface Props {
  content: Record<string, unknown>;
  variant: string;
  isAdmin: boolean;
  sectionId: number;
}

export function TeamSection({ content, variant, sectionId }: Props) {
  const title = String(content.title ?? "Náš tým");
  const subtitle = String(content.subtitle ?? "");
  const members = (content.members as TeamMember[]) ?? [];
  const ctaText = String(content.ctaText ?? "");
  const ctaHref = String(content.ctaHref ?? "#tym");

  if (variant === "fyzio-01-team-grid") return <TeamFyzio01 content={content} sectionId={sectionId} />;
  if (variant === "fyzio-02-team-grid") return <TeamFyzio02 content={content} sectionId={sectionId} />;
  if (variant === "catering-01-team") return <TeamCatering01 content={content} sectionId={sectionId} />;
  if (variant === "autoskola-01-team") return <TeamAutoskola01 content={content} sectionId={sectionId} />;
  if (variant === "kids-01-team")    return <TeamKids01  content={content} sectionId={sectionId} />;
  if (variant === "vet-01-team")     return <TeamVet01   content={content} sectionId={sectionId} />;
  if (variant === "arch-01-team")    return <TeamArch01  content={content} sectionId={sectionId} />;
  if (variant === "signal-01-team")  return <TeamSignal01 content={content} sectionId={sectionId} />;
  if (variant === "legal-02-team")   return <TeamLegal02 content={content} sectionId={sectionId} />;

  // beauty-01 — Sand-Cream Editorial Wellness team grid
  // Magazine header + 3×2 portrait grid (3:4), hover = image zoom + name → sand color shift,
  // mono role label under Fahkwang name, optional specialty hairline divider.
  if (variant === "beauty-01-team-grid") {
    const cc = content as Record<string, unknown>;
    const eyebrowRaw  = cc.eyebrow;
    const titleAlt    = cc.title;
    const subtitleRaw = cc.subtitle;
    const eyebrow  = eyebrowRaw  === undefined ? "Náš tým" : String(eyebrowRaw);
    const titleStr = titleAlt    === undefined ? "Šest tváří,\njedna filosofie." : String(titleAlt);
    const subtitle = subtitleRaw === undefined ? "Specialisté, kteří vědí, že detail dělá rozdíl. Léta praxe, ale především citlivý přístup ke každému klientovi." : String(subtitleRaw);
    const showHeader = !!(eyebrow.trim() || titleStr.trim() || subtitle.trim());
    const WHITE  = "#ffffff";
    const DARK   = "#1F1F1F";
    const MUTED  = "#5B4D43";
    const SAND   = "#E0BE9A";
    const FONT   = "'Fahkwang', Georgia, serif";
    const SANS   = "var(--font-overpass), 'Overpass', Inter, system-ui, sans-serif";
    const MONO   = "var(--font-overpass-mono), 'Overpass Mono', Menlo, monospace";
    return (
      <section
        id="tym"
        style={{
          backgroundColor: WHITE,
          padding: "clamp(72px, 9vw, 128px) clamp(24px, 5vw, 64px)",
        }}
        data-template="beauty-01"
      >
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          {showHeader && (
            <div className="b01-team-head" style={{
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

          {/* 3-col × 2-row grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "clamp(28px, 3vw, 48px)",
          }}>
            {members.map((m, i) => (
              <article key={`tm-${i}`} className="b01-team-card">
                {m.image && (
                  <div className="b01-team-img-wrap" style={{
                    width: "100%",
                    aspectRatio: "3 / 4",
                    position: "relative",
                    overflow: "hidden",
                    marginBottom: 20,
                    backgroundColor: "#f0e8df",
                  }}>
                    <GenericEditableImage
                      sectionId={sectionId}
                      field={`members.${i}.image`}
                      src={m.image}
                      alt={m.name}
                      className="absolute inset-0 w-full h-full"
                      style={{ position: "absolute" }}
                    >
                      <Image
                        src={m.image}
                        alt={m.name}
                        fill
                        className="b01-team-img object-cover object-top"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                        unoptimized={shouldSkipNextImageOptimization(m.image)}
                        style={{ transition: "transform 0.7s cubic-bezier(.4,0,.2,1)" }}
                      />
                    </GenericEditableImage>
                  </div>
                )}
                <h3 className="b01-team-name" style={{
                  margin: "0 0 6px",
                  fontFamily: FONT,
                  fontSize: "clamp(20px, 1.8vw, 26px)",
                  fontWeight: 500,
                  color: DARK, lineHeight: 1.2,
                  letterSpacing: "0.01em",
                  transition: "color 0.3s ease",
                }}>
                  <GenericEditableText sectionId={sectionId} field={`members.${i}.name`} value={m.name} tag="span" />
                </h3>
                <p style={{
                  margin: 0,
                  fontFamily: MONO, fontSize: 11,
                  letterSpacing: "0.22em", textTransform: "uppercase",
                  color: MUTED,
                }}>
                  <GenericEditableText sectionId={sectionId} field={`members.${i}.role`} value={String(m.role ?? "")} tag="span" />
                </p>
                {(m as { specialty?: string }).specialty && (
                  <>
                    <span aria-hidden="true" style={{
                      display: "block", width: 28, height: 1, backgroundColor: SAND,
                      margin: "14px 0 12px",
                    }} />
                    <p style={{
                      margin: 0,
                      fontFamily: SANS, fontSize: 13, lineHeight: 1.55,
                      color: MUTED,
                    }}>
                      <GenericEditableText sectionId={sectionId} field={`members.${i}.specialty`} value={String((m as { specialty?: string }).specialty ?? "")} tag="span" />
                    </p>
                  </>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // hair-01: tall portrait cards in a horizontal scroll row, cream bg
  if (variant === "hair-01-team-cards") {
    const MONO = "'Montserrat',sans-serif";
    const GOLD = "#8a6f28";
    const CREAM = "#f5f1f0";
    return (
      <section
        id="tym"
        data-template="hair-01"
        style={{ backgroundColor: CREAM, padding: "clamp(60px,8vw,100px) 0", fontFamily: MONO }}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
          <h2
            className="text-center mb-3"
            style={{ color: "#1e1e1e", fontSize: "clamp(22px,2.5vw,36px)", fontWeight: 300, letterSpacing: "0.08em" }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {subtitle && (
            <p
              className="text-center mb-12"
              style={{ color: "#605f5f", fontSize: 13, fontWeight: 300, lineHeight: 1.7, maxWidth: 560, margin: "0 auto 56px" }}
            >
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}

          {/* Horizontal scroll row of tall portrait cards */}
          <div
            className="flex gap-4 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {members.map((m, i) => (
              <div
                key={i}
                className="shrink-0 flex flex-col"
                style={{ width: "clamp(200px,20vw,260px)" }}
              >
                <GenericEditableImage
                  sectionId={sectionId}
                  field={`members.${i}.image`}
                  src={m.image ?? ""}
                  alt={m.name}
                  className="relative overflow-hidden"
                  style={{ aspectRatio: "3/4", width: "100%", backgroundColor: "#e8e0d8" }}
                >
                  {m.image && (
                    <Image
                      src={m.image}
                      alt={m.name}
                      fill
                      className="object-cover object-top"
                      sizes="260px"
                      unoptimized={shouldSkipNextImageOptimization(m.image)}
                    />
                  )}
                </GenericEditableImage>
                <div className="pt-4 pb-2">
                  <p style={{ color: "#1e1e1e", fontSize: 14, fontWeight: 500, letterSpacing: "0.04em", margin: 0 }}>
                    <GenericEditableText sectionId={sectionId} field={`members.${i}.name`} value={m.name} tag="span" />
                  </p>
                  <p style={{ color: GOLD, fontSize: 11, fontWeight: 400, letterSpacing: "0.08em", marginTop: 4 }}>
                    <GenericEditableText sectionId={sectionId} field={`members.${i}.role`} value={m.role} tag="span" />
                  </p>
                </div>
              </div>
            ))}
          </div>

          {ctaText && (
            <div className="flex justify-center mt-12">
              <a
                href={ctaHref}
                data-btn="inverse"
                style={{
                  border: `1.5px solid ${GOLD}`,
                  color: GOLD,
                  backgroundColor: "transparent",
                  fontFamily: MONO,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase" as const,
                  padding: "14px 36px",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>
            </div>
          )}
        </div>
      </section>
    );
  }

  // hair-03: #ebebeb bg, kruhové portréty 300×300px v řadě, outline CTA
  // Reference: H1 40px Helvetica weight 400 #2f201a centered, fotky 300×300 circle,
  // name 16px weight 500 #2f201a, role 16px weight 500 #525252, outline button
  if (variant === "hair-03-circles") {
    const DARK = "#2f201a";
    const MUTED = "#525252";
    const SANS = "Helvetica, Arial, sans-serif";
    return (
      <section id="tym" style={{ backgroundColor: "#ebebeb", padding: "80px 0" }} data-template="hair-03">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 60px" }}>
          <h2 style={{ fontFamily: SANS, fontSize: 40, fontWeight: 400, color: DARK, textAlign: "center", margin: "0 0 60px 0" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>

          <div style={{ display: "flex", justifyContent: "center", gap: 60 }}>
            {(members.length === 0 ? [
              { name: "Demo Majitelka", role: "Majitelka", image: "" },
              { name: "Demo Stylistka", role: "Top Stylist", image: "" },
              { name: "Demo Koloristka", role: "Top Stylist", image: "" },
            ] : members).map((m, i) => (
              <div key={`h3-tm-${i}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                {/* Kruhový portrét 300×300px */}
                <div style={{ width: 300, height: 300, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                  {m.image ? (
                    <GenericEditableImage sectionId={sectionId} field={`members.${i}.image`} src={m.image} alt={m.name} className="relative w-full h-full" style={{ width: "100%", height: "100%" }}>
                      <Image src={m.image} alt={m.name} fill className="object-cover" sizes="300px" unoptimized={shouldSkipNextImageOptimization(m.image)} />
                    </GenericEditableImage>
                  ) : (
                    <div style={{ width: "100%", height: "100%", backgroundColor: "#d0ccc8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, color: DARK }}>
                      {m.name.charAt(0)}
                    </div>
                  )}
                </div>
                <p style={{ fontFamily: SANS, fontSize: 16, fontWeight: 500, color: DARK, margin: "8px 0 0 0", textAlign: "center" }}>
                  <GenericEditableText sectionId={sectionId} field={`members.${i}.name`} value={m.name} tag="span" />
                </p>
                <p style={{ fontFamily: SANS, fontSize: 16, fontWeight: 500, color: MUTED, margin: 0, textAlign: "center" }}>
                  <GenericEditableText sectionId={sectionId} field={`members.${i}.role`} value={m.role} tag="span" />
                </p>
              </div>
            ))}
          </div>

          {ctaText && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 48 }}>
              <a
                href={ctaHref}
                data-btn="inverse"
                style={{
                  fontFamily: SANS,
                  fontSize: 16,
                  fontWeight: 400,
                  color: DARK,
                  border: `1px solid ${DARK}`,
                  backgroundColor: "transparent",
                  padding: "10px 28px",
                  textDecoration: "none",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = DARK; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = DARK; }}
              >
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                {" >"}
              </a>
            </div>
          )}
        </div>
      </section>
    );
  }

  if (variant === "team-barber-03-luxury") {
    // Barber-03 "Barbery" — warm cinematic urban team grid
    const GOLD = "#c8a96e";
    const BG   = "#1c1410";
    const CARD = "rgba(255,255,255,0.025)";
    const BORDER = "rgba(200,169,110,0.22)";
    const eyebrow = String((content as Record<string, unknown>).eyebrow ?? "");
    return (
      <section
        style={{ backgroundColor: BG, padding: "clamp(96px, 13vw, 150px) 24px", position: "relative", overflow: "hidden" }}
        data-template="barber-03"
      >
        {/* Dual gold hairlines */}
        <div aria-hidden style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 180, height: 1, background: "linear-gradient(90deg, transparent, #c8a96e 50%, transparent)" }} />
        <div aria-hidden style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 180, height: 1, background: "linear-gradient(90deg, transparent, rgba(200,169,110,0.5) 50%, transparent)" }} />
        {/* Warm radial glow */}
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 100%, rgba(200,169,110,0.07) 0%, transparent 55%)" }} />

        <div style={{ maxWidth: 1240, margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Editorial header */}
          {(eyebrow || title || subtitle) && (
            <div style={{ textAlign: "center", marginBottom: "clamp(56px, 8vw, 80px)" }}>
              {eyebrow && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                  <span aria-hidden style={{ width: 42, height: 1, backgroundColor: GOLD }} />
                  <span style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontStyle: "italic", fontSize: "12px", letterSpacing: "0.28em", textTransform: "uppercase", color: GOLD }}>
                    <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
                  </span>
                  <span aria-hidden style={{ width: 42, height: 1, backgroundColor: GOLD }} />
                </div>
              )}
              {title && (
                <h2 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: "clamp(2rem, 4.2vw, 3rem)", fontWeight: 700, lineHeight: 1.12, letterSpacing: "0.04em", color: "#f5efe6", textTransform: "uppercase", margin: "0 auto 22px", maxWidth: 760 }}>
                  <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
                </h2>
              )}
              {subtitle && (
                <p style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontStyle: "italic", fontSize: "clamp(0.98rem, 1.4vw, 1.1rem)", color: "rgba(245,239,230,0.72)", lineHeight: 1.7, margin: "0 auto", maxWidth: 600 }}>
                  <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
                </p>
              )}
              <div aria-hidden style={{ display: "inline-flex", alignItems: "center", gap: 14, marginTop: 28 }}>
                <span style={{ width: 48, height: 1, backgroundColor: "rgba(200,169,110,0.55)" }} />
                <span style={{ width: 6, height: 6, backgroundColor: GOLD, transform: "rotate(45deg)" }} />
                <span style={{ width: 48, height: 1, backgroundColor: "rgba(200,169,110,0.55)" }} />
              </div>
            </div>
          )}

          {/* Cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: "clamp(24px, 3vw, 36px)" }}>
            {members.map((m, i) => (
              <div key={i} className="b03tm-card" style={{
                position: "relative",
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderTop: `2px solid ${GOLD}`,
                padding: "0 0 32px",
                overflow: "hidden",
                animation: `b03TFadeUp 0.85s cubic-bezier(.22,.68,0,1.1) ${0.15 + i * 0.12}s both`,
              }}>
                {/* Image — full width portrait */}
                {m.image ? (
                  <ResizableImage
                    sectionId={sectionId}
                    field={`members.${i}.image`}
                    src={m.image}
                    alt={m.name}
                    fallbackWidth={320}
                    fallbackHeight={400}
                    style={{ display: "block", width: "100%", marginBottom: 28, overflow: "hidden" }}
                    aspectLock={false}
                    fluidDefault
                  >
                    <GenericEditableImage sectionId={sectionId} field={`members.${i}.image`} src={m.image} alt={m.name} style={{ width: "100%", height: "100%" }}>
                      <Image src={m.image} alt={m.name} fill className="object-cover b03tm-img" sizes="(max-width: 768px) 100vw, 33vw" unoptimized={shouldSkipNextImageOptimization(m.image)} />
                    </GenericEditableImage>
                    {/* Warm overlay */}
                    <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(28,20,16,0.12) 0%, rgba(28,20,16,0.5) 100%)", pointerEvents: "none" }} />
                    {/* Number badge */}
                    <span aria-hidden style={{
                      position: "absolute", top: 18, left: 18, zIndex: 2,
                      fontFamily: "'Libre Baskerville', Georgia, serif", fontStyle: "italic",
                      fontSize: 13, letterSpacing: "0.2em", color: GOLD, pointerEvents: "none",
                    }}>0{i + 1}</span>
                  </ResizableImage>
                ) : (
                  <div style={{ aspectRatio: "4 / 5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28, background: "rgba(0,0,0,0.25)", border: `1px solid ${BORDER}` }}>
                    <span style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 64, fontWeight: 700, color: GOLD, letterSpacing: 0 }}>{m.name.charAt(0)}</span>
                  </div>
                )}

                <div style={{ padding: "0 28px" }}>
                  {/* Role */}
                  <p style={{
                    fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.28em",
                    textTransform: "uppercase", color: GOLD, margin: "0 0 10px",
                  }}>
                    <GenericEditableText sectionId={sectionId} field={`members.${i}.role`} value={m.role} tag="span" />
                  </p>
                  {/* Name */}
                  <h3 style={{
                    fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: "1.4rem", fontWeight: 700,
                    color: "#f5efe6", margin: "0 0 14px", lineHeight: 1.2, letterSpacing: "0.02em",
                  }}>
                    <GenericEditableText sectionId={sectionId} field={`members.${i}.name`} value={m.name} tag="span" />
                  </h3>
                  {/* Decorative gold rule */}
                  <span aria-hidden style={{ display: "block", width: 32, height: 1, backgroundColor: GOLD, marginBottom: 16 }} />
                  {/* Bio */}
                  {m.bio && (
                    <p style={{
                      fontFamily: "'Libre Baskerville', Georgia, serif", fontStyle: "italic",
                      fontSize: "0.92rem", color: "rgba(245,239,230,0.72)",
                      lineHeight: 1.7, margin: 0,
                    }}>
                      <GenericEditableText sectionId={sectionId} field={`members.${i}.bio`} value={m.bio} tag="span" />
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "barber-dark") {
    const GOLD = "#C9A84C";
    const BG   = "#0a0a0a";
    const CARD = "rgba(255,255,255,0.04)";
    const BORDER = "rgba(201,168,76,0.15)";
    return (
      <section style={{ backgroundColor: BG, padding: "clamp(56px, 10vw, 100px) 24px" }} data-template="barber-01">
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "clamp(40px, 6vw, 64px)" }}>
            <p style={{ fontFamily: "var(--font-heading)", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, marginBottom: 16 }}>
              {subtitle ? <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /> : null}
            </p>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: "#F5F5F5", margin: 0, letterSpacing: "-0.01em" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <div style={{ width: 48, height: 1, background: GOLD, margin: "24px auto 0" }} />
          </div>
          {/* Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: 24 }}>
            {members.map((m, i) => (
              <div key={i} className="bc-team-card" style={{ background: CARD, border: `1px solid ${BORDER}`, borderTop: `2px solid ${GOLD}`, padding: "36px 32px 32px", display: "flex", flexDirection: "column", gap: 0, position: "relative", overflow: "hidden" }}>
                {/* Avatar */}
                <div className="bc-team-avatar" style={{ marginBottom: 24 }}>
                  {m.image ? (
                    <ResizableImage
                      sectionId={sectionId}
                      field={`members.${i}.image`}
                      src={m.image}
                      alt={m.name}
                      fallbackWidth={72}
                      fallbackHeight={72}
                      style={{ borderRadius: "50%", overflow: "hidden" }}
                      aspectLock
                      min={40}
                      max={200}
                    >
                      <GenericEditableImage sectionId={sectionId} field={`members.${i}.image`} src={m.image} alt={m.name} style={{ width: "100%", height: "100%" }}>
                        <Image src={m.image} alt={m.name} fill className="object-cover" sizes="200px" unoptimized={shouldSkipNextImageOptimization(m.image)} />
                      </GenericEditableImage>
                    </ResizableImage>
                  ) : (
                    <div style={{ width: 72, height: 72, borderRadius: "50%", border: `1.5px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 700, color: GOLD, letterSpacing: 0 }}>
                      {m.name.charAt(0)}
                    </div>
                  )}
                </div>
                {/* Role */}
                <p style={{ fontFamily: "var(--font-heading)", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>
                  <GenericEditableText sectionId={sectionId} field={`members.${i}.role`} value={m.role} tag="span" />
                </p>
                {/* Name */}
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", fontWeight: 700, color: "#F5F5F5", margin: "0 0 12px", lineHeight: 1.2 }}>
                  <GenericEditableText sectionId={sectionId} field={`members.${i}.name`} value={m.name} tag="span" />
                </h3>
                {/* Divider */}
                <div style={{ width: 32, height: 1, background: BORDER, marginBottom: 16 }} />
                {/* Bio */}
                {m.bio && (
                  <p style={{ fontFamily: "var(--font-body, Inter, sans-serif)", fontSize: "0.875rem", color: "#A0A0A0", lineHeight: 1.7, margin: 0 }}>
                    <GenericEditableText sectionId={sectionId} field={`members.${i}.bio`} value={m.bio} tag="span" />
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4" style={{ backgroundColor: "var(--color-surface, #f9fafb)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2
            className="text-3xl font-bold mb-3"
            style={{ color: "var(--color-text, #111827)", fontFamily: "var(--font-heading)" }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {subtitle && (
            <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--color-text-muted, #6b7280)" }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {members.length === 0
            ? [1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-3" />
                  <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>Jméno Příjmení</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Pozice</p>
                </div>
              ))
            : members.map((m, i) => (
                <div key={i} className="text-center">
                  {m.image ? (
                    <GenericEditableImage sectionId={sectionId} field={`members.${i}.image`} src={m.image} alt={m.name} className="w-24 h-24 rounded-full mx-auto mb-3 relative overflow-hidden">
                      <Image
                        src={m.image}
                        alt={m.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                        unoptimized={shouldSkipNextImageOptimization(m.image)}
                      />
                    </GenericEditableImage>
                  ) : (
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-white"
                      style={{ backgroundColor: "var(--color-primary, #6366f1)" }}
                    >
                      {m.name.charAt(0)}
                    </div>
                  )}
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "var(--color-text, #111827)", fontFamily: "var(--font-heading)" }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`members.${i}.name`} value={m.name} tag="span" />
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted, #6b7280)" }}>
                    <GenericEditableText sectionId={sectionId} field={`members.${i}.role`} value={m.role} tag="span" />
                  </p>
                  {m.bio && (
                    <p className="text-xs mt-2 max-w-xs mx-auto" style={{ color: "var(--color-text-muted)" }}>
                      <GenericEditableText sectionId={sectionId} field={`members.${i}.bio`} value={m.bio} tag="span" />
                    </p>
                  )}
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

// ── fyzio-01-team-grid ────────────────────────────────────────────────────────
// Bílé bg, navy kicker + Montserrat H2 centrovaně
// 5-col portrait grid: kulatý foto + jméno navy + role teal
// Inspirováno fyziovsem.cz tým stránka
// ─────────────────────────────────────────────────────────────────────────────
function TeamFyzio01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Member = { name?: string; role?: string; image?: string; href?: string };
  const tagline = String(content.tagline ?? "Náš tým");
  const title   = String(content.title   ?? "Poznejte náš tým");
  const body    = String(content.body    ?? "");
  const members = (content.members as Member[]) ?? [];

  const NAVY  = "#1f2d69";
  const TEAL  = "#6bbea1";
  const MUTED = "#666666";
  const MONT  = "'Montserrat', sans-serif";
  const SANS  = "'Open Sans', sans-serif";

  return (
    <section id="tym" data-template="fyzio-01" style={{ backgroundColor: "#ffffff", padding: "80px 24px", fontFamily: SANS }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontFamily: MONT, fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: TEAL, marginBottom: 12 }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          <h2 style={{ fontFamily: MONT, fontSize: "clamp(22px,3vw,36px)", fontWeight: 700, color: NAVY, marginBottom: body ? 14 : 0 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {body && (
            <p style={{ fontSize: 15, color: MUTED, maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
        </div>

        {/* 5-col team grid */}
        <div className="fyzio01-team-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 32 }}>
          {members.map((m, i) => (
            <div key={i} className="fyzio01-team-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              {/* Kulatá fotka */}
              <GenericEditableImage sectionId={sectionId} field={`members.${i}.image`} src={m.image ?? ""} alt={m.name ?? ""} className="relative overflow-hidden fyzio01-team-photo" style={{ width: 150, height: 150, borderRadius: "50%", flexShrink: 0 }}>
                {m.image ? (
                  <img src={m.image} alt={m.name ?? ""} loading="lazy" style={{ width: 150, height: 150, objectFit: "cover", borderRadius: "50%", display: "block" }} />
                ) : (
                  <div style={{ width: 150, height: 150, borderRadius: "50%", backgroundColor: "#dde6f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="1.5" opacity="0.4"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  </div>
                )}
              </GenericEditableImage>
              <div style={{ marginTop: 16 }}>
                <p style={{ fontFamily: MONT, fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 4 }}>
                  <GenericEditableText sectionId={sectionId} field={`members.${i}.name`} value={m.name ?? ""} tag="span" />
                </p>
                <p style={{ fontFamily: SANS, fontSize: 13, color: TEAL, fontWeight: 500 }}>
                  <GenericEditableText sectionId={sectionId} field={`members.${i}.role`} value={m.role ?? ""} tag="span" />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 1000px) { .fyzio01-team-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 640px)  { .fyzio01-team-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </section>
  );
}

// ── fyzio-02-team-grid ────────────────────────────────────────────────────────
// Světlé #f1f6f6 bg, 3-col photo-forward karty: portrét s navy gradientem, role
// + jméno vždy vidět, bio se odkryje zdola na hover + teal accent line. Movia.
// ─────────────────────────────────────────────────────────────────────────────
function TeamFyzio02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Member = { name?: string; role?: string; bio?: string; image?: string };
  const id      = String(content.id ?? "tym");
  const members = (content.members as Member[]) ?? [];

  // conditional header (skryje se na /tym subpage)
  const eyebrowRaw = (content as Record<string, unknown>).tagline;
  const titleRaw   = (content as Record<string, unknown>).title;
  const bodyRaw    = (content as Record<string, unknown>).body;
  const tagline = eyebrowRaw === undefined ? "Náš tým" : String(eyebrowRaw);
  const title   = titleRaw   === undefined ? "Terapeuti, kteří vás vrátí do pohybu" : String(titleRaw);
  const body    = bodyRaw    === undefined ? "Každý člen týmu se neustále vzdělává, abyste vy měli přístup k nejmodernějším metodám fyzioterapie i funkční neurologie." : String(bodyRaw);
  const showHeader = !!(tagline.trim() || title.trim() || body.trim());

  const secRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add("fz2-vis"); obs.unobserve(e.target); } });
    }, { threshold: 0.14 });
    el.querySelectorAll<HTMLElement>("[data-fz2tm]").forEach(i => obs.observe(i));
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={secRef} id={id} data-template="fyzio-02" className="fz2-tm">
      <div className="fz2-tm-inner">
        {showHeader && (
          <div className="fz2-tm-head fz2-reveal" data-fz2tm>
            {tagline.trim() && (
              <span className="fz2-pill">
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </span>
            )}
            {title.trim() && (
              <h2 className="fz2-tm-title">
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {body.trim() && (
              <p className="fz2-tm-lead">
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}
          </div>
        )}

        <div className="fz2-tm-grid">
          {members.map((m, i) => (
            <article key={i} className="fz2-tm-card fz2-reveal" data-fz2tm style={{ transitionDelay: `${i * 90}ms` }}>
              <div className="fz2-tm-photo">
                <GenericEditableImage sectionId={sectionId} field={`members.${i}.image`} src={m.image ?? ""} alt={m.name ?? ""} className="relative overflow-hidden" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                  {m.image ? (
                    <img src={m.image} alt={m.name ?? ""} loading="lazy" className="fz2-tm-img" />
                  ) : (
                    <div className="fz2-tm-img-ph">
                      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                  )}
                </GenericEditableImage>
                <div className="fz2-tm-veil" aria-hidden="true" />
                <div className="fz2-tm-info">
                  <span className="fz2-tm-accent" aria-hidden="true" />
                  <p className="fz2-tm-role">
                    <GenericEditableText sectionId={sectionId} field={`members.${i}.role`} value={m.role ?? ""} tag="span" />
                  </p>
                  <h3 className="fz2-tm-name">
                    <GenericEditableText sectionId={sectionId} field={`members.${i}.name`} value={m.name ?? ""} tag="span" />
                  </h3>
                  <p className="fz2-tm-bio">
                    <GenericEditableText sectionId={sectionId} field={`members.${i}.bio`} value={m.bio ?? ""} tag="span" />
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── catering-01-team ──────────────────────────────────────────────────────────
// Sand bg, uniform 4-col portrait grid, text below photo, elegant & compact
// ─────────────────────────────────────────────────────────────────────────────
// ── catering-01-team ─────────────────────────────────────────────────────────
// Nordic Minimal Gastro:
// - Forest green bg, cream text, 4-col grid
// - Circular photos with stone border ring, hover: scale + terracotta ring
// - Fraunces heading, Inter names/roles
// ─────────────────────────────────────────────────────────────────────────────
function TeamCatering01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GREEN  = "#2d4a3e";
  const TERRA  = "#c4755b";
  const WARM   = "#f8f5f0";
  const STONE  = "#e8e2d8";
  const SERIF  = "'Fraunces', Georgia, serif";
  const SANS   = "'Inter', system-ui, sans-serif";

  interface Member { name: string; role: string; image?: string }
  const headingRaw = content.heading;
  const heading = headingRaw === undefined ? "lidé za\nSaveur & Co." : String(headingRaw);
  const members = (content.members as Member[]) ?? [];
  const showHeader = !!heading.trim();

  return (
    <section
      id="tym"
      data-template="catering-01"
      data-variant="catering-01-team"
      style={{ background: GREEN, padding: "6rem 0 7rem", overflow: "hidden" }}
    >
      <style>{`
        .ct1tm-wrap{max-width:1200px;margin:0 auto;padding:0 1.5rem}
        .ct1tm-head{text-align:center;margin-bottom:4rem}
        .ct1tm-kicker{font-family:${SANS};font-size:.65rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:${TERRA};margin-bottom:1rem}
        .ct1tm-h{font-family:${SERIF};font-weight:300;font-style:italic;font-size:clamp(2rem,4vw,3.2rem);color:${WARM};margin:0;line-height:1.15;letter-spacing:-.01em}
        .ct1tm-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:2.5rem 1.5rem}
        .ct1tm-card{text-align:center}
        .ct1tm-ring{width:120px;height:120px;border-radius:50%;border:2px solid rgba(232,226,216,.25);margin:0 auto 1.2rem;overflow:hidden;transition:border-color .3s,transform .3s}
        .ct1tm-card:hover .ct1tm-ring{border-color:${TERRA};transform:scale(1.06)}
        .ct1tm-ring img{width:100%;height:100%;object-fit:cover;object-position:center top;display:block;filter:saturate(.85);transition:filter .4s}
        .ct1tm-card:hover .ct1tm-ring img{filter:saturate(1)}
        .ct1tm-name{font-family:${SERIF};font-weight:400;font-size:.95rem;color:${WARM};margin:0 0 .3rem}
        .ct1tm-role{font-family:${SANS};font-size:.7rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:${TERRA};margin:0;opacity:.8}
        @media(min-width:640px){
          .ct1tm-grid{grid-template-columns:repeat(3,1fr);gap:3rem 2rem}
          .ct1tm-ring{width:140px;height:140px}
        }
        @media(min-width:1024px){
          .ct1tm-grid{grid-template-columns:repeat(4,1fr);gap:3rem 2.5rem}
          .ct1tm-ring{width:160px;height:160px}
          .ct1tm-name{font-size:1.05rem}
        }
      `}</style>

      <div className="ct1tm-wrap">
        {showHeader && (
          <div className="ct1tm-head">
            <div className="ct1tm-kicker">náš tým</div>
            <h2 className="ct1tm-h">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span">
                {heading.split("\n").map((line, i) => (
                  <span key={i} style={{ display: "block" }}>{line}</span>
                ))}
              </GenericEditableText>
            </h2>
          </div>
        )}

        <div className="ct1tm-grid">
          {members.map((m, i) => (
            <div key={i} className="ct1tm-card">
              <div className="ct1tm-ring">
                <GenericEditableImage sectionId={sectionId} field={`members.${i}.image`} src={(m.image ?? "").replace("w=300&h=300", "w=400&h=600")} alt={m.name}>
                  <img
                    src={(m.image ?? "").replace("w=300&h=300", "w=400&h=600")}
                    alt={m.name}
                    loading={i < 4 ? "eager" : "lazy"}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
                  />
                </GenericEditableImage>
              </div>
              <p className="ct1tm-name">
                <GenericEditableText sectionId={sectionId} field={`members.${i}.name`} value={m.name} tag="span" />
              </p>
              <p className="ct1tm-role">
                <GenericEditableText sectionId={sectionId} field={`members.${i}.role`} value={m.role} tag="span" />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── autoskola-01 Team — 4-col portréty lektorů ───────────────────────────────
function TeamAutoskola01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const heading    = String(content.heading    ?? "Náš tým lektorů");
  const subheading = String(content.subheading ?? "Zkušení instruktoři, kteří vás bezpečně provedou výcvikem");
  const items      = ((content.items as Record<string, unknown>[]) ?? []);

  const ORANGE = "#f16823";
  const DARK   = "#484848";
  const FONT   = "'Roboto', sans-serif";

  return (
    <section id={String(sectionId)} style={{ backgroundColor: "#f7f7f7", padding: "80px clamp(24px, 6vw, 80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: ORANGE, margin: "0 0 10px" }}>
            <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
          </p>
          <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)", color: DARK, margin: "0 0 20px" }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <div style={{ width: 48, height: 3, backgroundColor: ORANGE, borderRadius: 2, margin: "0 auto" }} />
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
          {items.map((item, i) => {
            const name     = String(item.name     ?? "");
            const role     = String(item.role     ?? "");
            const bio      = String(item.bio      ?? "");
            const imageUrl = String(item.imageUrl ?? "");

            return (
              <div key={i} style={{ backgroundColor: "#fff", borderRadius: 4, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column" }}>
                {/* Foto */}
                <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden", backgroundColor: "#eee" }}>
                  <GenericEditableImage sectionId={sectionId} field={`items.${i}.imageUrl`} src={imageUrl} alt={name} style={{ position: "absolute", inset: 0, display: "block" }}>
                    <img src={imageUrl} alt={name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                  </GenericEditableImage>
                  {/* Oranžový akcent spodek */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, backgroundColor: ORANGE }} />
                </div>

                {/* Info */}
                <div style={{ padding: "20px 20px 24px", display: "flex", flexDirection: "column", gap: 6 }}>
                  <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.05rem", color: DARK, margin: 0 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={name} tag="span" />
                  </h3>
                  <p style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: ORANGE, margin: 0 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.role`} value={role} tag="span" />
                  </p>
                  {bio && (
                    <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: "0.85rem", color: "#777", margin: "6px 0 0", lineHeight: 1.65 }}>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.bio`} value={bio} tag="span" />
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          [id="${sectionId}"] > div > div:last-child { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/* ─── kids-01-team ─────────────────────────────────────────────────────── */
function TeamKids01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const heading   = String((content as any).heading   ?? "S kým se potkáš?");
  const subheading= String((content as any).subheading?? "Naši průvodci jsou profesionálové a umí to s dětmi. Fakt!");
  const ctaText   = String((content as any).ctaText   ?? "Poznej náš tým");
  const ctaHref   = String((content as any).ctaHref   ?? "/nas-tym");
  const members   = ((content as any).members as Array<{ name: string; role?: string; bio?: string; imageUrl?: string }>) ?? [];

  const sRef = useRef<HTMLElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = sRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const GREEN  = "#2d7a4d";
  const LGREEN = "#baeb92";
  const WHITE  = "#ffffff";
  const FONT   = "'Gotham Rounded', 'Nunito', 'Trebuchet MS', sans-serif";

  return (
    <section
      ref={sRef}
      id={`section-${sectionId}`}
      style={{ background: GREEN, padding: "80px 24px 96px", fontFamily: FONT }}
    >
      <style>{`
        .k01team-heading {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .k01team-heading.vis {
          opacity: 1;
          transform: translateY(0);
        }
        .k01team-card {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.55s ease, transform 0.55s ease;
          cursor: default;
        }
        .k01team-card.vis {
          opacity: 1;
          transform: translateY(0);
        }
        .k01team-card:hover {
          transform: translateY(-6px) !important;
        }
        .k01team-img-wrap {
          overflow: hidden;
          border-radius: 50%;
          width: 240px;
          height: 240px;
          margin: 0 auto 20px;
          border: 4px solid rgba(255,255,255,0.25);
          transition: border-color 0.25s ease;
        }
        .k01team-card:hover .k01team-img-wrap {
          border-color: ${LGREEN};
          box-shadow: 0 6px 24px rgba(0,0,0,0.3);
        }
        .k01team-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease, brightness 0.3s ease;
        }
        .k01team-card:hover .k01team-img-wrap img {
          transform: scale(1.07);
          filter: brightness(1.08);
        }
        .k01team-name {
          color: ${WHITE};
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0 0 4px;
          transition: color 0.22s ease;
        }
        .k01team-card:hover .k01team-name {
          color: ${LGREEN};
        }
        .k01team-role {
          color: ${LGREEN};
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin: 0 0 10px;
        }
        .k01team-bio {
          color: rgba(255,255,255,0.82);
          font-size: 0.9rem;
          line-height: 1.65;
          margin: 0;
        }
        .k01team-cta {
          display: inline-block;
          margin-top: 52px;
          background: #ffc107;
          color: #1a1a1a;
          font-family: ${FONT};
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 14px 36px;
          border-radius: 4px;
          text-decoration: none;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .k01team-cta:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 18px rgba(255,193,7,0.45);
        }
        @media (max-width: 768px) {
          .k01team-grid { grid-template-columns: 1fr !important; }
          .k01team-img-wrap { width: min(240px, 72vw) !important; height: min(240px, 72vw) !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        {/* Heading */}
        <div className={`k01team-heading${vis ? " vis" : ""}`}>
          <h2 style={{ color: WHITE, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 800, margin: "0 0 12px" }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <p style={{ color: LGREEN, fontSize: "1.05rem", margin: "0 0 52px", fontWeight: 500 }}>
            <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
          </p>
        </div>

        {/* Members grid */}
        <div
          className="k01team-grid"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(members.length || 3, 3)}, 1fr)`,
            gap: "40px 32px",
          }}
        >
          {members.map((m, i) => (
            <div
              key={i}
              className={`k01team-card${vis ? " vis" : ""}`}
              style={{ transitionDelay: vis ? `${i * 130}ms` : "0ms" }}
            >
              <div className="k01team-img-wrap">
                <GenericEditableImage sectionId={sectionId} field={`members.${i}.imageUrl`} src={m.imageUrl ?? ""} alt={m.name} style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
                  {m.imageUrl ? (
                    <img src={m.imageUrl} alt={m.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "rgba(255,255,255,0.15)" }} />
                  )}
                </GenericEditableImage>
              </div>
              <p className="k01team-name">
                <GenericEditableText sectionId={sectionId} field={`members.${i}.name`} value={m.name} tag="span" />
              </p>
              {m.role && (
                <p className="k01team-role">
                  <GenericEditableText sectionId={sectionId} field={`members.${i}.role`} value={m.role} tag="span" />
                </p>
              )}
              {m.bio && (
                <p className="k01team-bio">
                  <GenericEditableText sectionId={sectionId} field={`members.${i}.bio`} value={m.bio} tag="span" />
                </p>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        {ctaText && (
          <div className={`k01team-heading${vis ? " vis" : ""}`} style={{ transitionDelay: vis ? "400ms" : "0ms" }}>
            <a href={ctaHref} data-btn="primary" className="k01team-cta">
              {ctaText}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

// ── vet-01-team ───────────────────────────────────────────────────────────────
// Bílé bg, teal kicker + Forum H2, 3-col portrait 4/5 aspect-ratio
// Jméno teal Forum, role italic, bio Roboto Condensed
// ─────────────────────────────────────────────────────────────────────────────
function TeamVet01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const kickerRaw  = content.kicker;
  const headingRaw = content.heading;
  const kicker  = kickerRaw  === undefined ? "Náš tým" : String(kickerRaw);
  const heading = headingRaw === undefined ? "Kdo se postará o vašeho mazlíčka" : String(headingRaw);
  const showHeader = !!(kicker.trim() || heading.trim());
  const members = (content.members as Array<{ name?: string; role?: string; bio?: string; imageUrl?: string }>) ?? [];

  const TEAL   = "#0d7486";
  const PRIMARY= "#286C7E";
  const TEAL_L = "#42aaba";
  const DARK   = "#1a2c33";
  const FONT_H = "'Forum', 'Georgia', serif";
  const FONT_B = "'Roboto Condensed', 'Roboto', sans-serif";

  return (
    <section
      id="tym"
      data-template="vet-01-team"
      style={{ background: "linear-gradient(180deg,#fff,#f4fafb)", padding: "clamp(64px,8vw,104px) clamp(20px,5vw,40px)" }}
    >
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Forum&family=Roboto+Condensed:wght@400;500;700&display=swap" />
      <style>{`
        .v01tm-inner  { max-width: 1140px; margin: 0 auto; }
        .v01tm-header { text-align: center; margin-bottom: 56px; }
        .v01tm-kicker { display:inline-flex; align-items:center; gap:9px; font-family: ${FONT_B}; font-size: 13px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${TEAL}; margin: 0 0 14px; }
        .v01tm-kicker svg { color:${TEAL_L}; }
        .v01tm-heading{ font-family: ${FONT_H}; font-weight: 400; font-size: clamp(2rem,3.4vw,2.9rem); color: ${DARK}; margin: 0 0 16px; line-height:1.12; }
        .v01tm-rule { width:60px; height:3px; background:linear-gradient(90deg,${TEAL},${TEAL_L}); border-radius:2px; margin:0 auto; }
        .v01tm-grid   { display: grid; grid-template-columns: repeat(3, 1fr); gap: 34px 30px; }
        .v01tm-card   { display: flex; flex-direction: column; }
        .v01tm-img-wrap { position:relative; width: 100%; overflow: hidden; border-radius: 18px; margin-bottom: 22px; line-height: 0; box-shadow:0 12px 34px rgba(13,116,134,0.14); }
        .v01tm-img-wrap::after { content:''; position:absolute; inset:0; background:linear-gradient(180deg,transparent 45%,rgba(6,40,47,0.55)); opacity:0; transition:opacity 0.4s ease; }
        .v01tm-card:hover .v01tm-img-wrap::after { opacity:1; }
        .v01tm-img-wrap img { display: block; width: 100%; aspect-ratio: 4/5; object-fit: cover; object-position: top; transition:transform 0.8s cubic-bezier(.2,.7,.3,1); }
        .v01tm-card:hover .v01tm-img-wrap img { transform:scale(1.06); }
        .v01tm-chip { position:absolute; z-index:2; left:14px; bottom:14px; display:inline-flex; align-items:center; gap:7px; background:rgba(255,255,255,0.92); backdrop-filter:blur(4px); color:${TEAL}; font-family:${FONT_B}; font-size:12px; font-weight:600; letter-spacing:0.02em; padding:7px 13px; border-radius:50px; opacity:0; transform:translateY(10px); transition:opacity 0.4s ease, transform 0.4s cubic-bezier(.34,1.4,.64,1); }
        .v01tm-card:hover .v01tm-chip { opacity:1; transform:translateY(0); }
        .v01tm-name   { font-family: ${FONT_H}; font-size: 1.35rem; font-weight: 400; color: ${TEAL}; margin: 0 0 5px; }
        .v01tm-role   { display:inline-block; font-family: ${FONT_B}; font-size: 12.5px; font-weight:600; letter-spacing:0.03em; color: ${PRIMARY}; background:#e6f3f5; padding:4px 12px; border-radius:50px; margin: 0 0 13px; }
        .v01tm-bio    { font-family: ${FONT_B}; font-size: 14.5px; color: #4a6670; line-height: 1.62; margin: 0; }
        @media (max-width: 820px) { .v01tm-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .v01tm-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="v01tm-inner">
        {showHeader && (
          <div className="v01tm-header">
            <p className="v01tm-kicker">
              <svg width="15" height="15" viewBox="0 0 60 60" fill="currentColor" aria-hidden="true"><circle cx="18" cy="14" r="6"/><circle cx="30" cy="9" r="6"/><circle cx="42" cy="14" r="6"/><ellipse cx="30" cy="34" rx="13" ry="11"/><circle cx="23" cy="45" r="5"/><circle cx="37" cy="45" r="5"/></svg>
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            </p>
            <h2 className="v01tm-heading">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            <div className="v01tm-rule" />
          </div>
        )}

        <div className="v01tm-grid">
          {members.map((m, i) => (
            <div key={i} className="v01tm-card">
              <div className="v01tm-img-wrap">
                <GenericEditableImage sectionId={sectionId} field={`members.${i}.imageUrl`} src={m.imageUrl ?? ""} alt={m.name ?? ""} style={{ display: "block", width: "100%" }}>
                  {m.imageUrl
                    ? <img src={m.imageUrl} alt={m.name ?? ""} loading="lazy" style={{ display: "block", width: "100%", aspectRatio: "4/5", objectFit: "cover", objectPosition: "top" }} />
                    : <div style={{ width: "100%", aspectRatio: "4/5", background: "#DCE9EE" }} />
                  }
                </GenericEditableImage>
              </div>
              <p className="v01tm-name">
                <GenericEditableText sectionId={sectionId} field={`members.${i}.name`} value={m.name ?? ""} tag="span" />
              </p>
              {m.role && (
                <p className="v01tm-role">
                  <GenericEditableText sectionId={sectionId} field={`members.${i}.role`} value={m.role} tag="span" />
                </p>
              )}
              {m.bio && (
                <p className="v01tm-bio">
                  <GenericEditableText sectionId={sectionId} field={`members.${i}.bio`} value={m.bio} tag="span" />
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── arch-01-team ──────────────────────────────────────────────────────────────
function TeamArch01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Member = { name?: string; role?: string; bio?: string; imageUrl?: string };
  const members = (content.members as Member[]) ?? [];
  const heading = String(content.heading ?? "Architekti");
  const tagline = String(content.tagline ?? "");
  const ctaText = String(content.ctaText ?? "Poznat architekty");
  const ctaHref = String(content.ctaHref ?? "/architekti");

  const FONT  = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const BLACK = "#000000";

  const styles = `
    .a01team {
      background: #fff;
      padding: 80px 0 80px;
      color: ${BLACK};
    }
    .a01team-inner {
      padding: 0 3.5rem;
    }
    .a01team-header {
      margin-bottom: 48px;
    }
    .a01team-heading {
      font-family: ${FONT};
      font-size: clamp(24px, 2.5vw, 34px);
      font-weight: 300;
      letter-spacing: 0.04em;
      color: ${BLACK};
      margin: 0 0 20px;
      display: flex;
      align-items: center;
      gap: 18px;
    }
    .a01team-tagline {
      font-family: ${FONT};
      font-size: clamp(14px, 1.3vw, 16px);
      font-weight: 300;
      color: rgba(0,0,0,0.55);
      line-height: 1.7;
      margin: 0;
      max-width: 680px;
    }
    .a01team-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 40px 32px;
    }
    .a01team-card {
      display: block;
    }
    .a01team-img-wrap {
      overflow: hidden;
      aspect-ratio: 3/4;
      background: #f0f0f0;
      margin-bottom: 20px;
    }
    .a01team-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
      display: block;
      transition: transform 0.4s ease-in-out;
    }
    .a01team-card:hover .a01team-img { transform: scale(1.04); }
    .a01team-name {
      font-family: ${FONT};
      font-size: 18px;
      font-weight: 300;
      color: ${BLACK};
      margin: 0 0 6px;
      line-height: 1.3;
    }
    .a01team-role {
      font-family: ${FONT};
      font-size: 11px;
      font-weight: 400;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(0,0,0,0.45);
      margin: 0 0 14px;
    }
    .a01team-bio {
      font-family: ${FONT};
      font-size: 14px;
      font-weight: 300;
      color: rgba(0,0,0,0.65);
      line-height: 1.65;
      margin: 0;
    }
    .a01team-cta-wrap {
      text-align: center;
      padding-top: 56px;
    }
    .a01team-cta {
      display: inline-block;
      padding: 11px 36px;
      border: 1px solid rgba(0,0,0,0.45);
      color: ${BLACK};
      font-family: ${FONT};
      font-size: 12px;
      font-weight: 400;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      text-decoration: none;
      transition: background 0.2s, border-color 0.2s;
    }
    .a01team-cta:hover { background: rgba(0,0,0,0.06); border-color: ${BLACK}; }
    @media (max-width: 900px) {
      .a01team-grid { grid-template-columns: repeat(2, 1fr); }
      .a01team-inner { padding: 0 2rem; }
    }
    @media (max-width: 540px) {
      .a01team-grid { grid-template-columns: 1fr; }
      .a01team-inner { padding: 0 1rem; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <section className="a01team" data-template="arch-01-team">
        <div className="a01team-inner">
          <div className="a01team-header">
            <h2 className="a01team-heading">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 12" width={30} height={12} aria-hidden="true">
                <path fill={BLACK} d="M24,0l6,6l-6,6V7.5H0v-3h24V0z"/>
              </svg>
            </h2>
            {tagline && (
              <p className="a01team-tagline">
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </p>
            )}
          </div>
          <div className="a01team-grid">
            {members.map((m, i) => (
              <div key={i} className="a01team-card">
                <div className="a01team-img-wrap">
                  <GenericEditableImage
                    sectionId={sectionId}
                    field={`members.${i}.imageUrl`}
                    src={m.imageUrl ?? ""}
                    alt={m.name ?? `Člen týmu ${i + 1}`}
                    style={{ width: "100%", height: "100%", display: "block" }}
                  >
                    <img src={m.imageUrl} alt={m.name ?? `Člen týmu ${i + 1}`} loading="lazy" className="a01team-img" />
                  </GenericEditableImage>
                </div>
                <p className="a01team-name">
                  <GenericEditableText sectionId={sectionId} field={`members.${i}.name`} value={m.name ?? ""} tag="span" />
                </p>
                <p className="a01team-role">
                  <GenericEditableText sectionId={sectionId} field={`members.${i}.role`} value={m.role ?? ""} tag="span" />
                </p>
                {m.bio && (
                  <p className="a01team-bio">
                    <GenericEditableText sectionId={sectionId} field={`members.${i}.bio`} value={m.bio} tag="span" />
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="a01team-cta-wrap">
            <a href={ctaHref} data-btn="primary" className="a01team-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

// ── legal-02-team ── advokátní kancelář: grid právníků, navy + orange ────────────
function TeamLegal02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY = "#143171";
  const ORANGE = "#EB5C2E";
  const FONT_B = "'bw_gradualbold', 'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const FONT_R = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  type Member = { name?: string; role?: string; specialization?: string; email?: string; image?: string; imageUrl?: string };
  const members = (content.members as Member[]) ?? [];

  const eyebrowRaw  = content.eyebrow;
  const titleRaw    = content.title;
  const subtitleRaw = content.subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Partneři a právníci" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Lidé, kteří stojí za vašimi výsledky" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "" : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());

  return (
    <section id="tym" data-template="legal-02" style={{ backgroundColor: "#fff", padding: "clamp(72px,9vw,110px) 0" }}>
      <style>{`
        @font-face { font-family:'bw_gradualbold'; src:url('/templates/legal-02/bwgradual-bold-webfont.woff2') format('woff2'); font-display:swap; }
        .l02t-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:32px; }
        .l02t-photo > div, .l02t-photo > span { position:absolute !important; inset:0; width:100% !important; height:100% !important; }
        .l02t-photo img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        @media (max-width:900px){ .l02t-grid { grid-template-columns:repeat(2,1fr); } .l02t-outer { padding-left:24px !important; padding-right:24px !important; } }
        @media (max-width:560px){ .l02t-grid { grid-template-columns:1fr; } }
      `}</style>

      <div className="l02t-outer" style={{ maxWidth: 1440, margin: "0 auto", padding: "0 80px" }}>
        {showHeader && (
          <div style={{ maxWidth: 760, marginBottom: 56 }}>
            {eyebrow.trim() && (
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                <span style={{ width: 40, height: 2, background: ORANGE, display: "block" }} />
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="p"
                  style={{ fontFamily: FONT_B, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", color: ORANGE, margin: 0 }} />
              </div>
            )}
            {title.trim() && (
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2"
                style={{ fontFamily: FONT_B, fontSize: "clamp(30px,3.6vw,46px)", lineHeight: 1.1, color: NAVY, margin: 0, letterSpacing: "-0.01em" }} />
            )}
            {subtitle.trim() && (
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p"
                style={{ fontFamily: FONT_R, fontSize: 18, lineHeight: 1.6, color: "#4b5563", margin: "18px 0 0" }} />
            )}
          </div>
        )}

        <div className="l02t-grid">
          {members.map((m, i) => {
            const img = m.image ?? m.imageUrl ?? "";
            return (
              <div key={i} className="l02t-card">
                <div className="l02t-photo" style={{ position: "relative", width: "100%", paddingBottom: "118%", overflow: "hidden", background: "#ECEFF4" }}>
                  {img && (
                    <GenericEditableImage sectionId={sectionId} field={`members.${i}.image`} src={img} alt={m.name ?? "Právník"} className="l02t-img" style={{ position: "absolute", inset: 0 }}>
                      <Image src={img} alt={m.name ?? "Právník"} fill style={{ objectFit: "cover" }} unoptimized={shouldSkipNextImageOptimization(img)} sizes="(max-width:900px) 50vw, 33vw" />
                    </GenericEditableImage>
                  )}
                  <span className="l02t-bar" aria-hidden="true" />
                </div>
                <div style={{ paddingTop: 22 }}>
                  <GenericEditableText sectionId={sectionId} field={`members.${i}.role`} value={m.role ?? ""} tag="p"
                    style={{ fontFamily: FONT_B, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: ORANGE, margin: "0 0 7px" }} />
                  <GenericEditableText sectionId={sectionId} field={`members.${i}.name`} value={m.name ?? ""} tag="h3"
                    style={{ fontFamily: FONT_B, fontSize: 22, lineHeight: 1.2, color: NAVY, margin: "0 0 8px" }} />
                  {m.specialization !== undefined && (
                    <GenericEditableText sectionId={sectionId} field={`members.${i}.specialization`} value={m.specialization ?? ""} tag="p"
                      style={{ fontFamily: FONT_R, fontSize: 15, lineHeight: 1.55, color: "#6b7280", margin: "0 0 10px" }} />
                  )}
                  {m.email && (
                    <a href={`mailto:${m.email}`} className="l02t-mail" style={{ fontFamily: FONT_R, fontSize: 14, color: NAVY, textDecoration: "none" }}>
                      <GenericEditableText sectionId={sectionId} field={`members.${i}.email`} value={m.email} tag="span" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ══ SIGNAL — Swiss authority (signal-01) ══════════════════════════════════════
// Tým: portrétní karty 4/5, jméno Oswald, mono role, krátké bio. Ledové pozadí.
function TeamSignal01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrow = String(content.eyebrow ?? "Tým");
  const title   = String(content.title   ?? "Senioři, kteří už firmy vedli");
  const lead    = String(content.lead    ?? "Žádní junioři na fakturaci. Na projektu pracují lidé, kteří mají výsledky za sebou.");
  type SgMember = { name?: string; role?: string; bio?: string; image?: string };
  const members = (content.members as SgMember[] | undefined) ?? [];
  return (
    <>
      <style>{`
        .sg01tm { --sg-accent:#2563EB; --sg-ink:#101418; --sg-muted:#5B6472; --sg-border:#E3E7EB;
          background:#F3F5F7; font-family:var(--font-body, system-ui, -apple-system, sans-serif); color:var(--sg-ink);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .sg01tm-inner { max-width:1180px; margin:0 auto; }
        .sg01tm-head { max-width:660px; margin-bottom:clamp(32px,5vw,52px); }
        .sg01tm .sg01-eyebrow { font-family:var(--font-mono, ui-monospace, monospace); font-size:.76rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--sg-accent); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .sg01tm .sg01-eyebrow::before { content:''; width:32px; height:2px; background:var(--sg-accent); }
        .sg01tm-title { font-family:var(--font-heading, system-ui, sans-serif); color:var(--sg-ink); font-size:clamp(1.9rem,3.8vw,2.9rem); font-weight:600; letter-spacing:.01em; line-height:1.08; margin:0 0 14px; }
        .sg01tm-lead { font-size:1.05rem; color:var(--sg-muted); line-height:1.6; margin:0; }
        .sg01tm-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:18px; }
        .sg01tm-card { background:#fff; border:1px solid var(--sg-border); border-radius:10px; overflow:hidden; transition:transform .25s cubic-bezier(.22,.68,0,1), box-shadow .25s; }
        .sg01tm-card:hover { transform:translateY(-4px); box-shadow:0 12px 28px -18px rgba(16,20,24,.25); }
        .sg01tm-photo { position:relative; aspect-ratio:4/5; overflow:hidden; background:#E4E8ED; }
        .sg01tm-photoslot { position:absolute; inset:0; width:100%; height:100%; display:block; }
        .sg01tm-photo img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block; transition:transform .5s cubic-bezier(.22,.68,0,1); }
        .sg01tm-card:hover .sg01tm-photo img { transform:scale(1.04); }
        .sg01tm-body { padding:20px 22px 22px; }
        .sg01tm-name { font-family:var(--font-heading, system-ui, sans-serif); color:var(--sg-ink); font-size:1.12rem; font-weight:600; letter-spacing:.01em; margin:0 0 4px; }
        .sg01tm-role { font-family:var(--font-mono, ui-monospace, monospace); font-size:.72rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--sg-accent); margin:0 0 10px; }
        .sg01tm-bio { font-size:.9rem; color:var(--sg-muted); line-height:1.55; margin:0; }
        @media (prefers-reduced-motion: reduce){ .sg01tm-card,.sg01tm-photo img{ transition:none; } }
      `}</style>
      <section className="sg01tm" data-template="signal-01" id="tym">
        <div className="sg01tm-inner">
          <div className="sg01tm-head">
            <p className="sg01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="sg01tm-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p className="sg01tm-lead"><GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" /></p>
          </div>
          <div className="sg01tm-grid">
            {members.map((m, i) => (
              <div key={i} className="sg01tm-card">
                <div className="sg01tm-photo">
                  <GenericEditableImage sectionId={sectionId} field={`members.${i}.image`} src={String(m.image ?? "")} alt={String(m.name ?? "")} className="sg01tm-photoslot">
                    {m.image && <img src={String(m.image)} alt={String(m.name ?? "")} loading="lazy" />}
                  </GenericEditableImage>
                </div>
                <div className="sg01tm-body">
                  <h3 className="sg01tm-name"><GenericEditableText sectionId={sectionId} field={`members.${i}.name`} value={String(m.name ?? "")} tag="span" /></h3>
                  <p className="sg01tm-role"><GenericEditableText sectionId={sectionId} field={`members.${i}.role`} value={String(m.role ?? "")} tag="span" /></p>
                  <p className="sg01tm-bio"><GenericEditableText sectionId={sectionId} field={`members.${i}.bio`} value={String(m.bio ?? "")} tag="span" /></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
