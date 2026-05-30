import { notFound } from "next/navigation";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;
import { getTenantBySlug, getTenantPage, getPageSections, getTenantOverrides } from "@/lib/db";
import { TenantPublicView } from "@/components/tenant/TenantPublicView";
import { ClonedSiteRenderer } from "@/components/tenant/ClonedSiteRenderer";
import { TenantAnalytics, GtmNoScript } from "@/components/tenant/TenantAnalytics";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ studio?: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://venom-saas.vercel.app";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3015";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return {};

  const page = await getTenantPage(tenant.id, "home");
  const canonicalUrl = `${BASE_URL}/demo/${tenantSlug}`;
  const title = page?.seo_title ?? `${tenantSlug} — Demo`;
  const description = page?.seo_description ?? undefined;
  const ogImage = page?.og_image ?? `/demo/${tenantSlug}/opengraph-image`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    robots: tenant.status === "demo" ? { index: false, follow: false } : { index: true, follow: true },
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Venom SaaS",
      locale: "cs_CZ",
      type: "website",
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

export default async function TenantDemoPage({ params, searchParams }: Props) {
  const { tenantSlug } = await params;
  const { studio } = await searchParams;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") return notFound();

  const page = await getTenantPage(tenant.id, "home");
  if (!page) return notFound();

  const [sections, overrides] = await Promise.all([
    getPageSections(tenant.id, page.id),
    getTenantOverrides(tenant.id),
  ]);

  // Studio mode: when the studio embeds this page in an iframe (?studio=1),
  // enable inline editing if the user has the tenant access cookie. The
  // studio's own auth already gated access to /studio, so the iframe can trust
  // the cookie and switch on isAdmin without redirecting to /login.
  let isAdmin = false;
  if (studio === "1") {
    const cookieStore = await cookies();
    const accessCookie = cookieStore.get(`venom_access_${tenantSlug}`)?.value;
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
  return (
    <>
      <TenantAnalytics tenant={tenant} />
      {gtmId && <GtmNoScript gtmId={gtmId} />}
      <TenantPublicView tenant={tenant} page={page} sections={sections} overrides={overrides} isAdmin={isAdmin} />
    </>
  );
}
