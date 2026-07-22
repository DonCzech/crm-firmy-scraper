/** Široké kategorie šablon — sdílené mezi /vybrat-design, homepage galerií
 *  a onboarding pickerem. Klient-safe: žádný import DB, aby se do klientského
 *  bundlu netahal `pg` (design-catalog.ts je serverový). */

export interface DesignCategory {
  label: string;
  labelEn: string;
  prefixes: string[];
}

export const CATEGORIES: DesignCategory[] = [
  { label: "Vše",          labelEn: "All",           prefixes: [] },
  { label: "Krása & péče", labelEn: "Beauty & care", prefixes: ["barber", "beauty", "nails", "hair", "tattoo", "massage", "thaimasaze", "tawan", "grooming", "peak-cut"] },
  { label: "Zdraví",       labelEn: "Health",        prefixes: ["clinic", "dental", "ortho", "vet", "fyzio", "fitness", "harmonie"] },
  { label: "Gastronomie",  labelEn: "Gastronomy",    prefixes: ["restaurant", "cafe", "bakery", "sweet", "catering"] },
  { label: "Ubytování",    labelEn: "Accommodation", prefixes: ["hotel", "chalet"] },
  { label: "Reality",      labelEn: "Real estate",   prefixes: ["reality"] },
  { label: "Řemesla",      labelEn: "Trades",        prefixes: ["stavba", "rekonstrukce", "elektro", "instala", "malir", "klempir", "klima", "floors", "solar", "autoservis"] },
  { label: "Služby",       labelEn: "Services",      prefixes: ["ucetni", "lawyer", "legal", "autoskola", "lang", "kids", "edu", "clean", "ddd", "arbo", "florist", "garden", "pethotel"] },
  { label: "Kreativní",    labelEn: "Creative",      prefixes: ["photo", "video", "dj", "events", "arch"] },
  { label: "E-shopy",      labelEn: "E-shops",       prefixes: ["eshop"] },
];

export function categoryForSlug(slug: string): DesignCategory | null {
  return CATEGORIES.find(
    (c) => c.prefixes.length > 0 && c.prefixes.some((p) => slug === p || slug.startsWith(`${p}-`) || slug.startsWith(`${p}0`))
  ) ?? null;
}
