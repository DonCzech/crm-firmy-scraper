import { createHash } from "crypto";
import type { PortalConnector, PortalConnectionStatus, PortalListing, PortalSyncResult } from "./types";
import { PortalConnectorError } from "./types";
import { xmlRpcCall, type XmlRpcValue } from "./xmlrpc";

type SrealityResponse<T = unknown> = {
  status: number;
  statusMessage: string;
  output?: T;
};

type SrealityAdvert = {
  advert_id: number;
  advert_rkid: string;
  advert_url?: string;
  hash_id?: string;
  published?: number;
  published_status?: number;
};

export type SrealityCompatibleOptions = {
  portal: string;
  displayName: string;
  envPrefix: string;
  defaultRpcUrl?: string;
  minimumPhotos?: number;
  syncSeller?: boolean;
  sellerReference?: boolean;
  legacyAdvertFields?: boolean;
  legacySellerFields?: boolean;
};

const PUBLISH_STATUS: Record<number, string> = {
  0: "Probíhá zpracování",
  1: "Zveřejněno",
  2: "Firma nemá kredit",
  3: "Dlužná částka je vyšší než kredit",
  4: "Firma nemá zaplacenou registraci",
  8: "Makléř není aktivní",
  10: "Inzerát nemá fotografie",
  11: "Inzerát je zakázaný",
  12: "Inzerát je smazaný",
  13: "Inzerát není aktivní",
  14: "Inzerát není schválený",
  15: "Inzerát je duplicitní",
  16: "Inzerát čeká na vyhodnocení duplicity",
  18: "Inzerát expiroval",
  29: "Inzerát nemá dostatek fotografií",
};

function md5(value: string): string {
  return createHash("md5").update(value, "utf8").digest("hex");
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
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

function hasAmenity(listing: PortalListing, ...needles: string[]): boolean {
  const amenities = listing.amenities.map(normalize);
  return needles.some((needle) => amenities.some((amenity) => amenity.includes(normalize(needle))));
}

function apartmentSubtype(disposition: string | null): number | null {
  const map: Record<string, number> = {
    "1+kk": 2,
    "1+1": 3,
    "2+kk": 4,
    "2+1": 5,
    "3+kk": 6,
    "3+1": 7,
    "4+kk": 8,
    "4+1": 9,
    "5+kk": 10,
    "5+1": 11,
    "6+kk": 12,
    "6+1": 12,
    "7+kk": 12,
    "7+1": 12,
  };
  return disposition ? map[disposition] || 16 : null;
}

function roomCount(disposition: string | null): number | null {
  if (!disposition) return null;
  const rooms = Number(disposition.match(/^\d+/)?.[0]);
  if (!rooms) return 6;
  return Math.min(rooms, 5);
}

function mapCondition(condition: string | null): number | null {
  const map: Record<string, number> = {
    VERY_GOOD: 1,
    GOOD: 2,
    UNDER_CONSTRUCTION: 4,
    DEVELOPER_PROJECT: 5,
    NEW_BUILD: 6,
    TO_RECONSTRUCT: 8,
  };
  return condition ? map[condition] || null : null;
}

function mapConstruction(construction: string | null): number | null {
  const map: Record<string, number> = {
    WOOD: 1,
    BRICK: 2,
    LOW_ENERGY: 2,
    STONE: 3,
    PANEL: 5,
    SKELETON: 6,
    MIXED: 7,
  };
  return construction ? map[construction] || null : null;
}

function mapOwnership(ownership: string | null): number | null {
  const map: Record<string, number> = { PERSONAL: 1, COOPERATIVE: 2, STATE: 3 };
  return ownership ? map[ownership] || null : null;
}

function mapFurnishing(furnishing: string | null): number | undefined {
  const map: Record<string, number> = { FURNISHED: 1, UNFURNISHED: 2, PARTLY: 3 };
  return furnishing ? map[furnishing] : undefined;
}

function commercialSubtype(listing: PortalListing): number {
  const text = normalize(`${listing.title} ${listing.description || ""}`);
  if (text.includes("kancelar")) return 25;
  if (text.includes("sklad")) return 26;
  if (text.includes("vyrob")) return 27;
  if (text.includes("obchod")) return 28;
  if (text.includes("restaur")) return 30;
  return 32;
}

function buildAdvert(
  listing: PortalListing,
  options: SrealityCompatibleOptions,
): Record<string, XmlRpcValue> {
  const errors: string[] = [];
  if (listing.status !== "ACTIVE") errors.push("nemovitost musí být aktivní");
  if (!listing.description?.trim()) errors.push("chybí popis");
  if (!listing.location?.trim()) errors.push("chybí lokalita");
  if (!listing.price || listing.price < 0) errors.push("chybí platná cena");
  const minimumPhotos = options.minimumPhotos ?? 3;
  if (listing.images.length < minimumPhotos) {
    errors.push(
      `${options.displayName} vyžaduje nejméně ${minimumPhotos} ${
        minimumPhotos === 1 ? "fotografii" : "fotografie"
      }`,
    );
  }
  if (options.syncSeller) {
    if (!listing.agent?.name) errors.push("chybí přiřazený makléř");
    if (!listing.agent?.email) errors.push("makléř nemá e-mail");
    if (!listing.agent?.phone) errors.push("makléř nemá telefon");
  }
  if (options.legacyAdvertFields && !listing.region) errors.push("chybí kraj");

  const advertType = { APARTMENT: 1, HOUSE: 2, LAND: 3, COMMERCIAL: 4 }[listing.kind];
  const buildingCondition = mapCondition(listing.condition);
  const buildingType = mapConstruction(listing.construction);

  if (listing.kind !== "LAND") {
    if (!listing.area) errors.push("chybí užitná plocha");
    if (!buildingCondition) errors.push("chybí stav nemovitosti");
    if (!buildingType) errors.push("chybí typ konstrukce");
  }
  if ((listing.kind === "HOUSE" || listing.kind === "LAND") && !listing.landArea) {
    errors.push("chybí plocha pozemku");
  }
  if (listing.kind === "APARTMENT") {
    if (!listing.disposition) errors.push("chybí dispozice");
    if (listing.floor === null) errors.push("chybí patro");
    if (!listing.ownership) errors.push("chybí vlastnictví");
  }
  if (listing.kind === "HOUSE" && !listing.disposition) errors.push("chybí počet pokojů");

  if (errors.length) {
    throw new PortalConnectorError(
      `Data nelze odeslat na ${options.displayName}: ${errors.join(", ")}.`,
      "VALIDATION_ERROR",
      errors,
    );
  }

  const advert: Record<string, XmlRpcValue> = {
    advert_rkid: listing.id,
    advert_code: listing.id,
    user_status: true,
    advert_function: listing.deal === "RENT" ? 2 : 1,
    advert_lifetime: 4,
    advert_price: listing.priceHidden ? 0 : listing.price,
    advert_price_currency: 1,
    advert_price_unit: listing.deal === "RENT" ? 2 : 1,
    advert_price_text_note: listing.priceNote || "",
    advert_type: advertType,
    description: plainText(listing.description!).slice(0, 3000),
    locality_city: listing.location,
    locality_inaccuracy_level: 2,
    balcony: hasAmenity(listing, "balkon"),
    loggia: hasAmenity(listing, "lodzie", "loggia"),
    terrace: hasAmenity(listing, "terasa"),
    garage: hasAmenity(listing, "garaz"),
    parking_lots: hasAmenity(listing, "parkovani", "garaz"),
    cellar: hasAmenity(listing, "sklep"),
    basin: hasAmenity(listing, "bazen"),
    furnished: mapFurnishing(listing.furnishing),
    floors: listing.floors || undefined,
    acceptance_year: listing.yearBuilt || undefined,
    energy_efficiency_rating: listing.penb
      ? { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7 }[listing.penb.toUpperCase()]
      : undefined,
    advert_low_energy: listing.construction === "LOW_ENERGY",
  };

  if (options.legacyAdvertFields) {
    advert.seller_id = 0;
    advert.seller_rkid = listing.agent!.id;
    advert.title = listing.title;
    advert.locality_region = listing.region!;
    advert.locality_district = listing.district || undefined;
    advert.locality_street = listing.address || undefined;
    advert.locality_zip = listing.zip || undefined;
    advert.locality_accuracy_level = listing.address ? "UL" : "OB";
  } else if (options.sellerReference) {
    advert.seller_id = 0;
    advert.seller_rkid = listing.agent!.id;
  }

  if (listing.lat !== null && listing.lng !== null) {
    advert.locality_latitude = listing.lat;
    advert.locality_longitude = listing.lng;
  }
  if (listing.area) advert.usable_area = listing.area;
  if (buildingCondition) advert.building_condition = buildingCondition;
  if (buildingType) advert.building_type = buildingType;

  if (listing.kind === "APARTMENT") {
    advert.advert_subtype = apartmentSubtype(listing.disposition)!;
    advert.floor_number = listing.floor!;
    advert.ownership = mapOwnership(listing.ownership)!;
  } else if (listing.kind === "HOUSE") {
    advert.advert_subtype = normalize(listing.title).includes("vila") ? 39 : 37;
    advert.advert_room_count = roomCount(listing.disposition)!;
    advert.estate_area = listing.landArea!;
    advert.object_type = (listing.floors || 1) > 1 ? 2 : 1;
  } else if (listing.kind === "LAND") {
    advert.advert_subtype = normalize(`${listing.title} ${listing.description}`).includes("komerc")
      ? 18
      : 19;
    advert.estate_area = listing.landArea!;
  } else {
    advert.advert_subtype = commercialSubtype(listing);
    advert.object_type = (listing.floors || 1) > 1 ? 2 : 1;
  }

  return advert;
}

function getRpcUrl(options: SrealityCompatibleOptions): string {
  return process.env[`${options.envPrefix}_RPC_URL`] || options.defaultRpcUrl || "";
}

function getConfig(options: SrealityCompatibleOptions) {
  const clientIdKey = `${options.envPrefix}_CLIENT_ID`;
  const passwordKey = `${options.envPrefix}_IMPORT_PASSWORD`;
  const softwareKeyName = `${options.envPrefix}_SOFTWARE_KEY`;
  const clientId = Number(process.env[clientIdKey]);
  const password = process.env[passwordKey];
  const softwareKey = process.env[softwareKeyName];
  const missing = [
    !getRpcUrl(options) ? `${options.envPrefix}_RPC_URL` : null,
    !Number.isInteger(clientId) || clientId <= 0 ? clientIdKey : null,
    !password ? passwordKey : null,
    !softwareKey ? softwareKeyName : null,
  ].filter(Boolean);

  if (missing.length) {
    throw new PortalConnectorError(
      `${options.displayName} není nakonfigurováno. Chybí: ${missing.join(", ")}.`,
      "NOT_CONFIGURED",
      missing,
    );
  }

  return {
    clientId,
    passwordHash: /^[a-f0-9]{32}$/i.test(password!) ? password!.toLowerCase() : md5(password!),
    softwareKey: softwareKey!,
  };
}

function requireSuccess<T>(
  response: SrealityResponse<T>,
  method: string,
  options: SrealityCompatibleOptions,
): SrealityResponse<T> {
  if (response.status < 200 || response.status >= 300) {
    throw new PortalConnectorError(
      `${options.displayName} ${method}: ${response.status} ${response.statusMessage || "Neznámá chyba"}`,
      `${options.portal}_${response.status}`,
      response,
    );
  }
  return response;
}

function extractSessionId(output: any, displayName: string): string {
  const value = Array.isArray(output) ? output[0] : output;
  const sessionId = value?.sessionId || value?.session_id;
  if (!sessionId || typeof sessionId !== "string") {
    throw new PortalConnectorError(
      `${displayName} nevrátilo platné session ID.`,
      "INVALID_SESSION",
      output,
    );
  }
  return sessionId;
}

function extractAdvertId(output: any, displayName: string): string {
  const value = Array.isArray(output) ? output[0] : output;
  const advertId = value?.advert_id ?? value?.advertId;
  if (advertId === undefined || advertId === null) {
    throw new PortalConnectorError(
      `${displayName} nevrátilo ID inzerátu.`,
      "MISSING_EXTERNAL_ID",
      output,
    );
  }
  return String(advertId);
}

class SrealitySession {
  private sessionId = "";

  constructor(
    private readonly passwordHash: string,
    private readonly softwareKey: string,
    private readonly rpcUrl: string,
    private readonly options: SrealityCompatibleOptions,
  ) {}

  async login(clientId: number) {
    const hash = requireSuccess(
      await xmlRpcCall<SrealityResponse>(this.rpcUrl, "getHash", [clientId]),
      "getHash",
      this.options,
    );
    this.sessionId = extractSessionId(hash.output, this.options.displayName);
    const login = requireSuccess(
      await xmlRpcCall<SrealityResponse>(this.rpcUrl, "login", [this.nextSessionId()]),
      "login",
      this.options,
    );
    return login;
  }

  async call<T>(method: string, params: XmlRpcValue[] = []): Promise<SrealityResponse<T>> {
    return requireSuccess(
      await xmlRpcCall<SrealityResponse<T>>(this.rpcUrl, method, [this.nextSessionId(), ...params]),
      method,
      this.options,
    );
  }

  async logout() {
    if (!this.sessionId) return;
    try {
      await this.call("logout");
    } catch {
      // Relace na serveru sama vyprší; chyba odhlášení nesmí přepsat výsledek exportu.
    }
  }

  private nextSessionId(): string {
    const fixedPart = this.sessionId.slice(0, 48);
    this.sessionId = fixedPart + md5(this.sessionId + this.passwordHash + this.softwareKey);
    return this.sessionId;
  }
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

export function createSrealityCompatibleConnector(
  options: SrealityCompatibleOptions,
): PortalConnector {
  return {
    portal: options.portal,

    async inspect(): Promise<PortalConnectionStatus> {
      const rpcUrl = getRpcUrl(options);
      if (!rpcUrl) {
        return {
          portal: options.portal,
          implemented: true,
          configured: false,
          reachable: false,
          message: `Adaptér je připravený, ale portál musí dodat importní endpoint (${options.envPrefix}_RPC_URL).`,
        };
      }

      try {
        const response = requireSuccess(
          await xmlRpcCall<SrealityResponse<{ version?: string }>>(rpcUrl, "version"),
          "version",
          options,
        );
        const output = Array.isArray(response.output) ? response.output[0] : response.output;
        const version =
          typeof output === "string"
            ? output
            : output && typeof output === "object" && "version" in output
              ? String(output.version)
              : undefined;
        let configured = true;
        try {
          getConfig(options);
        } catch {
          configured = false;
        }
        return {
          portal: options.portal,
          implemented: true,
          configured,
          reachable: true,
          version,
          message: configured
            ? "Importní server je dostupný a přístupy jsou nakonfigurované."
            : "Importní server je dostupný, ale chybí přístupové údaje.",
        };
      } catch (error) {
        return {
          portal: options.portal,
          implemented: true,
          configured: false,
          reachable: false,
          message: error instanceof Error ? error.message : "Importní server není dostupný.",
        };
      }
    },

    async sync(listing: PortalListing): Promise<PortalSyncResult> {
      const config = getConfig(options);
      const advert = buildAdvert(listing, options);
      const session = new SrealitySession(
        config.passwordHash,
        config.softwareKey,
        getRpcUrl(options),
        options,
      );

      try {
        await session.login(config.clientId);
        if (options.syncSeller) {
          const sellerData = options.legacySellerFields
            ? {
                client_login: listing.agent!.email,
                client_name: listing.agent!.name,
                contact_gsm: listing.agent!.phone!,
                contact_email: listing.agent!.email,
              }
            : {
                client_login: listing.agent!.email,
                client_name: listing.agent!.name,
                contact_gsm: listing.agent!.phone!,
                contact_email: listing.agent!.email,
                client_is_employee: false,
                client_ic: false,
              };
          await session.call("addSeller", [
            0,
            listing.agent!.id,
            sellerData,
          ]);
        }
        const addAdvert = await session.call("addAdvert", [advert]);
        const externalId = extractAdvertId(addAdvert.output, options.displayName);

        const images = listing.images.slice(0, 30);
        for (let index = 0; index < images.length; index++) {
          const image = images[index];
          const photo = await downloadPhoto(image.url);
          try {
            await session.call("addPhoto", [
              Number(externalId),
              listing.id,
              {
                data: photo,
                main: index === 0 ? 1 : 0,
                order: index + 1,
                alt: image.alt || listing.title,
                photo_rkid: `${listing.id}:${image.id}`,
              },
            ]);
          } catch (error) {
            if (
              !(error instanceof PortalConnectorError) ||
              error.code !== `${options.portal}_451`
            ) {
              throw error;
            }
          }
        }

        const list = await session.call<SrealityAdvert[]>("listAdvert");
        const adverts = Array.isArray(list.output) ? list.output : [];
        const remote = adverts.find(
          (item) => String(item.advert_id) === externalId || item.advert_rkid === listing.id,
        );
        if (!remote) {
          throw new PortalConnectorError(
            `${options.displayName} inzerát přijalo, ale následné ověření ho nenašlo.`,
            "VERIFICATION_FAILED",
          );
        }

        const published = remote.published === 1;
        const statusCode = remote.published_status ?? 0;
        const statusText = PUBLISH_STATUS[statusCode] || `Stav ${statusCode}`;

        return {
          externalId,
          remoteUrl: remote.advert_url,
          remoteStatus: `${statusCode}: ${statusText}`,
          published,
          message: published
            ? `Inzerát byl ověřen jako zveřejněný na ${options.displayName}.`
            : `${options.displayName} inzerát přijalo, ale zatím není zveřejněný: ${statusText}.`,
        };
      } finally {
        await session.logout();
      }
    },
  };
}

export const srealityConnector = createSrealityCompatibleConnector({
  portal: "SREALITY",
  displayName: "Sreality",
  envPrefix: "SREALITY",
  defaultRpcUrl: "https://import.sreality.cz/RPC2",
});
