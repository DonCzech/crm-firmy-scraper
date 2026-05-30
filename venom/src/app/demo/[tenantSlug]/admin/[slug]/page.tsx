import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTenantBySlug, getTenantPage, getPageSections, getTenantOverrides } from "@/lib/db";
import { TenantEditorView } from "@/components/tenant/TenantEditorView";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tenantSlug: string; slug: string }>;
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function TenantAdminSubPage({ params }: Props) {
  const { tenantSlug, slug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") return notFound();

  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(`venom_access_${tenantSlug}`)?.value;

  if (!tenant.access_token || accessCookie !== tenant.access_token) {
    redirect(`/demo/${tenantSlug}/login`);
  }

  const page = await getTenantPage(tenant.id, slug);
  if (!page || page.is_homepage) return notFound();

  const [sections, overrides] = await Promise.all([
    getPageSections(tenant.id, page.id),
    getTenantOverrides(tenant.id),
  ]);

  return <TenantEditorView tenant={tenant} page={page} sections={sections} overrides={overrides} />;
}
