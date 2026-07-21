import { INVESTICE, PRODEJ, PRONAJEM, type Listing } from "./listings";

const TITLES: Record<string, string> = {
  p1: "Villa with a pool and winter garden",
  p2: "Terrace apartment overlooking Prague Castle",
  p3: "Family home with a garden beside the woods",
  p4: "Attic loft in an Art Nouveau building",
  p5: "Renovated interwar villa",
  p6: "Designer apartment with a loggia and garage",
  p7: "Contemporary new-build overlooking the valley",
  p8: "Mountain residence with a private spa",
  p9: "Duplex with a studio and roof terrace",
  p10: "Villa with a wine cellar and olive trees",
  n1: "Furnished apartment overlooking the Vltava",
  n2: "Serviced residence with reception and fitness suite",
  n3: "Family villa with a garden and double garage",
  n4: "Bright, newly renovated apartment",
  n5: "Loft offices in a converted industrial building",
  n6: "Duplex with a terrace and parking",
  n7: "New-build apartment with a balcony",
  n8: "Executive office with panoramic views",
  i1: "Income property with 12 apartments",
  i2: "Office building with long-term tenants",
  i3: "Fully refurbished apartment building",
  i4: "Mixed-use building with ground-floor retail",
  i5: "Development site with valid planning permission",
  i6: "Portfolio of rental apartments",
};

const LOCATIONS: Record<string, string> = {
  p3: "Prague-West — Jinočany",
  p5: "Brno — Masaryk Quarter",
  n1: "Prague 1 — New Town",
  i4: "Plzeň — city centre",
};

const TAGS: Record<string, Listing["tag"]> = {
  Novinka: "Novinka",
  Rezervováno: "Rezervováno",
  Exkluzivně: "Exkluzivně",
};

export function toEnglishListing(listing: Listing): Listing {
  return {
    ...listing,
    title: TITLES[listing.id] ?? listing.title,
    location: LOCATIONS[listing.id] ?? listing.location.replace(/^Praha/, "Prague"),
    priceSuffix: listing.priceSuffix ? "/ month" : undefined,
    tag: listing.tag ? TAGS[listing.tag] ?? listing.tag : undefined,
  };
}

export const SALE_EN = PRODEJ.map(toEnglishListing);
export const RENT_EN = PRONAJEM.map(toEnglishListing);
export const INVESTMENT_EN = INVESTICE.map(toEnglishListing);
export const FEATURED_EN = [
  SALE_EN[0],
  SALE_EN[1],
  RENT_EN[2],
  SALE_EN[7],
  INVESTMENT_EN[0],
  SALE_EN[3],
  RENT_EN[0],
  SALE_EN[4],
];
