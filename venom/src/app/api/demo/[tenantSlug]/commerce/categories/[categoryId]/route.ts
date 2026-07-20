import { NextRequest } from "next/server";
import { requireCommerceAdmin, jsonError, parseJsonBody } from "@/lib/commerce/api-guard";
import { CategoryPatchSchema } from "@/lib/commerce/api-schemas";
import { getCategory, updateCategory, deleteCategory } from "@/lib/commerce/categories";

/** Webero Commerce — single category (GET, PATCH, DELETE). */
interface RouteParams { params: Promise<{ tenantSlug: string; categoryId: string }> }

function parseId(raw: string): number | null {
  const id = parseInt(raw, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug, categoryId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  const id = parseId(categoryId);
  if (!id) return jsonError("Neplatné ID kategorie");

  const category = await getCategory(guard.tenant.id, id);
  if (!category) return jsonError("Kategorie nenalezena", 404);
  return Response.json({ category });
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug, categoryId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  const id = parseId(categoryId);
  if (!id) return jsonError("Neplatné ID kategorie");

  const body = await parseJsonBody(req);
  if (body === null) return jsonError("Neplatný JSON");
  const parsed = CategoryPatchSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Neplatná data");

  try {
    const category = await updateCategory(guard.tenant.id, id, parsed.data);
    if (!category) return jsonError("Kategorie nenalezena", 404);
    return Response.json({ category });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Uložení kategorie selhalo";
    if (message.includes("duplicate key")) {
      return jsonError("Kategorie s tímto slugem už existuje", 409);
    }
    return jsonError(message, 400);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug, categoryId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  const id = parseId(categoryId);
  if (!id) return jsonError("Neplatné ID kategorie");

  const deleted = await deleteCategory(guard.tenant.id, id);
  if (!deleted) return jsonError("Kategorie nenalezena", 404);
  return Response.json({ ok: true });
}
