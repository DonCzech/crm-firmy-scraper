/**
 * Commerce templates whose public website starts directly in the storefront.
 * Their internal homepage may still exist as editor/template storage, but it
 * must never act as a public landing page.
 */
const STOREFRONT_ONLY_TEMPLATE_KEYS = new Set(["eshop-01"]);

export function isStorefrontOnlyTemplate(templateKey: string | null | undefined): boolean {
  return !!templateKey && STOREFRONT_ONLY_TEMPLATE_KEYS.has(templateKey);
}
