import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";
import { allLocalPages } from "@/lib/localSeo";
import { allEnglishLocalPages } from "@/lib/localSeoEn";
import { ARTICLES_EN } from "@/data/articles-en";
import { INVESTMENT_EN, RENT_EN, SALE_EN } from "@/data/listings-en";

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
    { url: `${SITE_URL}/en/properties/all`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/en/properties/for-sale`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/en/properties/to-let`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/en/properties/investment`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/en/sold`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/en/agents`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/en/valuation`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/en/services`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/en/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/en/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/en/journal`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/en/privacy`, changeFrequency: "yearly", priority: 0.1 },
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
    ...allEnglishLocalPages().map((p) => ({
      url: `${SITE_URL}/en/real-estate/${p.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...listings.map((l) => ({
      url: `${SITE_URL}/nemovitost/${l.slug}`,
      lastModified: l.updatedAt,
      changeFrequency: "weekly" as const,
      priority: l.status === "ACTIVE" ? 0.8 : 0.4,
    })),
    ...listings.map((l) => ({
      url: `${SITE_URL}/en/property/${l.slug}`,
      lastModified: l.updatedAt,
      changeFrequency: "weekly" as const,
      priority: l.status === "ACTIVE" ? 0.75 : 0.35,
    })),
    ...[...SALE_EN, ...RENT_EN, ...INVESTMENT_EN].map((listing) => ({
      url: `${SITE_URL}/en/property/${listing.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...ARTICLES_EN.map((article) => ({
      url: `${SITE_URL}/en/journal/${article.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...agents.map((a) => ({
      url: `${SITE_URL}/makleri/${a.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
    ...agents.map((a) => ({
      url: `${SITE_URL}/en/agents/${a.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
