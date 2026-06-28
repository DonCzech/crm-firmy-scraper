import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTenantBySlug, query } from "@/lib/db";
import { HttpHeadersSettings } from "@/components/admin/settings/HttpHeadersSettings";
import type { HttpHeader } from "@/components/admin/settings/HttpHeadersSettings";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function SettingsHeadersPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") return notFound();

  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(`webero_access_${tenantSlug}`)?.value;
  if (!tenant.access_token || accessCookie !== tenant.access_token) {
    redirect(`/demo/${tenantSlug}/login`);
  }

  const headers = await query<HttpHeader>(
    "SELECT id, name, value, created_at FROM tenant_http_headers WHERE tenant_id = $1 ORDER BY created_at DESC",
    [tenant.id]
  );

  return <HttpHeadersSettings tenantSlug={tenantSlug} initialHeaders={headers} />;
}
