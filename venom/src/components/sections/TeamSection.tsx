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
