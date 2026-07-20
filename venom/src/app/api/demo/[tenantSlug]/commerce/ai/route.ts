import { NextRequest, NextResponse } from "next/server";
import { requireCommerceAdmin } from "@/lib/commerce/api-guard";
import { isAddonActive } from "@/lib/commerce/addons";
import { initCommerceDb } from "@/lib/commerce/schema";
import { generateProductDescription, generateBulkDescriptions, saveGeneratedDescription } from "@/lib/commerce/ai-descriptions";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  if (!(await isAddonActive(guard.tenant.id, "ai-copywriter"))) {
    return NextResponse.json({ error: "Modul AI copywriter popisků není aktivní" }, { status: 403 });
  }
  await initCommerceDb();

  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "generate": {
        const result = await generateProductDescription(guard.tenant.id, body.productId, body.type ?? "description");
        return NextResponse.json({ text: result });
      }
      case "generate_bulk": {
        const results = await generateBulkDescriptions(guard.tenant.id, body.productIds, body.type ?? "description");
        return NextResponse.json({ results });
      }
      case "save": {
        await saveGeneratedDescription(guard.tenant.id, body.productId, body.field, body.text);
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
