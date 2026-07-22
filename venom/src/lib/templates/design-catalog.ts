import catalogManifest from "@/generated/design-catalog.json";
import { query } from "@/lib/db";
import { CATEGORIES, categoryForSlug } from "./design-categories";

/* Kategorie žijí v klient-safe modulu (onboarding picker je klientská komponenta). */
export { CATEGORIES, categoryForSlug };
export type { DesignCategory } from "./design-categories";

/** Shared template-catalog discovery — used by /vybrat-design (choose-design)
 *  and the homepage templates gallery so both show the same complete set. */

export const INDUSTRY_LABEL: Record<string, string> = {
  harmonie: "Wellness", arbo: "Arboristika", arch: "Architekti",
  autoservis: "Autoservis", autoskola: "Autoškoly", bakery: "Pekárny",
  barber: "Barbershop", beauty: "Kosmetika", cafe: "Kavárny",
  catering: "Catering", chalet: "Chalupy", clean: "Úklid",
  clinic: "Kliniky", ddd: "DDD služby", dental: "Stomatologie",
  dj: "DJ", edu: "Vzdělávání", elektro: "Elektrikáři",
  events: "Eventy", fitness: "Fitness", floors: "Podlahy",
  florist: "Květinářství", fyzio: "Fyzioterapie", garden: "Zahrady",
  grooming: "Grooming", hair: "Holičství", hotel: "Hotely",
  instala: "Instalatéři", kids: "Dětské služby", klempir: "Klempíři",
  klima: "Klimatizace", lang: "Jazykové školy", lawyer: "Advokáti",
  legal: "Právní služby", malir: "Malíři", massage: "Masáže",
  nails: "Nehtové studio", ortho: "Ortodoncie", "peak-cut": "Barbershop",
  pethotel: "Pet hotely", photo: "Fotografové", reality: "Reality",
  restaurant: "Restaurace", solar: "Fotovoltaika", stavba: "Stavba",
  sweet: "Cukrárny", tattoo: "Tetování", ucetni: "Účetnictví",
  vet: "Veterináři", video: "Videoprodukce", lifestyle: "Lifestyle",
  eshop: "E-shop", tawan: "Masáže", rekonstrukce: "Rekonstrukce",
};

/** English labels for the Czech industry names above (card captions on /en). */
export const INDUSTRY_LABEL_EN: Record<string, string> = {
  "Wellness": "Wellness", "Arboristika": "Arboriculture", "Architekti": "Architects",
  "Autoservis": "Car service", "Autoškoly": "Driving schools", "Pekárny": "Bakeries",
  "Barbershop": "Barbershop", "Kosmetika": "Beauty", "Kavárny": "Cafés",
  "Catering": "Catering", "Chalupy": "Mountain cottages", "Úklid": "Cleaning",
  "Kliniky": "Clinics", "DDD služby": "Pest control", "Stomatologie": "Dental",
  "DJ": "DJ", "Vzdělávání": "Education", "Elektrikáři": "Electricians",
  "Eventy": "Events", "Fitness": "Fitness", "Podlahy": "Flooring",
  "Květinářství": "Florists", "Fyzioterapie": "Physiotherapy", "Zahrady": "Gardens",
  "Grooming": "Pet grooming", "Holičství": "Hair salons", "Hotely": "Hotels",
  "Instalatéři": "Plumbers", "Dětské služby": "Kids & family", "Klempíři": "Tinsmiths",
  "Klimatizace": "Air conditioning", "Jazykové školy": "Language schools", "Advokáti": "Lawyers",
  "Právní služby": "Legal services", "Malíři": "Painters", "Masáže": "Massage",
  "Nehtové studio": "Nail studio", "Ortodoncie": "Orthodontics", "Pet hotely": "Pet hotels",
  "Fotografové": "Photographers", "Reality": "Real estate", "Restaurace": "Restaurants",
  "Fotovoltaika": "Solar", "Stavba": "Construction", "Cukrárny": "Confectioneries",
  "Tetování": "Tattoo", "Účetnictví": "Accounting", "Veterináři": "Veterinarians",
  "Videoprodukce": "Video production", "Lifestyle": "Lifestyle", "E-shop": "E-shop",
  "Rekonstrukce": "Renovations", "Šablona": "Template",
};

/* Display name: manifest name without the internal "Demo " prefix / parentheticals. */
const NAME_OVERRIDES: Record<string, string> = {
  "peak-cut": "Peak Cut",
  "barber-01": "Dark Luxury",
};

export function displayName(key: string, manifestName: string): string {
  if (NAME_OVERRIDES[key]) return NAME_OVERRIDES[key];
  return manifestName.replace(/^Demo\s+/i, "").replace(/\s*\([^)]*\)\s*$/, "").trim();
}

export function industryFromSlug(slug: string): string {
  if (slug.startsWith("peak-cut")) return INDUSTRY_LABEL["peak-cut"];
  const base = slug.split("-")[0];
  return INDUSTRY_LABEL[base] || "Šablona";
}

export function prettyName(slug: string): string {
  return slug.replace(/(\w+)-(\d+)/, "$1 — $2").replace(/-/g, " ");
}

export interface DesignCatalogItem {
  slug: string;
  name: string;
  industry: string;
  preview: string;
  demoSlug: string | null;
}

export async function getDesignTemplates(): Promise<DesignCatalogItem[]> {
  // Generated before the Next.js build while src/ and public/ are both
  // available. Public assets are not a browsable filesystem in Vercel's
  // request-time server function.
  const keys = catalogManifest.map((template) => template.slug);

  let demoByKey: Map<string, string | null> = new Map();
  try {
    const rows = await query<{ key: string; demo: string | null }>(
      `SELECT tpl.key,
         COALESCE(
           (SELECT t.slug FROM tenants t WHERE t.slug = tpl.primary_demo_slug LIMIT 1),
           (SELECT t.slug FROM tenants t
             WHERE t.template_id = tpl.id
               AND EXISTS (SELECT 1 FROM sections s WHERE s.tenant_id = t.id AND s.content_source = 'v2')
             ORDER BY t.id LIMIT 1)
         ) AS demo
       FROM templates tpl WHERE tpl.key = ANY($1::text[])`,
      [keys]
    );
    demoByKey = new Map(rows.map((r) => [r.key, r.demo]));
  } catch {}

  return catalogManifest.map(({ slug, manifestName, preview }) => ({
    slug,
    name: manifestName ? displayName(slug, manifestName) : prettyName(slug),
    industry: industryFromSlug(slug),
    preview,
    demoSlug: demoByKey.get(slug) ?? null,
  }));
}
