import { ImageResponse } from "next/og";
import { getTenantBySlug, getTenantPage, getPageSections } from "@/lib/db";

export const alt = "Webero — profesionální weby";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export default async function Image({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  let name = tenantSlug;
  let tagline = "Vytvořeno na Webero";
  let bg = "#0f172a";
  let accent = "#6366f1";

  if (tenant) {
    const page = await getTenantPage(tenant.id, "home");
    if (page) {
      const sections = await getPageSections(tenant.id, page.id);
      const designTokens = sections[0]?.settings?.designTokens as Record<string, string> | undefined;
      const heroSection = sections.find((s) => s.section_type === "hero");
      const heroContent = (heroSection?.settings?.content ?? {}) as Record<string, string>;
      const navbarSection = sections.find((s) => s.section_type === "navbar");
      const navbarContent = (navbarSection?.settings?.content ?? {}) as Record<string, string>;

      name = navbarContent.siteName ?? heroContent.title?.split("\n")[0] ?? tenant.slug;
      tagline = heroContent.subtitle ?? "Vytvořeno na Webero";
      bg = designTokens?.colorBackground ?? "#0f172a";
      accent = designTokens?.colorAccent ?? "#6366f1";
    }
  }

  const isDark = bg.startsWith("#0") || bg.startsWith("#1") || bg === "#111" || bg === "#111111";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: bg,
          color: isDark ? "#ffffff" : "#111111",
          padding: "80px 96px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Accent bar left */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "15%",
            width: 6,
            height: "70%",
            background: accent,
            borderRadius: 3,
          }}
        />

        {/* Accent dot pattern top-right */}
        <div
          style={{
            position: "absolute",
            right: 80,
            top: 80,
            width: 120,
            height: 120,
            borderRadius: "50%",
            border: `2px solid ${accent}`,
            opacity: 0.25,
          }}
        />

        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: accent,
            marginBottom: 28,
          }}
        >
          Webero
        </div>

        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.05,
            marginBottom: 28,
            maxWidth: 900,
          }}
        >
          {name}
        </div>

        {tagline && (
          <div
            style={{
              fontSize: 28,
              opacity: 0.7,
              maxWidth: 700,
              lineHeight: 1.4,
            }}
          >
            {tagline.slice(0, 100)}
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
