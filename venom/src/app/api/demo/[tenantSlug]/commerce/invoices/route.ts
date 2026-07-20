import { NextRequest } from "next/server";
import { requireCommerceAdmin, jsonError } from "@/lib/commerce/api-guard";
import { initCommerceDb } from "@/lib/commerce/schema";
import { listInvoices, createInvoice, type InvoiceType } from "@/lib/commerce/invoices";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  await initCommerceDb();
  const sp = req.nextUrl.searchParams;
  const type = sp.get("type") as InvoiceType | null;

  const result = await listInvoices(guard.tenant.id, {
    type: type ?? undefined,
    page: parseInt(sp.get("page") ?? "1", 10) || 1,
    perPage: parseInt(sp.get("perPage") ?? "50", 10) || 50,
  });

  return Response.json(result);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  await initCommerceDb();
  const body = await req.json();

  try {
    const result = await createInvoice(guard.tenant.id, {
      orderId: body.orderId,
      type: body.type ?? "invoice",
      supplierOverrides: body.supplier,
      customerOverrides: body.customer,
      items: body.items,
      note: body.note,
      dueDate: body.dueDate,
      taxableDate: body.taxableDate,
      paymentMethod: body.paymentMethod,
      variableSymbol: body.variableSymbol,
    });
    return Response.json(result, { status: 201 });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Vytvoření dokladu selhalo", 400);
  }
}
