import { TemplateDefinition } from "./types";
import { asteraSiteContent } from "./astera-content";

/**
 * Astera Light — private, full-site 1:1 template backed by the isolated astera
 * module (`@/astera/*`). Not listed in the public design catalog; provisioned
 * directly. A single `astera-site` section carries the whole multi-language
 * site content ({ cs, en, ua }); AsteraSiteTemplate renders home + subpages.
 */
export const asteralightTemplate: TemplateDefinition = {
  key: "asteralight",
  name: "Astera Light",
  industry: "consulting",
  version: "1.0.0",

  designTokens: {
    colorPrimary: "#7c3bb2",
    colorSecondary: "#5f2a8d",
    colorBackground: "#ffffff",
    colorSurface: "#f9f7f7",
    colorText: "#1f1f1f",
    colorTextMuted: "#2d2530",
    colorAccent: "#7c3bb2",
    colorBorder: "#dde5f0",
    fontHeading: "Playfair Display, serif",
    fontBody: "Poppins, sans-serif",
    borderRadius: "12px",
    spacing: "normal",
  },

  defaultSections: [
    { type: "astera-site", variant: "astera-web", order: 0, visible: true },
  ],

  demoContent: {
    siteName: "Astera Light",
    tagline: "Výklad karet, očista prostoru a intuitivní vedení",
    description: asteraSiteContent.cs.siteSettings.metaDescription,
    seo: {
      title: asteraSiteContent.cs.siteSettings.metaTitle,
      description: asteraSiteContent.cs.siteSettings.metaDescription,
      localBusiness: {
        type: "ProfessionalService",
        city: "Praha",
        region: "Hlavní město Praha",
      },
    },
    // Consumed by tenant-factory: becomes section.settings.content for astera-site.
    "astera-site": asteraSiteContent,
  },
};
