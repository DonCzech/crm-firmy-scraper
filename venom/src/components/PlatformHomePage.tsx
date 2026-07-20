import { existsSync } from "fs";
import path from "path";
import { PlatformFooter } from "@/components/PlatformFooter";
import { PlatformHeader } from "@/components/PlatformHeader";
import { SaasLanding, type CatalogTemplate, type TemplateItem } from "@/components/SaasLanding";
import { query } from "@/lib/db";
import type { PlatformLocale } from "@/lib/platform-i18n";
import { categoryForSlug, getDesignTemplates, INDUSTRY_LABEL_EN } from "@/lib/templates/design-catalog";
import { getOnboardingEshop, ONBOARDING_ESHOP_KEYS } from "@/lib/templates/onboarding-catalog";

/** Homepage gallery items — full catalog, same discovery as /vybrat-design. */
async function getGalleryTemplates(): Promise<TemplateItem[]> {
  const items = await getDesignTemplates();
  return items.map((t) => {
    const cat = categoryForSlug(t.slug);
    return {
      key: t.slug,
      name: t.name,
      industry: t.industry,
      industryEn: INDUSTRY_LABEL_EN[t.industry] ?? t.industry,
      category: cat?.label ?? t.industry,
      categoryEn: cat?.labelEn ?? INDUSTRY_LABEL_EN[t.industry] ?? t.industry,
      src: t.preview,
    };
  });
}

async function getApprovedTemplates(): Promise<CatalogTemplate[]> {
  try {
    const rows = await query<{ key: string; name: string; industry: string; primary_demo_slug: string | null }>(
      `SELECT key, name, industry, primary_demo_slug FROM templates
        WHERE status = 'active'
          AND (review_status = 'approved' OR key = ANY($1::text[]))
        ORDER BY CASE WHEN key = ANY($1::text[]) THEN 0 ELSE 1 END,
                 reviewed_at DESC NULLS LAST, key ASC`,
      [ONBOARDING_ESHOP_KEYS]
    );
    return rows.map((r) => {
      const featuredEshop = getOnboardingEshop(r.key);
      return {
        key: r.key,
        name: r.name,
        industry: r.industry,
        previewPath: featuredEshop?.previewImage
          ?? (existsSync(path.join(process.cwd(), "public", "templates", r.key, "preview.webp"))
            ? `/templates/${r.key}/preview.webp`
            : existsSync(path.join(process.cwd(), "public", "templates", r.key, "preview.png"))
              ? `/templates/${r.key}/preview.png`
              : null),
        demoUrl: featuredEshop
          ? `/demo/${featuredEshop.demoSlug}`
          : r.primary_demo_slug ? `/demo/${r.primary_demo_slug}` : null,
      };
    });
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
  const [approvedTemplates, galleryTemplates, deskSlug, mobSlug] = await Promise.all([
    getApprovedTemplates(),
    getGalleryTemplates(),
    getDemoSlugFor(HERO_DESKTOP_TEMPLATE),
    getDemoSlugFor(HERO_MOBILE_TEMPLATE),
  ]);

  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/templates/eshop-05/showcase/hero-card-800.webp?v=2"
        imageSrcSet="/templates/eshop-05/showcase/hero-card-800.webp?v=2 800w, /templates/eshop-05/showcase/hero-card.webp?v=2 1200w"
        imageSizes="(max-width: 768px) 80vw, 42vw"
        fetchPriority="high"
      />
      <PlatformHeader locale={locale} />
      <main>
        <SaasLanding
          locale={locale}
          approvedTemplates={approvedTemplates}
          galleryTemplates={galleryTemplates}
          heroDesktopDemoUrl={deskSlug ? `/demo/${deskSlug}` : null}
          heroMobileDemoUrl={mobSlug ? `/demo/${mobSlug}` : null}
        />
      </main>
      <PlatformFooter locale={locale} />
    </>
  );
}
