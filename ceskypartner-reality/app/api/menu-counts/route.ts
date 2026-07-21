import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Reálné počty aktivních inzerátů pro mega menu (deal × kind + novinky) + vybraná nemovitost. */
export async function GET() {
  const [grouped, newCount, featuredRow] = await Promise.all([
    prisma.listing.groupBy({
      by: ["deal", "kind"],
      where: { status: "ACTIVE" },
      _count: true,
    }),
    prisma.listing.count({
      where: { status: "ACTIVE", tags: { has: "novinka" } },
    }),
    prisma.listing.findFirst({
      where: { status: "ACTIVE", featured: true },
      orderBy: { publishedAt: "desc" },
      select: {
        title: true,
        slug: true,
        location: true,
        price: true,
        deal: true,
        tags: true,
        images: { select: { url: true }, orderBy: { order: "asc" }, take: 1 },
      },
    }),
  ]);

  const deals: Record<string, number> = { SALE: 0, RENT: 0, INVESTMENT: 0 };
  const kinds: Record<string, number> = {};
  for (const g of grouped) {
    deals[g.deal] = (deals[g.deal] ?? 0) + g._count;
    kinds[`${g.deal}:${g.kind}`] = g._count;
  }

  const featured = featuredRow
    ? {
        title: featuredRow.title,
        slug: featuredRow.slug,
        location: featuredRow.location,
        price: featuredRow.price,
        isRent: featuredRow.deal === "RENT",
        tag: featuredRow.tags?.includes("novinka")
          ? "Novinka"
          : featuredRow.tags?.includes("exkluzivně")
            ? "Exkluzivně"
            : null,
        image: featuredRow.images[0]?.url ?? null,
      }
    : null;

  return NextResponse.json({ deals, kinds, newCount, featured });
}
