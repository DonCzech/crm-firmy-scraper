import { createHash } from "crypto";
import { XMLBuilder } from "fast-xml-parser";
import sharp from "sharp";
import type {
  PortalConnectionStatus,
  PortalConnector,
  PortalListing,
  PortalSyncContext,
  PortalSyncResult,
} from "./types";
import { PortalConnectorError } from "./types";

type CeskeRealityConfig = {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  companyId?: string;
  exportPin?: string;
};

type ApiEntry = {
  status?: string;
  code?: string | number;
  message?: string;
  details?: string;
  access_token?: string;
  expires_in?: number;
  id_firmy?: string | number;
  pin_exportu?: string;
  id_inzeratu?: string | number;
  url_inzeratu?: string;
  [key: string]: unknown;
};

type PreparedPhoto = {
  id: string;
  filename: string;
  data: Buffer;
  description: string;
};

const XML_BUILDER = new XMLBuilder({
  format: true,
  ignoreAttributes: false,
  suppressEmptyNode: true,
});

function getConfig(): CeskeRealityConfig {
  const clientId = process.env.CESKEREALITY_CLIENT_ID?.trim();
  const clientSecret = process.env.CESKEREALITY_CLIENT_SECRET;
  const companyId = process.env.CESKEREALITY_COMPANY_ID?.trim();
  const exportPin = process.env.CESKEREALITY_EXPORT_PIN?.trim();
  const missing = [
    !clientId ? "CESKEREALITY_CLIENT_ID" : null,
    !clientSecret ? "CESKEREALITY_CLIENT_SECRET" : null,
    !companyId && !exportPin
      ? "CESKEREALITY_COMPANY_ID nebo CESKEREALITY_EXPORT_PIN"
      : null,
  ].filter(Boolean);

  if (missing.length) {
    throw new PortalConnectorError(
      `ČeskéReality.cz nejsou nakonfigurované. Chybí: ${missing.join(", ")}.`,
      "NOT_CONFIGURED",
      missing,
    );
  }

  return {
    baseUrl: (process.env.CESKEREALITY_BASE_URL || "https://import.ceskereality.cz").replace(
      /\/$/,
      "",
    ),
    clientId: clientId!,
    clientSecret: clientSecret!,
    companyId,
    exportPin,
  };
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

function flattenEntries(payload: unknown): ApiEntry[] {
  if (!payload || typeof payload !== "object") return [];
  const root = (payload as Record<string, unknown>).ceskereality;
  if (Array.isArray(root)) return root.filter(Boolean) as ApiEntry[];
  if (!root || typeof root !== "object") return [];
  const direct = root as ApiEntry;
  if (
    direct.code !== undefined ||
    direct.access_token !== undefined ||
    direct.id_firmy !== undefined
  ) {
    return [direct];
  }
  return Object.values(root).filter(
    (entry) => entry && typeof entry === "object",
  ) as ApiEntry[];
}

function assertApiSuccess(entries: ApiEntry[], operation: string): void {
  const error = entries.find(
    (entry) => entry.status === "error" || Number(entry.code || 0) >= 400,
  );
  if (error) {
    throw new PortalConnectorError(
      `ČeskéReality.cz ${operation}: ${error.details || error.message || `chyba ${error.code}`}`,
      `CESKEREALITY_${error.code || "ERROR"}`,
      entries,
    );
  }
}

async function fetchJson(
  url: string,
  init: RequestInit,
  operation: string,
): Promise<{ payload: unknown; entries: ApiEntry[] }> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(45_000),
    headers: {
      "User-Agent": "CeskyPartner-Reality/1.0",
      ...init.headers,
    },
  });
  const text = await response.text();
  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new PortalConnectorError(
      `ČeskéReality.cz ${operation} nevrátily platný JSON.`,
      "INVALID_RESPONSE",
      text.slice(0, 1000),
    );
  }
  const entries = flattenEntries(payload);
  if (!response.ok && entries.length === 0) {
    throw new PortalConnectorError(
      `ČeskéReality.cz ${operation}: HTTP ${response.status}.`,
      `CESKEREALITY_HTTP_${response.status}`,
      payload,
    );
  }
  assertApiSuccess(entries, operation);
  return { payload, entries };
}

async function getToken(config: CeskeRealityConfig): Promise<string> {
  const form = new URLSearchParams({ grant_type: "client_credentials" });
  const { entries } = await fetchJson(
    `${config.baseUrl}/token.php`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${config.clientId}:${config.clientSecret}`,
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    },
    "token",
  );
  const token = entries.find((entry) => entry.access_token)?.access_token;
  if (!token) {
    throw new PortalConnectorError(
      "ČeskéReality.cz nevrátily access_token.",
      "MISSING_ACCESS_TOKEN",
      entries,
    );
  }
  return token;
}

async function resolveCompanyId(
  config: CeskeRealityConfig,
  token: string,
): Promise<string> {
  if (config.companyId) return config.companyId;
  const { entries } = await fetchJson(
    `${config.baseUrl}/rk.html`,
    { headers: { Authorization: `Bearer ${token}` } },
    "seznam RK",
  );
  const company = entries.find(
    (entry) => String(entry.pin_exportu || "") === config.exportPin,
  );
  if (!company?.id_firmy) {
    throw new PortalConnectorError(
      "ČeskéReality.cz nevrátily RK odpovídající CESKEREALITY_EXPORT_PIN.",
      "COMPANY_NOT_AUTHORIZED",
      entries,
    );
  }
  return String(company.id_firmy);
}

function mapSubtype(listing: PortalListing): number {
  if (listing.kind === "APARTMENT") {
    const map: Record<string, number> = {
      "1+kk": 202,
      "1+1": 203,
      "2+kk": 204,
      "2+1": 205,
      "3+kk": 206,
      "3+1": 207,
      "4+kk": 208,
      "4+1": 209,
      "5+kk": 210,
      "5+1": 211,
      "6+kk": 211,
      "6+1": 211,
      "7+kk": 211,
      "7+1": 211,
    };
    return listing.disposition ? map[listing.disposition] || 299 : 299;
  }
  const text = normalize(`${listing.title} ${listing.description || ""}`);
  if (listing.kind === "HOUSE") {
    if (text.includes("vila")) return 104;
    if (text.includes("cinzovni") || text.includes("bytovy dum")) return 105;
    if (text.includes("usedlost") || text.includes("statek")) return 106;
    if (text.includes("na klic")) return 107;
    if (text.includes("chata")) return 108;
    if (text.includes("chalupa")) return 109;
    if (text.includes("histor")) return 110;
    return 101;
  }
  if (listing.kind === "LAND") {
    if (text.includes("zahrad")) return 302;
    if (text.includes("zemedel")) return 303;
    if (text.includes("komerc")) return 304;
    if (text.includes("louka")) return 305;
    if (text.includes("les")) return 306;
    if (text.includes("vodni")) return 307;
    if (text.includes("staveb") || text.includes("bydlen")) return 301;
    return 399;
  }
  if (text.includes("vyrob")) return 501;
  if (text.includes("sklad")) return 502;
  if (text.includes("kancelar")) return 503;
  if (text.includes("obchod")) return 504;
  if (text.includes("restaur")) return 505;
  if (text.includes("hotel") || text.includes("penzion")) return 506;
  if (text.includes("zemedel")) return 508;
  if (text.includes("sport") || text.includes("kultur")) return 509;
  if (text.includes("ordinac")) return 511;
  if (text.includes("apartman")) return 512;
  return 599;
}

function mapCondition(condition: string | null): number | undefined {
  const map: Record<string, number> = {
    NEW_BUILD: 5,
    VERY_GOOD: 1,
    GOOD: 2,
    TO_RECONSTRUCT: 4,
    UNDER_CONSTRUCTION: 7,
    DEVELOPER_PROJECT: 9,
  };
  return condition ? map[condition] : undefined;
}

function mapOwnership(ownership: string | null): number | undefined {
  const map: Record<string, number> = {
    COOPERATIVE: 1,
    PERSONAL: 2,
    STATE: 3,
  };
  return ownership ? map[ownership] : undefined;
}

function formatDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function buildXml(
  listing: PortalListing,
  localId: number,
  companyId: string,
  photos: PreparedPhoto[],
): string {
  const description = plainText(listing.description || "");
  const fields: Record<string, unknown> = {
    cislo: listing.id.slice(0, 20),
    subtyp_n: mapSubtype(listing),
    ruian_uroven: 11,
    ruian_kod: listing.ruianAddressCode,
    zeme: 203,
    operace: listing.deal === "RENT" ? 1 : 0,
    nezverejnovat_polohu: 2,
    gps_lat: listing.lat ?? undefined,
    gps_lon: listing.lng ?? undefined,
    stav_n: listing.kind === "LAND" ? undefined : mapCondition(listing.condition),
    popisek: listing.title.slice(0, 200),
    popis: description,
    cena: listing.priceHidden ? 0 : listing.price,
    cena_neuvadet: listing.priceHidden ? 1 : 0,
    mena: 1,
    typceny_n: listing.deal === "RENT" ? 2 : 1,
    poznamkakcene: listing.priceNote || undefined,
    pl_uzitna: listing.kind === "LAND" ? undefined : listing.area,
    pl_celkova: listing.kind === "LAND" ? listing.landArea : listing.area,
    pl_pozemku:
      listing.kind === "LAND" || listing.kind === "HOUSE" ? listing.landArea : undefined,
    patro_cislo: listing.kind === "APARTMENT" ? listing.floor : undefined,
    podlazi_n: listing.floors || undefined,
    vlastnictvi: listing.kind === "APARTMENT" ? mapOwnership(listing.ownership) : undefined,
    vytah: listing.amenities.some((item) => normalize(item).includes("vytah")) ? 1 : undefined,
    bezbarier: listing.amenities.some((item) => normalize(item).includes("bezbarier"))
      ? 1
      : undefined,
    en_trida: listing.penb || undefined,
    en_vyhlaska: listing.penb ? 3 : undefined,
    last_access: formatDateTime(listing.updatedAt),
    makler_int_id: listing.agent?.id || undefined,
    makler_jmeno: listing.agent?.name || undefined,
    makler_telm: listing.agent?.phone || undefined,
    makler_mail: listing.agent?.email || undefined,
  };
  const pole = Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([id, value]) => ({ "@_id": id, "#text": String(value) }));

  const now = new Date();
  const timestamp = formatDateTime(now).replace(" ", "-").replace(/:/g, "-");
  return `<?xml version="1.0" encoding="utf-8"?>\n${XML_BUILDER.build({
    xreal: {
      identifikace: {
        "@_typ": "CLIENT",
        datumcas: timestamp,
        autorizace: { "@_id_firmy": companyId },
      },
      nabidky: {
        nabidka: {
          "@_id": localId,
          "@_operace": "U",
          pole,
          foto: photos.map((photo) => ({
            "@_id": photo.id,
            "@_popis": photo.description,
          })),
        },
      },
    },
  })}`;
}

function validateListing(listing: PortalListing): void {
  const errors: string[] = [];
  if (listing.status !== "ACTIVE") errors.push("nemovitost musí být aktivní");
  if (!listing.ruianAddressCode) errors.push("chybí RÚIAN kód adresního místa");
  if (plainText(listing.description || "").length < 30) {
    errors.push("popis musí mít alespoň 30 znaků");
  }
  if (listing.images.length === 0) errors.push("chybí fotografie");
  if (listing.kind !== "LAND") {
    if (!listing.condition) errors.push("chybí stav nemovitosti");
    if (!listing.area) errors.push("chybí užitná plocha");
  }
  if (listing.kind === "LAND" && !listing.landArea) errors.push("chybí plocha pozemku");
  if (listing.kind === "APARTMENT" && !listing.ownership) {
    errors.push("chybí forma vlastnictví");
  }
  if (errors.length) {
    throw new PortalConnectorError(
      `Data nelze odeslat na ČeskéReality.cz: ${errors.join(", ")}.`,
      "VALIDATION_ERROR",
      errors,
    );
  }
}

async function preparePhoto(url: string, description: string): Promise<PreparedPhoto> {
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
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
  const id = createHash("md5").update(data).digest("hex");
  return {
    id,
    filename: `${id}.jpg`,
    data,
    description: description.slice(0, 100),
  };
}

async function uploadFile(
  config: CeskeRealityConfig,
  token: string,
  companyId: string,
  filename: string,
  data: Buffer,
  type: string,
): Promise<void> {
  const form = new FormData();
  const bytes = new Uint8Array(data.byteLength);
  bytes.set(data);
  form.append("s", new Blob([bytes], { type }), filename);
  const { entries } = await fetchJson(
    `${config.baseUrl}/uloz_xml.html?id_firmy=${encodeURIComponent(companyId)}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    },
    `upload ${filename}`,
  );
  if (!entries.some((entry) => Number(entry.code) === 201)) {
    throw new PortalConnectorError(
      `ČeskéReality.cz nepotvrdily upload souboru ${filename}.`,
      "UPLOAD_NOT_CONFIRMED",
      entries,
    );
  }
}

export const ceskeRealityConnector: PortalConnector = {
  portal: "CESKEREALITY",

  async inspect(): Promise<PortalConnectionStatus> {
    let config: CeskeRealityConfig | null = null;
    try {
      config = getConfig();
    } catch {
      // Dostupnost token endpointu ověříme i bez přístupů.
    }
    try {
      if (config) {
        const token = await getToken(config);
        await resolveCompanyId(config, token);
      } else {
        const response = await fetch(
          "https://import.ceskereality.cz/token.php",
          {
            method: "POST",
            body: new URLSearchParams({ grant_type: "client_credentials" }),
            cache: "no-store",
            signal: AbortSignal.timeout(15_000),
          },
        );
        if (response.status >= 500) throw new Error(`HTTP ${response.status}`);
      }
      return {
        portal: "CESKEREALITY",
        implemented: true,
        configured: Boolean(config),
        reachable: true,
        version: "3.0",
        message: config
          ? "OAuth2 rozhraní je dostupné a RK je oprávněná k exportu."
          : "OAuth2 rozhraní je dostupné, ale chybí CLIENT_ID/SECRET a oprávnění RK.",
      };
    } catch (error) {
      return {
        portal: "CESKEREALITY",
        implemented: true,
        configured: Boolean(config),
        reachable: false,
        version: "3.0",
        message: error instanceof Error ? error.message : "Importní rozhraní není dostupné.",
      };
    }
  },

  async sync(
    listing: PortalListing,
    context: PortalSyncContext,
  ): Promise<PortalSyncResult> {
    validateListing(listing);
    const config = getConfig();
    const token = await getToken(config);
    const companyId = await resolveCompanyId(config, token);
    const photos: PreparedPhoto[] = [];
    for (const image of listing.images.slice(0, 30)) {
      photos.push(await preparePhoto(image.url, image.alt || listing.title));
    }
    for (const photo of photos) {
      await uploadFile(config, token, companyId, photo.filename, photo.data, "image/jpeg");
    }
    const xml = buildXml(listing, context.localId, companyId, photos);
    await uploadFile(
      config,
      token,
      companyId,
      "nemovitosti.xml",
      Buffer.from(xml, "utf8"),
      "text/xml",
    );

    const { entries: imported } = await fetchJson(
      `${config.baseUrl}/import_xml.html?id_firmy=${encodeURIComponent(companyId)}`,
      { headers: { Authorization: `Bearer ${token}` } },
      "import",
    );
    const success = imported.find((entry) => Number(entry.code) === 200);
    if (!success) {
      throw new PortalConnectorError(
        "ČeskéReality.cz nepotvrdily import nabídky.",
        "IMPORT_NOT_CONFIRMED",
        imported,
      );
    }

    const { entries: verified } = await fetchJson(
      `${config.baseUrl}/vypis_nemovitosti.html?id_firmy=${encodeURIComponent(
        companyId,
      )}&id_inzeratu=${context.localId}`,
      { headers: { Authorization: `Bearer ${token}` } },
      "ověření nabídky",
    );
    const remote = verified.find(
      (entry) => String(entry.id_inzeratu) === String(context.localId),
    );
    if (!remote) {
      throw new PortalConnectorError(
        "ČeskéReality.cz nabídku přijaly, ale následné ověření ji nenašlo.",
        "VERIFICATION_FAILED",
        verified,
      );
    }
    const remoteUrl = remote.url_inzeratu ? String(remote.url_inzeratu) : undefined;
    let published = false;
    if (remoteUrl) {
      try {
        const response = await fetch(remoteUrl, {
          method: "HEAD",
          redirect: "follow",
          cache: "no-store",
          signal: AbortSignal.timeout(15_000),
        });
        published = response.status < 400;
      } catch {
        published = false;
      }
    }
    return {
      externalId: String(context.localId),
      remoteUrl,
      remoteStatus: published ? "Veřejná URL dostupná" : "Importováno, zpracování portálem",
      published,
      message: published
        ? "Inzerát byl na ČeskéReality.cz ověřen přes veřejnou URL."
        : "ČeskéReality.cz import potvrdily; veřejné zobrazení se ještě zpracovává (portál uvádí až 20 minut).",
    };
  },
};
