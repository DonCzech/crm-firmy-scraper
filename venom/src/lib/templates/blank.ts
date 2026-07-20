import type { TemplateDefinition } from "./types";

/**
 * blank-01 — „Vlastní šablona od nuly".
 *
 * Game-changer onboarding path: instead of picking a finished industry
 * concept, the user starts with a clean three-section skeleton
 * (navbar + hero + footer) in a neutral, professional theme and builds
 * the whole site themselves in Studio via the curated section library.
 *
 * Everything here is intentionally minimal and theme-neutral so the
 * Design panel (colors / typography / buttons) fully drives the look.
 */
export const blankTemplate: TemplateDefinition = {
  key: "blank-01",
  name: "Vlastní šablona",
  industry: "*",
  version: "1.0.0",

  designTokens: {
    colorPrimary: "#111827",
    colorSecondary: "#4b5563",
    colorBackground: "#ffffff",
    colorSurface: "#f8fafc",
    colorText: "#111827",
    colorTextMuted: "#6b7280",
    colorAccent: "#4f46e5",
    colorBorder: "#e5e7eb",
    fontHeading: "Inter, system-ui, sans-serif",
    fontBody: "Inter, system-ui, sans-serif",
    borderRadius: "12px",
    spacing: "normal",
  },

  defaultSections: [
    {
      type: "navbar", variant: "default", order: 0, visible: true,
      content: {
        siteName: "Můj nový web",
        links: [
          { label: "Domů", href: "/" },
          { label: "O nás", href: "#o-nas" },
          { label: "Kontakt", href: "#kontakt" },
        ],
        ctaText: "Kontaktujte nás",
        ctaHref: "#kontakt",
      },
    },
    {
      type: "hero", variant: "hero-centered", order: 1, visible: true,
      content: {
        title: "Tady začíná váš nový web",
        subtitle:
          `Toto je prázdné plátno. Klikněte na „+ Přidat“ a poskládejte si web ze sekcí — hero, služby, galerie, recenze, kontakt a cokoliv dalšího. Barvy, písma a styl změníte v panelu Design.`,
        ctaText: "Začít stavět",
        ctaHref: "#o-nas",
      },
    },
    {
      type: "footer", variant: "default", order: 2, visible: true,
      content: {
        siteName: "Můj nový web",
        tagline: "Postaveno ve Webero Studio.",
        links: [
          { label: "Domů", href: "/" },
          { label: "Kontakt", href: "#kontakt" },
        ],
      },
    },
  ],

  demoContent: {
    siteName: "Můj nový web",
    seo: {
      title: "Můj nový web",
      description: "Nový web postavený od nuly ve Webero Studio.",
    },
  },
};
