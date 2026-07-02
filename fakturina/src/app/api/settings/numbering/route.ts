import { NextRequest, NextResponse } from "next/server";
import { requireSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  invoice_prefix: z.string().max(10).default(""),
  invoice_number_year_format: z.enum(["full", "short", "none"]).default("full"),
  invoice_number_month: z.boolean().default(false),
  invoice_number_position: z.enum(["start", "end"]).default("end"),
  invoice_number_volume: z.number().int().default(10000),
  invoice_number_separator: z.enum(["-", ""]).default("-"),
  invoice_next: z.number().int().min(1).optional(),
});

export async function GET() {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  return NextResponse.json({
    invoice_prefix: company.invoice_prefix ?? "",
    invoice_number_year_format: company.invoice_number_year_format ?? "full",
    invoice_number_month: company.invoice_number_month ?? false,
    invoice_number_position: company.invoice_number_position ?? "end",
    invoice_number_volume: company.invoice_number_volume ?? 10000,
    invoice_number_separator: company.invoice_number_separator ?? "-",
    invoice_next: company.invoice_next ?? 1,
  });
}

export async function PUT(req: NextRequest) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Neplatné vstupy" }, { status: 400 });

  const d = parsed.data;
  const fields: string[] = [
    "invoice_prefix = $2",
    "invoice_number_year_format = $3",
    "invoice_number_month = $4",
    "invoice_number_position = $5",
    "invoice_number_volume = $6",
    "invoice_number_separator = $7",
  ];
  const params: unknown[] = [
    company.id, d.invoice_prefix, d.invoice_number_year_format,
    d.invoice_number_month, d.invoice_number_position,
    d.invoice_number_volume, d.invoice_number_separator,
  ];

  if (d.invoice_next !== undefined) {
    fields.push(`invoice_next = $${params.length + 1}`);
    params.push(d.invoice_next);
  }

  await query(`UPDATE fak_companies SET ${fields.join(", ")} WHERE id = $1`, params);
  return NextResponse.json({ ok: true });
}
