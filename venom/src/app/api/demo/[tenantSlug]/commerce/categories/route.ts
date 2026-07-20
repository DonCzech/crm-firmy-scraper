import { NextRequest } from "next/server";
import { requireCommerceAdmin, jsonError, parseJsonBody } from "@/lib/commerce/api-guard";
import { CategoryBodySchema } from "@/lib/commerce/api-schemas";
import { listCategories, createCategory } from "@/lib/commerce/categories";

/** Webero Commerce — categories collection (GET list, POST create). */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  const categories = await listCategories(guard.tenant.id);
  return Response.json({ categories });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  const body = await parseJsonBody(req);
  if (body === null) return jsonError("Neplatný JSON");
  const parsed = CategoryBodySchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Neplatná data");

  try {
    const category = await createCategory(guard.tenant.id, parsed.data);
    return Response.json({ category }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Vytvoření kategorie selhalo";
    if (message.includes("duplicate key")) {
      return jsonError("Kategorie s tímto slugem už existuje", 409);
    }
    return jsonError(message, 400);
  }
}
