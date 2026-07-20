import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTenantBySlug } from "@/lib/db";
import { getTenantCustomCode, invalidateCustomCodeCache, EMPTY_CUSTOM_CODE } from "@/lib/custom-code";
import { CustomCodeSettings } from "@/components/admin/settings/CustomCodeSettings";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function SettingsCustomCodePage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") return notFound();

  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(`webero_access_${tenantSlug}`)?.value;
  if (!tenant.access_token || accessCookie !== tenant.access_token) {
    redirect(`/demo/${tenantSlug}/login`);
  }

  invalidateCustomCodeCache(tenant.id);
  const code = await getTenantCustomCode(tenant.id);

  return <CustomCodeSettings tenantSlug={tenantSlug} initialCode={code ?? EMPTY_CUSTOM_CODE} />;
}
