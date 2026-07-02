import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireSession, getUserCompany } from "@/lib/auth";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["unpaid", "paid", "overdue", "cancelled"]).optional(),
  supplierName: z.string().optional(),
  supplierIco: z.string().optional(),
  number: z.string().optional(),
  variableSymbol: z.string().optional(),
  note: z.string().optional(),
});

async function getExpense(id: string, companyId: string) {
  const { rows } = await query(
    "SELECT * FROM fak_expenses WHERE id = $1 AND company_id = $2",
    [id, companyId]
  );
  return rows[0] ?? null;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const expense = await getExpense(id, company.id);
  if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { rows: items } = await query(
    "SELECT * FROM fak_expense_items WHERE expense_id = $1 ORDER BY sort_order",
    [id]
  );
  return NextResponse.json({ ...expense, items });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const expense = await getExpense(id, company.id);
  if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Neplatné vstupy" }, { status: 400 });

  const d = parsed.data;
  const updates: string[] = ["updated_at = EXTRACT(EPOCH FROM NOW())::BIGINT"];
  const vals: unknown[] = [];
  let i = 1;

  if (d.status !== undefined) {
    updates.push(`status = $${i++}`);
    vals.push(d.status);
    if (d.status === "paid") { updates.push(`paid_at = $${i++}`); vals.push(Math.floor(Date.now() / 1000)); }
  }
  if (d.supplierName !== undefined) { updates.push(`supplier_name = $${i++}`); vals.push(d.supplierName); }
  if (d.supplierIco !== undefined) { updates.push(`supplier_ico = $${i++}`); vals.push(d.supplierIco); }
  if (d.number !== undefined) { updates.push(`number = $${i++}`); vals.push(d.number); }
  if (d.note !== undefined) { updates.push(`note = $${i++}`); vals.push(d.note); }

  vals.push(id, company.id);
  await query(`UPDATE fak_expenses SET ${updates.join(", ")} WHERE id = $${i++} AND company_id = $${i}`, vals);
  const { rows } = await query("SELECT * FROM fak_expenses WHERE id = $1 AND company_id = $2", [id, company.id]);
  return NextResponse.json(rows[0]);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const expense = await getExpense(id, company.id);
  if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await query("DELETE FROM fak_expenses WHERE id = $1 AND company_id = $2", [id, company.id]);
  return NextResponse.json({ ok: true });
}
