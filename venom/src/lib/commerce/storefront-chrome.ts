import { getTenantPage, getPageSections, type Tenant, type Section } from "@/lib/db";
import { resolveAllSections } from "@/lib/section-resolver";

/**
 * Storefront chrome — navbar + footer šablony pro commerce routes
 * (/obchod, /obchod/[slug]). Bere sekce z homepage tenantu a prožene je
 * stejným resolverem jako běžné stránky, takže vzhled i odkazy sedí 1:1.
 */
export interface StorefrontChrome {
  navbar: Section | null;
  footer: Section | null;
}

export async function getStorefrontChrome(tenant: Tenant): Promise<StorefrontChrome> {
  const home = await getTenantPage(tenant.id, "home");
  if (!home) return { navbar: null, footer: null };

  const sections = await getPageSections(tenant.id, home.id);
  const chrome = sections.filter(
    (s) => (s.section_type === "navbar" || s.section_type === "footer") && s.is_visible
  );
  if (!chrome.length) return { navbar: null, footer: null };

  const resolved = await resolveAllSections(tenant, chrome);
  return {
    navbar: resolved.find((s) => s.section_type === "navbar") ?? null,
    footer: resolved.find((s) => s.section_type === "footer") ?? null,
  };
}
