import { NextRequest } from "next/server";
import { requireCommerceAdmin, jsonError, parseJsonBody } from "@/lib/commerce/api-guard";
import { ProductBodySchema } from "@/lib/commerce/api-schemas";
import { listProducts, createProduct } from "@/lib/commerce/products";

/**
 * Webero Commerce — products collection.
 * GET  list (pagination, search, status/category filter) — admin grid
 * POST create product incl. variants/images/categories
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  const sp = req.nextUrl.searchParams;
  const status = sp.get("status");
  const result = await listProducts(guard.tenant.id, {
    page: parseInt(sp.get("page") ?? "1", 10) || 1,
    perPage: parseInt(sp.get("perPage") ?? "50", 10) || 50,
    search: sp.get("search") ?? undefined,
    status: status === "draft" || status === "active" || status === "archived" || status === "all" ? status : "all",
    categoryId: sp.get("categoryId") ? parseInt(sp.get("categoryId")!, 10) : undefined,
    sort: (["updated", "title", "price"] as const).find((s) => s === sp.get("sort")),
  });

  return Response.json(result);
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  const body = await parseJsonBody(req);
  if (body === null) return jsonError("Neplatný JSON");
  const parsed = ProductBodySchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Neplatná data");

  try {
    const product = await createProduct(guard.tenant.id, parsed.data, guard.tenant.email);
    return Response.json({ product }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Vytvoření produktu selhalo";
    if (message.includes("duplicate key")) {
      return jsonError("Produkt s tímto slugem nebo SKU už existuje", 409);
    }
    return jsonError(message, 400);
  }
}
