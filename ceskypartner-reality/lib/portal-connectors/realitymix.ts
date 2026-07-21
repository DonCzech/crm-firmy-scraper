import { createHash } from "crypto";
import sharp from "sharp";
import type { PortalConnector, PortalConnectionStatus, PortalListing, PortalSyncResult } from "./types";
import { PortalConnectorError } from "./types";
import { xmlRpcCall, type XmlRpcValue } from "./xmlrpc";

type RealityMixResponse<T = unknown> = {
  status: number;
  statusMessage: string;
  output?: T;
};

type RealityMixAdvert = {
  advert_id: number;
  rkid: string;
  advert_type: number;
  status_user?: number;
  user_status?: number;
};

type RealityMixPhoto = {
  photo_id: number;
  photo_rkid: string;
};

const RPC_URL = process.env.REALITYMIX_RPC_URL || "https://realitymix.cz/import/rpc/";

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

function mapOwnership(ownership: string | null): number | undefined {
  const map: Record<string, number> = { PERSONAL: 1, COOPERATIVE: 2, STATE: 3 };
  return ownership ? map[ownership] : undefined;
}

function mapFlatKind(disposition: string | null): number | null {
  const map: Record<string, number> = {
    "1+kk": 2,
    "2+kk": 3,
    "3+kk": 4,
    "4+kk": 5,
    "5+kk": 6,
    "6+kk": 7,
    "7+kk": 8,
    "1+1": 9,
    "2+1": 10,
    "3+1": 11,
    "4+1": 12,
    "5+1": 13,
    "6+1": 14,
    "7+1": 15,
  };
  return disposition ? map[disposition] || 16 : null;
}

function mapCommercialKind(listing: PortalListing): number {
  const text = normalize(`${listing.title} ${listing.description || ""}`);
  if (text.includes("sklad")) return 1;
  if (text.includes("vyrob")) return 2;
  if (text.includes("obchod")) return 3;
  if (text.includes("administr") || text.includes("kancelar")) return 7;
  return 6;
}

function mapLandKind(listing: PortalListing): number {
  const text = normalize(`${listing.title} ${listing.description || ""}`);
  if (text.includes("komerc")) return 1;
  if (text.includes("zemedel")) return 3;
  if (text.includes("les")) return 4;
  if (text.includes("louka") || text.includes("travni")) return 5;
  if (text.includes("zahrad")) return 6;
  if (text.includes("staveb") || text.includes("bydlen")) return 2;
  return 7;
}

function decimalToDms(value: number, latitude: boolean): string {
  const absolute = Math.abs(value);
  const degrees = Math.floor(absolute);
  const minutesFloat = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = ((minutesFloat - minutes) * 60).toFixed(2);
  const direction = latitude ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
  return `${degrees}°${minutes}'${seconds}"${direction}`;
}

function parseAddress(address: string | null): { street?: string; cp?: number } {
  if (!address) return {};
  const match = address.trim().match(/^(.*?)(?:\s+(\d+)(?:\/\d+)?)?$/);
  return {
    street: match?.[1]?.trim() || address,
    cp: match?.[2] ? Number(match[2]) : undefined,
  };
}

function buildAdvert(listing: PortalListing): Record<string, XmlRpcValue> {
  const errors: string[] = [];
  const description = plainText(listing.description || "");
  const condition = mapCondition(listing.condition);
  const construction = mapConstruction(listing.construction);

  if (listing.status !== "ACTIVE") errors.push("nemovitost musí být aktivní");
  if (!description) errors.push("chybí popis");
  if (!listing.location) errors.push("chybí město nebo lokalita");
  if (listing.images.length === 0) errors.push("chybí fotografie");
  if (listing.kind !== "LAND") {
    if (!condition) errors.push("chybí stav nemovitosti");
    if (!construction) errors.push("chybí typ konstrukce");
    if (!listing.area) errors.push("chybí plocha");
  }
  if (listing.kind === "APARTMENT") {
    if (!listing.disposition) errors.push("chybí dispozice");
    if (listing.floor === null) errors.push("chybí podlaží");
  }
  if (listing.kind === "HOUSE") {
    if (!listing.floors) errors.push("chybí počet podlaží");
  }
  if (listing.kind === "LAND" && !listing.landArea) errors.push("chybí plocha pozemku");

  if (errors.length) {
    throw new PortalConnectorError(
      `Data nelze odeslat na RealityMIX: ${errors.join(", ")}.`,
      "VALIDATION_ERROR",
      errors,
    );
  }

  const advertType = { APARTMENT: 4, HOUSE: 6, LAND: 3, COMMERCIAL: 2 }[listing.kind];
  const address = parseAddress(listing.address);
  const parking = hasAmenity(listing, "parkovani", "garaz") ? 1 : 0;

  const advert: Record<string, XmlRpcValue> = {
    rkid: listing.id,
    advert_type: advertType,
    advert_function: listing.deal === "RENT" ? 2 : 1,
    advert_price: listing.priceHidden ? 0 : listing.price,
    advert_price_note: listing.priceNote || (listing.priceHidden ? "Cena na vyžádání" : ""),
    advert_price_currency: 1,
    advert_price_unit: listing.deal === "RENT" ? 2 : 1,
    title: listing.title,
    basic_description: description.slice(0, 200),
    description,
    advert_city: listing.location,
    advert_street: address.street,
    advert_cp: address.cp,
    advert_zip: listing.zip ? Number(listing.zip.replace(/\s/g, "")) : undefined,
    show_map: 1,
    acceptance_year: listing.yearBuilt || undefined,
    construction_year: listing.yearBuilt || undefined,
    energy_efficiency_rating: listing.penb
      ? { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7 }[listing.penb.toUpperCase()]
      : undefined,
    energy_performance_certificate: listing.penb ? 3 : undefined,
    equipment: listing.furnishing === "UNFURNISHED" ? 0 : listing.furnishing ? 1 : undefined,
    virtual_tour: listing.tourUrl || undefined,
    video_url: listing.videoUrl || undefined,
    parking,
  };

  if (listing.lat !== null && listing.lng !== null) {
    advert.gps_latitude = decimalToDms(listing.lat, true);
    advert.gps_longitude = decimalToDms(listing.lng, false);
  }

  if (listing.kind === "APARTMENT") {
    advert.building_condition = condition!;
    advert.building_type = construction!;
    advert.flat_kind = mapFlatKind(listing.disposition)!;
    advert.floor_area = listing.area!;
    advert.floor_number = listing.floor!;
    advert.floors = listing.floors || undefined;
    advert.ownership = mapOwnership(listing.ownership);
    advert.flat_facilities = hasAmenity(listing, "garaz")
      ? 0
      : hasAmenity(listing, "vytah")
        ? 1
        : hasAmenity(listing, "parkovani")
          ? 2
          : undefined;
  } else if (listing.kind === "HOUSE") {
    advert.building_condition = condition!;
    advert.building_type = construction!;
    advert.floors = listing.floors!;
    advert.object_kind = 4;
    advert.object_type = listing.floors! > 1 ? 2 : 1;
    advert.usable_area = listing.area!;
    advert.plot_area = listing.landArea || listing.area!;
  } else if (listing.kind === "LAND") {
    advert.area_unit = 2;
    advert.estate_kind = mapLandKind(listing);
    advert.total_area = listing.landArea!;
  } else {
    advert.building_condition = condition!;
    advert.building_type = construction!;
    advert.commercial_kind = mapCommercialKind(listing);
    advert.total_area = listing.area!;
    advert.floors = listing.floors || undefined;
  }

  return advert;
}

function getConfig() {
  const clientId = Number(process.env.REALITYMIX_CLIENT_ID);
  const password = process.env.REALITYMIX_PASSWORD;
  const softwareKey = process.env.REALITYMIX_SOFTWARE_KEY;
  const missing = [
    !Number.isInteger(clientId) || clientId <= 0 ? "REALITYMIX_CLIENT_ID" : null,
    !password ? "REALITYMIX_PASSWORD" : null,
    !softwareKey ? "REALITYMIX_SOFTWARE_KEY" : null,
  ].filter(Boolean);

  if (missing.length) {
    throw new PortalConnectorError(
      `RealityMIX není nakonfigurováno. Chybí: ${missing.join(", ")}.`,
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
  response: RealityMixResponse<T>,
  method: string,
  accepted = [200],
): RealityMixResponse<T> {
  if (!accepted.includes(response.status)) {
    throw new PortalConnectorError(
      `RealityMIX ${method}: ${response.status} ${response.statusMessage || "Neznámá chyba"}`,
      `REALITYMIX_${response.status}`,
      response,
    );
  }
  return response;
}

function firstOutput(output: any): any {
  return Array.isArray(output) ? output[0] : output;
}

async function loginRealityMix() {
  const config = getConfig();
  const hashResponse = requireSuccess(
    await xmlRpcCall<RealityMixResponse>(RPC_URL, "getHash", [config.clientId]),
    "getHash",
  );
  const hashOutput = firstOutput(hashResponse.output);
  const sessionId = hashOutput?.session_id;
  const hashKey = hashOutput?.hashkey;
  if (!sessionId || !hashKey) {
    throw new PortalConnectorError(
      "RealityMIX nevrátilo session_id nebo hashkey.",
      "INVALID_SESSION",
      hashResponse,
    );
  }

  const password = md5(config.passwordHash + hashKey);
  requireSuccess(
    await xmlRpcCall<RealityMixResponse>(RPC_URL, "login", [
      sessionId,
      password,
      config.softwareKey,
    ]),
    "login",
  );
  return { sessionId, clientId: config.clientId };
}

async function downloadRealityMixPhoto(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
    headers: { "User-Agent": "CeskyPartner-Reality/1.0" },
  });
  if (!response.ok) throw new Error(`Fotografii nelze stáhnout (${response.status}): ${url}`);
  const input = Buffer.from(await response.arrayBuffer());
  const metadata = await sharp(input).metadata();
  if ((metadata.width || 0) < 640 || (metadata.height || 0) < 480) {
    throw new Error(`RealityMIX vyžaduje fotografii alespoň 640×480 px: ${url}`);
  }

  for (const width of [1600, 1280, 1024, 800, 640]) {
    for (const quality of [82, 72, 62, 52, 42]) {
      const output = await sharp(input)
        .rotate()
        .resize({ width, height: Math.round((width * 3) / 4), fit: "inside", withoutEnlargement: true })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
      if (output.length <= 100_000) return output;
    }
  }

  throw new Error(`Fotografii se nepodařilo zmenšit pod limit 100 kB: ${url}`);
}

export const realityMixConnector: PortalConnector = {
  portal: "REALITYMIX",

  async inspect(): Promise<PortalConnectionStatus> {
    let configured = true;
    try {
      getConfig();
    } catch {
      configured = false;
    }

    try {
      if (configured) {
        const { sessionId } = await loginRealityMix();
        await xmlRpcCall<RealityMixResponse>(RPC_URL, "logout", [sessionId]);
      } else {
        const response = await fetch(RPC_URL, {
          method: "GET",
          cache: "no-store",
          signal: AbortSignal.timeout(15_000),
        });
        if (response.status >= 500) throw new Error(`HTTP ${response.status}`);
      }

      return {
        portal: "REALITYMIX",
        implemented: true,
        configured,
        reachable: true,
        version: "1.3.5",
        message: configured
          ? "Importní server je dostupný a přístupy jsou funkční."
          : "Importní server je dostupný, ale chybí testovací nebo produkční přístupy.",
      };
    } catch (error) {
      return {
        portal: "REALITYMIX",
        implemented: true,
        configured,
        reachable: false,
        version: "1.3.5",
        message: error instanceof Error ? error.message : "Importní server není dostupný.",
      };
    }
  },

  async sync(listing: PortalListing): Promise<PortalSyncResult> {
    const advert = buildAdvert(listing);
    const { sessionId, clientId } = await loginRealityMix();

    try {
      const addAdvert = requireSuccess(
        await xmlRpcCall<RealityMixResponse>(RPC_URL, "addAdvert", [
          sessionId,
          advert,
          {},
        ]),
        "addAdvert",
      );
      const externalId = String(firstOutput(addAdvert.output)?.advert_id ?? "");
      if (!externalId) {
        throw new PortalConnectorError(
          "RealityMIX nevrátilo ID inzerátu.",
          "MISSING_EXTERNAL_ID",
          addAdvert,
        );
      }

      const existingPhotosResponse = requireSuccess(
        await xmlRpcCall<RealityMixResponse<RealityMixPhoto[]>>(RPC_URL, "listPhoto", [
          sessionId,
          Number(externalId),
          "",
        ]),
        "listPhoto",
      );
      const existingPhotos = Array.isArray(existingPhotosResponse.output)
        ? existingPhotosResponse.output
        : existingPhotosResponse.output
          ? [existingPhotosResponse.output as RealityMixPhoto]
          : [];
      for (const photo of existingPhotos) {
        requireSuccess(
          await xmlRpcCall<RealityMixResponse>(RPC_URL, "delPhoto", [
            sessionId,
            photo.photo_id,
            "",
          ]),
          "delPhoto",
        );
      }

      for (let index = 0; index < listing.images.length; index++) {
        const image = listing.images[index];
        const data = await downloadRealityMixPhoto(image.url);
        requireSuccess(
          await xmlRpcCall<RealityMixResponse>(RPC_URL, "addPhoto", [
            sessionId,
            Number(externalId),
            "",
            data,
            index === 0 ? 1 : 0,
            image.alt || listing.title,
            `${listing.id}:${image.id}`,
            "",
          ]),
          "addPhoto",
        );
      }

      const listResponse = requireSuccess(
        await xmlRpcCall<RealityMixResponse<RealityMixAdvert[]>>(RPC_URL, "listAdvert", [
          sessionId,
        ]),
        "listAdvert",
      );
      const adverts = Array.isArray(listResponse.output)
        ? listResponse.output
        : listResponse.output
          ? [listResponse.output as RealityMixAdvert]
          : [];
      const remote = adverts.find(
        (item) => String(item.advert_id) === externalId || item.rkid === listing.id,
      );
      if (!remote) {
        throw new PortalConnectorError(
          "RealityMIX inzerát přijalo, ale následné ověření ho nenašlo.",
          "VERIFICATION_FAILED",
        );
      }

      const active = (remote.status_user ?? remote.user_status) === 1;
      const remoteUrl = `https://realitymix.cz/detail.php?rk_id=${clientId}&rk_cislo=${encodeURIComponent(listing.id)}`;
      return {
        externalId,
        remoteUrl,
        remoteStatus: active ? "1: Aktivní" : "0: Neaktivní",
        published: active,
        message: active
          ? "Inzerát byl ověřen jako aktivní na RealityMIX."
          : "RealityMIX inzerát přijalo, ale zatím ho vede jako neaktivní.",
      };
    } finally {
      try {
        await xmlRpcCall<RealityMixResponse>(RPC_URL, "logout", [sessionId]);
      } catch {
        // Chyba odhlášení nesmí přepsat výsledek exportu.
      }
    }
  },
};
