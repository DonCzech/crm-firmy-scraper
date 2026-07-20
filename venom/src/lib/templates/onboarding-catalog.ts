export interface OnboardingFeaturedTemplate {
  key: string;
  demoSlug: string;
  previewImage: string;
}

/** E-shops are a first-class onboarding category, regardless of review order. */
export const ONBOARDING_ESHOPS: readonly OnboardingFeaturedTemplate[] = [
  {
    key: "eshop-01",
    demoSlug: "eshop-01-v2",
    previewImage: "/templates/eshop-01/showcase/desktop-full.png",
  },
  {
    key: "eshop-02",
    demoSlug: "eshop-02-v2",
    previewImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop&auto=format&q=82",
  },
  {
    key: "eshop-03",
    demoSlug: "eshop-03-v2",
    previewImage: "/templates/eshop-03/hero-elektronika.webp",
  },
  {
    key: "eshop-04",
    demoSlug: "eshop-04-v2",
    previewImage: "/templates/eshop-04/hero-moda.webp",
  },
  {
    key: "eshop-05",
    demoSlug: "eshop-05-v2",
    previewImage: "https://images.unsplash.com/photo-1560961911-ba7ef651a56c?w=1200&h=800&fit=crop&auto=format&q=82",
  },
  {
    key: "eshop-06",
    demoSlug: "eshop-06-v2",
    previewImage: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=1200&h=800&fit=crop&auto=format&q=82",
  },
  {
    key: "eshop-08",
    demoSlug: "eshop-08-v2",
    previewImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=800&fit=crop&auto=format&q=82",
  },
  {
    key: "eshop-09",
    demoSlug: "eshop-09-v2",
    previewImage: "/templates/eshop-09/showcase/desktop-hero.webp",
  },
  {
    key: "eshop-10",
    demoSlug: "eshop-10-v2",
    previewImage: "/templates/eshop-10/showcase/desktop-hero.webp",
  },
  {
    key: "eshop-11",
    demoSlug: "eshop-11-v2",
    previewImage: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&h=800&fit=crop&auto=format&q=82",
  },
  {
    key: "eshop-12",
    demoSlug: "eshop-12-v2",
    previewImage: "/templates/eshop-12/showcase/desktop-hero.webp",
  },
  {
    key: "eshop-13",
    demoSlug: "eshop-13-v2",
    previewImage: "/templates/eshop-13/showcase/desktop-hero.webp",
  },
  {
    key: "eshop-14",
    demoSlug: "eshop-14-v2",
    previewImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop&auto=format&q=82",
  },
];

export const ONBOARDING_ESHOP_KEYS = ONBOARDING_ESHOPS.map((template) => template.key);

export function getOnboardingEshop(templateKey: string): OnboardingFeaturedTemplate | undefined {
  return ONBOARDING_ESHOPS.find((template) => template.key === templateKey);
}
