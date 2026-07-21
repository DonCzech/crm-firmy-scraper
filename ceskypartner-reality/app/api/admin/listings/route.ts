import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { notifyMatchingDemands } from "@/lib/watchdog";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const deal = searchParams.get("deal");
  const kind = searchParams.get("kind");
  const search = searchParams.get("q");
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 20)));

  const where: any = {};
  if (status) where.status = status;
  if (deal) where.deal = deal;
  if (kind) where.kind = kind;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
    ];
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        agent: { select: { id: true, name: true, avatar: true } },
        images: { orderBy: { order: "asc" }, take: 1 },
        portalExports: { select: { portal: true, status: true } },
        _count: { select: { contacts: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ]);

  return jsonOk({ listings, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { title, deal, kind, disposition, price, priceNote, location, region, district, address, ruianAddressCode, ruianParcelCode, lat, lng, area, landArea, floor, floors, penb, yearBuilt, description, tourUrl, videoUrl, zip, ownership, condition, construction, furnishing, monthlyFees, deposit, exclusive, priceHidden, amenities, tags, status: listingStatus } = body;

  if (!title || !deal || !kind || !price || !location || !region) {
    return jsonError("Chybi povinne pole: title, deal, kind, price, location, region");
  }

  const slug = title
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const existingSlug = await prisma.listing.findUnique({ where: { slug } });
  const finalSlug = existingSlug ? `${slug}-${Date.now().toString(36)}` : slug;

  const listing = await prisma.listing.create({
    data: {
      title,
      slug: finalSlug,
      deal,
      kind,
      disposition: disposition || null,
      price,
      priceNote: priceNote || null,
      location,
      region,
      district: district || null,
      address: address || null,
      ruianAddressCode: ruianAddressCode || null,
      ruianParcelCode: ruianParcelCode || null,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      area: area ? parseInt(area) : null,
      landArea: landArea ? parseInt(landArea) : null,
      floor: floor ? parseInt(floor) : null,
      floors: floors ? parseInt(floors) : null,
      penb: penb || null,
      yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
      description: description || null,
      tourUrl: tourUrl || null,
      videoUrl: videoUrl || null,
      zip: zip || null,
      ownership: ownership || null,
      condition: condition || null,
      construction: construction || null,
      furnishing: furnishing || null,
      monthlyFees: monthlyFees ? parseInt(monthlyFees) : null,
      deposit: deposit ? parseInt(deposit) : null,
      exclusive: !!exclusive,
      priceHidden: !!priceHidden,
      amenities: amenities || [],
      tags: tags || [],
      status: listingStatus || "DRAFT",
      agentId: (session!.user as any).id,
      publishedAt: listingStatus === "ACTIVE" ? new Date() : null,
    },
    include: { agent: { select: { id: true, name: true } } },
  });

  const { portals } = body;
  if (Array.isArray(portals) && portals.length > 0) {
    await prisma.portalExport.createMany({
      data: portals.map((p: string) => ({ portal: p as any, listingId: listing.id })),
      skipDuplicates: true,
    });
  }

  const { imageUrls } = body;
  if (Array.isArray(imageUrls) && imageUrls.length > 0) {
    await prisma.media.updateMany({
      where: { url: { in: imageUrls }, listingId: null },
      data: { listingId: listing.id },
    });
    let order = 0;
    for (const url of imageUrls) {
      await prisma.media.updateMany({
        where: { url, listingId: listing.id },
        data: { order: order++ },
      });
    }
  }

  revalidatePath(`/nemovitost/${listing.slug}`);
  revalidatePath("/");
  if (listing.status === "ACTIVE") notifyMatchingDemands(listing.id);
  return jsonOk(listing, 201);
}
