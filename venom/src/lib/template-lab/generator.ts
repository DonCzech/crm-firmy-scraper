import type { AnalysisResult } from "./analyzer";
import type { TemplateDefinition, SectionConfig } from "../templates/types";

export interface GeneratedTemplate {
  slug: string;
  name: string;
  industry: string;
  sourceUrl: string;
  definition: TemplateDefinition;
  editableSchema: EditableSchema;
  pagesData: GeneratedPage[];
  generatedAt: string;
}

export interface EditableField {
  id: string;
  type:
    | "text"
    | "richtext"
    | "image"
    | "link"
    | "button"
    | "color"
    | "gallery"
    | "pricing"
    | "services"
    | "reviews"
    | "contact"
    | "section-visibility"
    | "repeater";
  label: string;
  defaultValue: unknown;
}

export interface EditableSchema {
  fields: EditableField[];
  sections: Record<string, EditableField[]>;
}

export interface GeneratedPage {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  isHomepage: boolean;
  sections: GeneratedSection[];
}

export interface GeneratedSection {
  type: string;
  variant: string;
  order: number;
  visible: boolean;
  settings: Record<string, unknown>;
  editableIds: string[];
}

const INDUSTRY_NAMES: Record<string, string> = {
  barber: "Barber & Hair Studio",
  hairdresser: "Kadeřnický salón",
  wellness: "Wellness & Spa",
  tattoo: "Tetovací Studio",
  fitness: "Fitness & Gym",
  cosmetics: "Kosmetický Salón",
  nails: "Nehtové Studio",
  physiotherapy: "Fyzioterapie",
  restaurant: "Restaurace",
  cafe: "Kavárna",
  realEstate: "Realitní Kancelář",
  autoService: "Autoservis",
  dentist: "Zubní Ordinace",
  lawyer: "Advokátní Kancelář",
  craftsman: "Řemeslník",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildSectionsFromAnalysis(analysis: AnalysisResult): GeneratedSection[] {
  const homePage = analysis.pages[0];
  if (!homePage) return getDefaultSections(analysis.industry);

  const sections: GeneratedSection[] = [];
  let order = 0;

  // Always start with navbar
  sections.push({
    type: "navbar",
    variant: "default",
    order: order++,
    visible: true,
    settings: {
      logo: analysis.siteName,
      links: analysis.navigation.slice(0, 6).map((label) => ({
        label,
        href: `#${slugify(label)}`,
      })),
      cta: {
        text: analysis.booking ? "Rezervovat" : "Kontakt",
        href: analysis.booking ? "#rezervace" : "#kontakt",
      },
      designTokens: analysis.designTokens,
    },
    editableIds: ["navbar.logo", "navbar.links", "navbar.cta"],
  });

  // Hero section
  const heroSection = homePage.sections.find((s) => s.type === "hero");
  sections.push({
    type: "hero",
    variant: "default",
    order: order++,
    visible: true,
    settings: {
      title: heroSection?.content?.headline || analysis.siteName,
      subtitle:
        heroSection?.content?.subheadline || analysis.description || "Profesionální služby pro vás",
      cta: {
        primary: {
          text: analysis.booking ? "Rezervovat online" : "Kontaktujte nás",
          href: analysis.booking ? "#rezervace" : "#kontakt",
        },
        secondary: {
          text: "Více o nás",
          href: "#o-nas",
        },
      },
      backgroundImage: "",
      overlay: true,
      designTokens: analysis.designTokens,
    },
    editableIds: ["hero.title", "hero.subtitle", "hero.cta.primary", "hero.cta.secondary", "hero.backgroundImage"],
  });

  // Services section
  if (analysis.services.length > 0 || homePage.sections.some((s) => s.type === "services")) {
    sections.push({
      type: "services",
      variant: "grid",
      order: order++,
      visible: true,
      settings: {
        title: "Naše Služby",
        subtitle: "Vše, co potřebujete",
        items: analysis.services.slice(0, 6).map((name, i) => ({
          id: `service-${i}`,
          title: name,
          description: "Profesionální služba na nejvyšší úrovni.",
          icon: "star",
          price: "",
        })),
        designTokens: analysis.designTokens,
      },
      editableIds: ["services.title", "services.subtitle", "services.items"],
    });
  }

  // Pricing
  if (analysis.pricing) {
    sections.push({
      type: "pricing",
      variant: "table",
      order: order++,
      visible: true,
      settings: {
        title: "Ceník",
        subtitle: "Transparentní ceny bez skrytých poplatků",
        currency: "Kč",
        items: [
          { id: "p1", name: "Základní balíček", price: "500", unit: "od", description: "" },
          { id: "p2", name: "Standardní balíček", price: "1000", unit: "od", description: "" },
          { id: "p3", name: "Premium balíček", price: "1500", unit: "od", description: "" },
        ],
        designTokens: analysis.designTokens,
      },
      editableIds: ["pricing.title", "pricing.items"],
    });
  }

  // Gallery
  if (analysis.gallery) {
    sections.push({
      type: "gallery",
      variant: "masonry",
      order: order++,
      visible: true,
      settings: {
        title: "Galerie",
        subtitle: "Naše práce",
        images: Array.from({ length: 6 }, (_, i) => ({
          id: `img-${i}`,
          src: `/template-lab/placeholders/${analysis.industry}/gallery-${i + 1}.webp`,
          alt: `Ukázka práce ${i + 1}`,
        })),
        designTokens: analysis.designTokens,
      },
      editableIds: ["gallery.title", "gallery.images"],
    });
  }

  // Team
  if (analysis.team) {
    sections.push({
      type: "team",
      variant: "cards",
      order: order++,
      visible: true,
      settings: {
        title: "Náš Tým",
        subtitle: "Profesionálové, kteří se o vás postarají",
        members: [
          {
            id: "m1",
            name: "Jan Novák",
            role: "Hlavní specialista",
            bio: "15 let zkušeností v oboru.",
            photo: `/template-lab/placeholders/${analysis.industry}/team-1.webp`,
          },
          {
            id: "m2",
            name: "Jana Nováková",
            role: "Specialistka",
            bio: "Odbornice s vášní pro svou práci.",
            photo: `/template-lab/placeholders/${analysis.industry}/team-2.webp`,
          },
        ],
        designTokens: analysis.designTokens,
      },
      editableIds: ["team.title", "team.members"],
    });
  }

  // Testimonials
  if (analysis.testimonials) {
    sections.push({
      type: "testimonials",
      variant: "carousel",
      order: order++,
      visible: true,
      settings: {
        title: "Co říkají naši zákazníci",
        subtitle: "",
        reviews: [
          {
            id: "r1",
            author: "Martin K.",
            rating: 5,
            text: "Skvělá práce, profesionální přístup. Vřele doporučuji!",
            date: "2025-01-15",
          },
          {
            id: "r2",
            author: "Petra B.",
            rating: 5,
            text: "Výborná kvalita a příjemné prostředí. Určitě se vrátím.",
            date: "2025-02-20",
          },
          {
            id: "r3",
            author: "Tomáš V.",
            rating: 5,
            text: "Profesionální a rychlý servis. Velmi spokojený zákazník.",
            date: "2025-03-10",
          },
        ],
        designTokens: analysis.designTokens,
      },
      editableIds: ["testimonials.title", "testimonials.reviews"],
    });
  }

  // Opening hours
  if (analysis.openingHours.length > 0) {
    sections.push({
      type: "opening-hours",
      variant: "default",
      order: order++,
      visible: true,
      settings: {
        title: "Otevírací Doba",
        hours: [
          { day: "Pondělí – Pátek", time: "9:00 – 18:00" },
          { day: "Sobota", time: "9:00 – 14:00" },
          { day: "Neděle", time: "Zavřeno" },
        ],
        designTokens: analysis.designTokens,
      },
      editableIds: ["opening-hours.title", "opening-hours.hours"],
    });
  }

  // FAQ
  if (analysis.faq) {
    sections.push({
      type: "faq",
      variant: "accordion",
      order: order++,
      visible: true,
      settings: {
        title: "Časté dotazy",
        items: [
          { q: "Jak si mohu rezervovat termín?", a: "Rezervaci lze provést online přes náš rezervační systém nebo telefonicky." },
          { q: "Jaké jsou platební možnosti?", a: "Přijímáme hotovost i platby kartou." },
          { q: "Kolik času si mám vyhradit?", a: "Záleží na zvoleném typu služby, průměrně 30–90 minut." },
        ],
        designTokens: analysis.designTokens,
      },
      editableIds: ["faq.title", "faq.items"],
    });
  }

  // Contact
  sections.push({
    type: "contact",
    variant: "split",
    order: order++,
    visible: true,
    settings: {
      title: "Kontakt",
      subtitle: "Rádi vás uvítáme",
      phone: analysis.contactInfo.phones[0] || "+420 000 000 000",
      email: analysis.contactInfo.emails[0] || "info@example.cz",
      address: analysis.contactInfo.addresses[0] || "Praha, Česká republika",
      openingHours: analysis.openingHours.slice(0, 3).join(" | ") || "Po–Pá: 9:00–18:00",
      socialLinks: analysis.socialLinks.slice(0, 5),
      form: {
        enabled: true,
        fields: ["name", "email", "phone", "message"],
      },
      map: {
        enabled: analysis.map,
        lat: 50.0755,
        lng: 14.4378,
      },
      designTokens: analysis.designTokens,
    },
    editableIds: [
      "contact.title",
      "contact.phone",
      "contact.email",
      "contact.address",
      "contact.form",
      "contact.map",
    ],
  });

  // Footer
  sections.push({
    type: "footer",
    variant: "default",
    order: order++,
    visible: true,
    settings: {
      logo: analysis.siteName,
      tagline: analysis.description || "Profesionální služby",
      links: analysis.navigation.slice(0, 5).map((label) => ({
        label,
        href: `#${slugify(label)}`,
      })),
      socialLinks: analysis.socialLinks.slice(0, 5),
      copyright: `© ${new Date().getFullYear()} ${analysis.siteName}. Všechna práva vyhrazena.`,
      designTokens: analysis.designTokens,
    },
    editableIds: ["footer.logo", "footer.tagline", "footer.links", "footer.copyright"],
  });

  return sections;
}

function getDefaultSections(industry: string): GeneratedSection[] {
  return [
    {
      type: "navbar",
      variant: "default",
      order: 0,
      visible: true,
      settings: { logo: "Studio", links: [], designTokens: {} },
      editableIds: ["navbar.logo", "navbar.links"],
    },
    {
      type: "hero",
      variant: "default",
      order: 1,
      visible: true,
      settings: { title: "Vítejte", subtitle: "Profesionální služby", designTokens: {} },
      editableIds: ["hero.title", "hero.subtitle"],
    },
    {
      type: "services",
      variant: "grid",
      order: 2,
      visible: true,
      settings: { title: "Naše Služby", items: [], designTokens: {} },
      editableIds: ["services.title", "services.items"],
    },
    {
      type: "contact",
      variant: "split",
      order: 3,
      visible: true,
      settings: { title: "Kontakt", designTokens: {} },
      editableIds: ["contact.title"],
    },
    {
      type: "footer",
      variant: "default",
      order: 4,
      visible: true,
      settings: { logo: "Studio", designTokens: {} },
      editableIds: ["footer.logo"],
    },
  ];
}

function buildEditableSchema(sections: GeneratedSection[]): EditableSchema {
  const allFields: EditableField[] = [];
  const sectionFields: Record<string, EditableField[]> = {};

  for (const section of sections) {
    const fields: EditableField[] = section.editableIds.map((id) => {
      const parts = id.split(".");
      const fieldName = parts.slice(1).join(".");
      let type: EditableField["type"] = "text";

      if (fieldName.includes("image") || fieldName.includes("photo") || fieldName.includes("background")) {
        type = "image";
      } else if (fieldName.includes("items") || fieldName.includes("members") || fieldName.includes("reviews") || fieldName.includes("links") || fieldName.includes("images") || fieldName.includes("hours")) {
        type = "repeater";
      } else if (fieldName === "cta" || fieldName.includes("cta.")) {
        type = "button";
      } else if (fieldName === "form") {
        type = "contact";
      } else if (fieldName.includes("richtext") || fieldName.includes("description")) {
        type = "richtext";
      }

      return {
        id,
        type,
        label: id,
        defaultValue: null,
      };
    });

    sectionFields[section.type] = fields;
    allFields.push(...fields);
  }

  return { fields: allFields, sections: sectionFields };
}

export function generateTemplate(analysis: AnalysisResult): GeneratedTemplate {
  const domain = analysis.domain.replace(/^www\./, "");
  const domainSlug = slugify(domain.split(".")[0]);
  const templateSlug = `${analysis.industry}-${domainSlug}`;
  const templateName = `${INDUSTRY_NAMES[analysis.industry] || analysis.industry} — ${analysis.siteName}`;

  const sections = buildSectionsFromAnalysis(analysis);
  const editableSchema = buildEditableSchema(sections);

  const defaultSections: SectionConfig[] = sections.map((s) => ({
    type: s.type,
    variant: s.variant,
    order: s.order,
    visible: s.visible,
  }));

  const demoContent: Record<string, unknown> = {};
  for (const section of sections) {
    demoContent[section.type] = section.settings;
  }

  const definition: TemplateDefinition = {
    key: templateSlug,
    name: templateName,
    industry: analysis.industry,
    version: "1.0.0",
    designTokens: analysis.designTokens,
    defaultSections,
    pages: [
      {
        slug: "home",
        title: "Domů",
        seoTitle: analysis.seo.title || templateName,
        seoDescription: analysis.seo.description || analysis.description,
        sections: sections.map((s) => ({
          type: s.type,
          variant: s.variant,
          order: s.order,
          visible: s.visible,
          content: s.settings,
        })),
      },
    ],
    demoContent,
  };

  const pagesData: GeneratedPage[] = [
    {
      slug: "home",
      title: "Domů",
      seoTitle: analysis.seo.title || templateName,
      seoDescription: analysis.seo.description || analysis.description,
      isHomepage: true,
      sections,
    },
  ];

  // Add subpages based on what was found
  if (analysis.pages.length > 1) {
    for (const page of analysis.pages.slice(1)) {
      const slug = slugify(page.title || page.url) || `page-${pagesData.length}`;
      pagesData.push({
        slug,
        title: page.title,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        isHomepage: false,
        sections: page.sections.map((s, i) => ({
          type: s.type,
          variant: "default",
          order: i,
          visible: true,
          settings: { designTokens: analysis.designTokens, ...s.content },
          editableIds: [`${s.type}.title`, `${s.type}.content`],
        })),
      });
    }
  }

  return {
    slug: templateSlug,
    name: templateName,
    industry: analysis.industry,
    sourceUrl: analysis.url,
    definition,
    editableSchema,
    pagesData,
    generatedAt: new Date().toISOString(),
  };
}
