import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk } from "@/lib/apiAuth";

// Uzávěrky: souhrn provizí makléřů z uzavřených případů za daný měsíc.
export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const monthParam = searchParams.get("month"); // "YYYY-MM"

  const now = new Date();
  const [year, month] = monthParam
    ? monthParam.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];

  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 1);

  const deals = await prisma.deal.findMany({
    where: { stage: "CLOSED", closedAt: { gte: from, lt: to } },
    include: {
      agent: { select: { id: true, name: true, avatar: true } },
      listing: { select: { id: true, title: true } },
      client: { select: { id: true, name: true } },
    },
    orderBy: { closedAt: "desc" },
  });

  const byAgent = new Map<string, { agent: { id: string; name: string; avatar: string | null } | null; deals: number; volume: number; commission: number }>();
  for (const d of deals) {
    const key = d.agent?.id || "none";
    if (!byAgent.has(key)) {
      byAgent.set(key, { agent: d.agent, deals: 0, volume: 0, commission: 0 });
    }
    const row = byAgent.get(key)!;
    row.deals++;
    row.volume += d.price || 0;
    row.commission += d.commission || 0;
  }

  return jsonOk({
    month: `${year}-${String(month).padStart(2, "0")}`,
    deals,
    agents: Array.from(byAgent.values()).sort((a, b) => b.commission - a.commission),
    totals: {
      deals: deals.length,
      volume: deals.reduce((s, d) => s + (d.price || 0), 0),
      commission: deals.reduce((s, d) => s + (d.commission || 0), 0),
    },
  });
}
