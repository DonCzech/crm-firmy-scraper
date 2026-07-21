import { createHash, createHmac } from "crypto";
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

type RealityCzConfig = {
  endpoint: string;
  username: string;
  passwordHash: string;
  totpSecret: string;
  program: string;
  version: string;
  license: string;
};

type SoapValue = string | number | { value: string; raw: true };

const SOAP_NAMESPACE = "http://soap.reality.cz/Do/";
const SOAP_ENDPOINT = process.env.REALITY_CZ_SOAP_URL || "https://soap.reality.cz/15/";
const SOAP_PARSER = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  parseTagValue: false,
  trimValues: true,
});
const PARAMETER_XML_BUILDER = new XMLBuilder({
  format: false,
  ignoreAttributes: false,
  suppressEmptyNode: true,
});

const STATUS_LABELS: Record<number, string> = {
  0: "Čeká na ověření polohy",
  1: "Zpracováno",
  8: "Chybná poloha",
  10: "Odstraněno",
  11: "Aktivní",
  13: "Rezervace",
  14: "Prodáno / vydraženo",
  15: "Pronajato",
  20: "Pozastaveno, připraveno k odstranění",
  21: "Pozastaveno",
  23: "Pozastaveno, rezervace",
  24: "Pozastaveno, prodáno / vydraženo",
  25: "Pozastaveno, pronajato",
  99: "Otevřeno k editaci",
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
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/[!?]{2,}/g, (match) => match[0])
    .replace(/\s+/g, " ")
    .trim();
}

function getConfig(): RealityCzConfig {
  const username = process.env.REALITY_CZ_USERNAME?.trim();
  const password = process.env.REALITY_CZ_PASSWORD;
  const totpSecret = process.env.REALITY_CZ_TOTP_SECRET?.trim();
  const program = process.env.REALITY_CZ_PROGRAM?.trim();
  const version = process.env.REALITY_CZ_PROGRAM_VERSION?.trim();
  const license = process.env.REALITY_CZ_LICENSE?.trim().toUpperCase();
  const missing = [
    !username ? "REALITY_CZ_USERNAME" : null,
    !password ? "REALITY_CZ_PASSWORD" : null,
    !totpSecret ? "REALITY_CZ_TOTP_SECRET" : null,
    !program ? "REALITY_CZ_PROGRAM" : null,
    !version ? "REALITY_CZ_PROGRAM_VERSION" : null,
    !license || !/^[A-Z0-9]{3}$/.test(license) ? "REALITY_CZ_LICENSE" : null,
  ].filter(Boolean);

  if (missing.length) {
    throw new PortalConnectorError(
      `Reality.cz není nakonfigurováno. Chybí: ${missing.join(", ")}.`,
      "NOT_CONFIGURED",
      missing,
    );
  }

  return {
    endpoint: SOAP_ENDPOINT,
    username: username!,
    passwordHash: /^[a-f0-9]{32}$/i.test(password!) ? password!.toLowerCase() : md5(password!),
    totpSecret: totpSecret!,
    program: program!,
    version: version!,
    license: license!,
  };
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function decodeTransport(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, "%20"));
  } catch {
    return value;
  }
}

function base32Decode(value: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const normalized = value.toUpperCase().replace(/[\s=-]/g, "");
  let bits = "";
  for (const character of normalized) {
    const index = alphabet.indexOf(character);
    if (index < 0) {
      throw new PortalConnectorError(
        "REALITY_CZ_TOTP_SECRET není platný Base32 klíč.",
        "INVALID_TOTP_SECRET",
      );
    }
    bits += index.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let offset = 0; offset + 8 <= bits.length; offset += 8) {
    bytes.push(Number.parseInt(bits.slice(offset, offset + 8), 2));
  }
  return Buffer.from(bytes);
}

function createTotp(secret: string): string {
  const counter = Math.floor(Date.now() / 1000 / 30);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", base32Decode(secret)).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const code =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(code % 1_000_000).padStart(6, "0");
}

async function soapCall(
  endpoint: string,
  method: string,
  params: Record<string, SoapValue>,
): Promise<string> {
  const bodyParameters = Object.entries(params)
    .map(([name, input]) => {
      const raw = typeof input === "object";
      const value = raw ? input.value : String(input);
      const transportValue = raw ? value : encodeURIComponent(value);
      return `<${name}>${escapeXml(transportValue)}</${name}>`;
    })
    .join("");
  const envelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <${method} xmlns="${SOAP_NAMESPACE}">${bodyParameters}</${method}>
  </soap:Body>
</soap:Envelope>`;

  const response = await fetch(endpoint, {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(45_000),
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: `"${SOAP_NAMESPACE}${method}"`,
      "User-Agent": "CeskyPartner-Reality/1.0",
    },
    body: envelope,
  });
  const responseBody = await response.text();
  const parsed = SOAP_PARSER.parse(responseBody);
  const soapBody = parsed?.Envelope?.Body;
  const fault = soapBody?.Fault;
  if (fault) {
    const message = decodeTransport(String(fault.faultstring || fault.detail || "SOAP chyba"));
    throw new PortalConnectorError(
      `Reality.cz ${method}: ${message}`,
      "REALITY_CZ_SOAP_FAULT",
      fault,
    );
  }
  if (!response.ok) {
    throw new PortalConnectorError(
      `Reality.cz ${method}: HTTP ${response.status}.`,
      `REALITY_CZ_HTTP_${response.status}`,
      responseBody.slice(0, 1000),
    );
  }

  const result = soapBody?.[`${method}Response`]?.[`${method}Result`];
  if (result === undefined || result === null) {
    throw new PortalConnectorError(
      `Reality.cz ${method} nevrátilo očekávaný výsledek.`,
      "INVALID_RESPONSE",
      responseBody.slice(0, 1000),
    );
  }
  return decodeTransport(String(result));
}

async function loginRealityCz(config: RealityCzConfig): Promise<string> {
  const handle = await soapCall(config.endpoint, "Logon", {
    vsUserName: config.username,
    vsPassword: config.passwordHash,
    vsProgram: config.program,
    vsVersion: config.version,
    vsResponse: createTotp(config.totpSecret),
  });
  if (!handle.trim()) {
    throw new PortalConnectorError(
      "Reality.cz nevrátilo identifikátor spojení.",
      "INVALID_SESSION",
    );
  }
  return handle;
}

function buildEstateCode(license: string, localId: number): string {
  const suffix = localId.toString(36).toUpperCase().padStart(6, "0");
  if (suffix.length !== 6) {
    throw new PortalConnectorError(
      "Byl překročen rozsah šestimístných evidenčních čísel Reality.cz.",
      "LOCAL_ID_OVERFLOW",
    );
  }
  return `${license}-${suffix}`;
}

function listingText(listing: PortalListing): string {
  return normalize(`${listing.title} ${listing.description || ""}`);
}

function hasAmenity(listing: PortalListing, ...needles: string[]): boolean {
  const amenities = listing.amenities.map(normalize);
  return needles.some((needle) => amenities.some((item) => item.includes(normalize(needle))));
}

function mapCategory(listing: PortalListing): number {
  const text = listingText(listing);
  if (listing.kind === "APARTMENT") {
    if ((listing.area || 0) <= 50) return 5;
    if ((listing.area || 0) <= 100) return 6;
    return 7;
  }
  if (listing.kind === "HOUSE") {
    if (text.includes("venkov") || text.includes("usedlost") || text.includes("statek")) return 8;
    if (text.includes("vila")) return 10;
    if (text.includes("najemni dum") || text.includes("bytovy dum")) return 11;
    return 9;
  }
  if (listing.kind === "LAND") {
    if (text.includes("komerc")) return 4;
    if (text.includes("zahrad")) return 2;
    if (text.includes("staveb") || text.includes("bydlen") || text.includes("rekreac")) return 3;
    return 1;
  }
  if (text.includes("restaur")) return 41;
  if (text.includes("kavarn")) return 43;
  if (text.includes("bar")) return 45;
  if (text.includes("hotel")) return 47;
  if (text.includes("penzion")) return 48;
  if (text.includes("bytovy dum")) return 50;
  if (text.includes("ordinac")) return 52;
  if (text.includes("kancelar")) return 53;
  if (text.includes("obchod") || text.includes("prodejn")) return 55;
  if (text.includes("sklad")) return 59;
  if (text.includes("vyrob")) return 62;
  if (text.includes("hala")) return 61;
  if (text.includes("atelier")) return 65;
  return 57;
}

function ownershipText(ownership: string | null): string | undefined {
  const map: Record<string, string> = {
    PERSONAL: "osobní",
    COOPERATIVE: "družstevní",
    STATE: "neuvedeno",
  };
  return ownership ? map[ownership] : undefined;
}

function constructionText(construction: string | null): string | undefined {
  const map: Record<string, string> = {
    BRICK: "cihlová",
    PANEL: "panelová",
    WOOD: "dřevěná",
    STONE: "kamenná",
    MIXED: "smíšená",
    SKELETON: "skeletová",
    LOW_ENERGY: "nízkoenergetická montovaná",
  };
  return construction ? map[construction] : undefined;
}

function conditionText(condition: string | null): string | undefined {
  const map: Record<string, string> = {
    NEW_BUILD: "novostavba",
    VERY_GOOD: "velmi dobrý stav",
    GOOD: "dobrý stav",
    TO_RECONSTRUCT: "před rekonstrukcí",
    UNDER_CONSTRUCTION: "ve výstavbě",
    DEVELOPER_PROJECT: "developerský projekt",
  };
  return condition ? map[condition] : undefined;
}

function furnishingText(furnishing: string | null): string | undefined {
  const map: Record<string, string> = {
    FURNISHED: "zařízeno",
    PARTLY: "částečně zařízeno",
    UNFURNISHED: "nezařízeno",
  };
  return furnishing ? map[furnishing] : undefined;
}

function youtubeId(url: string | null): string | undefined {
  if (!url) return undefined;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{11})/);
  return match?.[1];
}

function buildParameterXml(rootName: "baseParameters" | "optionalParameters", values: Record<string, unknown>): string {
  const params = Object.entries(values)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([name, value]) => ({
      "@_name": name,
      "#text": String(value),
    }));
  return PARAMETER_XML_BUILDER.build({
    [rootName]: {
      param: params,
    },
  });
}

function validateListing(listing: PortalListing): void {
  const errors: string[] = [];
  const description = plainText(listing.description || "");
  if (listing.status !== "ACTIVE") errors.push("nemovitost musí být aktivní");
  if (description.length < 30) errors.push("popis musí mít alespoň 30 znaků");
  if (listing.images.length === 0) errors.push("chybí fotografie");
  if (
    !listing.ruianAddressCode &&
    !listing.ruianParcelCode &&
    (listing.lat === null || listing.lng === null)
  ) {
    errors.push("chybí RÚIAN kód nebo GPS souřadnice");
  }
  if (listing.kind === "APARTMENT") {
    if (!listing.disposition) errors.push("chybí velikost bytu");
    if (!listing.area) errors.push("chybí plocha bytu");
    if (!listing.ownership) errors.push("chybí forma vlastnictví");
  }
  if (listing.kind === "HOUSE" && !listing.area) errors.push("chybí užitná plocha domu");
  if (listing.kind === "LAND" && !listing.landArea) errors.push("chybí plocha pozemku");

  if (errors.length) {
    throw new PortalConnectorError(
      `Data nelze odeslat na Reality.cz: ${errors.join(", ")}.`,
      "VALIDATION_ERROR",
      errors,
    );
  }
}

function buildParameters(listing: PortalListing): {
  base: string;
  optional: string;
} {
  validateListing(listing);
  const isRent = listing.deal === "RENT";
  const description = plainText(listing.description || "");
  const base = buildParameterXml("baseParameters", {
    SIGNATURE: 1,
    RUIAN_ADRESA_KOD: listing.ruianAddressCode || undefined,
    RUIAN_PARCELA_KOD: listing.ruianAddressCode ? undefined : listing.ruianParcelCode || undefined,
    Z_DRUH_NEMOVITOSTI_0: mapCategory(listing),
    Z_TYP_KOD: isRent ? 2 : 1,
    Z_POZNAMKA: description,
  });

  const optional = buildParameterXml("optionalParameters", {
    VLASTNI_ID: listing.id,
    MAPA_X: !listing.ruianAddressCode && !listing.ruianParcelCode ? listing.lat : undefined,
    MAPA_Y: !listing.ruianAddressCode && !listing.ruianParcelCode ? listing.lng : undefined,
    MAPA_PTR: 1,
    MAPA_DS: 901,
    Z_MISTO_ZEME: "cz",
    Z_CENA_PRODEJE: !isRent && !listing.priceHidden ? listing.price : undefined,
    Z_CENA_PRODEJE_JEDNOTKA: !isRent && !listing.priceHidden ? 2 : undefined,
    Z_CENA_PRONAJMU: isRent && !listing.priceHidden ? listing.price : undefined,
    Z_CENA_PRONAJMU_JEDNOTKA: isRent && !listing.priceHidden ? 4 : undefined,
    Z_CENA_ZALOHA: isRent && listing.monthlyFees ? listing.monthlyFees : undefined,
    Z_CENA_ZALOHA_JEDNOTKA: isRent && listing.monthlyFees ? 4 : undefined,
    Z_CENA_POZNAMKA:
      (listing.priceNote || (listing.priceHidden ? "Cena na vyžádání" : "")).slice(0, 100) ||
      undefined,
    Z_PLOCHA: listing.area || listing.landArea || undefined,
    Z_VELIKOST_BYTU: listing.kind === "APARTMENT" ? listing.disposition : undefined,
    Z_PLOCHA_BYTU: listing.kind === "APARTMENT" ? listing.area : undefined,
    Z_CISLO_PODLAZI: listing.kind === "APARTMENT" ? listing.floor : undefined,
    Z_FORMA_VLASTNICTVI:
      listing.kind === "APARTMENT" ? ownershipText(listing.ownership) : undefined,
    Z_PLOCHA_POZEMKU:
      listing.kind === "HOUSE" || listing.kind === "LAND" ? listing.landArea : undefined,
    Z_UZITNA_PLOCHA:
      listing.kind === "HOUSE" || listing.kind === "COMMERCIAL" ? listing.area : undefined,
    Z_VELIKOST_DOMU: listing.kind === "HOUSE" ? listing.disposition : undefined,
    Z_POCET_NP: listing.kind === "HOUSE" ? listing.floors : undefined,
    Z_UCEL_POZEMKU: listing.kind === "LAND" ? listing.title.slice(0, 80) : undefined,
    Z_DRUH_BUDOVY: listing.kind === "LAND" ? undefined : constructionText(listing.construction),
    Z_STAV_OBJEKTU: listing.kind === "LAND" ? undefined : conditionText(listing.condition),
    Z_ZARIZENI_NABYTKEM:
      listing.kind === "LAND" ? undefined : furnishingText(listing.furnishing),
    Z_ROK_VR: listing.yearBuilt || undefined,
    Z_POLOHA: listing.location.slice(0, 80),
    Z_BALKON: hasAmenity(listing, "balkon")
      ? 11
      : hasAmenity(listing, "lodzie", "loggia")
        ? 12
        : hasAmenity(listing, "terasa")
          ? 13
          : undefined,
    Z_SKLEP: hasAmenity(listing, "sklep") ? "ano" : undefined,
    Z_GARAZ: hasAmenity(listing, "garaz") ? "ano" : undefined,
    Z_PARKOVANI: hasAmenity(listing, "parkovani") ? "ano" : undefined,
    Z_VYTAH: hasAmenity(listing, "vytah") ? "ano" : undefined,
    PENB_TZP: listing.penb?.toUpperCase(),
    PENB_VYHLASKA: listing.penb ? 3 : undefined,
    YOUTUBE_ID: youtubeId(listing.videoUrl),
  });
  return { base, optional };
}

async function preparePicture(url: string): Promise<{ data: string; guid: string }> {
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
  const output = await sharp(input)
    .rotate()
    .resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
  return {
    data: output.toString("base64"),
    guid: md5(output.toString("base64")),
  };
}

function assertAccepted(message: string, method: string): void {
  const normalized = normalize(message);
  if (
    normalized.includes("chyb") ||
    normalized.includes("neplat") ||
    normalized.includes("nelze") ||
    normalized.includes("odmit")
  ) {
    throw new PortalConnectorError(
      `Reality.cz ${method}: ${message}`,
      "REALITY_CZ_REJECTED",
      message,
    );
  }
}

export const realityCzConnector: PortalConnector = {
  portal: "REALITY_CZ",

  async inspect(): Promise<PortalConnectionStatus> {
    let config: RealityCzConfig | null = null;
    try {
      config = getConfig();
    } catch {
      // Ping je veřejný a ověří skutečnou dostupnost bez přístupů RK.
    }

    try {
      const ping = await soapCall(SOAP_ENDPOINT, "Ping", {
        vsTestString: "ceskypartner-reality",
      });
      if (config) {
        const handle = await loginRealityCz(config);
        try {
          await soapCall(config.endpoint, "GetReport", {
            vsConnectionHandle: handle,
            vsReport: "EstateAgencyXML",
          });
        } finally {
          await soapCall(config.endpoint, "Logout", { vsConnectionHandle: handle });
        }
      }
      return {
        portal: "REALITY_CZ",
        implemented: true,
        configured: Boolean(config),
        reachable: true,
        version: ping.match(/rozhrani:\s*([0-9.]+)/i)?.[1] || "1.5",
        message: config
          ? "SOAP rozhraní je dostupné a účet RK se úspěšně přihlásil."
          : "SOAP rozhraní je dostupné, ale chybí schválený kanál, účet RK nebo TOTP.",
      };
    } catch (error) {
      return {
        portal: "REALITY_CZ",
        implemented: true,
        configured: Boolean(config),
        reachable: false,
        version: "1.5",
        message: error instanceof Error ? error.message : "SOAP rozhraní není dostupné.",
      };
    }
  },

  async sync(
    listing: PortalListing,
    context: PortalSyncContext,
  ): Promise<PortalSyncResult> {
    const config = getConfig();
    const estateCode = buildEstateCode(config.license, context.localId);
    const parameters = buildParameters(listing);
    const handle = await loginRealityCz(config);

    try {
      try {
        await soapCall(config.endpoint, "DeleteEstatePicture", {
          vsConnectionHandle: handle,
          vsCisloZakazky: estateCode,
          viPictureOrder: 99,
        });
      } catch {
        // U nové nabídky zatím fotografie neexistují.
      }

      const sent = await soapCall(config.endpoint, "SendEstateSimple", {
        vsConnectionHandle: handle,
        vsCisloZakazky: estateCode,
        vsBaseParameters: parameters.base,
        vsOptionalParameters: parameters.optional,
      });
      assertAccepted(sent, "SendEstateSimple");

      for (let index = 0; index < listing.images.slice(0, 30).length; index++) {
        const image = listing.images[index];
        const picture = await preparePicture(image.url);
        const response = await soapCall(config.endpoint, "SendEstatePicture", {
          vsConnectionHandle: handle,
          vsCisloZakazky: estateCode,
          viPictureOrder: index + 1,
          voPicture: { value: picture.data, raw: true },
          vsDescription: (image.alt || listing.title).slice(0, 60),
          vsGuid: picture.guid,
        });
        assertAccepted(response, "SendEstatePicture");
      }

      const processed = await soapCall(config.endpoint, "ProcessEstate", {
        vsConnectionHandle: handle,
      });
      assertAccepted(processed, "ProcessEstate");

      const checked = await soapCall(config.endpoint, "CheckEstate", {
        vsConnectionHandle: handle,
        vsCisloZakazky: estateCode,
      });
      const statusCode = Number(checked.match(/^\s*(\d+)/)?.[1]);
      if (!Number.isInteger(statusCode)) {
        throw new PortalConnectorError(
          `Reality.cz vrátilo neznámý stav nabídky: ${checked}`,
          "UNKNOWN_REMOTE_STATUS",
          checked,
        );
      }
      const statusText = STATUS_LABELS[statusCode] || checked;
      const published = [1, 11, 13, 14, 15].includes(statusCode);
      return {
        externalId: estateCode,
        remoteUrl: published ? `https://www.reality.cz/${estateCode}/` : undefined,
        remoteStatus: `${statusCode}: ${statusText}`,
        published,
        message: published
          ? `Inzerát byl na Reality.cz ověřen ve stavu „${statusText}“.`
          : `Reality.cz nabídku přijalo, ale zatím není aktivní: ${statusText}.`,
      };
    } finally {
      try {
        await soapCall(config.endpoint, "Logout", { vsConnectionHandle: handle });
      } catch {
        // Chyba odhlášení nesmí přepsat výsledek exportu.
      }
    }
  },
};
