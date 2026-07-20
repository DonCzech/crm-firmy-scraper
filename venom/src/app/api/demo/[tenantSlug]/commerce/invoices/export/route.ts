import { NextRequest } from "next/server";
import { requireCommerceAdmin } from "@/lib/commerce/api-guard";
import { initCommerceDb } from "@/lib/commerce/schema";
import { listInvoices, type InvoiceType } from "@/lib/commerce/invoices";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  await initCommerceDb();
  const sp = req.nextUrl.searchParams;
  const type = sp.get("type") as InvoiceType | null;

  const { items } = await listInvoices(guard.tenant.id, {
    type: type ?? undefined,
    page: 1,
    perPage: 10000,
  });

  function fmtCzk(cents: number): string {
    return (cents / 100).toFixed(2).replace(".", ",");
  }

  const header = "Číslo dokladu;Typ;Vystaveno;Splatnost;Odběratel;IČO;DIČ;Základ;DPH;Celkem;Měna;Stav";
  const rows = items.map((inv) =>
    [
      inv.invoice_number,
      inv.invoice_type,
      new Date(inv.issued_at).toLocaleDateString("cs-CZ"),
      new Date(inv.due_date).toLocaleDateString("cs-CZ"),
      `"${(inv.customer_name ?? "").replace(/"/g, '""')}"`,
      inv.customer_ico ?? "",
      inv.customer_dic ?? "",
      fmtCzk(inv.subtotal_cents),
      fmtCzk(inv.tax_cents),
      fmtCzk(inv.total_cents),
      inv.currency,
      inv.status,
    ].join(";")
  );

  const csv = "﻿" + [header, ...rows].join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="doklady-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
