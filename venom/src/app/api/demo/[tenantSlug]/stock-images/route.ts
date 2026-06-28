import { NextRequest } from "next/server";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";

/**
 * GET /api/demo/<slug>/stock-images?q=<query>&page=<n>
 *
 * Thin proxy to Unsplash Search API. We keep the access key server-side so
 * the client never sees it. Falls back to a Lorem Picsum-style placeholder
 * grid when UNSPLASH_ACCESS_KEY is unset (lets local dev work without a key).
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

interface UnsplashPhoto {
  id: string;
  description: string | null;
  alt_description: string | null;
  urls: { thumb: string; small: string; regular: string; full: string };
  links: { html: string; download_location: string };
  user: { name: string; username: string; links: { html: string } };
  width: number;
  height: number;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  if (!q) return Response.json({ photos: [], total: 0 });

  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    // Fallback for local dev — deterministic Picsum URLs so the UI still works.
    const seed = encodeURIComponent(q);
    const photos = Array.from({ length: 12 }, (_, i) => ({
      id: `picsum-${seed}-${page}-${i}`,
      alt: q,
      thumb: `https://picsum.photos/seed/${seed}-${page}-${i}/400/280`,
      regular: `https://picsum.photos/seed/${seed}-${page}-${i}/1280/720`,
      author: { name: "Lorem Picsum", url: "https://picsum.photos" },
      sourceUrl: "https://picsum.photos",
      width: 1280,
      height: 720,
    }));
    return Response.json({ photos, total: 12, source: "picsum-fallback" });
  }

  try {
    const r = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&page=${page}&per_page=12&orientation=landscape`, {
      headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" },
      cache: "no-store",
    });
    if (!r.ok) {
      const txt = await r.text();
      return Response.json({ error: `Unsplash ${r.status}`, detail: txt.slice(0, 200) }, { status: 502 });
    }
    const json = (await r.json()) as { total: number; results: UnsplashPhoto[] };
    const photos = json.results.map((p) => ({
      id: p.id,
      alt: p.alt_description || p.description || q,
      thumb: p.urls.thumb,
      regular: p.urls.regular,
      author: { name: p.user.name, url: `${p.user.links.html}?utm_source=webero&utm_medium=referral` },
      sourceUrl: `${p.links.html}?utm_source=webero&utm_medium=referral`,
      width: p.width,
      height: p.height,
    }));
    return Response.json({ photos, total: json.total, source: "unsplash" });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
