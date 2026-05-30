export const SECTION_TYPE_LABELS: Record<string, string> = {
  navbar: "Navigace",
  footer: "Patička",
  hero: "Hero",
  services: "Služby",
  pricing: "Ceník",
  about: "O nás",
  "blog-preview": "Náhled blogu",
  testimonials: "Reference",
  gallery: "Galerie",
  contact: "Kontakt",
  faq: "FAQ",
  cta: "CTA",
  "rezora-cta": "Rezervace CTA",
  "rezora-widget": "Rezervace Widget",
  "opening-hours": "Otevírací doba",
  team: "Tým",
  map: "Mapa",
  "full-page-clone": "Klonovaná stránka",
  "astera-home": "Astera úvod",
};

export function getSectionTypeLabel(type: string): string {
  return SECTION_TYPE_LABELS[type] ?? type;
}
