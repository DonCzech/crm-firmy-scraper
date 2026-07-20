import { NextRequest } from "next/server";
import { requireCommerceAdmin, jsonError } from "@/lib/commerce/api-guard";
import { initCommerceDb } from "@/lib/commerce/schema";
import { getInvoice, renderInvoiceHtml } from "@/lib/commerce/invoices";
import { renderInvoicePdf } from "@/lib/commerce/invoice-pdf";
import { invoiceQrSvg } from "@/lib/commerce/qr-payment";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ tenantSlug: string; invoiceId: string }> }) {
  const { tenantSlug, invoiceId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  await initCommerceDb();
  const result = await getInvoice(guard.tenant.id, Number(invoiceId));
  if (!result) return jsonError("Doklad nenalezen", 404);

  const isDelivery = result.invoice.invoice_type === "delivery_note";
  const qrSvg = isDelivery ? null : await invoiceQrSvg(result.invoice);
  const html = renderInvoiceHtml(result.invoice, result.items, isDelivery ? "delivery" : undefined, { qrSvg });

  // ?format=html vrátí náhled v prohlížeči, výchozí je PDF ke stažení
  if (req.nextUrl.searchParams.get("format") === "html") {
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const pdf = await renderInvoicePdf(html);
  if (!pdf) return jsonError("PDF renderer není k dispozici", 503);

  const prefix = isDelivery ? "dodaci-list" : "faktura";
  const filename = `${prefix}-${result.invoice.invoice_number.replace(/[^\w-]+/g, "-")}.pdf`;
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
