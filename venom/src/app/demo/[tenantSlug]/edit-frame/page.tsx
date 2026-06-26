import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getTenantBySlug, getTenantPage, getPageSections, getTenantOverrides } from "@/lib/db";
import { resolveAllSections } from "@/lib/section-resolver";
import { TenantPublicView } from "@/components/tenant/TenantPublicView";
import { ClonedSiteRenderer } from "@/components/tenant/ClonedSiteRenderer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

/**
 * Dedicated iframe target for ClonedStudioFrame (old clone-based templates).
 * Always force-dynamic so the editor always sees live DB state.
 * Auth: same webero_access_[slug] cookie as /admin.
 */
export default async function EditFramePage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") return notFound();

  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(`webero_access_${tenantSlug}`)?.value;
  const isAdmin = !!(tenant.access_token && accessCookie === tenant.access_token);

  const page = await getTenantPage(tenant.id, "home");
  if (!page) return notFound();

  const [rawSections, overrides] = await Promise.all([
    getPageSections(tenant.id, page.id),
    getTenantOverrides(tenant.id),
  ]);

  const sections = await resolveAllSections(tenant, rawSections);

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

  return <TenantPublicView tenant={tenant} page={page} sections={sections} overrides={overrides} isAdmin={isAdmin} />;
}
