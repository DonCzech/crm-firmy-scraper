import { NextRequest } from "next/server";
import { z } from "zod";
import { requireCommerceAdmin, jsonError, parseJsonBody } from "@/lib/commerce/api-guard";
import { isAddonActive } from "@/lib/commerce/addons";
import { getStockSyncConfig, saveStockSyncConfig, listStockSyncRuns, runStockSync } from "@/lib/commerce/stock-sync";

export const dynamic = "force-dynamic";

/** Modul „Synchronizace skladu" — konfigurace feedu + spuštění sync + historie běhů. */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

async function gate(req: NextRequest, tenantSlug: string) {
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return { response: guard.response };
  if (!(await isAddonActive(guard.tenant.id, "synchronizace-skladu"))) {
    return { response: Response.json({ error: "Modul Synchronizace skladu není aktivní" }, { status: 403 }) };
  }
  return { guard };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const g = await gate(req, tenantSlug);
  if (!g.guard) return g.response;
  const tenantId = g.guard.tenant.id;
  const [config, runs] = await Promise.all([getStockSyncConfig(tenantId), listStockSyncRuns(tenantId)]);
  return Response.json({
    config,
    runs,
    demo_feed_url: `/api/demo/${tenantSlug}/shop/stock-feed-demo`,
  });
}

const BodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("save-config"), feed_url: z.string().min(4).max(2000) }),
  z.object({ action: z.literal("run"), feed_url: z.string().min(4).max(2000).optional() }),
]);

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const g = await gate(req, tenantSlug);
  if (!g.guard) return g.response;
  const tenantId = g.guard.tenant.id;

  const body = await parseJsonBody(req);
  if (body === null) return jsonError("Neplatný JSON");
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Neplatná data");

  if (parsed.data.action === "save-config") {
    await saveStockSyncConfig(tenantId, parsed.data.feed_url);
    return Response.json({ ok: true });
  }

  let feedUrl = parsed.data.feed_url ?? (await getStockSyncConfig(tenantId))?.feed_url;
  if (!feedUrl) return jsonError("Nejprve nastavte URL skladového feedu");
  // Relativní demo feed → absolutní URL na stejném serveru
  if (feedUrl.startsWith("/")) feedUrl = `${req.nextUrl.origin}${feedUrl}`;

  const result = await runStockSync(tenantId, feedUrl, g.guard.tenant.email);
  if ("error" in result) return jsonError(result.error);
  return Response.json(result);
}
