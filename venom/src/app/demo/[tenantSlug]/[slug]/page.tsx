import { notFound, redirect } from "next/navigation";
import { getTenantBySlug, getTenantPage, getPageSections, getTenantOverrides } from "@/lib/db";
import { resolveAllSections } from "@/lib/section-resolver";
import { withRezoraPrefetch } from "@/lib/rezora/prefetch";
import { AsteraDemoPageTemplate } from "@/components/templates/AsteraDemoPageTemplate";
import { TenantPublicView } from "@/components/tenant/TenantPublicView";
import { ClonedSiteRenderer } from "@/components/tenant/ClonedSiteRenderer";
import { TenantCustomCode } from "@/components/tenant/TenantCustomCode";
import type { SiteContent } from "@/lib/content-types";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tenantSlug: string; slug: string }>;
}

export const revalidate = 60;

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

  if (tenant.site_mode === "onepage") {
    redirect(`/demo/${tenantSlug}/#${slug}`);
  }

  const tenantPage = await getTenantPage(tenant.id, slug);
  if (tenantPage) {
    const [rawSections, overrides] = await Promise.all([
      getPageSections(tenant.id, tenantPage.id),
      getTenantOverrides(tenant.id),
    ]);

    // F1 read-through: merge template defaults + slot refs + sparse content_overrides
    // into settings.content so the components receive resolved data.
    const pageSections = await withRezoraPrefetch(await resolveAllSections(tenant, rawSections));

    // Clone mode — render original HTML 1:1
    const cloneSection = pageSections.find((s) => s.section_type === "full-page-clone");
    if (cloneSection) {
      const { html, cssUrls, jsUrls } = cloneSection.settings as {
        html: string; cssUrls?: string[]; jsUrls?: string[];
      };
      return <ClonedSiteRenderer html={html} cssUrls={cssUrls} jsUrls={jsUrls} />;
    }

    return (
      <>
        <TenantCustomCode tenantId={tenant.id} placement="head" />
        <TenantPublicView
          tenant={tenant}
          page={tenantPage}
          sections={pageSections}
          overrides={overrides}
          isAdmin={false}
        />
        <TenantCustomCode tenantId={tenant.id} placement="body-end" />
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
