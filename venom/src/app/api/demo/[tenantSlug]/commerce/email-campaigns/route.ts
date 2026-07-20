import { NextRequest } from "next/server";
import { z } from "zod";
import { requireCommerceAdmin } from "@/lib/commerce/api-guard";
import { initCommerceDb } from "@/lib/commerce/schema";
import { isAddonActive } from "@/lib/commerce/addons";
import { getShopByTenantId } from "@/lib/commerce/shop";
import {
  CAMPAIGN_SEGMENTS, listCampaigns, createCampaign, deleteCampaign,
  sendCampaign, getCampaignOutbox, getSegmentCounts,
} from "@/lib/commerce/email-campaigns";

export const dynamic = "force-dynamic";

/** Modul „Hromadné e-maily“ — kampaně, segmenty, outbox, statistiky. */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

async function gate(req: NextRequest, tenantSlug: string) {
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return { response: guard.response };
  if (!(await isAddonActive(guard.tenant.id, "hromadne-emaily"))) {
    return { response: Response.json({ error: "Modul Hromadné e-maily není aktivní" }, { status: 403 }) };
  }
  await initCommerceDb();
  return { tenant: guard.tenant };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const g = await gate(req, tenantSlug);
  if ("response" in g) return g.response;

  const outboxFor = req.nextUrl.searchParams.get("outbox");
  if (outboxFor) {
    const outbox = await getCampaignOutbox(g.tenant.id, Number(outboxFor));
    return Response.json({ outbox });
  }

  const [campaigns, segmentCounts] = await Promise.all([
    listCampaigns(g.tenant.id),
    getSegmentCounts(g.tenant.id),
  ]);
  return Response.json({ campaigns, segments: CAMPAIGN_SEGMENTS, segmentCounts });
}

const PostSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    name: z.string().min(2).max(120),
    subject: z.string().min(2).max(200),
    html_body: z.string().min(2).max(50_000),
    segment: z.string().refine((s) => CAMPAIGN_SEGMENTS.some((x) => x.key === s), "Neznámý segment"),
  }),
  z.object({ action: z.literal("send"), id: z.number().int().positive() }),
  z.object({ action: z.literal("delete"), id: z.number().int().positive() }),
]);

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const g = await gate(req, tenantSlug);
  if ("response" in g) return g.response;

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Neplatný požadavek" }, { status: 400 }); }
  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Neplatný požadavek" }, { status: 400 });
  }

  if (parsed.data.action === "create") {
    const campaign = await createCampaign(g.tenant.id, parsed.data);
    return Response.json({ campaign });
  }

  if (parsed.data.action === "delete") {
    await deleteCampaign(g.tenant.id, parsed.data.id);
    return Response.json({ ok: true });
  }

  const shop = await getShopByTenantId(g.tenant.id);
  const result = await sendCampaign(g.tenant.id, parsed.data.id, shop?.name || "Obchod");
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 });
  return Response.json(result);
}
