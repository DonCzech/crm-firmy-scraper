import { NextRequest, NextResponse } from "next/server";
import { requireSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";

const MONTHS = ["Leden","Únor","Březen","Duben","Květen","Červen","Červenec","Srpen","Září","Říjen","Listopad","Prosinec"];

function escapeCell(v: unknown): string {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const year = req.nextUrl.searchParams.get("year") ?? String(new Date().getFullYear());

  const [invoiceRows, expenseRows] = await Promise.all([
    query(
      `SELECT EXTRACT(MONTH FROM issue_date::date)::int AS month,
              COALESCE(SUM(total) FILTER (WHERE status NOT IN ('cancelled','draft')), 0) AS vynosy
       FROM fak_invoices WHERE company_id = $1 AND issue_date LIKE $2 || '-%'
       GROUP BY month`,
      [company.id, year]
    ),
    query(
      `SELECT EXTRACT(MONTH FROM issue_date::date)::int AS month,
              COALESCE(SUM(total) FILTER (WHERE status != 'cancelled'), 0) AS naklady
       FROM fak_expenses WHERE company_id = $1 AND issue_date LIKE $2 || '-%'
       GROUP BY month`,
      [company.id, year]
    ),
  ]);

  const data = Array.from({ length: 12 }, (_, i) => {
    const ir = invoiceRows.rows.find((r) => r.month === i + 1);
    const er = expenseRows.rows.find((r) => r.month === i + 1);
    const vynosy = ir ? parseFloat(ir.vynosy) : 0;
    const naklady = er ? parseFloat(er.naklady) : 0;
    return {
      Měsíc: MONTHS[i],
      "Výnosy (Kč)": vynosy.toFixed(2),
      "Náklady (Kč)": naklady.toFixed(2),
      "Výsledek (Kč)": (vynosy - naklady).toFixed(2),
    };
  });

  const cols = ["Měsíc", "Výnosy (Kč)", "Náklady (Kč)", "Výsledek (Kč)"];
  const header = cols.join(",");
  const lines = data.map((r) => cols.map((c) => escapeCell(r[c as keyof typeof r])).join(","));
  const csv = "﻿" + [header, ...lines].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="statistiky-${year}.csv"`,
    },
  });
}
