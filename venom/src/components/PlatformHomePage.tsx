import { existsSync } from "fs";
import path from "path";
import { PlatformFooter } from "@/components/PlatformFooter";
import { PlatformHeader } from "@/components/PlatformHeader";
import { SaasLanding, type CatalogTemplate } from "@/components/SaasLanding";
import { query } from "@/lib/db";
import type { PlatformLocale } from "@/lib/platform-i18n";

async function getApprovedTemplates(): Promise<CatalogTemplate[]> {
  try {
    const rows = await query<{ key: string; name: string; industry: string; primary_demo_slug: string | null }>(
      `SELECT key, name, industry, primary_demo_slug FROM templates
        WHERE review_status = 'approved' AND status = 'active'
        ORDER BY reviewed_at DESC NULLS LAST, key ASC`
    );
    return rows.map((r) => ({
      key: r.key,
      name: r.name,
      industry: r.industry,
      previewPath: existsSync(path.join(process.cwd(), "public", "templates", r.key, "preview.webp"))
        ? `/templates/${r.key}/preview.webp`
        : existsSync(path.join(process.cwd(), "public", "templates", r.key, "preview.png"))
          ? `/templates/${r.key}/preview.png`
          : null,
      demoUrl: r.primary_demo_slug ? `/demo/${r.primary_demo_slug}` : null,
    }));
  } catch {
    return [];
  }
}

async function getDemoSlugFor(templateKey: string): Promise<string | null> {
  try {
    const rows = await query<{ slug: string }>(
      `SELECT COALESCE(
         (SELECT t.slug FROM tenants t WHERE t.slug = tpl.primary_demo_slug LIMIT 1),
         (SELECT t.slug FROM tenants t
           WHERE t.template_id = tpl.id
             AND EXISTS (SELECT 1 FROM sections s WHERE s.tenant_id = t.id AND s.content_source = 'v2')
           ORDER BY t.id LIMIT 1)
       ) AS slug
       FROM templates tpl WHERE tpl.key = $1`,
      [templateKey],
    );
    return rows[0]?.slug ?? null;
  } catch {
    return null;
  }
}

const HERO_DESKTOP_TEMPLATE = "barber-04";
const HERO_MOBILE_TEMPLATE = "hotel-01";

export async function PlatformHomePage({ locale = "cs" }: { locale?: PlatformLocale } = {}) {
  const [approvedTemplates, deskSlug, mobSlug] = await Promise.all([
    getApprovedTemplates(),
    getDemoSlugFor(HERO_DESKTOP_TEMPLATE),
    getDemoSlugFor(HERO_MOBILE_TEMPLATE),
  ]);

  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/templates/arch-01/hero-1-800.webp"
        imageSrcSet="/templates/arch-01/hero-1-800.webp 800w, /templates/arch-01/hero-1.webp 1200w"
        imageSizes="(max-width: 768px) 80vw, 42vw"
        fetchPriority="high"
      />
      <PlatformHeader locale={locale} />
      <main>
        <SaasLanding
          locale={locale}
          approvedTemplates={approvedTemplates}
          heroDesktopDemoUrl={deskSlug ? `/demo/${deskSlug}` : null}
          heroMobileDemoUrl={mobSlug ? `/demo/${mobSlug}` : null}
        />
      </main>
      <PlatformFooter locale={locale} />
    </>
  );
}
