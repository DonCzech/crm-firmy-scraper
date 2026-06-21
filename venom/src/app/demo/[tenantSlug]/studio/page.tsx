import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTenantBySlug, getTenantPage, getPageSections, getTenantOverrides } from "@/lib/db";
import { resolveAllSections } from "@/lib/section-resolver";
import { TenantStudioView } from "@/components/studio/TenantStudioView";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function TenantStudioPage({ params, searchParams }: Props) {
  const { tenantSlug } = await params;
  const { page: pageSlug } = await searchParams;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") return notFound();

  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(`venom_access_${tenantSlug}`)?.value;

  if (!tenant.access_token || accessCookie !== tenant.access_token) {
    redirect(`/demo/${tenantSlug}/login`);
  }

  // F2 Sprint 3 multi-page: load requested page (default = homepage).
  const targetSlug = pageSlug?.trim() || "home";
  const page = await getTenantPage(tenant.id, targetSlug);
  if (!page) {
    // Requested non-existent page → fall back to homepage instead of 404
    if (targetSlug !== "home") {
      redirect(`/demo/${tenantSlug}/studio`);
    }
    return notFound();
  }

  const [rawSections, overrides] = await Promise.all([
    getPageSections(tenant.id, page.id),
    getTenantOverrides(tenant.id),
  ]);

  // F1: hydrate v2 sections with resolved content (template default + slots + sparse overrides)
  // so Inspector has editable values to show. Legacy sections pass through untouched.
  const sections = await resolveAllSections(tenant, rawSections);

  return (
    <TenantStudioView
      tenant={tenant}
      page={page}
      sections={sections}
      overrides={overrides}
    />
  );
}
