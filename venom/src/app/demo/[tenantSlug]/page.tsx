import { notFound } from "next/navigation";
import { getTenantBySlug, getTenantPage, getPageSections, getTenantOverrides, getSubscriptionByTenantId, queryOne } from "@/lib/db";
import { resolveAllSections } from "@/lib/section-resolver";
import { buildTenantSEO } from "@/lib/tenant-seo";
import { TenantPublicView } from "@/components/tenant/TenantPublicView";
import { ClonedSiteRenderer } from "@/components/tenant/ClonedSiteRenderer";
import { PublicTrialLock } from "@/components/tenant/PublicTrialLock";
import { TenantAnalytics, GtmNoScript } from "@/components/tenant/TenantAnalytics";
import { loadTemplate } from "@/lib/templates/loader";
import type { Metadata, Viewport } from "next";

export const revalidate = 60;

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://webero.co";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3015";

export async function generateViewport({ params }: { params: Promise<{ tenantSlug: string }> }): Promise<Viewport> {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  let themeColor = "#ffffff";
  if (tenant) {
    try {
      const tpl = await loadTemplate(tenant.template_key);
      themeColor = tpl.designTokens?.colorBackground ?? "#ffffff";
    } catch (_) {}
  }
  return { themeColor };
}

export async function generateMetadata({ params }: { params: Promise<{ tenantSlug: string }> }): Promise<Metadata> {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return {};

  const page = await getTenantPage(tenant.id, "home");
  // F3: buildTenantSEO merges tenant_data_slots (brand.name, tagline, social, seo.*)
  //     with page-level SEO overrides + tenant.industry → schema.org type.
  const { metadata } = await buildTenantSEO(tenant, { page: page ?? undefined });
  return metadata;
}

export default async function TenantDemoPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") return notFound();

  // Trial gate: visitors can't see the site if trial has expired and subscription is inactive.
  const sub = await getSubscriptionByTenantId(tenant.id);
  const expired = sub && sub.status !== "active" && sub.trial_ends_at && new Date(sub.trial_ends_at) < new Date();
  if (expired) {
    const extra = await queryOne<{ business_name: string | null }>(
      "SELECT business_name FROM tenants WHERE id = $1",
      [tenant.id]
    );
    return <PublicTrialLock tenantSlug={tenant.slug} businessName={extra?.business_name ?? null} />;
  }

  const page = await getTenantPage(tenant.id, "home");
  if (!page) return notFound();

  const [rawSections, overrides] = await Promise.all([
    getPageSections(tenant.id, page.id),
    getTenantOverrides(tenant.id),
  ]);

  // F1 read-through: legacy sections pass through untouched; v2 sections get
  // template defaults + slot refs + sparse overrides merged into settings.content.
  const sections = await resolveAllSections(tenant, rawSections);

  // Clone mode: single full-page-clone section renders the original site HTML 1:1
  const cloneSection = sections.find((s) => s.section_type === "full-page-clone");
  if (cloneSection) {
    const { html, cssUrls, jsUrls } = cloneSection.settings as {
      html: string;
      cssUrls?: string[];
      jsUrls?: string[];
    };
    return <ClonedSiteRenderer html={html} cssUrls={cssUrls} jsUrls={jsUrls} />;
  }

  const gtmId = tenant.analytics_config?.gtm_id;
  const { jsonLd } = await buildTenantSEO(tenant, { page: page ?? undefined });

  // LCP preload: generate proper /_next/image srcset URLs (not the raw path)
  // so browser preloads the same optimized image that <Image priority> will request.
  const heroSection = sections.find((s) => s.is_visible && s.section_type === "hero");
  const heroContent = heroSection?.settings?.content as Record<string, unknown> | undefined;
  const lcpSrc = typeof heroContent?.backgroundImage === "string" && heroContent.backgroundImage.startsWith("/")
    ? (heroContent.backgroundImage as string)
    : null;
  const lcpSrcset = lcpSrc
    ? [640, 828, 1080, 1200].map(w => `/_next/image?url=${encodeURIComponent(lcpSrc)}&w=${w}&q=75 ${w}w`).join(", ")
    : null;

  return (
    <>
      {lcpSrcset && (
        <link rel="preload" as="image" imageSrcSet={lcpSrcset} imageSizes="100vw" fetchPriority="high" />
      )}
      <TenantAnalytics tenant={tenant} />
      {gtmId && <GtmNoScript gtmId={gtmId} />}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <TenantPublicView tenant={tenant} page={page} sections={sections} overrides={overrides} isAdmin={false} />
    </>
  );
}
