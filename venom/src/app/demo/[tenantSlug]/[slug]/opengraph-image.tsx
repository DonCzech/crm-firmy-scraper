import { ImageResponse } from "next/og";
import { getTenantBySlug, getTenantPage } from "@/lib/db";

export const alt = "Venom SaaS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ tenantSlug: string; slug: string }>;
}

export default async function Image({ params }: Props) {
  const { tenantSlug, slug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const page = tenant ? await getTenantPage(tenant.id, slug) : null;

  const title = page?.seo_title ?? slug ?? tenantSlug ?? "Venom SaaS";
  const subtitle = tenant?.slug ?? "Vytvořeno na Webero";
  const background = "#0f172a";

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
          background,
          color: "#ffffff",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, marginBottom: 24 }}>
          {title}
        </div>
        <div style={{ fontSize: 32, opacity: 0.85 }}>{subtitle}</div>
      </div>
    ),
    { ...size }
  );
}
