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
  name: z.string().min(1).optional(),
  clientId: z.string().optional().nullable(),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
  period: z.enum(["weekly", "monthly", "quarterly", "yearly"]).optional(),
  active: z.boolean().optional(),
  sendByEmail: z.boolean().optional(),
  asProforma: z.boolean().optional(),
  dueDays: z.number().int().min(1).max(365).optional(),
  currency: z.string().optional(),
  note: z.string().optional().nullable(),
  items: z.array(itemSchema).optional(),
});

async function getOwned(id: string, companyId: string) {
  const { rows } = await query(
    "SELECT * FROM fak_recurring_invoices WHERE id = $1 AND company_id = $2",
    [id, companyId]
  );
  return rows[0] ?? null;
}

async function validateClient(companyId: string, clientId?: string | null) {
  if (!clientId) return null;
  const { rows } = await query(
    "SELECT id FROM fak_clients WHERE id = $1 AND company_id = $2 AND archived = false",
    [clientId, companyId]
  );
  return rows[0] ? null : "Klient neexistuje";
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const rec = await getOwned(id, company.id);
  if (!rec) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { rows: items } = await query(
    "SELECT * FROM fak_recurring_invoice_items WHERE recurring_invoice_id = $1 ORDER BY sort_order ASC",
    [id]
  );
  return NextResponse.json({ ...rec, items });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const rec = await getOwned(id, company.id);
  if (!rec) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Neplatné vstupy" }, { status: 400 });

  const d = parsed.data;
  const refError = await validateClient(company.id, d.clientId);
  if (refError) return NextResponse.json({ error: refError }, { status: 400 });

  const fields: string[] = [];
  const vals: unknown[] = [];
  let idx = 1;
  const add = (col: string, val: unknown) => { fields.push(`${col} = $${idx++}`); vals.push(val); };

  if (d.name !== undefined) add("name", d.name);
  if (d.clientId !== undefined) add("client_id", d.clientId);
  if (d.startDate !== undefined) add("start_date", d.startDate);
  if (d.endDate !== undefined) add("end_date", d.endDate);
  if (d.period !== undefined) add("period", d.period);
  if (d.active !== undefined) add("active", d.active);
  if (d.sendByEmail !== undefined) add("send_by_email", d.sendByEmail);
  if (d.asProforma !== undefined) add("as_proforma", d.asProforma);
  if (d.dueDays !== undefined) add("due_days", d.dueDays);
  if (d.currency !== undefined) add("currency", d.currency);
  if (d.note !== undefined) add("note", d.note);

  if (fields.length > 0) {
    vals.push(id, company.id);
    await query(`UPDATE fak_recurring_invoices SET ${fields.join(", ")} WHERE id = $${idx++} AND company_id = $${idx}`, vals);
  }

  if (d.items !== undefined) {
    await query("DELETE FROM fak_recurring_invoice_items WHERE recurring_invoice_id = $1", [id]);
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
  }

  const { rows } = await query("SELECT * FROM fak_recurring_invoices WHERE id = $1 AND company_id = $2", [id, company.id]);
  const { rows: items } = await query(
    "SELECT * FROM fak_recurring_invoice_items WHERE recurring_invoice_id = $1 ORDER BY sort_order ASC",
    [id]
  );
  return NextResponse.json({ ...rows[0], items });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const rec = await getOwned(id, company.id);
  if (!rec) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await query("DELETE FROM fak_recurring_invoices WHERE id = $1 AND company_id = $2", [id, company.id]);
  return NextResponse.json({ ok: true });
}
