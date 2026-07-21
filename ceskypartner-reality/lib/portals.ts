// Registr českých inzertních portálů pro export nemovitostí.
// Klíče odpovídají enumu Portal v prisma/schema.prisma.

export type PortalCategory =
  | "major"
  | "network"
  | "partner"
  | "regional"
  | "service"
  | "social";

export type PortalInfo = {
  key: string;
  name: string;
  url: string;
  category: PortalCategory;
  note?: string;
  exportable?: boolean;
};

export const PORTALS: PortalInfo[] = [
  // ── Hlavní portály ──
  { key: "SREALITY", name: "Sreality.cz", url: "https://www.sreality.cz", category: "major" },
  { key: "REALITY_IDNES", name: "Reality iDNES", url: "https://reality.idnes.cz", category: "major" },
  { key: "REALITY_CZ", name: "Reality.cz", url: "https://www.reality.cz", category: "major" },
  { key: "REALITYMIX", name: "RealityMix.cz", url: "https://realitymix.cz", category: "major", note: "Jedna databáze pro síť portálů RealityMIX" },
  { key: "CESKEREALITY", name: "ČeskéReality.cz", url: "https://www.ceskereality.cz", category: "major", note: "Včetně regionálních mutací a partnerské sítě" },
  { key: "REALHIT", name: "RealHit.cz", url: "https://www.realhit.cz", category: "major" },
  { key: "IGLUU", name: "Igluu.cz", url: "https://www.igluu.cz", category: "major" },
  { key: "ULOVDOMOV", name: "UlovDomov.cz", url: "https://www.ulovdomov.cz", category: "major", note: "Pronájmy" },

  // ── Sítě portálů ──
  { key: "B3_TECHNOLOGY", name: "B3 Technology", url: "https://www.b3technology.cz", category: "network", note: "1 můstek → 6 portálů přes VideoBydlení" },
  { key: "DOMY_BYTY_POZEMKY", name: "DomyBytyPozemky.cz", url: "https://www.domybytypozemky.cz", category: "network", note: "1 můstek → 42 regionálních domén" },

  // ── Partnerské servery ──
  { key: "BYTY_CZ", name: "Byty.cz", url: "https://www.byty.cz", category: "partner", note: "Hlavní web nyní vrací HTTP 404; čeká se na potvrzení portálu" },
  { key: "REALITNI_ESO", name: "Realitní ESO", url: "https://www.realitnieso.cz", category: "partner" },
  { key: "REAS", name: "REAS.cz", url: "https://www.reas.cz", category: "partner", note: "Inzerce zdarma" },
  { key: "JENREALITY", name: "JenReality.cz", url: "https://www.jenreality.cz", category: "partner", note: "Inzerce zdarma" },
  { key: "BLACK_REALITY", name: "Black Reality", url: "https://www.black-reality.cz", category: "partner", note: "Inzerce zdarma" },
  { key: "PROPERTY4YOU", name: "Property4You", url: "https://www.property4you.online/sk", category: "partner", note: "Evropský portál" },
  { key: "SUPERBYTY24", name: "Supa24", url: "https://supa24.com/cs", category: "partner", note: "Byty a apartmány po celém světě" },
  { key: "NEMOVITOSTI_BLESK", name: "Nemovitosti.blesk.cz", url: "https://nemovitosti.blesk.cz", category: "partner", note: "Inzerce zdarma" },
  { key: "LOVEC_REALIT", name: "Lovec-Realit.cz", url: "https://lovec-realit.cz", category: "partner", note: "Inzerce zdarma" },
  { key: "SUPERHOME", name: "SuperHome.cz", url: "https://superhome.cz", category: "partner", note: "Inzerce zdarma" },
  { key: "DOMONAUT", name: "Domonaut.cz", url: "https://domonaut.cz", category: "partner" },
  { key: "REALINGO", name: "Realingo.cz", url: "https://realingo.cz", category: "partner", note: "Zdarma bez omezení" },
  { key: "REALITYCECHY", name: "RealityČechy.cz", url: "https://www.realitycechy.cz", category: "partner" },

  // ── Regionální a další ──
  { key: "EUROBYDLENI", name: "Eurobydlení.cz", url: "https://www.eurobydleni.cz", category: "regional" },
  { key: "POZEMKY_CZ", name: "Pozemky.cz", url: "https://www.pozemky.cz", category: "regional", note: "Pozemky" },
  { key: "ANNONCE", name: "Annonce.cz", url: "https://www.annonce.cz", category: "regional" },
  { key: "BAZOS_REALITY", name: "Bazoš Reality", url: "https://reality.bazos.cz", category: "regional" },
  { key: "REALCITY", name: "RealCity.cz", url: "https://www.realcity.cz", category: "regional" },
  { key: "AVIZO", name: "Avízo.cz", url: "https://www.avizo.cz", category: "regional" },
  { key: "VIAREALITY", name: "ViaReality.cz", url: "https://www.viareality.cz", category: "regional" },
  { key: "PRAZSKEREALITY", name: "PražskéReality.cz", url: "https://www.prazskereality.cz", category: "regional", note: "Praha" },
  { key: "PRAGUE_REAL_ESTATE", name: "PragueRealEstate.cz", url: "https://www.praguerealestate.cz", category: "regional", note: "Praha / EN" },
  { key: "HRADECKEREALITY", name: "Reality Hradec Králové", url: "https://reality.hradeckralove.cz", category: "regional", note: "Hradec Králové" },
  { key: "REALITNI_TRZNICE", name: "Realitní tržnice", url: "https://www.realitnitrznice.cz", category: "regional" },

  // ── Služby a položky, které nejsou běžným veřejným portálem ──
  { key: "BEZREALITKY", name: "Bezrealitky.cz", url: "https://www.bezrealitky.cz", category: "service", note: "Běžný export nabídek RK je smluvně omezený", exportable: false },
  { key: "VALUO", name: "Valuo.cz", url: "https://www.valuo.cz", category: "service", note: "Oceňování a data; není klasický inzertní portál", exportable: false },
  { key: "MECH_CZ", name: "MECH Reality", url: "https://www.mech.cz", category: "service", note: "Realitní kancelář, nikoli otevřený portál", exportable: false },
  { key: "VINEGRET", name: "Vinegret.cz", url: "https://vinegret.cz", category: "service", note: "Informační web pro ruskojazyčnou komunitu", exportable: false },
  { key: "REALITNI_KOMORA", name: "Realitní komora ČR", url: "https://www.realitnikomora.cz", category: "service", note: "Profesní sdružení", exportable: false },
  { key: "ARKCR", name: "ARK ČR", url: "https://www.arkcr.cz", category: "service", note: "Asociace; nabídky řeší přes Igluu MLS", exportable: false },

  // ── Sociální sítě ──
  { key: "FACEBOOK_MARKETPLACE", name: "Facebook stránka", url: "https://www.facebook.com", category: "social", note: "Publikace na firemní stránku, nikoli veřejné Marketplace API", exportable: false },
];

export const PORTAL_CATEGORY_LABELS: Record<PortalCategory, string> = {
  major: "Hlavní portály",
  network: "Sítě portálů",
  partner: "Partnerské servery",
  regional: "Regionální a další",
  service: "Služby a omezené kanály",
  social: "Sociální sítě",
};

export const PORTAL_MAP: Record<string, PortalInfo> = Object.fromEntries(
  PORTALS.map((p) => [p.key, p])
);

export function isValidPortal(key: string): boolean {
  return key in PORTAL_MAP;
}
