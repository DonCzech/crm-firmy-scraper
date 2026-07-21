import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk } from "@/lib/apiAuth";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    listingsByStatus,
    listingsByKind,
    listingsByDeal,
    dealsByStage,
    exportsByStatus,
    contactsRecent,
    dealsRecent,
    demandsActive,
    tasksOpen,
  ] = await Promise.all([
    prisma.listing.groupBy({ by: ["status"], _count: true }),
    prisma.listing.groupBy({ by: ["kind"], _count: true }),
    prisma.listing.groupBy({ by: ["deal"], _count: true }),
    prisma.deal.groupBy({ by: ["stage"], _count: true, _sum: { price: true, commission: true } }),
    prisma.portalExport.groupBy({ by: ["status"], _count: true }),
    prisma.contact.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.deal.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, stage: true, commission: true },
    }),
    prisma.demand.count({ where: { status: "ACTIVE" } }),
    prisma.task.count({ where: { status: { not: "DONE" } } }),
  ]);

  // Kontakty a případy po měsících (posledních 6 měsíců)
  const months: { key: string; label: string; contacts: number; deals: number; commission: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      key,
      label: d.toLocaleDateString("cs-CZ", { month: "short", year: "2-digit" }),
      contacts: 0,
      deals: 0,
      commission: 0,
    });
  }
  const monthOf = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  for (const c of contactsRecent) {
    const m = months.find((x) => x.key === monthOf(new Date(c.createdAt)));
    if (m) m.contacts++;
  }
  for (const dl of dealsRecent) {
    const m = months.find((x) => x.key === monthOf(new Date(dl.createdAt)));
    if (m) {
      m.deals++;
      if (dl.stage === "CLOSED") m.commission += dl.commission || 0;
    }
  }

  return jsonOk({
    listingsByStatus,
    listingsByKind,
    listingsByDeal,
    dealsByStage,
    exportsByStatus,
    months,
    demandsActive,
    tasksOpen,
  });
}
