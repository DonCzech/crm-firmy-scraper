import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireSession, getUserCompany } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const { id } = await params;
  await query("DELETE FROM fak_invoice_templates WHERE id = $1 AND company_id = $2", [id, company.id]);
  return NextResponse.json({ ok: true });
}
