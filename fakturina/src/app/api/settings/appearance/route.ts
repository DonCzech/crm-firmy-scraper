import { NextRequest, NextResponse } from "next/server";
import { requireSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  invoice_template: z.string().default("modern"),
  invoice_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#4f46e5"),
  invoice_spacing: z.enum(["spacious", "compact"]).default("spacious"),
  invoice_footer: z.string().optional(),
  logo_url: z.string().optional().nullable(),
  stamp_url: z.string().optional().nullable(),
  show_qr_payment: z.boolean().default(true),
  default_language: z.string().default("cs"),
});

export async function GET() {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  return NextResponse.json({
    invoice_template: company.invoice_template ?? "modern",
    invoice_color: company.invoice_color ?? "#4f46e5",
    invoice_spacing: company.invoice_spacing ?? "spacious",
    invoice_footer: company.invoice_footer ?? "",
    logo_url: company.logo_url ?? null,
    stamp_url: company.stamp_url ?? null,
    show_qr_payment: company.show_qr_payment ?? true,
    default_language: company.default_language ?? "cs",
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
  await query(
    `UPDATE fak_companies SET
       invoice_template = $2, invoice_color = $3, invoice_spacing = $4,
       invoice_footer = $5, logo_url = $6, stamp_url = $7,
       show_qr_payment = $8, default_language = $9
     WHERE id = $1`,
    [company.id, d.invoice_template, d.invoice_color, d.invoice_spacing,
     d.invoice_footer ?? null, d.logo_url ?? null, d.stamp_url ?? null,
     d.show_qr_payment, d.default_language]
  );
  return NextResponse.json({ ok: true });
}
