import { NextRequest, NextResponse } from "next/server";
import { getListingBySlug } from "@/lib/queries";

/** Rychlý náhled nemovitosti pro mapu — načítá se až po kliknutí na pin. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = await getListingBySlug(slug).catch(() => null);
  if (!l) return NextResponse.json({ error: "Nemovitost nenalezena" }, { status: 404 });

  return NextResponse.json({
    title: l.title,
    slug: l.slug,
    location: l.location,
    price: l.price,
    deal: l.deal,
    disposition: l.disposition,
    area: l.area,
    landArea: l.landArea,
    floor: l.floor,
    floors: l.floors,
    penb: l.penb,
    yearBuilt: l.yearBuilt,
    description: l.description?.slice(0, 420) ?? null,
    images: l.images.slice(0, 10).map((i) => i.url),
  });
}
