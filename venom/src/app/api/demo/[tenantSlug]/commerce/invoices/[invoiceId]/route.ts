import { NextRequest } from "next/server";
import { requireCommerceAdmin, jsonError } from "@/lib/commerce/api-guard";
import { initCommerceDb } from "@/lib/commerce/schema";
import { getInvoice, cancelInvoice } from "@/lib/commerce/invoices";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ tenantSlug: string; invoiceId: string }> }) {
  const { tenantSlug, invoiceId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  await initCommerceDb();
  const result = await getInvoice(guard.tenant.id, Number(invoiceId));
  if (!result) return jsonError("Doklad nenalezen", 404);
  return Response.json(result);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ tenantSlug: string; invoiceId: string }> }) {
  const { tenantSlug, invoiceId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  await initCommerceDb();
  const invoice = await cancelInvoice(guard.tenant.id, Number(invoiceId));
  if (!invoice) return jsonError("Doklad nelze stornovat", 400);
  return Response.json({ ok: true, invoice });
}
