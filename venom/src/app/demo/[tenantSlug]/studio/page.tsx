import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTenantBySlug, getTenantPage, getPageSections, getTenantOverrides } from "@/lib/db";
import { TenantStudioView } from "@/components/studio/TenantStudioView";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function TenantStudioPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") return notFound();

  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(`venom_access_${tenantSlug}`)?.value;

  if (!tenant.access_token || accessCookie !== tenant.access_token) {
    redirect(`/demo/${tenantSlug}/login`);
  }

  const page = await getTenantPage(tenant.id, "home");
  if (!page) return notFound();

  const [sections, overrides] = await Promise.all([
    getPageSections(tenant.id, page.id),
    getTenantOverrides(tenant.id),
  ]);

  return (
    <TenantStudioView
      tenant={tenant}
      page={page}
      sections={sections}
      overrides={overrides}
    />
  );
}
