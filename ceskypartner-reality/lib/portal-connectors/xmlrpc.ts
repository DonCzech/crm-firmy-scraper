import { XMLParser } from "fast-xml-parser";

type XmlRpcScalar = string | number | boolean | Date | Buffer | null | undefined;
export type XmlRpcValue = XmlRpcScalar | XmlRpcValue[] | { [key: string]: XmlRpcValue };

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function encodeValue(value: XmlRpcValue): string {
  if (value === null || value === undefined) return "<value><string></string></value>";
  if (Buffer.isBuffer(value)) return `<value><base64>${value.toString("base64")}</base64></value>`;
  if (value instanceof Date) {
    const iso = value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    return `<value><dateTime.iso8601>${iso}</dateTime.iso8601></value>`;
  }
  if (Array.isArray(value)) {
    return `<value><array><data>${value.map(encodeValue).join("")}</data></array></value>`;
  }
  if (typeof value === "object") {
    const members = Object.entries(value)
      .filter(([, memberValue]) => memberValue !== undefined)
      .map(
        ([name, memberValue]) =>
          `<member><name>${escapeXml(name)}</name>${encodeValue(memberValue)}</member>`,
      )
      .join("");
    return `<value><struct>${members}</struct></value>`;
  }
  if (typeof value === "boolean") return `<value><boolean>${value ? "1" : "0"}</boolean></value>`;
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? `<value><int>${value}</int></value>`
      : `<value><double>${value}</double></value>`;
  }
  return `<value><string>${escapeXml(value)}</string></value>`;
}

function decodeValue(node: any): any {
  if (node === null || node === undefined) return null;
  if (typeof node !== "object") return node;
  if ("string" in node) return node.string ?? "";
  if ("int" in node) return Number(node.int);
  if ("i4" in node) return Number(node.i4);
  if ("i8" in node) return Number(node.i8);
  if ("double" in node) return Number(node.double);
  if ("boolean" in node) return String(node.boolean) === "1";
  if ("base64" in node) return Buffer.from(node.base64 || "", "base64");
  if ("dateTime.iso8601" in node) return String(node["dateTime.iso8601"]);
  if ("nil" in node) return null;
  if ("array" in node) {
    const values = node.array?.data?.value;
    if (values === undefined) return [];
    return (Array.isArray(values) ? values : [values]).map(decodeValue);
  }
  if ("struct" in node) {
    const members = node.struct?.member;
    if (!members) return {};
    return (Array.isArray(members) ? members : [members]).reduce(
      (result: Record<string, unknown>, member: any) => {
        result[String(member.name)] = decodeValue(member.value);
        return result;
      },
      {},
    );
  }
  if ("value" in node) return decodeValue(node.value);
  return node;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  trimValues: true,
});

export async function xmlRpcCall<T>(
  endpoint: string,
  method: string,
  params: XmlRpcValue[] = [],
): Promise<T> {
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<methodCall><methodName>${escapeXml(method)}</methodName>` +
    `<params>${params.map((param) => `<param>${encodeValue(param)}</param>`).join("")}</params>` +
    `</methodCall>`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      Accept: "text/xml",
      "User-Agent": "CeskyPartner-Reality/1.0",
    },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`XML-RPC HTTP ${response.status}: ${responseText.slice(0, 500)}`);
  }

  const parsed = parser.parse(responseText);
  const methodResponse = parsed?.methodResponse;
  if (!methodResponse) throw new Error("Neplatná XML-RPC odpověď");

  if (methodResponse.fault?.value) {
    const fault = decodeValue(methodResponse.fault.value);
    throw new Error(`XML-RPC fault: ${JSON.stringify(fault)}`);
  }

  const value = methodResponse.params?.param?.value;
  return decodeValue(value) as T;
}
