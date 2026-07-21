export type ListingKind = "byt" | "dum" | "pozemek" | "komercni";

export type Listing = {
  id: string;
  title: string;
  location: string;
  disposition?: string;
  area: number;
  price: number;
  priceSuffix?: string;
  image: string;
  /** Další fotografie — pro řádkové zobrazení výpisu */
  images?: string[];
  /** Krátký popis — pro řádkové zobrazení výpisu */
  description?: string;
  tag?: "Novinka" | "Rezervováno" | "Exkluzivně" | "Prodáno" | "Pronajato";
  /** Výnos p.a. — jen investiční nemovitosti */
  yieldPa?: string;
  kind: ListingKind;
  /** GPS — pro zobrazení na mapě výsledků */
  lat?: number;
  lng?: number;
};

export const KIND_LABELS: Record<ListingKind, string> = {
  byt: "Byty",
  dum: "Rodinné domy a vily",
  pozemek: "Pozemky",
  komercni: "Komerční prostory",
};

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`;

export function formatPrice(listing: Listing, locale: "cs" | "en" = "cs"): string {
  const value = listing.price.toLocaleString(locale === "en" ? "en-GB" : "cs-CZ");
  return listing.priceSuffix ? `${value} Kč ${listing.priceSuffix}` : `${value} Kč`;
}

export const PRODEJ: Listing[] = [
  {
    id: "p1",
    kind: "dum",
    title: "Vila s bazénem a zimní zahradou",
    location: "Praha 6 — Nebušice",
    disposition: "6+kk",
    area: 412,
    price: 54_900_000,
    image: img("1613490493576-7fde63acd811"),
    tag: "Exkluzivně",
  },
  {
    id: "p2",
    kind: "byt",
    title: "Byt s terasou a výhledem na Hradčany",
    location: "Praha 1 — Malá Strana",
    disposition: "4+kk",
    area: 168,
    price: 32_500_000,
    image: img("1600607687939-ce8a6c25118c"),
    tag: "Novinka",
  },
  {
    id: "p3",
    kind: "dum",
    title: "Rodinný dům se zahradou u lesa",
    location: "Praha-západ — Jinočany",
    disposition: "5+kk",
    area: 246,
    price: 24_900_000,
    image: img("1600585154340-be6161a56a0c"),
  },
  {
    id: "p4",
    kind: "byt",
    title: "Podkrovní loft v secesním domě",
    location: "Praha 2 — Vinohrady",
    disposition: "3+kk",
    area: 124,
    price: 18_700_000,
    image: img("1522708323590-d24dbb6b0267"),
    tag: "Novinka",
  },
  {
    id: "p5",
    kind: "dum",
    title: "Prvorepubliková vila po renovaci",
    location: "Brno — Masarykova čtvrť",
    disposition: "7+1",
    area: 385,
    price: 42_800_000,
    image: img("1600585152220-90363fe7e115"),
  },
  {
    id: "p6",
    kind: "byt",
    title: "Designový byt s lodžií a garáží",
    location: "Praha 7 — Holešovice",
    disposition: "2+kk",
    area: 78,
    price: 11_400_000,
    image: img("1600210492486-724fe5c67fb0"),
    tag: "Rezervováno",
  },
  {
    id: "p7",
    kind: "dum",
    title: "Moderní novostavba s výhledem do údolí",
    location: "Praha 5 — Košíře",
    disposition: "5+kk",
    area: 291,
    price: 38_900_000,
    image: img("1600566753190-17f0baa2a6c3"),
  },
  {
    id: "p8",
    kind: "dum",
    title: "Horská rezidence s wellness",
    location: "Špindlerův Mlýn",
    disposition: "4+kk",
    area: 205,
    price: 29_900_000,
    image: img("1449844908441-8829872d2607"),
    tag: "Exkluzivně",
  },
  {
    id: "p9",
    kind: "byt",
    title: "Mezonet s ateliérem a střešní terasou",
    location: "Praha 3 — Žižkov",
    disposition: "4+1",
    area: 152,
    price: 16_900_000,
    image: img("1560448204-e02f11c3d0e2"),
  },
  {
    id: "p10",
    kind: "dum",
    title: "Vila s vinným sklepem a olivovníky",
    location: "Mikulov",
    disposition: "6+1",
    area: 340,
    price: 27_500_000,
    image: img("1600596542815-ffad4c1539a9"),
  },
];

export const PRONAJEM: Listing[] = [
  {
    id: "n1",
    kind: "byt",
    title: "Zařízený byt s výhledem na Vltavu",
    location: "Praha 1 — Nové Město",
    disposition: "3+kk",
    area: 118,
    price: 65_000,
    priceSuffix: "/ měsíc",
    image: img("1502672260266-1c1ef2d93688"),
    tag: "Novinka",
  },
  {
    id: "n2",
    kind: "byt",
    title: "Rezidenční bydlení s recepcí a fitness",
    location: "Praha 8 — Karlín",
    disposition: "2+kk",
    area: 74,
    price: 38_000,
    priceSuffix: "/ měsíc",
    image: img("1560185007-cde436f6a4d0"),
  },
  {
    id: "n3",
    kind: "dum",
    title: "Rodinná vila se zahradou a dvojgaráží",
    location: "Praha 6 — Hanspaulka",
    disposition: "5+1",
    area: 260,
    price: 120_000,
    priceSuffix: "/ měsíc",
    image: img("1580587771525-78b9dba3b914"),
    tag: "Exkluzivně",
  },
  {
    id: "n4",
    kind: "byt",
    title: "Slunný byt po rekonstrukci",
    location: "Praha 2 — Vinohrady",
    disposition: "2+1",
    area: 82,
    price: 34_500,
    priceSuffix: "/ měsíc",
    image: img("1554995207-c18c203602cb"),
  },
  {
    id: "n5",
    kind: "komercni",
    title: "Loftové kanceláře v industriální budově",
    location: "Praha 7 — Holešovice",
    area: 420,
    price: 185_000,
    priceSuffix: "/ měsíc",
    image: img("1497366754035-f200968a6e72"),
  },
  {
    id: "n6",
    kind: "byt",
    title: "Mezonet s terasou a parkováním",
    location: "Brno — Trnitá",
    disposition: "4+kk",
    area: 140,
    price: 52_000,
    priceSuffix: "/ měsíc",
    image: img("1560185127-6ed189bf02f4"),
    tag: "Novinka",
  },
  {
    id: "n7",
    kind: "byt",
    title: "Byt v novostavbě s balkonem",
    location: "Praha 9 — Vysočany",
    disposition: "1+kk",
    area: 44,
    price: 22_500,
    priceSuffix: "/ měsíc",
    image: img("1512918728675-ed5a9ecdebfd"),
  },
  {
    id: "n8",
    kind: "komercni",
    title: "Reprezentativní kancelář s výhledem",
    location: "Praha 4 — Pankrác",
    area: 310,
    price: 145_000,
    priceSuffix: "/ měsíc",
    image: img("1556912173-3bb406ef7e77"),
    tag: "Rezervováno",
  },
];

export const INVESTICE: Listing[] = [
  {
    id: "i1",
    kind: "komercni",
    title: "Činžovní dům s 12 jednotkami",
    location: "Praha 2 — Vinohrady",
    area: 1_420,
    price: 168_000_000,
    image: img("1541849546-216549ae216d"),
    yieldPa: "4,8 % p.a.",
    tag: "Exkluzivně",
  },
  {
    id: "i2",
    kind: "komercni",
    title: "Administrativní budova s dlouhodobými nájmy",
    location: "Praha 4 — Michle",
    area: 2_150,
    price: 142_500_000,
    image: img("1464938050520-ef2270bb8ce8"),
    yieldPa: "5,6 % p.a.",
  },
  {
    id: "i3",
    kind: "komercni",
    title: "Bytový dům po kompletní revitalizaci",
    location: "Brno — Veveří",
    area: 980,
    price: 89_000_000,
    image: img("1545324418-cc1a3fa10c00"),
    yieldPa: "5,1 % p.a.",
    tag: "Novinka",
  },
  {
    id: "i4",
    kind: "komercni",
    title: "Polyfunkční dům s retailem v parteru",
    location: "Plzeň — centrum",
    area: 1_260,
    price: 74_500_000,
    image: img("1479839672679-a46483c0e7c8"),
    yieldPa: "6,2 % p.a.",
  },
  {
    id: "i5",
    kind: "pozemek",
    title: "Developerský pozemek s platným ÚR",
    location: "Praha 10 — Strašnice",
    area: 4_800,
    price: 96_000_000,
    image: img("1500382017468-9049fed747ef"),
  },
  {
    id: "i6",
    kind: "komercni",
    title: "Soubor bytových jednotek k pronájmu",
    location: "Ostrava — Poruba",
    area: 1_650,
    price: 58_900_000,
    image: img("1460317442991-0ec209397118"),
    yieldPa: "7,1 % p.a.",
  },
];

/** Kurátorský výběr pro úvodní slider */
export const VYBRANE: Listing[] = [
  PRODEJ[0],
  PRODEJ[1],
  PRONAJEM[2],
  PRODEJ[7],
  INVESTICE[0],
  PRODEJ[3],
  PRONAJEM[0],
  PRODEJ[4],
];
