import { NextRequest } from "next/server";
import { requireCommerceAdmin, jsonError, parseJsonBody } from "@/lib/commerce/api-guard";
import { getProductParams, setProductParams } from "@/lib/commerce/params";

/**
 * Webero Commerce — hodnoty parametrů produktu.
 * GET  seznam hodnot (join na definice)
 * PUT  nahradí kompletní sadu hodnot: { params: [{ param_id, value }] }
 */
interface RouteParams { params: Promise<{ tenantSlug: string; productId: string }> }

export const dynamic = "force-dynamic";

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

  const values = await getProductParams(guard.tenant.id, id);
  return Response.json({ params: values });
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug, productId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  const id = parseId(productId);
  if (!id) return jsonError("Neplatné ID produktu");

  const body = await parseJsonBody(req);
  if (body === null || typeof body !== "object") return jsonError("Neplatný JSON");
  const raw = (body as { params?: unknown }).params;
  if (!Array.isArray(raw)) return jsonError("Chybí pole params");

  const items: Array<{ param_id: number; value: string }> = [];
  for (const it of raw) {
    const paramId = Number((it as { param_id?: unknown })?.param_id);
    const value = String((it as { value?: unknown })?.value ?? "").trim();
    if (!Number.isInteger(paramId) || paramId <= 0) return jsonError("Neplatné param_id");
    if (value.length > 500) return jsonError("Hodnota parametru je příliš dlouhá");
    if (value) items.push({ param_id: paramId, value });
  }

  await setProductParams(guard.tenant.id, id, items);
  return Response.json({ ok: true });
}
