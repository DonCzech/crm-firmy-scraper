import { NextRequest, NextResponse } from "next/server";
import { requireSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";

function escapeCell(v: unknown): string {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: Record<string, unknown>[], cols: string[]) {
  return [cols.join(","), ...rows.map((row) => cols.map((col) => escapeCell(row[col])).join(","))].join("\n");
}

const STATUS_LABELS: Record<string, string> = {
  unpaid: "Nezaplaceno",
  paid: "Zaplaceno",
  overdue: "Po splatnosti",
  cancelled: "Stornováno",
};

const PAYMENT_LABELS: Record<string, string> = {
  bank: "Převodem",
  card: "Kartou",
  cash: "Hotově",
  cod: "Dobírka",
  other: "Jinak",
};

export async function GET(req: NextRequest) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const sp = req.nextUrl.searchParams;
  const status = sp.get("status");
  const q = sp.get("q");
  const from = sp.get("from");
  const to = sp.get("to");

  const conditions = ["company_id = $1"];
  const params: unknown[] = [company.id];

  if (status) { params.push(status); conditions.push(`status = $${params.length}`); }
  if (from) { params.push(from); conditions.push(`issue_date >= $${params.length}`); }
  if (to) { params.push(to); conditions.push(`issue_date <= $${params.length}`); }
  if (q?.trim()) {
    params.push(`%${q.trim()}%`);
    conditions.push(`(supplier_name ILIKE $${params.length} OR number ILIKE $${params.length} OR variable_symbol ILIKE $${params.length})`);
  }

  const { rows } = await query(
    `SELECT supplier_name, supplier_ico, number, variable_symbol, status,
            issue_date, due_date, taxable_date, subtotal, vat_total, total,
            currency, payment_method, note
     FROM fak_expenses
     WHERE ${conditions.join(" AND ")}
     ORDER BY issue_date DESC, created_at DESC`,
    params
  );

  const data = rows.map((row) => ({
    "Číslo dokladu": row.number ?? "",
    "Dodavatel": row.supplier_name ?? "",
    "IČO dodavatele": row.supplier_ico ?? "",
    "Stav": STATUS_LABELS[row.status] ?? row.status,
    "Datum vystavení": row.issue_date,
    "Datum splatnosti": row.due_date,
    "DUZP": row.taxable_date ?? "",
    "Základ DPH": row.subtotal,
    "DPH": row.vat_total,
    "Celkem": row.total,
    "Měna": row.currency,
    "Způsob platby": PAYMENT_LABELS[row.payment_method] ?? row.payment_method,
    "Variabilní symbol": row.variable_symbol ?? "",
    "Poznámka": row.note ?? "",
  }));

  const cols = Object.keys(data[0] ?? {
    "Číslo dokladu": "", Dodavatel: "", "IČO dodavatele": "", Stav: "",
    "Datum vystavení": "", "Datum splatnosti": "", DUZP: "",
    "Základ DPH": 0, DPH: 0, Celkem: 0, Měna: "",
    "Způsob platby": "", "Variabilní symbol": "", Poznámka: "",
  });

  return new NextResponse("﻿" + toCsv(data, cols), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="naklady.csv"`,
    },
  });
}
