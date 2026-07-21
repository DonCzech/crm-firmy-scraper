import { prisma } from "./prisma";
import type { DealType, PropertyKind } from "@prisma/client";

export type PublicListing = {
  id: string;
  title: string;
  slug: string;
  status: string;
  location: string;
  disposition: string | null;
  area: number | null;
  landArea: number | null;
  price: number;
  priceNote: string | null;
  deal: DealType;
  kind: PropertyKind;
  tags: string[];
  featured: boolean;
  image: string | null;
  /** Prvních pár fotografií — pro řádkové zobrazení výpisu */
  images: string[];
  description: string | null;
  publishedAt: Date | null;
  lat: number | null;
  lng: number | null;
};

export type PublicListingDetail = {
  id: string;
  title: string;
  slug: string;
  status: string;
  deal: DealType;
  kind: PropertyKind;
  disposition: string | null;
  price: number;
  priceNote: string | null;
  location: string;
  region: string | null;
  district: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  area: number | null;
  landArea: number | null;
  floor: number | null;
  floors: number | null;
  penb: string | null;
  yearBuilt: number | null;
  description: string | null;
  tourUrl: string | null;
  videoUrl: string | null;
  zip: string | null;
  ownership: string | null;
  condition: string | null;
  construction: string | null;
  furnishing: string | null;
  monthlyFees: number | null;
  deposit: number | null;
  exclusive: boolean;
  priceHidden: boolean;
  amenities: string[];
  tags: string[];
  featured: boolean;
  publishedAt: Date | null;
  images: { id: string; url: string; alt: string | null; order: number }[];
  agent: { name: string; email: string; phone: string | null; avatar: string | null } | null;
};

export type PublicBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  tags: string[];
  publishedAt: Date | null;
  author: { name: string } | null;
};

export type PublicBlogPostDetail = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  metaTitle: string | null;
  metaDesc: string | null;
  tags: string[];
  publishedAt: Date | null;
  author: { name: string; avatar: string | null } | null;
};

const listingSelect = {
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
  images: {
    select: { url: true },
    orderBy: { order: "asc" as const },
    take: 4,
  },
} as const;

function mapListing(row: any): PublicListing {
  const urls: string[] = row.images?.map((i: { url: string }) => i.url) ?? [];
  return {
    ...row,
    image: urls[0] || null,
    images: urls,
  };
}

export async function getActiveListings(deal?: DealType, limit?: number): Promise<PublicListing[]> {
  // Rezervované nemovitosti zůstávají ve výpisu se štítkem — působí důvěryhodně a tvoří FOMO
  const rows = await prisma.listing.findMany({
    where: { status: { in: ["ACTIVE", "RESERVED"] }, ...(deal ? { deal } : {}) },
    select: listingSelect,
    orderBy: { publishedAt: "desc" },
    ...(limit ? { take: limit } : {}),
  });
  return rows.map(mapListing);
}

export type ListingSearchFilters = {
  deal?: DealType;
  kind?: PropertyKind;
  regions?: string[];
  districts?: string[];
  disposition?: string;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
};

export function buildListingWhere(f: ListingSearchFilters) {
  return {
    status: { in: ["ACTIVE", "RESERVED"] as ("ACTIVE" | "RESERVED")[] },
    ...(f.deal ? { deal: f.deal } : {}),
    ...(f.kind ? { kind: f.kind } : {}),
    ...(f.regions?.length ? { region: { in: f.regions } } : {}),
    ...(f.districts?.length ? { district: { in: f.districts } } : {}),
    ...(f.disposition ? { disposition: f.disposition } : {}),
    ...(f.priceMin != null || f.priceMax != null
      ? {
          price: {
            ...(f.priceMin != null ? { gte: f.priceMin } : {}),
            ...(f.priceMax != null ? { lte: f.priceMax } : {}),
          },
        }
      : {}),
    ...(f.areaMin ? { area: { gte: f.areaMin } } : {}),
  };
}

export async function searchListings(f: ListingSearchFilters): Promise<PublicListing[]> {
  const rows = await prisma.listing.findMany({
    where: buildListingWhere(f),
    select: listingSelect,
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(mapListing);
}

export async function getFeaturedListings(limit = 6): Promise<PublicListing[]> {
  const rows = await prisma.listing.findMany({
    where: { status: "ACTIVE", featured: true },
    select: listingSelect,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return rows.map(mapListing);
}

export async function getListingBySlug(slug: string): Promise<PublicListingDetail | null> {
  // Prodané/pronajaté inzeráty se nikdy nemažou — detail zůstává jako SEO stránka
  // a podpora prodeje („tuto nemovitost jsme prodali"); z výpisů kategorií ale mizí
  const row = await prisma.listing.findFirst({
    where: { slug, status: { in: ["ACTIVE", "RESERVED", "SOLD", "RENTED"] } },
    include: {
      images: { select: { id: true, url: true, alt: true, order: true }, orderBy: { order: "asc" } },
      agent: { select: { name: true, email: true, phone: true, avatar: true } },
    },
  });
  if (!row) return null;
  return row as unknown as PublicListingDetail;
}

export async function getSimilarListings(listing: PublicListingDetail, limit = 4): Promise<PublicListing[]> {
  // Nejdřív skutečně podobné (stejný typ, cenové pásmo ±30 %, stejný kraj),
  // zbytek doplníme volnějším dotazem, aby sekce nebyla poloprázdná
  const base = { status: "ACTIVE" as const, deal: listing.deal, id: { not: listing.id } };
  const strict = await prisma.listing.findMany({
    where: {
      ...base,
      kind: listing.kind,
      ...(listing.price > 0
        ? { price: { gte: Math.round(listing.price * 0.7), lte: Math.round(listing.price * 1.3) } }
        : {}),
      ...(listing.region ? { region: listing.region } : {}),
    },
    select: listingSelect,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  if (strict.length >= limit) return strict.map(mapListing);

  const fill = await prisma.listing.findMany({
    where: { ...base, id: { notIn: [listing.id, ...strict.map((r) => r.id)] } },
    select: listingSelect,
    orderBy: { publishedAt: "desc" },
    take: limit - strict.length,
  });
  return [...strict, ...fill].map(mapListing);
}

/** Prodané a pronajaté nemovitosti — stránka referencí /prodano */
export async function getClosedListings(limit = 60): Promise<PublicListing[]> {
  const rows = await prisma.listing.findMany({
    where: { status: { in: ["SOLD", "RENTED"] } },
    select: listingSelect,
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
  return rows.map(mapListing);
}

export type PublicAgent = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  bio: string | null;
  activeCount: number;
  soldCount: number;
};

/** Veřejné profily makléřů — pro /makleri */
export async function getPublicAgents(): Promise<PublicAgent[]> {
  const rows = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      bio: true,
      listings: { select: { status: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    avatar: u.avatar,
    bio: u.bio,
    activeCount: u.listings.filter((l) => l.status === "ACTIVE" || l.status === "RESERVED").length,
    soldCount: u.listings.filter((l) => l.status === "SOLD" || l.status === "RENTED").length,
  }));
}

export async function getAgentWithListings(id: string): Promise<{ agent: PublicAgent; listings: PublicListing[] } | null> {
  const u = await prisma.user.findUnique({
    select: { id: true, name: true, email: true, phone: true, avatar: true, bio: true },
    where: { id },
  });
  if (!u) return null;
  const rows = await prisma.listing.findMany({
    where: { agentId: id, status: { in: ["ACTIVE", "RESERVED"] } },
    select: listingSelect,
    orderBy: { publishedAt: "desc" },
  });
  const soldCount = await prisma.listing.count({ where: { agentId: id, status: { in: ["SOLD", "RENTED"] } } });
  return {
    agent: { ...u, activeCount: rows.length, soldCount },
    listings: rows.map(mapListing),
  };
}

export type PublicTestimonial = { quote: string; name: string; context: string; rating: number };

/** Zveřejněné recenze klientů — sekce Reference a /prodano */
export async function getPublishedTestimonials(limit = 12): Promise<PublicTestimonial[]> {
  const rows = await prisma.testimonial.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map((t) => ({ quote: t.quote, name: t.name, context: t.context || "", rating: t.rating }));
}

export async function getPublishedBlogPosts(limit?: number): Promise<PublicBlogPost[]> {
  return prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      tags: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
    orderBy: { publishedAt: "desc" },
    ...(limit ? { take: limit } : {}),
  });
}

export async function getBlogPostBySlug(slug: string): Promise<PublicBlogPostDetail | null> {
  return prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImage: true,
      metaTitle: true,
      metaDesc: true,
      tags: true,
      publishedAt: true,
      author: { select: { name: true, avatar: true } },
    },
  });
}

export async function getListingCount(): Promise<{ sale: number; rent: number; investment: number }> {
  const [sale, rent, investment] = await Promise.all([
    prisma.listing.count({ where: { status: "ACTIVE", deal: "SALE" } }),
    prisma.listing.count({ where: { status: "ACTIVE", deal: "RENT" } }),
    prisma.listing.count({ where: { status: "ACTIVE", deal: "INVESTMENT" } }),
  ]);
  return { sale, rent, investment };
}
