import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import { requireSession, getUserCompany } from "@/lib/auth";
import { auditLog } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  ico: z.string().optional(),
  dic: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  bankAccount: z.string().optional(),
  iban: z.string().optional(),
  swift: z.string().optional(),
  logoUrl: z.string().optional(),
  invoiceTemplate: z.string().optional(),
  invoiceColor: z.string().optional(),
  invoiceFooter: z.string().optional(),
  invoiceNoteBefore: z.string().optional(),
  vatStatus: z.enum(["non_vat", "vat_payer", "identified_person"]).optional(),
  defaultCurrency: z.enum(["CZK", "EUR"]).optional(),
  defaultDueDays: z.number().int().min(1).max(365).optional(),
  invoicePrefix: z.string().optional(),
  invoicePadding: z.number().int().min(1).max(8).optional(),
  invoiceNext: z.number().int().min(1).optional(),
  features: z.record(z.boolean()).optional(),
  onboarded: z.boolean().optional(),
});

export async function GET() {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  return NextResponse.json(company ?? null);
}

export async function POST(req: NextRequest) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await getUserCompany(user.id);
  if (existing) return NextResponse.json({ error: "Company already exists" }, { status: 409 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Neplatné vstupy" }, { status: 400 });

  const d = parsed.data;
  const id = randomUUID();

  await query(
    `INSERT INTO fak_companies
       (id, user_id, name, ico, dic, address, city, zip, country,
        bank_account, iban, swift, logo_url, vat_status, default_currency,
        default_due_days, invoice_prefix, invoice_template, invoice_color, invoice_footer,
        invoice_note_before, invoice_padding, invoice_next, features, onboarded)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)`,
    [
      id, user.id, d.name, d.ico ?? null, d.dic ?? null,
      d.address ?? null, d.city ?? null, d.zip ?? null, d.country ?? "CZ",
      d.bankAccount ?? null, d.iban ?? null, d.swift ?? null, d.logoUrl ?? null,
      d.vatStatus ?? "non_vat", d.defaultCurrency ?? "CZK",
      d.defaultDueDays ?? 14, d.invoicePrefix ?? "FA", d.invoiceTemplate ?? "modern",
      d.invoiceColor ?? "#4f46e5", d.invoiceFooter ?? null, d.invoiceNoteBefore ?? null,
      d.invoicePadding ?? 4, d.invoiceNext ?? 1,
      d.features ? JSON.stringify(d.features) : null, d.onboarded ?? false,
    ]
  );

  await auditLog({ userId: user.id, companyId: id, action: "company.created", entityType: "company", entityId: id });
  const { rows } = await query("SELECT * FROM fak_companies WHERE id = $1", [id]);
  return NextResponse.json(rows[0], { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Neplatné vstupy" }, { status: 400 });

  const d = parsed.data;

  const sets: string[] = [];
  const vals: unknown[] = [];
  let i = 1;
  const add = (col: string, val: unknown) => { sets.push(`${col}=$${i++}`); vals.push(val); };

  add("name", d.name);
  add("ico", d.ico ?? null);
  add("dic", d.dic ?? null);
  add("address", d.address ?? null);
  add("city", d.city ?? null);
  add("zip", d.zip ?? null);
  add("country", d.country ?? "CZ");
  add("bank_account", d.bankAccount ?? null);
  add("iban", d.iban ?? null);
  add("swift", d.swift ?? null);
  add("logo_url", d.logoUrl ?? null);
  add("vat_status", d.vatStatus ?? company.vat_status);
  add("default_currency", d.defaultCurrency ?? company.default_currency);
  add("default_due_days", d.defaultDueDays ?? company.default_due_days);
  add("invoice_prefix", d.invoicePrefix ?? company.invoice_prefix);
  add("invoice_template", d.invoiceTemplate ?? company.invoice_template ?? "modern");
  add("invoice_color", d.invoiceColor ?? company.invoice_color ?? "#4f46e5");
  add("invoice_footer", d.invoiceFooter !== undefined ? (d.invoiceFooter || null) : company.invoice_footer);
  add("invoice_note_before", d.invoiceNoteBefore !== undefined ? (d.invoiceNoteBefore || null) : company.invoice_note_before);
  if (d.invoicePadding !== undefined) add("invoice_padding", d.invoicePadding);
  if (d.invoiceNext !== undefined) add("invoice_next", d.invoiceNext);
  if (d.features !== undefined) add("features", JSON.stringify(d.features));
  if (d.onboarded !== undefined) add("onboarded", d.onboarded);

  vals.push(company.id);
  await query(`UPDATE fak_companies SET ${sets.join(", ")} WHERE id=$${i}`, vals);

  await auditLog({ userId: user.id, companyId: company.id, action: "company.updated", entityType: "company", entityId: company.id });
  const { rows } = await query("SELECT * FROM fak_companies WHERE id = $1", [company.id]);
  return NextResponse.json(rows[0]);
}
