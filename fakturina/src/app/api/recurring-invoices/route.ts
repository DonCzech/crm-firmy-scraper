import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import { requireSession, getUserCompany } from "@/lib/auth";
import { z } from "zod";

const itemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().min(0).default(1),
  unit: z.string().optional(),
  unitPrice: z.number().default(0),
  vatRate: z.number().int().min(0).max(21).default(0),
});

const schema = z.object({
  name: z.string().min(1),
  clientId: z.string().optional().nullable(),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  period: z.enum(["weekly", "monthly", "quarterly", "yearly"]).default("monthly"),
  sendByEmail: z.boolean().default(false),
  asProforma: z.boolean().default(false),
  dueDays: z.number().int().min(1).max(365).default(14),
  currency: z.string().default("CZK"),
  note: z.string().optional().nullable(),
  items: z.array(itemSchema).min(0),
});

function calcNextDate(startDate: string, period: string): string {
  const d = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d >= today) return startDate;
  while (d < today) {
    if (period === "weekly") d.setDate(d.getDate() + 7);
    else if (period === "monthly") d.setMonth(d.getMonth() + 1);
    else if (period === "quarterly") d.setMonth(d.getMonth() + 3);
    else d.setFullYear(d.getFullYear() + 1);
  }
  return d.toISOString().split("T")[0];
}

async function validateClient(companyId: string, clientId?: string | null) {
  if (!clientId) return null;
  const { rows } = await query(
    "SELECT id FROM fak_clients WHERE id = $1 AND company_id = $2 AND archived = false",
    [clientId, companyId]
  );
  return rows[0] ? null : "Klient neexistuje";
}

export async function GET() {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json([]);

  const { rows } = await query(
    `SELECT r.*, c.name as client_name
     FROM fak_recurring_invoices r
     LEFT JOIN fak_clients c ON c.id = r.client_id
     WHERE r.company_id = $1
     ORDER BY r.created_at DESC`,
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
  if (!parsed.success) return NextResponse.json({ error: "Neplatné vstupy", details: parsed.error.flatten() }, { status: 400 });

  const d = parsed.data;
  const refError = await validateClient(company.id, d.clientId);
  if (refError) return NextResponse.json({ error: refError }, { status: 400 });

  const id = randomUUID();
  const nextDate = calcNextDate(d.startDate, d.period);

  await query(
    `INSERT INTO fak_recurring_invoices
       (id, company_id, client_id, name, start_date, next_issue_date, end_date,
        period, active, send_by_email, as_proforma, due_days, currency, note)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,$9,$10,$11,$12,$13)`,
    [id, company.id, d.clientId ?? null, d.name, d.startDate, nextDate,
     d.endDate ?? null, d.period, d.sendByEmail, d.asProforma, d.dueDays, d.currency, d.note ?? null]
  );

  for (let i = 0; i < d.items.length; i++) {
    const item = d.items[i];
    await query(
      `INSERT INTO fak_recurring_invoice_items
         (id, recurring_invoice_id, name, quantity, unit, unit_price, vat_rate, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [randomUUID(), id, item.name, item.quantity, item.unit ?? null,
       item.unitPrice, item.vatRate, i]
    );
  }

  const { rows } = await query("SELECT * FROM fak_recurring_invoices WHERE id = $1 AND company_id = $2", [id, company.id]);
  return NextResponse.json(rows[0], { status: 201 });
}
