import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://fakturina.cz";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard/", "/api/", "/onboarding/", "/invoice/", "/quote/", "/login", "/register"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
