import { query } from "@/lib/db";
import { NavbarSection } from "@/components/sections/NavbarSection";
import { FooterSection } from "@/components/sections/FooterSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { applyCommerceCategoriesToNavbar, fetchCategoryTree, navbarWantsCommerceCategories } from "@/lib/commerce/section-data";

/**
 * Per-šablonový chrome storefrontu — u šablon s vlastním navbarem/footerem
 * (eshop-02+) renderuje na /obchod stránkách sekce šablony místo sdíleného
 * ShopHeader/ShopFooter, takže web i e-shop tvoří jeden celek.
 *
 * Obsah se čte z navbar/footer sekce homepage tenanta (jediný zdroj pravdy:
 * úpravy v editoru se propíšou i do storefrontu). Šablony bez vlastního
 * chrome (eshop-01) vrací null → stránky použijí sdílený header/footer.
 */

const TEMPLATE_CHROME_KEYS = new Set(["eshop-02", "eshop-03", "eshop-04", "eshop-05", "eshop-06", "eshop-07", "eshop-08", "eshop-09", "eshop-10", "eshop-11", "eshop-12", "eshop-13", "eshop-14", "eshop-15", "eshop-16", "eshop-17", "eshop-18", "eshop-19", "eshop-20"]);

interface ChromeSection {
  id: number;
  variant: string;
  content: Record<string, unknown>;
}

async function fetchChromeSection(
  tenantId: number,
  sectionType: "navbar" | "footer"
): Promise<ChromeSection | null> {
  const rows = await query<{ id: number; section_variant: string; settings: unknown }>(
    `SELECT s.id, s.section_variant, s.settings
     FROM sections s JOIN pages p ON p.id = s.page_id
     WHERE s.tenant_id = $1 AND s.section_type = $2 AND p.is_homepage = true AND s.is_visible = true
     ORDER BY s.order_index LIMIT 1`,
    [tenantId, sectionType]
  ).catch(() => []);
  if (!rows.length) return null;
  const settings = (rows[0].settings ?? {}) as Record<string, unknown>;
  return {
    id: rows[0].id,
    variant: rows[0].section_variant,
    content: (settings.content ?? {}) as Record<string, unknown>,
  };
}

export async function getTemplateChromeKey(tenantId: number): Promise<string | null> {
  const rows = await query<{ key: string | null }>(
    `SELECT t.key FROM tenants tn LEFT JOIN templates t ON t.id = tn.template_id WHERE tn.id = $1`,
    [tenantId]
  ).catch(() => []);
  const key = rows[0]?.key ?? null;
  return key && TEMPLATE_CHROME_KEYS.has(key) ? key : null;
}

export async function TemplateShopHeader({ tenantId, tenantSlug }: { tenantId: number; tenantSlug: string }) {
  const section = await fetchChromeSection(tenantId, "navbar");
  if (!section) return null;
  let content = section.content;
  if (navbarWantsCommerceCategories(content)) {
    const tree = await fetchCategoryTree(tenantId);
    content = applyCommerceCategoriesToNavbar(content, tree, `/demo/${tenantSlug}/obchod`);
  }
  return (
    <NavbarSection
      content={content}
      variant={section.variant}
      isAdmin={false}
      tenantSlug={tenantSlug}
      sectionId={section.id}
    />
  );
}

async function fetchChromeSectionByVariant(tenantId: number, variant: string): Promise<ChromeSection | null> {
  const rows = await query<{ id: number; section_variant: string; settings: unknown }>(
    `SELECT s.id, s.section_variant, s.settings
     FROM sections s JOIN pages p ON p.id = s.page_id
     WHERE s.tenant_id = $1 AND s.section_variant = $2 AND p.is_homepage = true AND s.is_visible = true
     ORDER BY s.order_index LIMIT 1`,
    [tenantId, variant]
  ).catch(() => []);
  if (!rows.length) return null;
  const settings = (rows[0].settings ?? {}) as Record<string, unknown>;
  return { id: rows[0].id, variant: rows[0].section_variant, content: (settings.content ?? {}) as Record<string, unknown> };
}

export async function TemplateShopFooter({ tenantId, tenantSlug }: { tenantId: number; tenantSlug: string }) {
  const section = await fetchChromeSection(tenantId, "footer");
  if (!section) return null;

  // eshop-05 (pompo): červený prefooter + newsletter nad footerem i ve storefrontu
  const [prefooter, newsletter] = section.variant === "eshop-05-footer"
    ? await Promise.all([
        fetchChromeSectionByVariant(tenantId, "eshop-05-prefooter"),
        fetchChromeSectionByVariant(tenantId, "eshop-05-newsletter"),
      ])
    : [null, null];

  // eshop-07 (kosmetika-zdravi): USP pás nad footerem i ve storefrontu
  const usp = section.variant === "eshop-07-footer"
    ? await fetchChromeSectionByVariant(tenantId, "eshop-07-usp")
    : null;

  // eshop-15 (Apatyka): newsletter pás nad footerem i ve storefrontu
  const newsletter15 = section.variant === "eshop-15-footer"
    ? await fetchChromeSectionByVariant(tenantId, "eshop-15-newsletter")
    : null;

  // eshop-17 (Rozkvět): newsletter pás nad footerem i ve storefrontu
  const newsletter17 = section.variant === "eshop-17-footer"
    ? await fetchChromeSectionByVariant(tenantId, "eshop-17-newsletter")
    : null;

  return (
    <>
      {usp && (
        <AboutSection content={usp.content} variant={usp.variant} isAdmin={false} tenantSlug={tenantSlug} sectionId={usp.id} />
      )}
      {prefooter && (
        <ContactSection content={prefooter.content} variant={prefooter.variant} isAdmin={false} tenantSlug={tenantSlug} sectionId={prefooter.id} />
      )}
      {newsletter && (
        <CtaSection content={newsletter.content} variant={newsletter.variant} isAdmin={false} tenantSlug={tenantSlug} sectionId={newsletter.id} />
      )}
      {newsletter15 && (
        <CtaSection content={newsletter15.content} variant={newsletter15.variant} isAdmin={false} tenantSlug={tenantSlug} sectionId={newsletter15.id} />
      )}
      {newsletter17 && (
        <CtaSection content={newsletter17.content} variant={newsletter17.variant} isAdmin={false} tenantSlug={tenantSlug} sectionId={newsletter17.id} />
      )}
      <FooterSection
        content={section.content}
        variant={section.variant}
        isAdmin={false}
        tenantSlug={tenantSlug}
        sectionId={section.id}
      />
    </>
  );
}
