import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import { requireSession, getUserCompany } from "@/lib/auth";
import { z } from "zod";

const itemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().min(0).default(1),
  unit: z.string().optional(),
  unitPrice: z.number(),
  vatRate: z.number().int().min(0).max(21).default(0),
});

const schema = z.object({
  supplierName: z.string().optional(),
  supplierIco: z.string().optional(),
  number: z.string().optional(),
  variableSymbol: z.string().optional(),
  currency: z.string().default("CZK"),
  issueDate: z.string(),
  dueDate: z.string(),
  taxableDate: z.string().optional(),
  paymentMethod: z.enum(["bank", "card", "cash", "cod", "other"]).default("bank"),
  note: z.string().optional(),
  items: z.array(itemSchema).min(0),
});

export async function GET(req: NextRequest) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json([]);

  const status = req.nextUrl.searchParams.get("status");
  const q = req.nextUrl.searchParams.get("q");

  const conditions = ["company_id = $1"];
  const params: unknown[] = [company.id];
  let idx = 2;

  if (status) { conditions.push(`status = $${idx++}`); params.push(status); }
  if (q?.trim()) {
    conditions.push(`(supplier_name ILIKE $${idx} OR number ILIKE $${idx} OR variable_symbol ILIKE $${idx})`);
    params.push(`%${q.trim()}%`);
    idx++;
  }

  const { rows } = await query(
    `SELECT * FROM fak_expenses WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC`,
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
  const isVatPayer = company.vat_status === "vat_payer";

  const calcItems = d.items.map((item) => {
    const totalWithoutVat = Math.round(item.quantity * item.unitPrice * 100) / 100;
    const totalVat = isVatPayer ? Math.round(totalWithoutVat * (item.vatRate / 100) * 100) / 100 : 0;
    return { ...item, totalWithoutVat, totalVat, totalWithVat: Math.round((totalWithoutVat + totalVat) * 100) / 100 };
  });

  const subtotal = calcItems.reduce((s, i) => s + i.totalWithoutVat, 0);
  const vatTotal = calcItems.reduce((s, i) => s + i.totalVat, 0);
  const total = Math.round((subtotal + vatTotal) * 100) / 100;

  const id = randomUUID();
  await query(
    `INSERT INTO fak_expenses
       (id, company_id, supplier_name, supplier_ico, number, variable_symbol, currency,
        issue_date, due_date, taxable_date, subtotal, vat_total, total, status, payment_method, note)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'unpaid',$14,$15)`,
    [id, company.id, d.supplierName ?? null, d.supplierIco ?? null, d.number ?? null,
     d.variableSymbol ?? null, d.currency, d.issueDate, d.dueDate, d.taxableDate ?? null,
     subtotal, vatTotal, total, d.paymentMethod, d.note ?? null]
  );

  for (let i = 0; i < calcItems.length; i++) {
    const item = calcItems[i];
    await query(
      `INSERT INTO fak_expense_items
         (id, expense_id, name, quantity, unit, unit_price, vat_rate,
          total_without_vat, total_vat, total_with_vat, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [randomUUID(), id, item.name, item.quantity, item.unit ?? null,
       item.unitPrice, item.vatRate, item.totalWithoutVat, item.totalVat, item.totalWithVat, i]
    );
  }

  const { rows } = await query("SELECT * FROM fak_expenses WHERE id = $1", [id]);
  return NextResponse.json(rows[0], { status: 201 });
}
