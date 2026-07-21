import { createHash } from "crypto";
import { Readable } from "stream";
import { Client } from "basic-ftp";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import sharp from "sharp";
import type {
  PortalConnectionStatus,
  PortalConnector,
  PortalListing,
  PortalSyncContext,
  PortalSyncResult,
} from "./types";
import { PortalConnectorError } from "./types";

type IdnesConfig = {
  login: string;
  password: string;
  baseUrl: string;
  testMode: boolean;
  ftp: {
    host: string;
    user: string;
    password: string;
    port: number;
    secure: boolean | "implicit";
  };
};

type IdnesResponse = {
  root?: {
    control?: {
      status?: string;
      message?: string;
      warning?: string | string[];
    };
    data?: Record<string, unknown>;
  };
};

type PreparedImage = {
  hash: string;
  filename: string;
  data: Buffer;
};

const XML_PARSER = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: true,
  trimValues: true,
});

const XML_BUILDER = new XMLBuilder({
  format: true,
  ignoreAttributes: false,
  suppressEmptyNode: true,
});

function envEnabled(value: string | undefined): boolean {
  return value === "1" || value?.toLowerCase() === "true";
}

function getConfig(): IdnesConfig {
  const explicitBaseUrl = process.env.REALITY_IDNES_BASE_URL?.trim();
  const testMode = explicitBaseUrl
    ? explicitBaseUrl.includes("test.reality.idnes.cz")
    : process.env.REALITY_IDNES_TEST_MODE?.toLowerCase() !== "false";
  const baseUrl =
    explicitBaseUrl ||
    (testMode
      ? "https://test.reality.idnes.cz/import/v2/"
      : "https://import.reality.idnes.cz/import/v2/");
  const login = process.env.REALITY_IDNES_LOGIN?.trim();
  const password = process.env.REALITY_IDNES_PASSWORD;
  const ftpHost = process.env.REALITY_IDNES_FTP_HOST?.trim();
  const ftpUser = process.env.REALITY_IDNES_FTP_USER?.trim();
  const ftpPassword = process.env.REALITY_IDNES_FTP_PASSWORD;
  const ftpPort = Number(process.env.REALITY_IDNES_FTP_PORT || 21);
  const secureSetting = process.env.REALITY_IDNES_FTP_SECURE?.toLowerCase();
  const secure = secureSetting === "implicit" ? "implicit" : envEnabled(secureSetting);
  const missing = [
    !login ? "REALITY_IDNES_LOGIN" : null,
    !password ? "REALITY_IDNES_PASSWORD" : null,
    !ftpHost ? "REALITY_IDNES_FTP_HOST" : null,
    !ftpUser ? "REALITY_IDNES_FTP_USER" : null,
    !ftpPassword ? "REALITY_IDNES_FTP_PASSWORD" : null,
    !Number.isInteger(ftpPort) || ftpPort <= 0 ? "REALITY_IDNES_FTP_PORT" : null,
    !testMode && !envEnabled(process.env.REALITY_IDNES_STATIC_EGRESS_CONFIRMED)
      ? "REALITY_IDNES_STATIC_EGRESS_CONFIRMED"
      : null,
  ].filter(Boolean);

  if (missing.length) {
    throw new PortalConnectorError(
      `Reality.iDNES není nakonfigurováno. Chybí: ${missing.join(", ")}.`,
      "NOT_CONFIGURED",
      missing,
    );
  }

  return {
    login: login!,
    password: password!,
    baseUrl: baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`,
    testMode,
    ftp: {
      host: ftpHost!,
      user: ftpUser!,
      password: ftpPassword!,
      port: ftpPort,
      secure,
    },
  };
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

function listingText(listing: PortalListing): string {
  return normalize(`${listing.title} ${listing.description || ""}`);
}

function hasAmenity(listing: PortalListing, ...needles: string[]): boolean {
  const amenities = listing.amenities.map(normalize);
  return needles.some((needle) => amenities.some((item) => item.includes(normalize(needle))));
}

function mapSubtype(listing: PortalListing): number {
  if (listing.kind === "APARTMENT") {
    const map: Record<string, number> = {
      "1+kk": 1,
      "1+1": 2,
      "2+kk": 3,
      "2+1": 4,
      "3+kk": 5,
      "3+1": 6,
      "4+kk": 7,
      "4+1": 8,
      "5+kk": 9,
      "5+1": 12,
      "6+kk": 13,
      "6+1": 13,
      "7+kk": 13,
      "7+1": 13,
      "pokoj": 14,
    };
    return listing.disposition ? map[normalize(listing.disposition)] || 11 : 11;
  }

  const text = listingText(listing);
  if (listing.kind === "HOUSE") {
    if (text.includes("radov")) return 1;
    if (text.includes("rohov")) return 2;
    if (text.includes("v bloku")) return 3;
    return 4;
  }
  if (listing.kind === "COMMERCIAL") {
    if (text.includes("kancelar")) return 1;
    if (text.includes("administrativ")) return 2;
    if (text.includes("obchodni centrum")) return 4;
    if (text.includes("obchod")) return 3;
    if (text.includes("sklad")) return 5;
    if (text.includes("vyrob")) return 6;
    if (text.includes("prumysl")) return 7;
    if (text.includes("hotel")) return 8;
    if (text.includes("penzion")) return 9;
    if (text.includes("restaur")) return 10;
    if (text.includes("najemni dum") || text.includes("bytovy dum")) return 11;
    if (text.includes("zemedel")) return 12;
    if (text.includes("hrad") || text.includes("zamek") || text.includes("tvrz")) return 14;
    return 13;
  }

  if (text.includes("komerc")) return 2;
  if (text.includes("zemedel")) return 4;
  if (text.includes("les")) return 5;
  if (text.includes("zahrad")) return 6;
  if (text.includes("louka")) return 8;
  if (text.includes("vodni")) return 9;
  if (text.includes("staveb") || text.includes("bydlen")) return 1;
  return 7;
}

function mapConstruction(construction: string | null): number | undefined {
  const map: Record<string, number> = {
    BRICK: 1,
    PANEL: 2,
    WOOD: 3,
    STONE: 4,
    MIXED: 5,
    SKELETON: 6,
    LOW_ENERGY: 7,
  };
  return construction ? map[construction] : undefined;
}

function mapBuildingCondition(condition: string | null): number | undefined {
  const map: Record<string, number> = {
    NEW_BUILD: 1,
    VERY_GOOD: 3,
    GOOD: 3,
    TO_RECONSTRUCT: 5,
    UNDER_CONSTRUCTION: 9,
    DEVELOPER_PROJECT: 8,
  };
  return condition ? map[condition] : undefined;
}

function mapApartmentCondition(condition: string | null): number | undefined {
  const map: Record<string, number> = {
    NEW_BUILD: 1,
    VERY_GOOD: 3,
    GOOD: 4,
    TO_RECONSTRUCT: 5,
    UNDER_CONSTRUCTION: 9,
    DEVELOPER_PROJECT: 8,
  };
  return condition ? map[condition] : undefined;
}

function mapFloor(floor: number | null): number | undefined {
  if (floor === null) return undefined;
  if (floor === 0) return 1000;
  if (floor === -1) return 1002;
  if (floor < -1) return floor;
  if (floor > 20) return 999;
  return floor;
}

function mapOwnership(ownership: string | null): number | undefined {
  const map: Record<string, number> = {
    PERSONAL: 1,
    COOPERATIVE: 2,
    STATE: 3,
  };
  return ownership ? map[ownership] : undefined;
}

function mapFurnishing(furnishing: string | null): number | undefined {
  const map: Record<string, number> = {
    FURNISHED: 1,
    PARTLY: 2,
    UNFURNISHED: 3,
  };
  return furnishing ? map[furnishing] : undefined;
}

function withoutUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined && item !== null && item !== ""),
  ) as T;
}

function validateListing(listing: PortalListing): void {
  const description = plainText(listing.description || "");
  const errors: string[] = [];
  if (listing.status !== "ACTIVE") errors.push("nemovitost musí být aktivní");
  if (listing.title.trim().length < 5) errors.push("titulek musí mít alespoň 5 znaků");
  if (description.length < 30) errors.push("popis musí mít alespoň 30 znaků");
  if (listing.images.length === 0) errors.push("chybí fotografie");
  if (listing.lat === null || listing.lng === null) {
    errors.push("chybí GPS souřadnice pro reverzní geocoding");
  }
  if (!listing.priceHidden && (!listing.price || listing.price < 0)) errors.push("chybí platná cena");
  if (listing.kind === "APARTMENT") {
    if (!listing.disposition) errors.push("chybí dispozice bytu");
    if (!listing.ownership) errors.push("chybí forma vlastnictví");
    if (listing.floor === null) errors.push("chybí podlaží");
  }
  if (listing.kind !== "LAND") {
    if (!listing.area) errors.push("chybí užitná plocha");
    if (!listing.construction) errors.push("chybí konstrukce budovy");
    if (!listing.condition) errors.push("chybí stav nemovitosti");
  }
  if (listing.kind === "LAND" && !listing.landArea) errors.push("chybí plocha pozemku");

  if (errors.length) {
    throw new PortalConnectorError(
      `Data nelze odeslat na Reality.iDNES: ${errors.join(", ")}.`,
      "VALIDATION_ERROR",
      errors,
    );
  }
}

function buildPropertyXml(
  listing: PortalListing,
  localId: number,
  images: PreparedImage[],
): string {
  validateListing(listing);
  const description = plainText(listing.description || "");
  const isa = { APARTMENT: 1, HOUSE: 2, COMMERCIAL: 3, LAND: 4 }[listing.kind];
  const isRent = listing.deal === "RENT";
  const property = withoutUndefined({
    id_exported: localId,
    id_nemo_ext: listing.id.slice(0, 32),
    isa,
    isa_sub: mapSubtype(listing),
    f_typ_nabidky: isRent ? 2 : 1,
    f_typ_pronajmu: isRent ? 1 : undefined,
    f_vlastnictvi: listing.kind === "APARTMENT" ? mapOwnership(listing.ownership) : undefined,
    f_stav_zakazky: 1,
    b_exclusive: listing.exclusive ? 1 : 0,
    cena: listing.priceHidden ? 0 : listing.price,
    f_mena: 0,
    f_cena_za_prodej: isRent ? undefined : 1,
    f_cena_za_pronajem: isRent ? 1 : undefined,
    b_cena_hide: listing.priceHidden ? 1 : 0,
    cena_vratna_kauce: isRent && listing.deposit ? listing.deposit : undefined,
    poznamka_cena: listing.priceNote?.slice(0, 150),
    b_reverse_geocoding: 1,
    f_rev_geo_mode: 1,
    gps_lat: listing.lat!,
    gps_lng: listing.lng!,
    b_show_map: 1,
    titulek: listing.title.trim().slice(0, 100),
    popis: description,
    b_zobrazit: 1,
    podlazi_nad: listing.floors || undefined,
    f_podlazi_nr: listing.kind === "APARTMENT" ? mapFloor(listing.floor) : undefined,
    pl_uzitna: listing.kind === "LAND" ? undefined : listing.area!,
    pl_celkem: listing.kind === "LAND" ? listing.landArea! : listing.area!,
    pl_parcela:
      listing.kind === "LAND" || listing.kind === "HOUSE"
        ? listing.landArea || undefined
        : undefined,
    f_konstrukce: listing.kind === "LAND" ? undefined : mapConstruction(listing.construction),
    f_stav_budovy:
      listing.kind === "LAND" ? undefined : mapBuildingCondition(listing.condition),
    f_stav_bytu:
      listing.kind === "APARTMENT" ? mapApartmentCondition(listing.condition) : undefined,
    f_vybaveni: listing.kind === "LAND" ? undefined : mapFurnishing(listing.furnishing),
    rok_vystavby: listing.yearBuilt || undefined,
    b_vytah: hasAmenity(listing, "vytah") ? 1 : undefined,
    b_bezbarier: hasAmenity(listing, "bezbarier") ? 1 : undefined,
    b_sklep: hasAmenity(listing, "sklep") ? 1 : undefined,
    b_bazen: hasAmenity(listing, "bazen") ? 1 : undefined,
    b_zahrada: hasAmenity(listing, "zahrada") ? 1 : undefined,
    url_virtual_tour: listing.tourUrl || undefined,
    images: {
      image: images.map((image, index) => ({
        ord: index + 1,
        hash: image.hash,
        filename: image.filename,
      })),
    },
  });

  return `<?xml version="1.0" encoding="utf-8"?>\n${XML_BUILDER.build({
    nemovitost: property,
  })}`;
}

async function prepareImage(url: string, login: string): Promise<PreparedImage> {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
    headers: { "User-Agent": "CeskyPartner-Reality/1.0" },
  });
  if (!response.ok) {
    throw new PortalConnectorError(
      `Fotografii nelze stáhnout (${response.status}): ${url}`,
      "IMAGE_DOWNLOAD_FAILED",
    );
  }

  const input = Buffer.from(await response.arrayBuffer());
  const data = await sharp(input)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
  const hash = createHash("md5").update(data).digest("hex");
  const loginPrefix = login.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!loginPrefix) {
    throw new PortalConnectorError(
      "Reality.iDNES login nelze použít v názvu souboru.",
      "INVALID_LOGIN",
    );
  }
  return {
    hash,
    filename: `${loginPrefix}_${hash}.jpg`,
    data,
  };
}

async function callIdnes(
  config: IdnesConfig,
  script: string,
  params: Record<string, string | number> = {},
): Promise<NonNullable<IdnesResponse["root"]>> {
  const url = new URL(script, config.baseUrl);
  url.searchParams.set("login", config.login);
  url.searchParams.set("pwd", config.password);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));

  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(45_000),
    headers: { "User-Agent": "CeskyPartner-Reality/1.0" },
  });
  const body = await response.text();
  if (!response.ok) {
    throw new PortalConnectorError(
      `Reality.iDNES ${script}: HTTP ${response.status}.`,
      `REALITY_IDNES_HTTP_${response.status}`,
      body.slice(0, 1000),
    );
  }

  const root = (XML_PARSER.parse(body) as IdnesResponse).root;
  if (!root) {
    throw new PortalConnectorError(
      `Reality.iDNES ${script} nevrátilo platné XML.`,
      "INVALID_RESPONSE",
      body.slice(0, 1000),
    );
  }
  if (normalize(String(root.control?.status || "")) !== "ok") {
    const message = String(root.control?.message || "Neznámá chyba importu");
    throw new PortalConnectorError(
      `Reality.iDNES ${script}: ${message}`,
      "REALITY_IDNES_REJECTED",
      root,
    );
  }
  return root;
}

async function verifyFtp(config: IdnesConfig): Promise<void> {
  const client = new Client(30_000);
  try {
    await client.access(config.ftp);
    await client.pwd();
  } finally {
    client.close();
  }
}

async function uploadFiles(
  config: IdnesConfig,
  images: PreparedImage[],
  xmlFilename: string,
  xml: string,
): Promise<void> {
  const client = new Client(45_000);
  try {
    await client.access(config.ftp);
    for (const image of images) {
      await client.uploadFrom(Readable.from([image.data]), image.filename);
    }
    await client.uploadFrom(Readable.from([Buffer.from(xml, "utf8")]), xmlFilename);
  } catch (error) {
    throw new PortalConnectorError(
      `Reality.iDNES FTP přenos selhal: ${
        error instanceof Error ? error.message : "neznámá chyba"
      }`,
      "FTP_UPLOAD_FAILED",
      error,
    );
  } finally {
    client.close();
  }
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
}

export const realityIdnesConnector: PortalConnector = {
  portal: "REALITY_IDNES",

  async inspect(): Promise<PortalConnectionStatus> {
    let config: IdnesConfig | null = null;
    try {
      config = getConfig();
    } catch {
      // Veřejnou dostupnost rozhraní ověříme i bez přístupů.
    }

    try {
      if (config) {
        await callIdnes(config, "login_check.php");
        await verifyFtp(config);
      } else {
        const response = await fetch("https://test.reality.idnes.cz/import/v2/login_check.php", {
          cache: "no-store",
          signal: AbortSignal.timeout(15_000),
        });
        if (response.status >= 500) throw new Error(`HTTP ${response.status}`);
      }

      return {
        portal: "REALITY_IDNES",
        implemented: true,
        configured: Boolean(config),
        reachable: true,
        version: "2.3.3",
        message: config
          ? `Importní API i FTP jsou dostupné (${config.testMode ? "test" : "produkce"}).`
          : "Importní server je dostupný, ale chybí API/FTP přístupy nebo potvrzení pevné IP.",
      };
    } catch (error) {
      return {
        portal: "REALITY_IDNES",
        implemented: true,
        configured: Boolean(config),
        reachable: false,
        version: "2.3.3",
        message: error instanceof Error ? error.message : "Importní server není dostupný.",
      };
    }
  },

  async sync(
    listing: PortalListing,
    context: PortalSyncContext,
  ): Promise<PortalSyncResult> {
    const config = getConfig();
    validateListing(listing);

    await callIdnes(config, "login_check.php");
    const credit = await callIdnes(config, "rk_has_credit.php");
    const creditData = asRecord(credit.data);
    if (Number(creditData?.has_credit) !== 1) {
      throw new PortalConnectorError(
        "Reality.iDNES účet nemá kredit pro zveřejnění nabídky.",
        "NO_CREDIT",
        credit,
      );
    }

    const images: PreparedImage[] = [];
    for (const image of listing.images.slice(0, 30)) {
      images.push(await prepareImage(image.url, config.login));
    }
    const xml = buildPropertyXml(listing, context.localId, images);
    const xmlFilename = `${config.login.replace(/[^a-zA-Z0-9_-]/g, "")}_${context.localId}.xml`;
    await uploadFiles(config, images, xmlFilename, xml);

    const imported = await callIdnes(config, "nemo_import.php", {
      filename: xmlFilename,
    });
    const importedData = asRecord(imported.data);
    const importedId = importedData?.id_nemo;

    const list = await callIdnes(config, "nemo_get_list.php", {
      id_exported: context.localId,
    });
    const listData = asRecord(list.data);
    const remoteValue = listData?.nemovitost;
    const remote = asRecord(Array.isArray(remoteValue) ? remoteValue[0] : remoteValue);
    if (!remote) {
      throw new PortalConnectorError(
        "Reality.iDNES nabídku přijalo, ale následné ověření ji nenašlo.",
        "VERIFICATION_FAILED",
        list,
      );
    }

    const visible = Number(remote.b_visible) === 1;
    const imageCount = Number(remote.image_count || 0);
    const externalId = String(remote.id_nemo || importedId || "");
    if (!externalId) {
      throw new PortalConnectorError(
        "Reality.iDNES nevrátilo interní ID nabídky.",
        "MISSING_EXTERNAL_ID",
        remote,
      );
    }

    let remoteUrl: string | undefined;
    try {
      const urlResponse = await callIdnes(config, "nemo_get_url.php", {
        id_exported: context.localId,
      });
      remoteUrl = String(asRecord(urlResponse.data)?.url || "") || undefined;
    } catch {
      // URL je doplňková; stav publikace ověřujeme přes nemo_get_list.php.
    }

    const published = visible && imageCount > 0;
    return {
      externalId,
      remoteUrl,
      remoteStatus: `${visible ? "Viditelné" : "Skryté"}, fotografií: ${imageCount}`,
      published,
      message: published
        ? "Inzerát byl na Reality.iDNES ověřen jako viditelný."
        : `Reality.iDNES nabídku přijalo, ale zatím není publikovaná (viditelnost: ${
            visible ? "ano" : "ne"
          }, fotografií: ${imageCount}).`,
    };
  },
};
