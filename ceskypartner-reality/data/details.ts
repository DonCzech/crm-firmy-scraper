import { INVESTICE, PRODEJ, PRONAJEM, type Listing } from "./listings";

export type Agent = {
  name: string;
  role: string;
  phone: string;
  email: string;
  photo: string;
};

export type ListingDetail = {
  listing: Listing;
  /** Prodej / Pronájem / Investiční příležitost */
  dealType: string;
  refNumber: string;
  gallery: string[];
  description: string[];
  amenities: string[];
  /** Řádky přehledové tabulky: [label, value] */
  overview: [string, string][];
  coords: [number, number];
  locationText: string;
  agent: Agent;
  similar: Listing[];
  /** URL 3D prohlídky (CubiCasa / VisitHome) */
  tourUrl?: string;
};

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

/** Ověřené interiérové/exteriérové fotky pro galerie */
const GALLERY_POOL = [
  "1600607687939-ce8a6c25118c",
  "1600047509807-ba8f99d2cdde",
  "1600210492486-724fe5c67fb0",
  "1560448204-e02f11c3d0e2",
  "1502672260266-1c1ef2d93688",
  "1522708323590-d24dbb6b0267",
  "1560185007-cde436f6a4d0",
  "1560185127-6ed189bf02f4",
  "1512918728675-ed5a9ecdebfd",
  "1554995207-c18c203602cb",
  "1556912173-3bb406ef7e77",
  "1493809842364-78817add7ffb",
  "1600566753086-00f18fb6b3ea",
  "1600121848594-d8644e57abab",
  "1600573472592-401b489a3cdc",
  "1613977257363-707ba9348227",
];

const AGENTS: Agent[] = [
  {
    name: "Markéta Svobodová",
    role: "Senior makléřka",
    phone: "+420 731 200 311",
    email: "svobodova@ceskypartner.cz",
    photo: img("1573496359142-b8d87734a5a2", 400),
  },
  {
    name: "Jan Novotný",
    role: "Realitní makléř",
    phone: "+420 733 410 522",
    email: "novotny@ceskypartner.cz",
    photo: img("1560250097-0b93528c311a", 400),
  },
  {
    name: "Alena Krejčí",
    role: "Specialistka na investice",
    phone: "+420 737 615 908",
    email: "krejci@ceskypartner.cz",
    photo: img("1580489944761-15a19d654956", 400),
  },
];

/** Přibližné souřadnice lokalit pro mapu */
const COORDS: Record<string, [number, number]> = {
  "Praha 1": [50.0875, 14.4213],
  "Praha 2": [50.0755, 14.4378],
  "Praha 3": [50.0851, 14.4661],
  "Praha 4": [50.0415, 14.4416],
  "Praha 5": [50.0716, 14.3823],
  "Praha 6": [50.0932, 14.3667],
  "Praha 7": [50.1005, 14.4297],
  "Praha 8": [50.1089, 14.4487],
  "Praha 9": [50.1105, 14.5088],
  "Praha 10": [50.0672, 14.4917],
  "Praha-západ": [50.023, 14.267],
  Brno: [49.1951, 16.6068],
  Plzeň: [49.7475, 13.3776],
  Ostrava: [49.8346, 18.1687],
  Mikulov: [48.8055, 16.6378],
  "Špindlerův Mlýn": [50.7264, 15.6094],
};

const AMENITY_POOLS: Record<string, string[]> = {
  byt: [
    "Vestavěné skříně na míru",
    "Kuchyně s vinotékou a spotřebiči Miele",
    "Dubové podlahy",
    "Podlahové vytápění",
    "Klimatizace",
    "Chytrá domácnost",
    "Bezpečnostní vstupní dveře",
    "Sklepní kóje",
    "Výtah",
    "Videovrátný",
  ],
  dum: [
    "Zahrada s automatickou závlahou",
    "Dvojgaráž s nabíječkou pro elektromobil",
    "Krbová vložka",
    "Tepelné čerpadlo",
    "Rekuperace vzduchu",
    "Venkovní terasa s pergolou",
    "Chytrá domácnost",
    "Alarm a kamerový systém",
    "Studna na pozemku",
    "Fotovoltaická elektrárna",
  ],
  komercni: [
    "Recepce s ostrahou 24/7",
    "Klimatizace a rekuperace",
    "Zdvojené podlahy",
    "Optická konektivita",
    "Parkování v objektu",
    "Zázemí pro cyklisty",
    "Certifikace BREEAM",
    "Záložní zdroj energie",
  ],
};

function isHouse(listing: Listing): boolean {
  return /vila|dům|rezidence|mezonet/i.test(listing.title);
}

function isCommercial(listing: Listing): boolean {
  return /kancelář|administrativní|polyfunkční|komerční|dům s|budova|soubor|pozemek|činžovní/i.test(
    listing.title
  );
}

function dealTypeOf(listing: Listing): string {
  if (INVESTICE.some((l) => l.id === listing.id)) return "Investiční příležitost";
  return listing.priceSuffix ? "Pronájem" : "Prodej";
}

function hashOf(id: string): number {
  return id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

function coordsFor(location: string): [number, number] {
  const key = Object.keys(COORDS).find((k) => location.startsWith(k));
  return key ? COORDS[key] : [50.0755, 14.4378];
}

function buildDescription(listing: Listing, dealType: string): string[] {
  const house = isHouse(listing);
  const commercial = isCommercial(listing);
  const area = listing.area.toLocaleString("cs-CZ");

  if (commercial) {
    return [
      `${listing.title} v lokalitě ${listing.location} o celkové ploše ${area} m². Objekt v udržovaném stavu s transparentní nájemní strukturou a dlouhodobě stabilní obsazeností, vhodný pro investory hledající předvídatelný výnos i potenciál dalšího zhodnocení.`,
      `Nemovitost prošla v posledních letech průběžnou modernizací společných prostor a technologií. K dispozici je kompletní datová místnost: nájemní smlouvy, technické zprávy, energetické audity a pasportizace jednotek. Právní prověrka je připravena k okamžitému předání.`,
      `Podrobný investiční memorandum včetně finančního modelu zasíláme po podpisu NDA. Diskrétní jednání je samozřejmostí — nemovitost nenabízíme ve veřejné inzerci v plném detailu.`,
    ];
  }

  const intro = house
    ? `${listing.title} o dispozici ${listing.disposition ?? ""} a užitné ploše ${area} m² v lokalitě ${listing.location}. Architektura domu pracuje s velkorysými okny, vysokými stropy a plynulým propojením interiéru se zahradou — výsledkem je bydlení plné světla a soukromí.`
    : `${listing.title} o dispozici ${listing.disposition ?? ""} a ploše ${area} m² v lokalitě ${listing.location}. Interiér kombinuje původní charakter domu s precizním soudobým designem — vysoké stropy, kvalitní materiály a promyšlená dispozice bez jediného ztraceného metru.`;

  const middle = house
    ? `Přízemí nabízí otevřený obytný prostor s kuchyní na míru a přímým vstupem na terasu, v patře se nacházejí ložnice s vlastními koupelnami a šatnami. Technické zázemí domu odpovídá současným standardům úsporného provozu — od tepelného čerpadla po rekuperaci.`
    : `Obytnému prostoru dominuje kuchyně na míru s kamennou pracovní deskou a spotřebiči vyšší řady. Ložnice jsou orientovány do klidného vnitrobloku, hlavní z nich disponuje vlastní šatnou. Koupelny jsou obloženy velkoformátovou keramikou a vybaveny sanitou značky Villeroy & Boch.`;

  const outro =
    dealType === "Pronájem"
      ? `Nemovitost je k dispozici ihned, minimální délka pronájmu 12 měsíců. V ceně není zahrnuto plnění za energie a služby. Rádi zajistíme prohlídku včetně video walkthrough pro zájemce ze zahraničí.`
      : `V docházkové vzdálenosti se nachází kompletní občanská vybavenost, kvalitní školy i rychlé spojení do centra. Financování pomůžeme nastavit s naším hypotečním specialistou, právní servis a advokátní úschova jsou součástí služby.`;

  return [intro, middle, outro];
}

export function getListingDetail(id: string): ListingDetail | null {
  const all = [...PRODEJ, ...PRONAJEM, ...INVESTICE];
  const listing = all.find((l) => l.id === id);
  if (!listing) return null;

  const dealType = dealTypeOf(listing);
  const h = hashOf(listing.id);
  const commercial = isCommercial(listing);
  const house = isHouse(listing);

  // Galerie: hlavní foto + 7 dalších z poolu (deterministicky dle id)
  const rest = GALLERY_POOL.filter((g) => !listing.image.includes(g));
  const gallery = [
    listing.image.replace("w=1200", "w=1600"),
    ...Array.from({ length: 7 }, (_, i) => img(rest[(h + i * 3) % rest.length])),
  ];

  const pool = commercial ? AMENITY_POOLS.komercni : house ? AMENITY_POOLS.dum : AMENITY_POOLS.byt;
  const amenities = pool.filter((_, i) => (h + i) % 3 !== 0).slice(0, 8);

  const floor = commercial ? null : house ? null : `${(h % 5) + 1}. podlaží z ${(h % 5) + 3}`;
  const penb = ["B", "B", "C", "A"][h % 4];

  const overview: [string, string][] = [
    ["Referenční číslo", `CP-${2600 + (h % 300)}`],
    [
      dealType === "Pronájem" ? "Nájemné" : "Cena",
      `${listing.price.toLocaleString("cs-CZ")} Kč${listing.priceSuffix ? " / měsíc" : ""}`,
    ],
    ...(listing.disposition ? ([["Dispozice", listing.disposition]] as [string, string][]) : []),
    ["Užitná plocha", `${listing.area.toLocaleString("cs-CZ")} m²`],
    ...(floor ? ([["Podlaží", floor]] as [string, string][]) : []),
    ["Stav", h % 2 === 0 ? "Po kompletní rekonstrukci" : "Velmi dobrý"],
    ["Vlastnictví", "Osobní"],
    ["PENB", `Třída ${penb}`],
    ...(listing.yieldPa ? ([["Výnos", listing.yieldPa]] as [string, string][]) : []),
    ["K dispozici", dealType === "Pronájem" ? "Ihned" : "Dle dohody"],
  ];

  const locationText = commercial
    ? `Lokalita s výbornou dopravní dostupností a silnou nájemní poptávkou. V okolí se nachází občanská vybavenost, zastávky MHD i napojení na hlavní dopravní tepny.`
    : `${listing.location} patří k nejvyhledávanějším adresám. V docházkové vzdálenosti najdete kavárny, restaurace, školy i parky; spojení do centra zabere jen několik minut.`;

  return {
    listing,
    dealType,
    refNumber: `CP-${2600 + (h % 300)}`,
    gallery,
    description: buildDescription(listing, dealType),
    amenities,
    overview,
    coords: coordsFor(listing.location),
    locationText,
    agent: AGENTS[h % AGENTS.length],
    similar: (dealType === "Pronájem" ? PRONAJEM : dealType === "Prodej" ? PRODEJ : INVESTICE)
      .filter((l) => l.id !== listing.id)
      .slice(0, 6),
    // Demo: 3D prohlídka u části inzerátů (deterministicky dle id)
    tourUrl: h % 2 === 0 ? "https://visithome.ai/ekCURpKZQMoGfwfxmv2Mjj?mu=m&t=1772534923" : undefined,
  };
}

export function allListingIds(): string[] {
  return [...PRODEJ, ...PRONAJEM, ...INVESTICE].map((l) => l.id);
}
