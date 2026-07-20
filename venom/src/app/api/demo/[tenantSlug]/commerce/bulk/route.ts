import { NextRequest, NextResponse } from "next/server";
import { requireCommerceAdmin } from "@/lib/commerce/api-guard";
import { initCommerceDb } from "@/lib/commerce/schema";
import {
  bulkUpdatePrices, bulkAssignCategory, bulkSetFlag,
  bulkSetTaxRate, bulkExportProducts,
} from "@/lib/commerce/bulk-operations";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  await initCommerceDb();

  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "update_prices": {
        const result = await bulkUpdatePrices(guard.tenant.id, {
          productIds: body.productIds,
          categoryId: body.categoryId,
          mode: body.mode,
          value: body.value,
          field: body.field ?? "price_cents",
        });
        return NextResponse.json(result);
      }
      case "assign_category": {
        const result = await bulkAssignCategory(
          guard.tenant.id, body.productIds ?? [], body.categoryId, body.mode ?? "add"
        );
        return NextResponse.json(result);
      }
      case "set_flag": {
        const result = await bulkSetFlag(
          guard.tenant.id, body.productIds ?? [], body.flag, body.value
        );
        return NextResponse.json(result);
      }
      case "set_tax_rate": {
        const result = await bulkSetTaxRate(
          guard.tenant.id, body.productIds ?? [], body.taxRate
        );
        return NextResponse.json(result);
      }
      case "export": {
        const csv = await bulkExportProducts(guard.tenant.id, {
          categoryId: body.categoryId,
          status: body.status,
        });
        return new NextResponse(csv, {
          headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=products.csv" },
        });
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
