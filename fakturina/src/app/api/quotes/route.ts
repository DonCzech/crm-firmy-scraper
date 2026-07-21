import { NextRequest, NextResponse } from "next/server";
import { randomUUID, randomBytes } from "crypto";
import { query, withTransaction } from "@/lib/db";
import { requireSession, getUserCompany } from "@/lib/auth";
import { z } from "zod";

const itemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive().default(1),
  unit: z.string().optional(),
  unitPrice: z.number().min(0),
  vatRate: z.number().int().min(0).max(21).default(0),
});

const schema = z.object({
  clientId: z.string().optional().nullable(),
  currency: z.string().regex(/^[A-Z]{3}$/).default("CZK"),
  issueDate: z.string().date(),
  validUntil: z.string().date().optional(),
  language: z.string().default("cs"),
  note: z.string().optional(),
  noteBeforeItems: z.string().optional(),
  footerText: z.string().optional(),
  items: z.array(itemSchema).min(1).max(500),
});

async function validateClient(companyId: string, clientId?: string | null) {
  if (!clientId) return null;
  const { rows } = await query(
    "SELECT id FROM fak_clients WHERE id = $1 AND company_id = $2 AND archived = false",
    [clientId, companyId]
  );
  return rows[0] ? null : "Klient neexistuje";
}

export async function GET(req: NextRequest) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json([]);

  const status = req.nextUrl.searchParams.get("status");
  const q = req.nextUrl.searchParams.get("q");

  const conditions = ["q.company_id = $1"];
  const params: unknown[] = [company.id];
  let idx = 2;

  if (status) { conditions.push(`q.status = $${idx++}`); params.push(status); }
  if (q?.trim()) {
    conditions.push(`(q.number ILIKE $${idx} OR c.name ILIKE $${idx})`);
    params.push(`%${q.trim()}%`);
    idx++;
  }

  const { rows } = await query(
    `SELECT q.*, c.name as client_name
     FROM fak_quotes q
     LEFT JOIN fak_clients c ON c.id = q.client_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY q.created_at DESC`,
    params
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
  const refError = await validateClient(company.id, d.clientId);
  if (refError) return NextResponse.json({ error: refError }, { status: 400 });

  const isVatPayer = company.vat_status === "vat_payer";

  const calcItems = d.items.map((item) => {
    const totalWithoutVat = Math.round(item.quantity * item.unitPrice * 100) / 100;
    const totalVat = isVatPayer ? Math.round(totalWithoutVat * (item.vatRate / 100) * 100) / 100 : 0;
    return { ...item, totalWithoutVat, totalVat, totalWithVat: Math.round((totalWithoutVat + totalVat) * 100) / 100 };
  });

  const subtotal = calcItems.reduce((s, i) => s + i.totalWithoutVat, 0);
  const vatTotal = calcItems.reduce((s, i) => s + i.totalVat, 0);
  const total = Math.round((subtotal + vatTotal) * 100) / 100;

  const created = await withTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${company.id}:quotes`]);
    const count = await client.query("SELECT COUNT(*)::int as cnt FROM fak_quotes WHERE company_id = $1", [company.id]);
    const number = `NAB${new Date().getFullYear()}-${String(Number(count.rows[0].cnt) + 1).padStart(4, "0")}`;
    const id = randomUUID();
    const publicToken = randomBytes(24).toString("hex");
    await client.query(
    `INSERT INTO fak_quotes
       (id, company_id, client_id, number, status, currency, issue_date, valid_until,
        language, note, note_before_items, footer_text,
        subtotal, vat_total, total, public_token)
     VALUES ($1,$2,$3,$4,'draft',$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
    [id, company.id, d.clientId ?? null, number, d.currency,
     d.issueDate, d.validUntil ?? null, d.language,
     d.note ?? null, d.noteBeforeItems ?? null, d.footerText ?? null,
     subtotal, vatTotal, total, publicToken]
    );

    for (let i = 0; i < calcItems.length; i++) {
      const item = calcItems[i];
      await client.query(
      `INSERT INTO fak_quote_items
         (id, quote_id, name, quantity, unit, unit_price, vat_rate,
          total_without_vat, total_vat, total_with_vat, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [randomUUID(), id, item.name, item.quantity, item.unit ?? null,
       item.unitPrice, item.vatRate, item.totalWithoutVat, item.totalVat, item.totalWithVat, i]
    );
    }
    const result = await client.query("SELECT * FROM fak_quotes WHERE id = $1 AND company_id = $2", [id, company.id]);
    return result.rows[0];
  });
  return NextResponse.json(created, { status: 201 });
}
