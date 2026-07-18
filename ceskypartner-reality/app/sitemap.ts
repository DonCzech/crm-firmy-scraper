import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";
import { allLocalPages } from "@/lib/localSeo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/nabidka/prodej`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/nabidka/pronajem`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/nabidka/investicni`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/prodano`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/makleri`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/odhad-nemovitosti`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/sluzby`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/o-nas`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/kontakt`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/en`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/ochrana-osobnich-udaju`, changeFrequency: "yearly", priority: 0.1 },
  ];

  // Inzeráty — vč. prodaných/pronajatých (detaily žijí dál jako SEO stránky)
  const listings = await prisma.listing
    .findMany({
      where: { status: { in: ["ACTIVE", "RESERVED", "SOLD", "RENTED"] } },
      select: { slug: true, updatedAt: true, status: true },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    })
    .catch(() => []);

  const posts = await prisma.blogPost
    .findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      take: 1000,
    })
    .catch(() => []);

  // Profily makléřů — stejný zdroj jako /makleri (getPublicAgents = všichni uživatelé)
  const agents = await prisma.user
    .findMany({ select: { id: true }, orderBy: { createdAt: "asc" } })
    .catch(() => []);

  return [
    ...staticPages,
    // Lokalitní landing pages (deal × typ × kraj)
    ...allLocalPages().map((p) => ({
      url: `${SITE_URL}/nemovitosti/${p.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...listings.map((l) => ({
      url: `${SITE_URL}/nemovitost/${l.slug}`,
      lastModified: l.updatedAt,
      changeFrequency: "weekly" as const,
      priority: l.status === "ACTIVE" ? 0.8 : 0.4,
    })),
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...agents.map((a) => ({
      url: `${SITE_URL}/makleri/${a.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
