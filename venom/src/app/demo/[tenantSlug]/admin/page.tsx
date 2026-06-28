import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTenantBySlug, getTenantPage, getPageSections, getTenantOverrides } from "@/lib/db";
import { TenantStudioView as TenantEditorView } from "@/components/studio/TenantStudioView";
import { resolveAllSections } from "@/lib/section-resolver";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function TenantAdminPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") return notFound();

  // ── Auth check ─────────────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(`webero_access_${tenantSlug}`)?.value;

  if (!tenant.access_token || accessCookie !== tenant.access_token) {
    redirect(`/demo/${tenantSlug}/login`);
  }

  const page = await getTenantPage(tenant.id, "home");
  if (!page) return notFound();

  const [rawSections, overrides] = await Promise.all([
    getPageSections(tenant.id, page.id),
    getTenantOverrides(tenant.id),
  ]);

  // Resolve v2 section content (content_overrides → settings.content) so the
  // editor starts with the correct merged content rather than empty settings.
  const sections = await resolveAllSections(tenant, rawSections);

  return <TenantEditorView tenant={tenant} page={page} sections={sections} overrides={overrides} />;
}
