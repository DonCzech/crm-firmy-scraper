import { NextRequest, NextResponse } from "next/server";
import { requireSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";

function escapeCell(v: unknown): string {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(rows: Record<string, unknown>[], cols: string[]): string {
  const header = cols.join(",");
  const lines = rows.map((r) => cols.map((c) => escapeCell(r[c])).join(","));
  return [header, ...lines].join("\n");
}

// Minimal XLSX writer (no external dep)
function toXlsx(rows: Record<string, unknown>[], cols: string[]): Buffer {
  // Build simple XML-based XLSX
  const sharedStrings: string[] = [];
  const ssMap = new Map<string, number>();
  function si(s: string): number {
    if (!ssMap.has(s)) { ssMap.set(s, sharedStrings.length); sharedStrings.push(s); }
    return ssMap.get(s)!;
  }

  const headerRow = cols.map((c) => `<c t="s"><v>${si(c)}</v></c>`).join("");
  const dataRows = rows.map((r) =>
    `<row>${cols.map((c) => {
      const v = r[c];
      if (v === null || v === undefined || v === "") return "<c/>";
      const num = typeof v === "number" ? v : parseFloat(String(v));
      if (!isNaN(num) && typeof v !== "string") return `<c t="n"><v>${num}</v></c>`;
      return `<c t="s"><v>${si(String(v))}</v></c>`;
    }).join("")}</row>`
  ).join("");

  const sheetXml = `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row>${headerRow}</row>${dataRows}</sheetData></worksheet>`;
  const ssXml = `<?xml version="1.0" encoding="UTF-8"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${sharedStrings.length}" uniqueCount="${sharedStrings.length}">${sharedStrings.map((s) => `<si><t>${s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</t></si>`).join("")}</sst>`;
  const wbXml = `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Faktury" sheetId="1" r:id="rId1"/></sheets></workbook>`;
  const relsXml = `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>`;
  const contentTypes = `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/></Types>`;

  // Build ZIP manually using a simple approach via Buffer concatenation
  const files: { name: string; data: Buffer }[] = [
    { name: "[Content_Types].xml", data: Buffer.from(contentTypes, "utf8") },
    { name: "_rels/.rels", data: Buffer.from(`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`, "utf8") },
    { name: "xl/workbook.xml", data: Buffer.from(wbXml, "utf8") },
    { name: "xl/_rels/workbook.xml.rels", data: Buffer.from(relsXml, "utf8") },
    { name: "xl/worksheets/sheet1.xml", data: Buffer.from(sheetXml, "utf8") },
    { name: "xl/sharedStrings.xml", data: Buffer.from(ssXml, "utf8") },
  ];

  return buildZip(files);
}

function crc32(buf: Buffer): number {
  const table: number[] = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16LE(n: number): Buffer {
  const b = Buffer.alloc(2); b.writeUInt16LE(n, 0); return b;
}
function writeUint32LE(n: number): Buffer {
  const b = Buffer.alloc(4); b.writeUInt32LE(n, 0); return b;
}

function buildZip(files: { name: string; data: Buffer }[]): Buffer {
  const localHeaders: Buffer[] = [];
  const centralDir: Buffer[] = [];
  let offset = 0;

  for (const f of files) {
    const name = Buffer.from(f.name, "utf8");
    const crc = crc32(f.data);
    const size = f.data.length;

    const local = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x03, 0x04]),
      writeUint16LE(20), writeUint16LE(0), writeUint16LE(0),
      writeUint16LE(0), writeUint16LE(0),
      writeUint32LE(crc), writeUint32LE(size), writeUint32LE(size),
      writeUint16LE(name.length), writeUint16LE(0),
      name, f.data,
    ]);
    localHeaders.push(local);

    const central = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x01, 0x02]),
      writeUint16LE(20), writeUint16LE(20),
      writeUint16LE(0), writeUint16LE(0), writeUint16LE(0),
      writeUint16LE(0), writeUint16LE(0),
      writeUint32LE(crc), writeUint32LE(size), writeUint32LE(size),
      writeUint16LE(name.length), writeUint16LE(0), writeUint16LE(0),
      writeUint16LE(0), writeUint16LE(0), writeUint32LE(0),
      writeUint32LE(offset),
      name,
    ]);
    centralDir.push(central);
    offset += local.length;
  }

  const cdBuf = Buffer.concat(centralDir);
  const eocd = Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x05, 0x06]),
    writeUint16LE(0), writeUint16LE(0),
    writeUint16LE(files.length), writeUint16LE(files.length),
    writeUint32LE(cdBuf.length), writeUint32LE(offset),
    writeUint16LE(0),
  ]);

  return Buffer.concat([...localHeaders, cdBuf, eocd]);
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Koncept", sent: "Odesláno", viewed: "Zobrazeno",
  paid: "Zaplaceno", overdue: "Po splatnosti", cancelled: "Stornováno",
};
const TYPE_LABELS: Record<string, string> = {
  invoice: "Faktura", proforma: "Proforma", advance: "Zálohová",
  credit_note: "Dobropis", tax_document: "Daňový doklad",
};
const PAYMENT_LABELS: Record<string, string> = {
  bank: "Převodem", card: "Kartou", cash: "Hotově", cod: "Dobírka", other: "Jinak",
};

export async function GET(req: NextRequest) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const sp = req.nextUrl.searchParams;
  const format = sp.get("format") ?? "csv"; // csv | xlsx
  const status = sp.get("status");
  const dateFrom = sp.get("from");
  const dateTo = sp.get("to");

  const conditions: string[] = ["i.company_id = $1"];
  const params: unknown[] = [company.id];

  if (status) { conditions.push(`i.status = $${params.length + 1}`); params.push(status); }
  if (dateFrom) { conditions.push(`i.issue_date >= $${params.length + 1}`); params.push(dateFrom); }
  if (dateTo) { conditions.push(`i.issue_date <= $${params.length + 1}`); params.push(dateTo); }

  const { rows } = await query(
    `SELECT i.number, i.type, i.status, i.issue_date, i.due_date,
            c.name as client_name, c.ico as client_ico,
            i.subtotal, i.vat_total, i.total, i.currency,
            i.payment_method, i.variable_symbol, i.order_number
     FROM fak_invoices i
     LEFT JOIN fak_clients c ON c.id = i.client_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY i.issue_date DESC`,
    params
  );

  const data = rows.map((r) => ({
    "Číslo faktury": r.number,
    "Typ": TYPE_LABELS[r.type] ?? r.type,
    "Stav": STATUS_LABELS[r.status] ?? r.status,
    "Datum vystavení": r.issue_date,
    "Datum splatnosti": r.due_date,
    "Odběratel": r.client_name ?? "",
    "IČO odběratele": r.client_ico ?? "",
    "Základ DPH": r.subtotal,
    "DPH": r.vat_total,
    "Celkem": r.total,
    "Měna": r.currency,
    "Způsob platby": PAYMENT_LABELS[r.payment_method] ?? r.payment_method,
    "Variabilní symbol": r.variable_symbol ?? "",
    "Číslo objednávky": r.order_number ?? "",
  }));

  const cols = Object.keys(data[0] ?? {
    "Číslo faktury": "", Typ: "", Stav: "", "Datum vystavení": "", "Datum splatnosti": "",
    "Odběratel": "", "IČO odběratele": "", "Základ DPH": 0, DPH: 0, Celkem: 0,
    Měna: "", "Způsob platby": "", "Variabilní symbol": "", "Číslo objednávky": "",
  });

  if (format === "xlsx") {
    const buf = toXlsx(data, cols);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="faktury.xlsx"`,
      },
    });
  }

  const csv = toCsv(data, cols);
  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="faktury.csv"`,
    },
  });
}
