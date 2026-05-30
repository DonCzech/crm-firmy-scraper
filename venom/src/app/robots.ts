import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3015";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/demo/barber-01", "/demo/cafe-01"],
        disallow: ["/admin", "/api/admin", "/demo/", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
