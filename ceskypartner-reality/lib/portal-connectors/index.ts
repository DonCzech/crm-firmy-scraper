import { PORTAL_MAP } from "@/lib/portals";
import { b3TechnologyConnector } from "./b3technology";
import { blackRealityConnector } from "./blackreality";
import { bytyCzConnector } from "./bytycz";
import { ceskeRealityConnector } from "./ceskereality";
import { eurobydleniConnector } from "./eurobydleni";
import { realityIdnesConnector } from "./idnes";
import { jenRealityConnector } from "./jenreality";
import { lovecRealitConnector } from "./lovecrealit";
import { pragueRealEstateConnector } from "./praguerealestate";
import { prazskeRealityConnector } from "./prazskereality";
import { realingoConnector } from "./realingo";
import { realityCzConnector } from "./realitycz";
import { realityMixConnector } from "./realitymix";
import { srealityConnector } from "./sreality";
import { superHomeConnector } from "./superhome";
import type { PortalConnectionStatus, PortalConnector } from "./types";

const CONNECTORS: Partial<Record<string, PortalConnector>> = {
  B3_TECHNOLOGY: b3TechnologyConnector,
  SREALITY: srealityConnector,
  CESKEREALITY: ceskeRealityConnector,
  REALITY_IDNES: realityIdnesConnector,
  REALITY_CZ: realityCzConnector,
  REALITYMIX: realityMixConnector,
  REALINGO: realingoConnector,
  EUROBYDLENI: eurobydleniConnector,
  BYTY_CZ: bytyCzConnector,
  SUPERHOME: superHomeConnector,
  JENREALITY: jenRealityConnector,
  BLACK_REALITY: blackRealityConnector,
  LOVEC_REALIT: lovecRealitConnector,
  PRAZSKEREALITY: prazskeRealityConnector,
  PRAGUE_REAL_ESTATE: pragueRealEstateConnector,
};

const PORTAL_LIMITATIONS: Partial<Record<string, string>> = {
  BEZREALITKY:
    "Portál poskytuje integrace jen smluvním partnerům; chybí přímý technický přístup vydaný pro toto CRM.",
  REALHIT:
    "Portál přijímá exporty přes schválené realitní softwary, ale nezveřejňuje vlastní importní protokol.",
  IGLUU:
    "Externí CRM integrace je smluvní a neveřejná; je nutné získat partnerskou dokumentaci a přístupy.",
  ULOVDOMOV:
    "Importní můstek existuje, ale portál nezveřejňuje jeho protokol ani endpoint pro vlastní CRM.",
  REALITNI_ESO:
    "Import z databází třetích stran je podporovaný, ale veřejná technická specifikace není dostupná.",
  REAS: "Nebyl nalezen veřejný publikační import pro realitní kanceláře.",
  VALUO: "Nebyl nalezen veřejný publikační import pro realitní kanceláře.",
  PROPERTY4YOU: "Portál nezveřejňuje ověřitelné importní API ani exportní můstek.",
  SUPERBYTY24: "Portál nezveřejňuje ověřitelné importní API ani exportní můstek.",
  NEMOVITOSTI_BLESK: "Portál nezveřejňuje přímé importní API pro vlastní CRM.",
  MECH_CZ: "Současný web je realitní kancelář, nikoli otevřený inzertní portál pro cizí nabídky.",
  DOMONAUT: "Nebyl nalezen veřejný importní protokol pro nabídky realitních kanceláří.",
  VINEGRET: "Veřejný importní host nevrací ověřitelné publikační rozhraní.",
  REALITYCECHY: "Import je řešen neveřejně přes partnerské realitní softwary.",
  POZEMKY_CZ: "Portál nezveřejňuje přímý importní protokol pro vlastní CRM.",
  ANNONCE: "Veřejné hromadné API pro export realitních nabídek není dostupné.",
  BAZOS_REALITY: "Bazoš neposkytuje veřejné hromadné publikační API pro realitní kanceláře.",
  REALCITY: "Portál podporuje exportní softwary, ale technické rozhraní je neveřejné.",
  AVIZO: "Veřejné hromadné publikační API pro reality není dostupné.",
  VIAREALITY: "Napojení se aktivuje po registraci kanceláře; veřejná technická specifikace chybí.",
  HRADECKEREALITY: "Portál nezveřejňuje ověřitelné importní API pro vlastní CRM.",
  REALITNI_TRZNICE: "Nebyl nalezen veřejný importní protokol pro nabídky realitních kanceláří.",
  REALITNI_KOMORA: "Jde o oborový subjekt, nikoli ověřený inzertní portál s importním API.",
  DOMY_BYTY_POZEMKY:
    "Napojení přes realitní softwary je podporované, ale portál vydává technické údaje neveřejně.",
  ARKCR: "Jde o asociaci realitních kanceláří, nikoli běžný inzertní exportní portál.",
  FACEBOOK_MARKETPLACE:
    "Hromadná publikace realit vyžaduje schválený partnerský přístup Meta; běžné veřejné API ji neposkytuje.",
};

export function getPortalConnector(portal: string): PortalConnector | null {
  return CONNECTORS[portal.toUpperCase()] || null;
}

export async function inspectPortalConnection(portal: string): Promise<PortalConnectionStatus> {
  const portalKey = portal.toUpperCase();
  const connector = getPortalConnector(portalKey);
  if (connector) return connector.inspect();

  return {
    portal: portalKey,
    implemented: false,
    configured: false,
    reachable: false,
    message:
      PORTAL_LIMITATIONS[portalKey] ||
      (PORTAL_MAP[portalKey]
        ? "Portál nemá veřejně ověřitelný importní protokol."
        : "Neznámý portál."),
  };
}
