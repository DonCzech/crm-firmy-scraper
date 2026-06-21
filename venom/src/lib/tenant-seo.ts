/**
 * F3 — Centralizovaný builder pro per-tenant SEO metadata + structured data.
 *
 * Volá se z generateMetadata() v tenant page routes. Sloučí:
 *   - tenant data slots (brand.name, contact.phone, contact.email, contact.address)
 *   - page.seo_title / seo_description / og_image
 *   - tenant.industry → schema.org type
 *
 * Output je hotová `Metadata` pro Next.js + JSON-LD string pro <script>.
 */
import type { Metadata } from "next";
import type { Tenant } from "./db";
import { getTenantDataSlotsCached } from "./section-resolver";
import { buildLocalBusiness, buildOrganization } from "./schema-org";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://webero.co";

const INDUSTRY_SCHEMA_TYPE: Record<string, string> = {
  bakery: "Bakery",
  cafe: "CafeOrCoffeeShop",
  restaurant: "Restaurant",
  barber: "HairSalon",
  hairdresser: "HairSalon",
  beauty: "BeautySalon",
  nails: "BeautySalon",
  wellness: "HealthAndBeautyBusiness",
  fitness: "ExerciseGym",
  physio: "PhysicalTherapy",
  dentist: "Dentist",
  lawyer: "LegalService",
  realEstate: "RealEstateAgent",
  auto: "AutoRepair",
  cleaning: "HouseCleaningService",
  construction: "GeneralContractor",
  florist: "Florist",
  catering: "FoodEstablishment",
  hotel: "Hotel",
  events: "EventPlanner",
  tattoo: "TattooParlor",
  veterinary: "VeterinaryCare",
  accounting: "AccountingService",
  finance: "FinancialService",
  architecture: "Architect",
  solar: "Electrician",
  photographer: "Photograph",
  dj: "MusicGroup",
  education: "EducationalOrganization",
  pets: "PetStore",
  default: "LocalBusiness",
};

export interface TenantPageSEO {
  page?: {
    seo_title?: string | null;
    seo_description?: string | null;
    og_image?: string | null;
    noindex?: boolean | null;
  };
  pathname?: string; // např. "" pro root, "/blog/foo" pro blog
}

export interface TenantSEOResult {
  metadata: Metadata;
  /** JSON-LD string vhodný pro `<script type="application/ld+json">{ . }</script>`. */
  jsonLd: string;
}

export async function buildTenantSEO(tenant: Tenant, opts: TenantPageSEO = {}): Promise<TenantSEOResult> {
  const slots = await getTenantDataSlotsCached(tenant.id);
  const name      = (slots.get("brand.name") as string)   ?? tenant.slug;
  const phone     = slots.get("contact.phone")  as string | undefined;
  const email     = slots.get("contact.email")  as string | undefined;
  const address   = slots.get("contact.address") as string | undefined;
  const city      = slots.get("contact.city")    as string | undefined;
  const zip       = slots.get("contact.zip")     as string | undefined;
  const logo      = (slots.get("brand.logoUrl") as string | undefined);
  const tagline   = (slots.get("brand.tagline") as string | undefined);
  const seoTitleSlot = slots.get("seo.defaultTitle") as string | undefined;
  const seoDescSlot  = slots.get("seo.defaultDescription") as string | undefined;
  const ogImageSlot  = slots.get("seo.ogImage") as string | undefined;
  const social: string[] = [];
  for (const k of ["social.facebook","social.instagram","social.linkedin","social.youtube","social.tiktok"]) {
    const v = slots.get(k) as string | undefined;
    if (v) social.push(v);
  }

  const path = opts.pathname ?? "";
  const canonical = `${BASE_URL}/demo/${tenant.slug}${path}`;

  const title = opts.page?.seo_title || seoTitleSlot || `${name}${tagline ? ` — ${tagline}` : ""}`;
  const description = opts.page?.seo_description || seoDescSlot || tagline || undefined;
  const ogImage = opts.page?.og_image || ogImageSlot || `/demo/${tenant.slug}/opengraph-image`;
  const noindex = opts.page?.noindex === true || tenant.status === "demo";

  const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    alternates: { canonical },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: name,
      locale: "cs_CZ",
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    other: phone ? { "telephone": phone } : undefined,
  };

  const schemaType = INDUSTRY_SCHEMA_TYPE[tenant.industry] ?? INDUSTRY_SCHEMA_TYPE.default;

  let structured: Record<string, unknown>;
  if (schemaType === "Organization") {
    structured = buildOrganization({ name, url: canonical, logoUrl: logo, sameAs: social, description });
  } else {
    const lb = buildLocalBusiness({
      name,
      url: canonical,
      schemaType,
      phone,
      email,
      address: address ? { street: address, city, postalCode: zip, country: "CZ" } : undefined,
      image: logo,
      description,
    });
    structured = social.length ? { ...lb, sameAs: social } : lb;
  }

  return { metadata, jsonLd: JSON.stringify(structured) };
}
