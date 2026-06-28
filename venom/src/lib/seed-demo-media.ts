import { query, getSetting, setSetting } from "@/lib/db";
import { uploadMedia } from "@/lib/media-storage";

const DEMO_FOLDER = "Demo obrázky";
const SETTINGS_KEY = "demo_media_urls_v1";

interface DemoPhotoMeta {
  filename: string;
  alt: string;
  category: string;
  w: number;
  h: number;
}

interface CachedDemoMedia {
  url: string;
  filename: string;
  alt: string;
  category: string;
  w: number;
  h: number;
}

const SAMPLE_PHOTOS: (DemoPhotoMeta & { pid: number })[] = [
  { pid: 10,  w: 1920, h: 1280, filename: "gym-barbell-01.jpg",        alt: "Gym barbell",       category: "Fitness" },
  { pid: 11,  w: 1920, h: 1280, filename: "sport-workout-02.jpg",       alt: "Sport workout",     category: "Fitness" },
  { pid: 26,  w: 1600, h: 1067, filename: "training-crossfit-03.jpg",   alt: "Training crossfit", category: "Fitness" },
  { pid: 27,  w: 1920, h: 1280, filename: "running-sprint-04.jpg",      alt: "Running sprint",    category: "Fitness" },
  { pid: 36,  w: 1920, h: 1200, filename: "yoga-studio-05.jpg",         alt: "Yoga studio",       category: "Fitness" },
  { pid: 37,  w: 1920, h: 1280, filename: "fitness-woman-06.jpg",       alt: "Fitness woman",     category: "Fitness" },
  { pid: 60,  w: 1920, h: 1280, filename: "modern-office-07.jpg",       alt: "Modern office",     category: "Business" },
  { pid: 61,  w: 1920, h: 1280, filename: "team-meeting-08.jpg",        alt: "Team meeting",      category: "Business" },
  { pid: 48,  w: 1920, h: 1280, filename: "laptop-analytics-09.jpg",    alt: "Laptop analytics",  category: "Business" },
  { pid: 42,  w: 1920, h: 1280, filename: "desk-workspace-10.jpg",      alt: "Desk workspace",    category: "Business" },
  { pid: 20,  w: 1920, h: 1280, filename: "office-collab-11.jpg",       alt: "Office collab",     category: "Business" },
  { pid: 15,  w: 1920, h: 1080, filename: "mountains-sunset-12.jpg",    alt: "Mountains sunset",  category: "Příroda" },
  { pid: 16,  w: 1920, h: 1200, filename: "forest-misty-13.jpg",        alt: "Forest misty",      category: "Příroda" },
  { pid: 29,  w: 1920, h: 1280, filename: "lake-forest-14.jpg",         alt: "Lake forest",       category: "Příroda" },
  { pid: 30,  w: 1920, h: 1280, filename: "forest-trail-15.jpg",        alt: "Forest trail",      category: "Příroda" },
  { pid: 33,  w: 1920, h: 1080, filename: "golden-meadow-16.jpg",       alt: "Golden meadow",     category: "Příroda" },
  { pid: 39,  w: 1920, h: 1280, filename: "ocean-waves-17.jpg",         alt: "Ocean waves",       category: "Příroda" },
  { pid: 13,  w: 1920, h: 1200, filename: "city-skyline-18.jpg",        alt: "City skyline",      category: "Architektura" },
  { pid: 32,  w: 1920, h: 1080, filename: "modern-architecture-19.jpg", alt: "Modern architecture", category: "Architektura" },
  { pid: 22,  w: 1920, h: 1280, filename: "urban-bridge-20.jpg",        alt: "Urban bridge",      category: "Architektura" },
  { pid: 21,  w: 1920, h: 1080, filename: "minimal-interior-21.jpg",    alt: "Minimal interior",  category: "Architektura" },
  { pid: 43,  w: 1920, h: 1280, filename: "buildings-glass-22.jpg",     alt: "Buildings glass",   category: "Architektura" },
  { pid: 292, w: 1920, h: 1280, filename: "food-spread-23.jpg",         alt: "Food spread",       category: "Jídlo" },
  { pid: 431, w: 1920, h: 1280, filename: "fresh-vegetables-24.jpg",    alt: "Fresh vegetables",  category: "Jídlo" },
  { pid: 488, w: 1920, h: 1280, filename: "coffee-art-25.jpg",          alt: "Coffee art",        category: "Jídlo" },
  { pid: 575, w: 1920, h: 1280, filename: "salad-bowl-26.jpg",          alt: "Salad bowl",        category: "Jídlo" },
  { pid: 312, w: 1920, h: 1080, filename: "bakery-bread-27.jpg",        alt: "Bakery bread",      category: "Jídlo" },
  { pid: 24,  w: 1920, h: 1080, filename: "abstract-gradient-28.jpg",   alt: "Abstract gradient", category: "Design" },
  { pid: 25,  w: 1920, h: 1200, filename: "minimal-design-29.jpg",      alt: "Minimal design",    category: "Design" },
  { pid: 49,  w: 1920, h: 1080, filename: "tech-pattern-30.jpg",        alt: "Tech pattern",      category: "Design" },
];

// Upload the 30 demo images once to shared storage (tenantId=0, no FK in media table).
// URLs are cached in platform_settings so this only runs once per deployment.
async function ensureSharedDemoMedia(): Promise<CachedDemoMedia[]> {
  const cached = await getSetting(SETTINGS_KEY);
  if (cached) {
    try {
      return JSON.parse(cached) as CachedDemoMedia[];
    } catch {
      // corrupt cache → re-seed
    }
  }

  const results: CachedDemoMedia[] = [];

  for (const photo of SAMPLE_PHOTOS) {
    try {
      const picsumUrl = `https://picsum.photos/id/${photo.pid}/${photo.w}/${photo.h}`;
      const fetchRes = await fetch(picsumUrl, { redirect: "follow" });
      if (!fetchRes.ok) continue;

      const blob = await fetchRes.blob();
      const file = new File([blob], photo.filename, { type: "image/jpeg" });
      // tenantId=0 → stored at shared path "0/media/..." (not in any real tenant's namespace)
      const result = await uploadMedia(file, 0, { targetWidth: photo.w, targetHeight: photo.h, fit: "cover" });

      results.push({
        url: result.url,
        filename: photo.filename,
        alt: photo.alt,
        category: photo.category,
        w: result.width ?? photo.w,
        h: result.height ?? photo.h,
      });
    } catch {
      // best-effort — skip broken photos
    }
  }

  if (results.length > 0) {
    await setSetting(SETTINGS_KEY, JSON.stringify(results));
  }

  return results;
}

// Insert lightweight DB rows for this tenant pointing to the shared demo URLs.
// No file copy — one set of files for all tenants.
export async function seedDemoMedia(tenantId: number): Promise<{ count: number }> {
  // Skip if already seeded for this tenant
  const existing = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM media WHERE tenant_id = $1 AND folder = $2`,
    [tenantId, DEMO_FOLDER]
  );
  if (parseInt(existing[0]?.count ?? "0", 10) > 0) return { count: 0 };

  const sharedMedia = await ensureSharedDemoMedia();
  if (sharedMedia.length === 0) return { count: 0 };

  const now = new Date().toISOString();
  let count = 0;

  for (const m of sharedMedia) {
    try {
      await query(
        `INSERT INTO media (tenant_id, url, filename, original_name, mime_type, size_bytes, width, height, alt_text, folder, created_at)
         VALUES ($1, $2, $3, $4, 'image/webp', NULL, $5, $6, $7, $8, $9)
         ON CONFLICT DO NOTHING`,
        [tenantId, m.url, m.filename, m.filename, m.w, m.h, m.category, DEMO_FOLDER, now]
      );
      count++;
    } catch {
      // skip
    }
  }

  return { count };
}
