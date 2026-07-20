import { NextRequest } from "next/server";
import { requireTenantAdmin, assertSameOrigin } from "@/lib/demo-auth";
import { getConnectionKey, listBookings, updateBookingStatus } from "@/lib/rezora/client";

export const dynamic = "force-dynamic";

/**
 * Rezervace tenanta pro administraci na jeho webu.
 *
 * Prohlížeč se sem hlásí běžnou tenantí session; párovací klíč k Rezoře zná jen
 * server, který jím volání dál autorizuje. Klíč tak nikdy neopustí server.
 */

const STATUSES = ["pending", "confirmed", "cancelled", "completed"] as const;
type Status = (typeof STATUSES)[number];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!ok || !tenant) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const key = await getConnectionKey(tenant.id);
  if (!key) return Response.json({ connected: false, bookings: [] });

  const scopeParam = new URL(req.url).searchParams.get("scope");
  const scope = scopeParam === "past" || scopeParam === "all" ? scopeParam : "upcoming";

  const res = await listBookings(key, scope);
  if (!res.ok) return Response.json({ error: res.error }, { status: res.status });

  return Response.json({
    connected: true,
    bookings: res.data?.bookings ?? [],
    account: res.data?.account ?? null,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Neplatný původ požadavku" }, { status: 403 });

  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!ok || !tenant) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const key = await getConnectionKey(tenant.id);
  if (!key) return Response.json({ error: "Web není propojen s rezervacemi" }, { status: 400 });

  const body = (await req.json().catch(() => ({}))) as { id?: string; status?: string };
  const id = typeof body.id === "string" ? body.id : "";
  const status = String(body.status ?? "") as Status;
  if (!id) return Response.json({ error: "Chybí ID rezervace" }, { status: 400 });
  if (!STATUSES.includes(status)) return Response.json({ error: "Neplatný stav" }, { status: 400 });

  const res = await updateBookingStatus(key, id, status);
  if (!res.ok) return Response.json({ error: res.error }, { status: res.status });

  return Response.json({ ok: true });
}
