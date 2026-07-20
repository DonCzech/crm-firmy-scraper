import { notFound } from "next/navigation";
import { getTenantBySlug, getTenantPage, getPageSections, getTenantOverrides, getSubscriptionByTenantId, queryOne } from "@/lib/db";
import { resolveAllSections, type TenantWithKey } from "@/lib/section-resolver";
import { withRezoraPrefetch } from "@/lib/rezora/prefetch";
import { buildTenantSEO } from "@/lib/tenant-seo";
import { TenantPublicView } from "@/components/tenant/TenantPublicView";
import { ClonedSiteRenderer } from "@/components/tenant/ClonedSiteRenderer";
import { PublicTrialLock } from "@/components/tenant/PublicTrialLock";
import { TenantAnalytics, GtmNoScript } from "@/components/tenant/TenantAnalytics";
import { TenantCustomCode } from "@/components/tenant/TenantCustomCode";
import { loadTemplate } from "@/lib/templates/loader";
import { isStorefrontOnlyTemplate } from "@/lib/commerce/storefront-only";
import StorefrontListingPage from "./obchod/page";
import type { Metadata, Viewport } from "next";

export const revalidate = 300;

interface Props {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ kategorie?: string; strana?: string; znacka?: string; q?: string; vse?: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://webero.co";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3015";

export async function generateViewport({ params }: { params: Promise<{ tenantSlug: string }> }): Promise<Viewport> {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  let themeColor = "#ffffff";
  if (tenant) {
    try {
      const tpl = await loadTemplate((tenant as TenantWithKey).template_key ?? "");
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

export default async function TenantDemoPage({ params, searchParams }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") return notFound();

  const template = tenant.template_id
    ? await queryOne<{ key: string }>("SELECT key FROM templates WHERE id = $1", [tenant.template_id])
    : null;
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

  // Storefront-only templates have no public landing page. Render the shop at
  // /demo/{slug} directly; /obchod remains only as a backwards-compatible URL.
  if (isStorefrontOnlyTemplate(template?.key)) {
    return (
      <>
        <TenantCustomCode tenantId={tenant.id} placement="head" />
        <StorefrontListingPage params={params} searchParams={searchParams} />
        <TenantCustomCode tenantId={tenant.id} placement="body-end" />
      </>
    );
  }

  const page = await getTenantPage(tenant.id, "home");
  if (!page) return notFound();

  const [rawSections, overrides] = await Promise.all([
    getPageSections(tenant.id, page.id),
    getTenantOverrides(tenant.id),
  ]);

  // F1 read-through: legacy sections pass through untouched; v2 sections get
  // template defaults + slot refs + sparse overrides merged into settings.content.
  // Rezervační nabídku přednačte server (viz withRezoraPrefetch) — widget tak
  // nemusí po scrollu nic dotahovat a je vidět i pro vyhledávače.
  const sections = await withRezoraPrefetch(await resolveAllSections(tenant, rawSections));

  // Clone mode: single full-page-clone section renders the original site HTML 1:1
  const cloneSection = sections.find((s) => s.section_type === "full-page-clone");
  if (cloneSection) {
    const { html, cssUrls, jsUrls } = cloneSection.settings as {
      html: string;
      cssUrls?: string[];
      jsUrls?: string[];
    };
    // Extract LCP hero image URLs server-side so preloads are in SSR HTML (no hydration delay).
    // Check for <picture><source srcset="..." media="(max-width: ...)"> first (mobile LCP candidate),
    // then fall back to first <img> src or CSS url().
    const mobileSrcMatch = html.match(/<source\s[^>]*srcset=['"]([^'"]+\.(jpg|jpeg|webp|png))['"][^>]*media=['"][^'"]*max-width[^'"]*['"][^>]*>/i)
      ?? html.match(/<source\s[^>]*media=['"][^'"]*max-width[^'"]*['"][^>]*srcset=['"]([^'"]+\.(jpg|jpeg|webp|png))['"][^>]*>/i);
    const mobileLcpUrl = mobileSrcMatch ? mobileSrcMatch[1] : null;
    const desktopLcpMatch = html.match(/<img[^>]+src=['"]([^'"]+\.(jpg|jpeg|webp|png))['"][^>]*>/i)
      ?? html.match(/url\(['"]?([^'")]+\.(jpg|jpeg|webp|png))['"]?\)/i);
    const desktopLcpUrl = desktopLcpMatch ? desktopLcpMatch[1] : null;
    const clonePreloadImages = desktopLcpUrl ? [desktopLcpUrl] : undefined;
    return (
      <>
        {mobileLcpUrl && (
           
          <link rel="preload" as="image" href={mobileLcpUrl} fetchPriority="high" media="(max-width: 574px)" />
        )}
        {desktopLcpUrl && (
           
          <link rel="preload" as="image" href={desktopLcpUrl} fetchPriority="high" media={mobileLcpUrl ? "(min-width: 575px)" : undefined} />
        )}
        <ClonedSiteRenderer html={html} cssUrls={cssUrls} jsUrls={jsUrls} preloadImages={clonePreloadImages} />
      </>
    );
  }

  const gtmId = tenant.analytics_config?.gtm_id;
  const { jsonLd } = await buildTenantSEO(tenant, { page: page ?? undefined });

  // LCP preload: emit a high-priority <link> for the hero background image so
  // the browser discovers it from static HTML (before React hydration).
  const heroSection = sections.find(s => s.section_type === "hero");
  const heroContent = heroSection?.settings?.content as Record<string, unknown> | undefined;
  const lcpImageUrl = (heroContent?.backgroundImage as string | undefined)
    ?? ((heroContent?.slides as Array<{ backgroundImage?: string }> | undefined)?.[0]?.backgroundImage)
    ?? null;

  return (
    <>
      {lcpImageUrl && (
         
        <link rel="preload" as="image" href={lcpImageUrl} fetchPriority="high" />
      )}
      <TenantAnalytics tenant={tenant} />
      {gtmId && <GtmNoScript gtmId={gtmId} />}
      <TenantCustomCode tenantId={tenant.id} placement="head" />
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <TenantPublicView tenant={tenant} page={page} sections={sections} overrides={overrides} isAdmin={false} />
      <TenantCustomCode tenantId={tenant.id} placement="body-end" />
    </>
  );
}
