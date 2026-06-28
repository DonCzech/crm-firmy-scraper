import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTenantBySlug, query } from "@/lib/db";
import { RedirectsSettings } from "@/components/admin/settings/RedirectsSettings";
import type { Redirect } from "@/components/admin/settings/RedirectsSettings";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function SettingsRedirectsPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") return notFound();

  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(`webero_access_${tenantSlug}`)?.value;
  if (!tenant.access_token || accessCookie !== tenant.access_token) {
    redirect(`/demo/${tenantSlug}/login`);
  }

  const redirects = await query<Redirect>(
    "SELECT id, from_path, to_path, status_code, created_at FROM tenant_redirects WHERE tenant_id = $1 ORDER BY created_at DESC",
    [tenant.id]
  );

  return <RedirectsSettings tenantSlug={tenantSlug} initialRedirects={redirects} />;
}
