import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/apiAuth";
import { dbToCardListing, dealTypeLabel } from "@/lib/mappers";

/** Karty inzerátů podle slugů (oblíbené v localStorage), s ?all=1 celá aktivní nabídka pro fulltext. */
export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "1";
  const slugs = (req.nextUrl.searchParams.get("ids") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 60);
  if (!all && slugs.length === 0) return jsonOk([]);

  const rows = await prisma.listing.findMany({
    where: all
      ? { status: { in: ["ACTIVE", "RESERVED"] } }
      : { slug: { in: slugs }, status: { in: ["ACTIVE", "RESERVED", "SOLD", "RENTED"] } },
    ...(all ? { orderBy: { publishedAt: "desc" as const }, take: 200 } : {}),
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      location: true,
      disposition: true,
      area: true,
      landArea: true,
      price: true,
      priceNote: true,
      deal: true,
      kind: true,
      tags: true,
      featured: true,
      description: true,
      publishedAt: true,
      lat: true,
      lng: true,
      images: { select: { url: true }, orderBy: { order: "asc" as const }, take: 1 },
    },
  });

  const cards = rows.map((row) => ({
    listing: dbToCardListing({
      ...row,
      image: row.images?.[0]?.url || null,
      images: row.images?.map((i) => i.url) ?? [],
    } as any),
    deal: dealTypeLabel(row.deal),
  }));

  return jsonOk(cards);
}
