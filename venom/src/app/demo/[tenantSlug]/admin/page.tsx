import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTenantBySlug, getTenantPage, getPageSections, getTenantOverrides } from "@/lib/db";
import { TenantStudioView as TenantEditorView } from "@/components/studio/TenantStudioView";
import { AsteraStudioEditor } from "@/components/studio/AsteraStudioEditor";
import { StudioThemeScript } from "@/components/studio/StudioThemeScript";
import { resolveAllSections } from "@/lib/section-resolver";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ studio?: string; builder?: string }>;
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function TenantAdminPage({ params, searchParams }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") return notFound();

  // ── Auth check ─────────────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(`webero_access_${tenantSlug}`)?.value;

  if (!tenant.access_token || accessCookie !== tenant.access_token) {
    redirect(`/demo/${tenantSlug}/login`);
  }

  // ── E-shop tenanti přistávají v administraci obchodu ────────────────────────
  // Pro e-shopy je primární pracovní plocha administrace obchodu; studio editor
  // (vzhled webu) zůstává dostupný přes ?studio=1 — tlačítko „Studio editor"
  // v e-shop administraci.
  // ?builder=1 otevírá Studio rovnou v režimu AI Builderu (fullscreen chat
  // + živý náhled) — jde o tentýž editor, jen s builder vrstvou navrchu.
  const { studio, builder } = await searchParams;
  if (studio !== "1" && builder !== "1" && tenant.tenant_kind === "commerce") {
    redirect(`/demo/${tenantSlug}/admin/obchod`);
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

  // astera-site tenants edit through astera's own native LiveEditor (1:1 with
  // astera-web) rather than the generic StudioCanvas.
  const asteraSection = sections.find((s) => s.section_type === "astera-site");
  if (asteraSection) {
    return <AsteraStudioEditor tenant={tenant} section={asteraSection} />;
  }

  return (
    <>
      <StudioThemeScript />
      <TenantEditorView
        tenant={tenant}
        page={page}
        sections={sections}
        overrides={overrides}
        initialBuilderOpen={builder === "1"}
      />
    </>
  );
}
