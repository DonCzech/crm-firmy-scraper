import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk } from "@/lib/apiAuth";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const now = new Date();
  const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

  const [
    activeListings,
    totalContacts,
    newContacts,
    recentListings,
    portalExports,
    recentActivity,
  ] = await Promise.all([
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.contact.count(),
    prisma.contact.count({ where: { status: "NEW" } }),
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.portalExport.groupBy({
      by: ["portal", "status"],
      _count: true,
    }),
    prisma.listing.findMany({
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: { id: true, title: true, status: true, updatedAt: true },
    }),
  ]);

  // Rozpad leadů za 30 dní podle typu — poptávky se rozlišují podle původu zprávy
  const [recentContacts, recentDemands] = await Promise.all([
    prisma.contact.findMany({
      where: { createdAt: { gte: monthAgo } },
      select: { message: true, source: true, listingId: true },
    }),
    prisma.demand.count({ where: { createdAt: { gte: monthAgo } } }),
  ]);
  const leads = { nemovitost: 0, hypoteka: 0, odhad: 0, hlidaciPes: recentDemands, newsletter: 0, ostatni: 0 };
  for (const c of recentContacts) {
    if (c.source === "NEWSLETTER") leads.newsletter++;
    else if (c.message.startsWith("Žádost o financování")) leads.hypoteka++;
    else if (c.message.startsWith("Žádost o odhad")) leads.odhad++;
    else if (c.listingId) leads.nemovitost++;
    else leads.ostatni++;
  }

  const portalStats = ["SREALITY", "BEZREALITKY", "REALITY_CZ", "REALITY_IDNES"].map((portal) => {
    const synced = portalExports.find((e) => e.portal === portal && e.status === "SYNCED")?._count || 0;
    const errors = portalExports.find((e) => e.portal === portal && e.status === "ERROR")?._count || 0;
    const pending = portalExports.find((e) => e.portal === portal && e.status === "PENDING")?._count || 0;
    return { portal, synced, errors, pending };
  });

  return jsonOk({
    kpi: {
      activeListings,
      totalContacts,
      newContacts,
    },
    recentListings,
    portalStats,
    recentActivity,
    leads,
  });
}
