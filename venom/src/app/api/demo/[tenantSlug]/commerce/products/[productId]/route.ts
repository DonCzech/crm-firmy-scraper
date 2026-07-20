import { NextRequest } from "next/server";
import { requireCommerceAdmin, jsonError, parseJsonBody } from "@/lib/commerce/api-guard";
import { ProductPatchSchema } from "@/lib/commerce/api-schemas";
import { getProduct, updateProduct, archiveProduct } from "@/lib/commerce/products";

/**
 * Webero Commerce — single product.
 * GET    full detail (variants, images, categories)
 * PATCH  partial update (slug change → SEO redirect; stock change → movement)
 * DELETE archive (soft delete — orders keep their snapshots)
 */
interface RouteParams { params: Promise<{ tenantSlug: string; productId: string }> }

function parseId(raw: string): number | null {
  const id = parseInt(raw, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug, productId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  const id = parseId(productId);
  if (!id) return jsonError("Neplatné ID produktu");

  const product = await getProduct(guard.tenant.id, id);
  if (!product) return jsonError("Produkt nenalezen", 404);
  return Response.json({ product });
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug, productId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  const id = parseId(productId);
  if (!id) return jsonError("Neplatné ID produktu");

  const body = await parseJsonBody(req);
  if (body === null) return jsonError("Neplatný JSON");
  const parsed = ProductPatchSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Neplatná data");

  try {
    const product = await updateProduct(guard.tenant.id, id, parsed.data, guard.tenant.email);
    if (!product) return jsonError("Produkt nenalezen", 404);
    return Response.json({ product });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Uložení produktu selhalo";
    if (message.includes("duplicate key")) {
      return jsonError("Produkt s tímto slugem nebo SKU už existuje", 409);
    }
    return jsonError(message, 400);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug, productId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  const id = parseId(productId);
  if (!id) return jsonError("Neplatné ID produktu");

  const archived = await archiveProduct(guard.tenant.id, id, guard.tenant.email);
  if (!archived) return jsonError("Produkt nenalezen", 404);
  return Response.json({ ok: true, archived: true });
}
