import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTenantBySlug, query } from "@/lib/db";
import { CssClassesSettings } from "@/components/admin/settings/CssClassesSettings";
import type { CssClass } from "@/components/admin/settings/CssClassesSettings";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function SettingsCssPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") return notFound();

  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(`webero_access_${tenantSlug}`)?.value;
  if (!tenant.access_token || accessCookie !== tenant.access_token) {
    redirect(`/demo/${tenantSlug}/login`);
  }

  const classes = await query<CssClass>(
    "SELECT id, name, css_class, description, created_at FROM tenant_css_classes WHERE tenant_id = $1 ORDER BY created_at DESC",
    [tenant.id]
  );

  return <CssClassesSettings tenantSlug={tenantSlug} initialClasses={classes} />;
}
