import { NextRequest, NextResponse } from "next/server";
import { requireCommerceAdmin } from "@/lib/commerce/api-guard";
import { initCommerceDb } from "@/lib/commerce/schema";
import { getTranslations, setTranslationsBulk, getTranslationCoverage } from "@/lib/commerce/translations";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  await initCommerceDb();

  try {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get("entity_type");
    const entityId = searchParams.get("entity_id");
    const locale = searchParams.get("locale") || undefined;

    if (entityType && entityId) {
      const translations = await getTranslations(guard.tenant.id, entityType, Number(entityId), locale);
      return NextResponse.json({ translations });
    }

    if (entityType) {
      const coverage = await getTranslationCoverage(guard.tenant.id, entityType);
      return NextResponse.json({ coverage });
    }

    return NextResponse.json({ error: "entity_type required" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

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
    const { entity_type, entity_id, locale, fields } = body;
    await setTranslationsBulk(guard.tenant.id, entity_type, entity_id, locale, fields);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
