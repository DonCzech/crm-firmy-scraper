import { notFound } from "next/navigation";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;
import { getTenantBySlug, getTenantPage, getPageSections, getTenantOverrides, getSubscriptionByTenantId, queryOne } from "@/lib/db";
import { resolveAllSections } from "@/lib/section-resolver";
import { buildTenantSEO } from "@/lib/tenant-seo";
import { TenantPublicView } from "@/components/tenant/TenantPublicView";
import { ClonedSiteRenderer } from "@/components/tenant/ClonedSiteRenderer";
import { PublicTrialLock } from "@/components/tenant/PublicTrialLock";
import { TenantAnalytics, GtmNoScript } from "@/components/tenant/TenantAnalytics";
import { loadTemplate } from "@/lib/templates/loader";
import type { Metadata, Viewport } from "next";

interface Props {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ studio?: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://webero.co";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3015";

export async function generateViewport({ params }: Props): Promise<Viewport> {
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return {};

  const page = await getTenantPage(tenant.id, "home");
  // F3: buildTenantSEO merges tenant_data_slots (brand.name, tagline, social, seo.*)
  //     with page-level SEO overrides + tenant.industry → schema.org type.
  const { metadata } = await buildTenantSEO(tenant, { page: page ?? undefined });
  return metadata;
}

export default async function TenantDemoPage({ params, searchParams }: Props) {
  const { tenantSlug } = await params;
  const { studio } = await searchParams;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") return notFound();

  // Trial gate: visitors can't see the actual site once the trial has expired
  // and the subscription is not active. The studio (?studio=1) bypasses this
  // — the tenant owner still needs to see what's locked in order to pay.
  // The TrialLockOverlay in TenantEditorView handles the studio side.
  if (studio !== "1") {
    const sub = await getSubscriptionByTenantId(tenant.id);
    const expired = sub && sub.status !== "active" && sub.trial_ends_at && new Date(sub.trial_ends_at) < new Date();
    if (expired) {
      const extra = await queryOne<{ business_name: string | null }>(
        "SELECT business_name FROM tenants WHERE id = $1",
        [tenant.id]
      );
      return <PublicTrialLock tenantSlug={tenant.slug} businessName={extra?.business_name ?? null} />;
    }
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

  // Studio mode: when the studio embeds this page in an iframe (?studio=1),
  // enable inline editing if the user has the tenant access cookie. The
  // studio's own auth already gated access to /studio, so the iframe can trust
  // the cookie and switch on isAdmin without redirecting to /login.
  let isAdmin = false;
  if (studio === "1") {
    const cookieStore = await cookies();
    const accessCookie = cookieStore.get(`webero_access_${tenantSlug}`)?.value;
    if (tenant.access_token && accessCookie === tenant.access_token) {
      isAdmin = true;
    }
  }

  // Clone mode: single full-page-clone section renders the original site HTML 1:1
  const cloneSection = sections.find((s) => s.section_type === "full-page-clone");
  if (cloneSection) {
    const { html, cssUrls, jsUrls } = cloneSection.settings as {
      html: string;
      cssUrls?: string[];
      jsUrls?: string[];
    };
    return (
      <ClonedSiteRenderer
        html={html}
        cssUrls={cssUrls}
        jsUrls={jsUrls}
        isAdmin={isAdmin}
        sectionId={cloneSection.id}
        tenantSlug={tenantSlug}
      />
    );
  }

  const gtmId = tenant.analytics_config?.gtm_id;
  // F3: emit JSON-LD structured data (LocalBusiness/Organization based on industry)
  const { jsonLd } = await buildTenantSEO(tenant, { page: page ?? undefined });

  // LCP preload: grab first visible hero section's background image (local paths only)
  const heroSection = sections.find((s) => s.is_visible && s.section_type === "hero");
  const heroContent = heroSection?.settings?.content as Record<string, unknown> | undefined;
  const lcpImage = typeof heroContent?.backgroundImage === "string" && heroContent.backgroundImage.startsWith("/")
    ? heroContent.backgroundImage as string
    : null;

  return (
    <>
      {lcpImage && (
        <link rel="preload" as="image" href={lcpImage} fetchPriority="high" />
      )}
      <TenantAnalytics tenant={tenant} />
      {gtmId && <GtmNoScript gtmId={gtmId} />}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <TenantPublicView tenant={tenant} page={page} sections={sections} overrides={overrides} isAdmin={isAdmin} />
    </>
  );
}
