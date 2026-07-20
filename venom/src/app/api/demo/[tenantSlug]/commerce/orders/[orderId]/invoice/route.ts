import { NextRequest } from "next/server";
import { requireCommerceAdmin } from "@/lib/commerce/api-guard";
import { initCommerceDb } from "@/lib/commerce/schema";
import { createInvoice, getInvoice, listInvoices, renderInvoiceHtml, type InvoiceType } from "@/lib/commerce/invoices";
import { renderInvoicePdf } from "@/lib/commerce/invoice-pdf";
import { invoiceQrSvg } from "@/lib/commerce/qr-payment";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ tenantSlug: string; orderId: string }> }) {
  const { tenantSlug, orderId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  await initCommerceDb();
  const oid = Number(orderId);
  const type = req.nextUrl.searchParams.get("type") as InvoiceType | "delivery" | null;

  const invoiceType: InvoiceType = type === "delivery" ? "delivery_note"
    : type === "credit_note" ? "credit_note"
    : type === "proforma" ? "proforma"
    : "invoice";

  const existing = await listInvoices(guard.tenant.id, { orderId: oid, type: invoiceType });
  let invoice;
  let items;

  if (existing.items.length > 0) {
    const detail = await getInvoice(guard.tenant.id, existing.items[0].id);
    if (!detail) return Response.json({ error: "not found" }, { status: 404 });
    invoice = detail.invoice;
    items = detail.items;
  } else {
    const result = await createInvoice(guard.tenant.id, {
      orderId: oid,
      type: invoiceType,
      paymentMethod: "Bankovní převod",
    });
    invoice = result.invoice;
    items = result.items;
  }

  const qrSvg = type === "delivery" ? null : await invoiceQrSvg(invoice);
  const html = renderInvoiceHtml(invoice, items, type === "delivery" ? "delivery" : undefined, { qrSvg });

  if (req.nextUrl.searchParams.get("format") === "pdf") {
    const pdf = await renderInvoicePdf(html);
    if (!pdf) return Response.json({ error: "PDF renderer není k dispozici" }, { status: 503 });
    const prefix = type === "delivery" ? "dodaci-list" : "faktura";
    const filename = `${prefix}-${invoice.invoice_number.replace(/[^\w-]+/g, "-")}.pdf`;
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
