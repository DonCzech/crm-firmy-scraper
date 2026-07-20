import { existsSync, readdirSync } from "fs";
import path from "path";

export const TEMPLATE_PREVIEW_FALLBACK = "/templates/arch-01/hero-1.webp";

const TEMPLATE_PREVIEW_OVERRIDES: Record<string, string> = {
  "harmonie-01": "/templates/harmonie-01/about.webp",
  "arch-01": "/templates/arch-01/hero-1.webp",
  "autoservis-01": "/templates/autoservis-01/hero-servis.webp",
  "autoservis-03": "/templates/autoservis-03/hero-bg.webp",
  "barber-01": "/templates/barber-01/preview.webp",
  "barber-02": "/templates/barber-02/preview.webp",
  "barber-03": "/templates/barber-03/showcase/desktop-full.png",
  "barber-04": "/templates/barber-04/showcase/desktop-full.png",
  "beauty-01": "/templates/beauty-01/showcase/desktop-full.png",
  "clinic-02": "/templates/clinic-02/hero-bg.webp",
  "ddd-01": "/templates/ddd-01/hero-bg.webp",
  "dental-01": "/templates/dental-01/hero-bg.webp",
  "dj-01": "/templates/dj-01/hero-nocturne.webp",
  "edu-01": "/templates/edu-01/hero-1.webp",
  "elektro-01": "/templates/elektro-01/gallery-1.webp",
  "hair-01": "/templates/hair-01/images/hero.jpg",
  "legal-02": "/templates/legal-02/about-bg.jpg",
  "malir-01": "/templates/malir-01/faq11.jpg",
  "malir-02": "/templates/malir-02/hero-1.webp",
  "massage-01": "/templates/massage-01/gallery-1.webp",
  "nails-02": "/templates/nails-02/hero/hero-bg.webp",
  "nails-03": "/templates/nails-03/hero-bg.webp",
  "ortho-02": "/templates/ortho-02/hero-bg.webp",
  "peak-cut": "/templates/peak-cut/showcase/desktop-full.png",
  "reality-01": "/templates/reality-01/hero-bg.webp",
  "reality-02": "/templates/reality-02/hero.webp",
  "rekonstrukce-01": "/templates/rekonstrukce-01/hero.webp",
  "solar-03": "/templates/solar-03/hero.webp",
  "stavba-02": "/templates/stavba-02/hero-1.webp",
  "stavba-03": "/templates/stavba-03/hero-1.webp",
  "tattoo-01": "/templates/tattoo-01/hero-art.webp",
  "tattoo-02": "/templates/tattoo-02/hero-bg.webp",
  "tattoo-03": "/templates/tattoo-03/about-team.jpg",
  "ucetni-01": "/templates/ucetni-01/about-vector.png",
  "ucetni-02": "/templates/ucetni-02/hero.webp",
  "ucetni-04": "/templates/ucetni-04/hero/h1.webp",
};

export function findTemplatePreview(key: string): string {
  if (TEMPLATE_PREVIEW_OVERRIDES[key]) return TEMPLATE_PREVIEW_OVERRIDES[key];

  const dir = path.join(process.cwd(), "public", "templates", key);
  const candidates = [
    "showcase/desktop-full.png",
    "showcase/desktop-hero.png",
    "preview.webp",
    "preview.png",
    "hero-bg.webp",
    "hero.webp",
    "hero-1.webp",
    "hero-art.webp",
    "hero-2.webp",
    "hero-bg.jpg",
    "hero.jpg",
  ];

  for (const candidate of candidates) {
    if (existsSync(path.join(dir, candidate))) return `/templates/${key}/${candidate}`;
  }

  if (existsSync(dir)) {
    const discovered: string[] = [];
    const visit = (absDir: string, relDir = "", depth = 0) => {
      if (depth > 2) return;
      for (const entry of readdirSync(absDir, { withFileTypes: true })) {
        if (entry.name.startsWith(".")) continue;
        const rel = relDir ? `${relDir}/${entry.name}` : entry.name;
        const abs = path.join(absDir, entry.name);
        if (entry.isDirectory()) {
          visit(abs, rel, depth + 1);
        } else if (/\.(webp|png|jpe?g|avif)$/i.test(entry.name) && !/original|q55|800/i.test(entry.name)) {
          discovered.push(rel);
        }
      }
    };
    visit(dir);
    discovered.sort((a, b) => previewRank(a) - previewRank(b) || a.localeCompare(b));
    if (discovered[0]) return `/templates/${key}/${discovered[0]}`;
  }

  return TEMPLATE_PREVIEW_FALLBACK;
}

function previewRank(rel: string): number {
  const value = rel.toLowerCase();
  if (value.includes("preview")) return 0;
  if (value.includes("showcase/desktop")) return 1;
  if (value.includes("hero")) return 2;
  if (value.includes("about")) return 3;
  if (value.includes("gallery")) return 4;
  return 5;
}
