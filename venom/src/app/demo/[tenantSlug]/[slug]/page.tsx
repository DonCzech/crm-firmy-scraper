import { notFound } from "next/navigation";
import { getTenantBySlug, getTenantPage, getPageSections, getTenantOverrides } from "@/lib/db";
import { AsteraDemoPageTemplate } from "@/components/templates/AsteraDemoPageTemplate";
import { TenantPublicView } from "@/components/tenant/TenantPublicView";
import { ClonedSiteRenderer } from "@/components/tenant/ClonedSiteRenderer";
import type { SiteContent } from "@/lib/content-types";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tenantSlug: string; slug: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://webero.co";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3015";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug, slug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return { robots: { index: false, follow: false } };
  const page = await getTenantPage(tenant.id, slug);
  const canonicalUrl = `${BASE_URL}/demo/${tenantSlug}/${slug}`;
  const title = page?.seo_title ?? `${slug} — ${tenantSlug}`;
  const description = page?.seo_description ?? undefined;
  const ogImage = page?.og_image ?? `/demo/${tenantSlug}/${slug}/opengraph-image`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Webero",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function TenantAsteraSubPage({ params }: Props) {
  const { tenantSlug, slug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") return notFound();

  const tenantPage = await getTenantPage(tenant.id, slug);
  if (tenantPage) {
    const [pageSections, overrides] = await Promise.all([
      getPageSections(tenant.id, tenantPage.id),
      getTenantOverrides(tenant.id),
    ]);

    // Clone mode — render original HTML 1:1
    const cloneSection = pageSections.find((s) => s.section_type === "full-page-clone");
    if (cloneSection) {
      const { html, cssUrls, jsUrls } = cloneSection.settings as {
        html: string; cssUrls?: string[]; jsUrls?: string[];
      };
      return <ClonedSiteRenderer html={html} cssUrls={cssUrls} jsUrls={jsUrls} />;
    }

    // LCP preload for hero section background image (local paths only)
    const heroSec = pageSections.find((s) => s.is_visible && s.section_type === "hero");
    const heroContent = heroSec?.settings?.content as Record<string, unknown> | undefined;
    const lcpImage = typeof heroContent?.backgroundImage === "string" && heroContent.backgroundImage.startsWith("/")
      ? heroContent.backgroundImage as string
      : null;

    return (
      <>
        {lcpImage && <link rel="preload" as="image" href={lcpImage} fetchPriority="high" />}
        <TenantPublicView
          tenant={tenant}
          page={tenantPage}
          sections={pageSections}
          overrides={overrides}
          isAdmin={false}
        />
      </>
    );
  }

  const homePage = await getTenantPage(tenant.id, "home");
  if (!homePage) return notFound();

  const sections = await getPageSections(tenant.id, homePage.id);
  const asteraSection = sections.find((section) => section.section_type === "astera-home");
  const content = asteraSection?.settings?.content as SiteContent | undefined;
  if (!asteraSection || !content || !(content.pages ?? []).some((page) => page.slug === slug)) return notFound();

  return (
    <AsteraDemoPageTemplate
      content={content}
      tenantSlug={tenantSlug}
      pageSlug={slug}
      isAdmin={false}
      sectionId={asteraSection.id}
    />
  );
}
