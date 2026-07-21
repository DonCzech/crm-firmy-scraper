import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

const LISTING_IMAGES: Record<string, string[]> = {
  "vila-sarka": [
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80&auto=format&fit=crop",
  ],
  "penthouse-vinohrady": [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80&auto=format&fit=crop",
  ],
  "mezonet-mala-strana": [
    "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200&q=80&auto=format&fit=crop",
  ],
  "loft-karlin": [
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=80&auto=format&fit=crop",
  ],
  "rodinny-dum-pruhonice": [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80&auto=format&fit=crop",
  ],
  "pozemek-ricany": [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1200&q=80&auto=format&fit=crop",
  ],
};

async function main() {
  const listings = await p.listing.findMany({ select: { id: true, slug: true } });

  for (const listing of listings) {
    const urls = LISTING_IMAGES[listing.slug];
    if (!urls) {
      console.log(`No images for slug: ${listing.slug}`);
      continue;
    }

    // Delete existing images for this listing
    await p.media.deleteMany({ where: { listingId: listing.id } });

    for (let i = 0; i < urls.length; i++) {
      await p.media.create({
        data: {
          url: urls[i],
          key: `seed/${listing.slug}-${i}.jpg`,
          filename: `${listing.slug}-${i}.jpg`,
          mimeType: "image/jpeg",
          size: 0,
          width: 1200,
          height: 800,
          order: i,
          listingId: listing.id,
        },
      });
    }
    console.log(`Seeded ${urls.length} images for: ${listing.slug}`);
  }

  // Also seed some portal exports
  const activeListings = await p.listing.findMany({ where: { status: "ACTIVE" }, select: { id: true, title: true } });

  // Clear existing exports
  await p.portalExport.deleteMany({});

  for (const listing of activeListings) {
    // Sreality - all active
    await p.portalExport.create({
      data: {
        portal: "SREALITY",
        listingId: listing.id,
        status: "SYNCED",
        externalId: `SR-${Math.floor(Math.random() * 900000 + 100000)}`,
        lastSyncAt: new Date(),
      },
    });
    // Bezrealitky - some synced, some pending
    await p.portalExport.create({
      data: {
        portal: "BEZREALITKY",
        listingId: listing.id,
        status: Math.random() > 0.3 ? "SYNCED" : "PENDING",
        externalId: Math.random() > 0.3 ? `BZ-${Math.floor(Math.random() * 90000 + 10000)}` : null,
        lastSyncAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 86400000) : null,
      },
    });
  }

  // One error export for testing
  if (activeListings.length > 0) {
    await p.portalExport.create({
      data: {
        portal: "REALITY_CZ",
        listingId: activeListings[0].id,
        status: "ERROR",
        errorLog: "Chybi povinne pole: popis nemovitosti",
      },
    });
  }

  console.log(`Seeded portal exports for ${activeListings.length} listings`);
  await p.$disconnect();
}

main().catch((e) => { console.error(e); p.$disconnect(); process.exit(1); });
