import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://fakturina.cz";
const UPDATED = new Date("2026-07-13");

const PAGES: { path: string; priority: number; freq: "weekly" | "monthly" | "yearly" }[] = [
  { path: "", priority: 1.0, freq: "weekly" },
  { path: "/kontakt", priority: 0.5, freq: "monthly" },
  { path: "/ochrana-soukromi", priority: 0.3, freq: "yearly" },
  { path: "/podminky", priority: 0.3, freq: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((p) => ({
    url: `${BASE}${p.path || "/"}`,
    lastModified: UPDATED,
    changeFrequency: p.freq,
    priority: p.priority,
  }));
}
