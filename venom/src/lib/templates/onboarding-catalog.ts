export interface OnboardingFeaturedTemplate {
  key: string;
  demoSlug: string;
  previewImage: string;
}

/** Všech 20 e-shopů = first-class onboarding kategorie, bez ohledu na review stav.
 *  Preview = reálný full-page screenshot demo tenanta
 *  (scripts/_shot-onboarding-eshops.mjs → public/templates/eshop-NN/showcase/onboarding-desktop.jpg). */
export const ONBOARDING_ESHOPS: readonly OnboardingFeaturedTemplate[] = Array.from(
  { length: 20 },
  (_, i) => {
    const nn = String(i + 1).padStart(2, "0");
    return {
      key: `eshop-${nn}`,
      demoSlug: `eshop-${nn}-v2`,
      previewImage: `/templates/eshop-${nn}/showcase/onboarding-desktop.jpg`,
    };
  }
);

export const ONBOARDING_ESHOP_KEYS = ONBOARDING_ESHOPS.map((template) => template.key);

export function getOnboardingEshop(templateKey: string): OnboardingFeaturedTemplate | undefined {
  return ONBOARDING_ESHOPS.find((template) => template.key === templateKey);
}
