import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTenantBySlug, query } from "@/lib/db";
import { ActivitySettings } from "@/components/admin/settings/ActivitySettings";
import type { AuditEntry } from "@/components/admin/settings/ActivitySettings";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function SettingsActivityPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") return notFound();

  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(`webero_access_${tenantSlug}`)?.value;
  if (!tenant.access_token || accessCookie !== tenant.access_token) {
    redirect(`/demo/${tenantSlug}/login`);
  }

  const entries = await query<AuditEntry>(
    `SELECT id, action, actor_email, target_type, target_id, details, created_at, ip_address
     FROM audit_log WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 200`,
    [tenant.id]
  );

  return <ActivitySettings tenantSlug={tenantSlug} entries={entries} />;
}
