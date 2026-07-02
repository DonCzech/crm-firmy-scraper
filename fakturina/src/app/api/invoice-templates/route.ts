import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import { requireSession, getUserCompany } from "@/lib/auth";
import { z } from "zod";

const itemSchema = z.object({
  name: z.string(),
  quantity: z.number().default(1),
  unit: z.string().default("ks"),
  unitPrice: z.number().default(0),
  vatRate: z.number().default(0),
});

const schema = z.object({
  name: z.string().min(1).max(100),
  note: z.string().optional(),
  paymentMethod: z.string().optional(),
  footerText: z.string().optional(),
  noteBeforeItems: z.string().optional(),
  currency: z.string().default("CZK"),
  language: z.string().default("cs"),
  items: z.array(itemSchema).default([]),
});

export async function GET() {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json([]);

  const { rows } = await query(
    `SELECT t.*,
       COALESCE(json_agg(ti ORDER BY ti.sort_order) FILTER (WHERE ti.id IS NOT NULL), '[]') as items
     FROM fak_invoice_templates t
     LEFT JOIN fak_invoice_template_items ti ON ti.template_id = t.id
     WHERE t.company_id = $1
     GROUP BY t.id
     ORDER BY t.created_at DESC`,
    [company.id]
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Neplatné vstupy" }, { status: 400 });

  const d = parsed.data;
  const id = randomUUID();

  await query(
    `INSERT INTO fak_invoice_templates (id, company_id, name, note, payment_method, footer_text, note_before_items, currency, language)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [id, company.id, d.name, d.note ?? null, d.paymentMethod ?? null,
     d.footerText ?? null, d.noteBeforeItems ?? null, d.currency, d.language]
  );

  for (let i = 0; i < d.items.length; i++) {
    const item = d.items[i];
    await query(
      `INSERT INTO fak_invoice_template_items (id, template_id, name, quantity, unit, unit_price, vat_rate, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [randomUUID(), id, item.name, item.quantity, item.unit, item.unitPrice, item.vatRate, i]
    );
  }

  const { rows } = await query(
    `SELECT t.*,
       COALESCE(json_agg(ti ORDER BY ti.sort_order) FILTER (WHERE ti.id IS NOT NULL), '[]') as items
     FROM fak_invoice_templates t
     LEFT JOIN fak_invoice_template_items ti ON ti.template_id = t.id
     WHERE t.id = $1 GROUP BY t.id`,
    [id]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
