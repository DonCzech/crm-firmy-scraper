import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildListingWhere } from "@/lib/queries";
import { parseSearchFilters } from "@/lib/searchFilters";

export async function GET(req: NextRequest) {
  const filters = parseSearchFilters(req.nextUrl.searchParams);

  // Počty u krajů respektují všechny filtry kromě výběru lokality samotné
  // (kraje i okresy) — jinak výběr okresu vynuluje počty všech ostatních
  // krajů a celý výběr lokality se zablokuje
  const { regions: _regions, districts: _districts, ...regionAgnostic } = filters;

  const [count, regionCounts] = await Promise.all([
    prisma.listing.count({ where: buildListingWhere(filters) }),
    prisma.listing.groupBy({
      by: ["region"],
      where: buildListingWhere(regionAgnostic),
      _count: true,
    }),
  ]);

  const activeRegions: Record<string, number> = {};
  for (const r of regionCounts) {
    if (r.region) activeRegions[r.region] = r._count;
  }

  return NextResponse.json({ count, activeRegions });
}
