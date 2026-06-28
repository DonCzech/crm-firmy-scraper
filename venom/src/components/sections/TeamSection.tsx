import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import { GenericEditableImage } from "@/components/tenant/GenericEditableImage";
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

  // beauty-01: 6-member grid, portrait foto 380×464px, 3 per row
  // Reference: selfbeautystudio.com — white bg, 3-col × 2-row, portrait crop
  if (variant === "beauty-01-team-grid") {
    const WHITE  = "#ffffff";
    const CREAM  = "#FFF8F1";
    const DARK   = "#1F1F1F";
    const MUTED  = "#5B4D43";
    const FONT_H = "'Cormorant Garamond', 'Fahkwang', Georgia, serif";
    const FONT_B = "'Fahkwang', sans-serif";
    return (
      <section id="tym" style={{ backgroundColor: WHITE, padding: "80px 24px" }} data-template="beauty-01">
        {/* Header */}
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center", marginBottom: 52 }}>
          <p style={{ fontFamily: FONT_B, fontSize: 11, fontWeight: 300, letterSpacing: "0.22em", color: MUTED, textTransform: "uppercase", marginBottom: 10 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </p>
          {subtitle && (
            <h2 style={{ fontFamily: FONT_H, fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 400, color: DARK }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </h2>
          )}
        </div>

        {/* 3-col × 2-row grid — portrait 380×464 */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
          style={{ maxWidth: 1200, margin: "0 auto", gap: "40px 24px" }}
        >
          {members.map((m, i) => (
            <div key={`tm-${i}`}>
              {/* Portrait foto — 380:464 ratio */}
              {m.image && (
                <div style={{ width: "100%", aspectRatio: "380/464", position: "relative", overflow: "hidden", marginBottom: 16 }}>
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
                      className="object-cover object-top"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                      unoptimized={shouldSkipNextImageOptimization(m.image)}
                    />
                  </GenericEditableImage>
                </div>
              )}
              <h3 style={{ fontFamily: FONT_H, fontSize: 22, fontWeight: 400, color: DARK, marginBottom: 4, lineHeight: 1.2 }}>
                <GenericEditableText sectionId={sectionId} field={`members.${i}.name`} value={m.name} tag="span" />
              </h3>
              <p style={{ fontFamily: FONT_B, fontSize: 13, fontWeight: 300, color: MUTED, letterSpacing: "0.04em" }}>
                <GenericEditableText sectionId={sectionId} field={`members.${i}.role`} value={m.role} tag="span" />
              </p>
            </div>
          ))}
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
              <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderTop: `2px solid ${GOLD}`, padding: "36px 32px 32px", display: "flex", flexDirection: "column", gap: 0 }}>
                {/* Avatar */}
                <div style={{ marginBottom: 24 }}>
                  {m.image ? (
                    <GenericEditableImage sectionId={sectionId} field={`members.${i}.image`} src={m.image} alt={m.name} className="relative overflow-hidden" style={{ width: 72, height: 72, borderRadius: "50%" }}>
                      <Image src={m.image} alt={m.name} fill className="object-cover" sizes="72px" unoptimized={shouldSkipNextImageOptimization(m.image)} />
                    </GenericEditableImage>
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
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              {/* Kulatá fotka */}
              <GenericEditableImage sectionId={sectionId} field={`members.${i}.image`} src={m.image ?? ""} alt={m.name ?? ""} className="relative overflow-hidden" style={{ width: 150, height: 150, borderRadius: "50%", flexShrink: 0 }}>
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
// Surface #f5f3ee bg, 3-col grid, foto čtvercové s navy overlay při hoveru
// Zlatá role, DM Serif jméno, bio text
// ─────────────────────────────────────────────────────────────────────────────
function TeamFyzio02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Member = { name?: string; role?: string; bio?: string; image?: string };
  const tagline = String(content.tagline ?? "Kdo jsme?");
  const title   = String(content.title   ?? "Působící terapeuté");
  const body    = String(content.body    ?? "");
  const members = (content.members as Member[]) ?? [];
  const id      = String(content.id ?? "tym");

  const NAVY  = "#1a2e4a";
  const GOLD  = "#c9a84c";
  const SURF  = "#f5f3ee";
  const MUTED = "#6b7280";
  const WHITE = "#ffffff";
  const SERIF = "'DM Serif Display', serif";
  const SANS  = "'Plus Jakarta Sans', sans-serif";

  return (
    <section id={id} data-template="fyzio-02" style={{ backgroundColor: SURF, padding: "80px 24px", fontFamily: SANS }}>
      <style>{`
        .f02-team-card-img { transition: transform 0.4s ease; }
        .f02-team-card:hover .f02-team-card-img { transform: scale(1.05); }
        .f02-team-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
        @media(max-width: 800px) { .f02-team-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media(max-width: 500px) { .f02-team-grid { grid-template-columns: 1fr !important; } }
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
            <p style={{ fontFamily: SANS, fontSize: 16, color: MUTED, maxWidth: 560, margin: "0 auto", lineHeight: 1.75 }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
        </div>

        {/* Grid */}
        <div className="f02-team-grid">
          {members.map((m, i) => (
            <div key={i} className="f02-team-card" style={{ backgroundColor: WHITE, borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 16px rgba(26,46,74,0.07)" }}>
              {/* Foto */}
              <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden", backgroundColor: SURF }}>
                <GenericEditableImage sectionId={sectionId} field={`members.${i}.image`} src={m.image ?? ""} alt={m.name ?? ""} className="relative overflow-hidden" style={{ width: "100%", height: "100%" }}>
                  {m.image ? (
                    <img
                      src={m.image}
                      alt={m.name ?? ""}
                      loading="lazy"
                      className="f02-team-card-img"
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#e8e4dc" }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="1.5" opacity="0.3"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                  )}
                </GenericEditableImage>
                {/* Zlatá linka dole */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, backgroundColor: GOLD }} />
              </div>

              {/* Text */}
              <div style={{ padding: "20px 24px 24px" }}>
                <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                  <GenericEditableText sectionId={sectionId} field={`members.${i}.role`} value={m.role ?? ""} tag="span" />
                </p>
                <h3 style={{ fontFamily: SERIF, fontSize: "1.15rem", fontWeight: 400, color: NAVY, marginBottom: 10, lineHeight: 1.3 }}>
                  <GenericEditableText sectionId={sectionId} field={`members.${i}.name`} value={m.name ?? ""} tag="span" />
                </h3>
                {m.bio && (
                  <p style={{ fontFamily: SANS, fontSize: 13, color: MUTED, lineHeight: 1.7, margin: 0 }}>
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

// ── catering-01-team ──────────────────────────────────────────────────────────
// Sand bg, uniform 4-col portrait grid, text below photo, elegant & compact
// ─────────────────────────────────────────────────────────────────────────────
function TeamCatering01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const TEAL  = "#1c373a";
  const SURF  = "#eae6db";
  const GOLD  = "#baae8c";
  const CREAM = "#fefff1";
  const SERIF = "'Libre Baskerville', Georgia, serif";
  const SANS  = "'Source Sans 3', 'Source Sans Pro', sans-serif";

  interface Member { name: string; role: string; image?: string }
  const heading = String(content.heading ?? "poznejte\nDemo Catering");
  const members = (content.members as Member[]) ?? [];
  const headingLines = heading.split("\n");

  return (
    <section
      id="tym"
      data-template="catering-01"
      data-variant="catering-01-team"
      style={{ background: SURF, overflow: "hidden" }}
    >
      <style>{`
        .c01tm-outer{
          max-width:calc(100% - 3.2rem);margin:0 auto;
          padding:4.5rem 0 5rem;
        }
        .c01tm-top{
          display:flex;flex-direction:column;
          gap:.8rem;
          margin-bottom:3rem;
          padding-bottom:2rem;
          border-bottom:.06rem solid rgba(28,55,58,.15);
        }
        .c01tm-kicker{
          font-family:${SANS};font-size:.68rem;font-weight:700;
          letter-spacing:.55rem;text-transform:uppercase;
          color:${GOLD};margin:0;
        }
        .c01tm-h{
          font-family:${SERIF};font-style:italic;font-weight:300;
          font-size:clamp(2rem,4.5vw,4.4rem);line-height:1.08;
          text-transform:uppercase;color:${TEAL};margin:0;
        }
        .c01tm-h em{color:${GOLD};font-style:italic}

        /* grid */
        .c01tm-grid{
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:2rem 1.4rem;
        }
        .c01tm-card{}
        .c01tm-photo{
          aspect-ratio:3/4;
          overflow:hidden;
          margin-bottom:1rem;
          background:#c8c2b8;
        }
        .c01tm-photo img{
          width:100%;height:100%;object-fit:cover;
          object-position:center top;
          display:block;
          transition:transform .6s ease;
          filter:saturate(.9);
        }
        .c01tm-card:hover .c01tm-photo img{
          transform:scale(1.04);
          filter:saturate(1);
        }
        .c01tm-sep{
          width:2rem;height:.08rem;
          background:${GOLD};
          margin-bottom:.6rem;
          transition:width .3s ease;
        }
        .c01tm-card:hover .c01tm-sep{width:3.2rem}
        .c01tm-name{
          font-family:${SERIF};font-weight:700;font-style:normal;
          font-size:.82rem;color:${TEAL};
          margin:0 0 .25rem;letter-spacing:.01rem;
        }
        .c01tm-role{
          font-family:${SANS};font-size:.65rem;font-weight:400;
          letter-spacing:.12rem;text-transform:uppercase;
          color:${GOLD};margin:0;
        }

        @media(min-width:640px){
          .c01tm-grid{grid-template-columns:repeat(3,1fr);gap:2.4rem 1.8rem}
        }
        @media(min-width:1025px){
          .c01tm-outer{max-width:calc(100% - 6.4rem);padding:5.5rem 0 6rem}
          .c01tm-top{flex-direction:row;align-items:flex-end;justify-content:space-between;margin-bottom:3.5rem}
          .c01tm-grid{grid-template-columns:repeat(4,1fr);gap:2.8rem 2rem}
          .c01tm-photo{margin-bottom:1.1rem}
          .c01tm-name{font-size:.9rem}
          .c01tm-role{font-size:.68rem}
        }
        @media(min-width:1400px){
          .c01tm-outer{padding:6.5rem 0 7rem}
          .c01tm-grid{gap:3.2rem 2.4rem}
          .c01tm-name{font-size:1rem}
          .c01tm-role{font-size:.72rem}
        }
      `}</style>

      <div className="c01tm-outer">
        <div className="c01tm-top">
          <div>
            <p className="c01tm-kicker">náš tým</p>
            <h2 className="c01tm-h">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span">
                {headingLines.map((line, i) => (
                  <span key={i} style={{ display: "block" }}>
                    {i === headingLines.length - 1 ? <em>{line}</em> : line}
                  </span>
                ))}
              </GenericEditableText>
            </h2>
          </div>
        </div>

        <div className="c01tm-grid">
          {members.map((m, i) => (
            <div key={i} className="c01tm-card">
              <div className="c01tm-photo">
                <GenericEditableImage sectionId={sectionId} field={`members.${i}.image`} src={(m.image ?? "").replace("w=300&h=300", "w=400&h=600")} alt={m.name}>
                  <img
                    src={(m.image ?? "").replace("w=300&h=300", "w=400&h=600")}
                    alt={m.name}
                    loading={i < 4 ? "eager" : "lazy"}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
                  />
                </GenericEditableImage>
              </div>
              <div className="c01tm-sep" />
              <p className="c01tm-name">
                <GenericEditableText sectionId={sectionId} field={`members.${i}.name`} value={m.name} tag="span" />
              </p>
              <p className="c01tm-role">
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
  const kicker  = String(content.kicker  ?? "Náš tým");
  const heading = String(content.heading ?? "Veterináři a tým kliniky");
  const members = (content.members as Array<{ name?: string; role?: string; bio?: string; imageUrl?: string }>) ?? [];

  const TEAL   = "#286C7E";
  const TEAL_L = "#42aaba";
  const DARK   = "#1a2c33";
  const FONT_H = "'Forum', 'Georgia', serif";
  const FONT_B = "'Roboto Condensed', 'Roboto', sans-serif";

  return (
    <section
      id={String(sectionId)}
      data-variant="vet-01-team"
      style={{ background: "#fff", padding: "clamp(56px,7vw,96px) clamp(20px,5vw,40px)" }}
    >
      <style>{`
        .v01tm-inner  { max-width: 1140px; margin: 0 auto; }
        .v01tm-header { text-align: center; margin-bottom: 48px; }
        .v01tm-kicker { font-family: ${FONT_B}; font-size: 12px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${TEAL_L}; margin: 0 0 10px; }
        .v01tm-heading{ font-family: ${FONT_H}; font-weight: 400; font-size: clamp(1.8rem,3vw,2.5rem); color: ${DARK}; margin: 0; }
        .v01tm-grid   { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px 32px; }
        .v01tm-card   { display: flex; flex-direction: column; }
        .v01tm-img-wrap { width: 100%; overflow: hidden; border-radius: 4px; margin-bottom: 20px; line-height: 0; }
        .v01tm-img-wrap img { display: block; width: 100%; aspect-ratio: 4/5; object-fit: cover; object-position: top; }
        .v01tm-name   { font-family: ${FONT_H}; font-size: 1.25rem; font-weight: 400; color: ${TEAL}; margin: 0 0 4px; }
        .v01tm-role   { font-family: ${FONT_B}; font-size: 13px; font-style: italic; color: ${TEAL_L}; margin: 0 0 10px; }
        .v01tm-bio    { font-family: ${FONT_B}; font-size: 14px; color: #4a6670; line-height: 1.6; margin: 0; }
        @media (max-width: 820px) { .v01tm-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .v01tm-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="v01tm-inner">
        <div className="v01tm-header">
          <p className="v01tm-kicker">
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 className="v01tm-heading">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
        </div>

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
