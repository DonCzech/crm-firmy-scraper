import type {
  PortalConnectionStatus,
  PortalConnector,
  PortalListing,
  PortalSyncResult,
} from "./types";
import { PortalConnectorError } from "./types";

type SuperHomeConfig = {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  agencyMappingId: string;
};

type SuperHomeResponse = {
  status?: number;
  message?: string;
  access_token?: string;
  propertyListingMappingId?: string;
  url?: string;
  propertyListings?: Array<{
    propertyListingMappingId?: string;
    publishedStatus?: string;
    url?: string;
  }>;
};

const DEFAULT_BASE_URL = "https://superhome.cz/";

function xmlEscape(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function xmlElement(name: string, value: unknown): string {
  if (value === undefined || value === null || value === "") return "";
  return `<${name}>${xmlEscape(value)}</${name}>`;
}

function xmlRequest(name: string, content: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><${name} xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">${content}</${name}>`;
}

function plainText(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function hasAmenity(listing: PortalListing, ...needles: string[]): boolean {
  const amenities = listing.amenities.map(normalize);
  return needles.some((needle) =>
    amenities.some((amenity) => amenity.includes(normalize(needle))),
  );
}

function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function isoDateTime(value: Date): string {
  return value.toISOString().slice(0, 19).replace("T", " ");
}

function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return { firstName: parts[0] || "Makléř", lastName: "-" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function mapConstruction(value: string | null): string | null {
  const map: Record<string, string> = {
    BRICK: "brick",
    PANEL: "panel",
    WOOD: "wooden",
    STONE: "stone",
    MIXED: "mixed",
    SKELETON: "other",
    LOW_ENERGY: "other",
  };
  return value ? map[value] || "other" : null;
}

function mapFurnishing(value: string | null): string | null {
  const map: Record<string, string> = {
    FURNISHED: "with",
    PARTLY: "partially",
    UNFURNISHED: "without",
  };
  return value ? map[value] || null : null;
}

function mapOwnership(value: string | null): string | null {
  const map: Record<string, string> = {
    PERSONAL: "private",
    COOPERATIVE: "cooperative",
    STATE: "municipal",
  };
  return value ? map[value] || "other" : null;
}

function mapCondition(value: string | null): string | null {
  const map: Record<string, string> = {
    NEW_BUILD: "new",
    VERY_GOOD: "very-good",
    GOOD: "good",
    TO_RECONSTRUCT: "before-reconstruction",
    UNDER_CONSTRUCTION: "under-construction",
    DEVELOPER_PROJECT: "project",
  };
  return value ? map[value] || "other" : null;
}

function apartmentLayout(value: string | null): string | null {
  if (!value) return null;
  const normalized = value.toLowerCase().replace("+", "-");
  return /^(1|2|3|4|5|6)-(kk|1)$/.test(normalized) || normalized === "7-kk"
    ? normalized
    : "other";
}

function houseSize(value: string | null): string {
  const rooms = Number(value?.match(/^\d+/)?.[0]);
  return rooms >= 1 && rooms <= 6 ? `${rooms}-${rooms === 1 ? "room" : "rooms"}` : "other";
}

function commercialType(listing: PortalListing): string {
  const text = normalize(`${listing.title} ${listing.description || ""}`);
  if (text.includes("kancelar")) return "office";
  if (text.includes("sklad")) return "warehouse";
  if (text.includes("vyrob")) return "manufacturing-facility";
  if (text.includes("obchod")) return "store";
  if (text.includes("restaur")) return "restaurant";
  if (text.includes("hotel") || text.includes("ubytov")) return "hotel";
  return "other";
}

function landType(listing: PortalListing): string {
  const text = normalize(`${listing.title} ${listing.description || ""}`);
  if (text.includes("komerc")) return "commercial";
  if (text.includes("pole") || text.includes("zemedel")) return "field";
  if (text.includes("louka")) return "meadow";
  if (text.includes("les")) return "forest";
  if (text.includes("zahrad")) return "garden";
  if (text.includes("vinic")) return "vineyard";
  if (text.includes("staveb") || text.includes("bydlen")) return "housings";
  return "other";
}

function propertySpecificXml(listing: PortalListing): string {
  const common =
    xmlElement("PropertyArea", listing.kind === "LAND" ? listing.landArea : listing.area) +
    xmlElement("UsableArea", listing.area) +
    xmlElement("AdditionalLandArea", listing.kind === "HOUSE" ? listing.landArea : undefined) +
    xmlElement("BuildingType", mapConstruction(listing.construction)) +
    xmlElement("Furnishings", mapFurnishing(listing.furnishing)) +
    xmlElement("OwnershipType", mapOwnership(listing.ownership)) +
    xmlElement("ConditionType", mapCondition(listing.condition));

  if (listing.kind === "APARTMENT") {
    return (
      common +
      xmlElement("ApartmentLayout", apartmentLayout(listing.disposition)) +
      xmlElement("ApartmentType", "standard") +
      xmlElement("HeatingSystem", "other") +
      xmlElement("EnergyPerformance", listing.penb?.toLowerCase())
    );
  }
  if (listing.kind === "HOUSE") {
    return (
      common +
      xmlElement("HouseSize", houseSize(listing.disposition)) +
      xmlElement(
        "HouseType",
        normalize(listing.title).includes("vila") ? "villa" : "family-house",
      ) +
      xmlElement("HouseConstructionType", (listing.floors || 1) > 1 ? "multi-story" : "one-story") +
      xmlElement("HeatingSystem", "other") +
      xmlElement("EnergyPerformance", listing.penb?.toLowerCase())
    );
  }
  if (listing.kind === "COMMERCIAL") {
    return common + xmlElement("CommercialType", commercialType(listing));
  }
  return common + xmlElement("LandType", landType(listing));
}

function validateListing(listing: PortalListing): void {
  const errors: string[] = [];
  if (listing.status !== "ACTIVE") errors.push("nemovitost musí být aktivní");
  if (!listing.description?.trim()) errors.push("chybí popis");
  if (!listing.location?.trim()) errors.push("chybí lokalita");
  if (listing.price < 0) errors.push("cena nesmí být záporná");
  if (!listing.agent?.name) errors.push("chybí přiřazený makléř");
  if (!listing.agent?.email) errors.push("makléř nemá e-mail");
  if (!listing.images.length) errors.push("chybí fotografie");

  if (listing.kind === "APARTMENT" || listing.kind === "HOUSE") {
    if (!listing.area) errors.push("chybí užitná plocha");
    if (!listing.construction) errors.push("chybí konstrukce");
    if (!listing.furnishing) errors.push("chybí vybavení");
    if (!listing.ownership) errors.push("chybí vlastnictví");
    if (!listing.condition) errors.push("chybí stav nemovitosti");
    if (!listing.penb) errors.push("chybí PENB");
  }
  if (listing.kind === "APARTMENT" && !listing.disposition) errors.push("chybí dispozice");
  if (listing.kind === "HOUSE") {
    if (!listing.disposition) errors.push("chybí počet pokojů");
    if (!listing.landArea) errors.push("chybí plocha pozemku");
  }
  if (listing.kind === "COMMERCIAL") {
    if (!listing.area) errors.push("chybí užitná plocha");
    if (!listing.ownership) errors.push("chybí vlastnictví");
    if (!listing.condition) errors.push("chybí stav nemovitosti");
  }
  if (listing.kind === "LAND" && !listing.landArea) errors.push("chybí plocha pozemku");

  if (errors.length) {
    throw new PortalConnectorError(
      `Data nelze odeslat na SuperHome: ${errors.join(", ")}.`,
      "VALIDATION_ERROR",
      errors,
    );
  }
}

function getConfig(): SuperHomeConfig {
  const baseUrl = (process.env.SUPERHOME_BASE_URL || DEFAULT_BASE_URL).trim();
  const clientId = process.env.SUPERHOME_CLIENT_ID?.trim();
  const clientSecret = process.env.SUPERHOME_CLIENT_SECRET;
  const agencyMappingId = process.env.SUPERHOME_AGENCY_MAPPING_ID?.trim();
  const missing = [
    !clientId ? "SUPERHOME_CLIENT_ID" : null,
    !clientSecret ? "SUPERHOME_CLIENT_SECRET" : null,
    !agencyMappingId ? "SUPERHOME_AGENCY_MAPPING_ID" : null,
  ].filter(Boolean);

  if (missing.length) {
    throw new PortalConnectorError(
      `SuperHome není nakonfigurováno. Chybí: ${missing.join(", ")}.`,
      "NOT_CONFIGURED",
      missing,
    );
  }

  return {
    baseUrl: baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`,
    clientId: clientId!,
    clientSecret: clientSecret!,
    agencyMappingId: agencyMappingId!,
  };
}

async function apiCall(
  baseUrl: string,
  path: string,
  xml: string,
  accessToken?: string,
  requireSuccess = true,
): Promise<SuperHomeResponse> {
  const response = await fetch(new URL(path, baseUrl), {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
    headers: {
      "Content-Type": "application/xml",
      Accept: "application/json",
      ...(accessToken ? { Authorization: accessToken } : {}),
    },
    body: xml,
  });
  const raw = await response.text();
  let data: SuperHomeResponse;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new PortalConnectorError(
      `SuperHome vrátilo neplatnou odpověď HTTP ${response.status}.`,
      "SUPERHOME_INVALID_RESPONSE",
      raw.slice(0, 1000),
    );
  }

  if (requireSuccess && (!response.ok || data.status !== 200)) {
    throw new PortalConnectorError(
      `SuperHome ${path}: ${data.status || response.status} ${data.message || "Neznámá chyba"}`,
      `SUPERHOME_${data.status || response.status}`,
      data,
    );
  }
  return data;
}

async function getAccessToken(config: SuperHomeConfig): Promise<string> {
  const response = await apiCall(
    config.baseUrl,
    "i1-get-access-token",
    xmlRequest(
      "GetAccessTokenRequest",
      xmlElement("ClientId", config.clientId) + xmlElement("ClientSecret", config.clientSecret),
    ),
  );
  if (!response.access_token) {
    throw new PortalConnectorError(
      "SuperHome nevrátilo přístupový token.",
      "SUPERHOME_MISSING_TOKEN",
      response,
    );
  }
  return response.access_token;
}

async function downloadPhoto(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(30_000),
    cache: "no-store",
    headers: { "User-Agent": "CeskyPartner-Reality/1.0" },
  });
  if (!response.ok) throw new Error(`Fotografii nelze stáhnout (${response.status}): ${url}`);
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > 10 * 1024 * 1024) throw new Error(`Fotografie je větší než 10 MB: ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > 10 * 1024 * 1024) throw new Error(`Fotografie je větší než 10 MB: ${url}`);
  return buffer;
}

function buildListingXml(listing: PortalListing, agencyMappingId: string): string {
  const propertyType = {
    APARTMENT: "Apartment",
    HOUSE: "House",
    LAND: "Land",
    COMMERCIAL: "Commercial",
  }[listing.kind];
  const timestamp = listing.updatedAt || new Date();
  const amenities =
    xmlElement("Parking", hasAmenity(listing, "parkovani", "stani")) +
    xmlElement("Garage", hasAmenity(listing, "garaz")) +
    xmlElement("Elevator", hasAmenity(listing, "vytah")) +
    xmlElement("Internet", hasAmenity(listing, "internet")) +
    xmlElement("Balcony", hasAmenity(listing, "balkon")) +
    xmlElement("Terrace", hasAmenity(listing, "terasa")) +
    xmlElement("Loggia", hasAmenity(listing, "lodzie", "loggia")) +
    xmlElement("Cellar", hasAmenity(listing, "sklep")) +
    xmlElement("WheelchairAccess", hasAmenity(listing, "bezbarier")) +
    xmlElement("SwimmingPool", hasAmenity(listing, "bazen"));
  const address =
    xmlElement("CountryCode", "CZ") +
    xmlElement("County", listing.region) +
    xmlElement("City", listing.location) +
    xmlElement("District", listing.district) +
    xmlElement("Street", listing.address) +
    xmlElement("PostalCode", listing.zip) +
    xmlElement("Latitude", listing.lat) +
    xmlElement("Longitude", listing.lng);

  return xmlRequest(
    "SubmitPropertyListingRequest",
    xmlElement("PropertyListingMappingId", listing.id) +
      xmlElement("AgentMappingId", listing.agent!.id) +
      xmlElement("AgencyMappingId", agencyMappingId) +
      xmlElement("ListingStatus", "active") +
      xmlElement("AvailableFrom", isoDate(listing.publishedAt || listing.createdAt)) +
      xmlElement("Unpublished", false) +
      xmlElement("DateCreated", isoDateTime(listing.createdAt)) +
      xmlElement("DateUpdated", isoDateTime(timestamp)) +
      xmlElement("OfferType", listing.deal === "RENT" ? "LongTermRent" : "Sale") +
      xmlElement("PropertyType", propertyType) +
      xmlElement("PriceUnit", listing.deal === "RENT" ? "per_month" : "per_property") +
      xmlElement("Price", listing.priceHidden ? 0 : listing.price) +
      xmlElement("CurrencyCode", "CZK") +
      xmlElement("Bail", listing.deal === "RENT" ? listing.deposit : undefined) +
      xmlElement("UtilityBills", listing.deal === "RENT" ? listing.monthlyFees : undefined) +
      xmlElement("PriceNotes", listing.priceNote) +
      propertySpecificXml(listing) +
      amenities +
      xmlElement("ApartmentFloor", listing.kind === "APARTMENT" ? listing.floor : undefined) +
      xmlElement("NumberOfFloors", listing.floors) +
      xmlElement("DescriptionCs", plainText(listing.description!).slice(0, 4000)) +
      xmlElement("YouTubeVideo", listing.videoUrl) +
      xmlElement("VirtualTour", listing.tourUrl) +
      `<AddressComponents>${address}</AddressComponents>`,
  );
}

export const superHomeConnector: PortalConnector = {
  portal: "SUPERHOME",

  async inspect(): Promise<PortalConnectionStatus> {
    let configured = true;
    let config: SuperHomeConfig | null = null;
    try {
      config = getConfig();
    } catch {
      configured = false;
    }

    try {
      if (config) {
        const token = await getAccessToken(config);
        await apiCall(
          config.baseUrl,
          "i1-get-property-listings",
          xmlRequest(
            "GetPropertyListingsRequest",
            xmlElement("AgencyMappingId", config.agencyMappingId),
          ),
          token,
        );
      } else {
        const probe = await apiCall(
          DEFAULT_BASE_URL,
          "i1-get-access-token",
          xmlRequest(
            "GetAccessTokenRequest",
            xmlElement("ClientId", "__connection_probe__") +
              xmlElement("ClientSecret", "__connection_probe__"),
          ),
          undefined,
          false,
        );
        if (typeof probe.status !== "number") throw new Error("API nevrátilo stav.");
      }

      return {
        portal: "SUPERHOME",
        implemented: true,
        configured,
        reachable: true,
        version: "2.6",
        message: configured
          ? "Importní API i účet realitní kanceláře jsou dostupné."
          : "Importní API je dostupné, ale chybí přístupové údaje.",
      };
    } catch (error) {
      return {
        portal: "SUPERHOME",
        implemented: true,
        configured,
        reachable: false,
        version: "2.6",
        message: error instanceof Error ? error.message : "Importní API není dostupné.",
      };
    }
  },

  async sync(listing: PortalListing): Promise<PortalSyncResult> {
    validateListing(listing);
    const config = getConfig();
    const token = await getAccessToken(config);
    const agentName = splitName(listing.agent!.name);

    await apiCall(
      config.baseUrl,
      "i1-submit-agent",
      xmlRequest(
        "SubmitAgentRequest",
        xmlElement("AgentMappingId", listing.agent!.id) +
          xmlElement("AgencyMappingId", config.agencyMappingId) +
          xmlElement("FirstName", agentName.firstName) +
          xmlElement("LastName", agentName.lastName) +
          xmlElement("LoginEmail", listing.agent!.email) +
          xmlElement("PublicEmail", listing.agent!.email) +
          xmlElement("PublicPhone", listing.agent!.phone) +
          xmlElement("IsEmployee", false),
      ),
      token,
    );

    const submitted = await apiCall(
      config.baseUrl,
      "i1-submit-property-listing",
      buildListingXml(listing, config.agencyMappingId),
      token,
    );

    for (let index = 0; index < Math.min(listing.images.length, 30); index++) {
      const image = listing.images[index];
      const photo = await downloadPhoto(image.url);
      await apiCall(
        config.baseUrl,
        "i1-submit-property-listing-photo",
        xmlRequest(
          "SubmitPropertyListingPhotoRequest",
          xmlElement("PhotoMappingId", image.id) +
            xmlElement("PropertyListingMappingId", listing.id) +
            xmlElement("AgencyMappingId", config.agencyMappingId) +
            xmlElement("IsMainPhoto", index === 0) +
            xmlElement("PhotoData", photo.toString("base64")),
        ),
        token,
      );
    }

    const verified = await apiCall(
      config.baseUrl,
      "i1-get-property-listings",
      xmlRequest(
        "GetPropertyListingsRequest",
        xmlElement("AgencyMappingId", config.agencyMappingId),
      ),
      token,
    );
    const remote = verified.propertyListings?.find(
      (item) => item.propertyListingMappingId === listing.id,
    );
    if (!remote) {
      throw new PortalConnectorError(
        "SuperHome nabídku přijalo, ale následné ověření ji nenašlo.",
        "VERIFICATION_FAILED",
      );
    }

    const published = remote.publishedStatus?.toLowerCase() === "published";
    return {
      externalId: submitted.propertyListingMappingId || listing.id,
      remoteUrl: remote.url || submitted.url,
      remoteStatus: remote.publishedStatus || "accepted",
      published,
      message: published
        ? "Inzerát byl ověřen jako zveřejněný na SuperHome."
        : `SuperHome inzerát přijalo, ale stav je ${remote.publishedStatus || "zatím neurčený"}.`,
    };
  },
};
