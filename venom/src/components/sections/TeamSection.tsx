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
