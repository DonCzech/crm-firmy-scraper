import { NextRequest } from "next/server";
import { query, queryOne } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";

/**
 * GET /api/demo/<slug>/perf-score?pageId=<id>
 *
 * Pre-publish performance audit. Runs static checks against the page
 * (image sizes via HEAD, alt coverage, lazy loading hints, broken external
 * links, text density, mobile breakpoints) and returns a weighted score
 * with actionable hints — same shape as the SEO score endpoint so the UI
 * pattern is reused.
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

interface PerfCheck {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  weight: number;
  hint: string;
}

interface SectionRow {
  id: number;
  section_type: string;
  is_visible: boolean;
  settings: Record<string, unknown> | null;
  content_overrides: Record<string, unknown> | null;
}

interface PageRow {
  id: number;
  slug: string;
  title: string;
  is_homepage: boolean;
}

function check(id: string, label: string, ok: boolean, weight: number, hint: string, warnIf?: () => boolean): PerfCheck {
  if (ok) return { id, label, status: "pass", weight, hint };
  if (warnIf && warnIf()) return { id, label, status: "warn", weight, hint };
  return { id, label, status: "fail", weight, hint };
}

async function probeImageBytes(url: string, timeoutMs = 1500): Promise<number | null> {
  if (!url || !url.startsWith("http")) return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const r = await fetch(url, { method: "HEAD", signal: ctrl.signal });
    clearTimeout(t);
    if (!r.ok) return null;
    const len = r.headers.get("content-length");
    return len ? parseInt(len, 10) : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const pageIdRaw = new URL(req.url).searchParams.get("pageId");
  const pageId = pageIdRaw ? parseInt(pageIdRaw, 10) : null;
  const page = pageId
    ? await queryOne<PageRow>(
        "SELECT id, slug, title, is_homepage FROM pages WHERE id = $1 AND tenant_id = $2",
        [pageId, tenant.id]
      )
    : await queryOne<PageRow>(
        "SELECT id, slug, title, is_homepage FROM pages WHERE tenant_id = $1 AND is_homepage = true LIMIT 1",
        [tenant.id]
      );
  if (!page) return Response.json({ error: "Page not found" }, { status: 404 });

  const sections = await query<SectionRow>(
    `SELECT id, section_type, is_visible, settings, content_overrides
       FROM sections WHERE tenant_id = $1 AND page_id = $2 ORDER BY order_index`,
    [tenant.id, page.id]
  );

  function* walkStrings(node: unknown): Generator<{ key: string; value: string }> {
    if (typeof node === "string") return;
    if (Array.isArray(node)) { for (const it of node) yield* walkStrings(it); return; }
    if (node && typeof node === "object") {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        if (typeof v === "string") yield { key: k, value: v };
        else if (v && typeof v === "object") yield* walkStrings(v);
      }
    }
  }

  const imageUrls = new Set<string>();
  const externalLinks = new Set<string>();
  let totalCharCount = 0;
  let imagesMissingAlt = 0;
  let totalImagesField = 0;
  let usesLazyLoading = false;
  let hasHero = false;
  let hasResponsiveBreakpoints = false;

  for (const s of sections) {
    if (!s.is_visible) continue;
    if (s.section_type === "hero") hasHero = true;
    if (s.settings && typeof s.settings === "object") {
      const settings = s.settings as Record<string, unknown>;
      const hiddenOn = settings.hiddenOn;
      if (Array.isArray(hiddenOn) && hiddenOn.length > 0) hasResponsiveBreakpoints = true;
    }
    const content = { ...(s.settings?.content ?? {}), ...(s.content_overrides ?? {}) };
    for (const { key, value } of walkStrings(content)) {
      totalCharCount += value.length;
      if (/image|photo|picture|src|thumb/i.test(key) && /^https?:\/\//i.test(value) && /\.(jpe?g|png|webp|gif|avif)/i.test(value)) {
        imageUrls.add(value);
        totalImagesField += 1;
        if (/loading=("|')lazy/.test(value)) usesLazyLoading = true;
      }
      if (/^alt/i.test(key) && value.trim().length === 0) imagesMissingAlt += 1;
      if (/href|url|link/i.test(key) && /^https?:\/\//i.test(value)) {
        externalLinks.add(value);
      }
    }
  }

  // Probe image sizes for up to 12 distinct URLs in parallel.
  const sampleUrls = Array.from(imageUrls).slice(0, 12);
  const probed = await Promise.all(sampleUrls.map((u) => probeImageBytes(u)));
  const heavyImages = probed.filter((b) => b !== null && b! > 500_000).length;
  const totalKnownBytes = probed.reduce((acc, b) => acc + (b ?? 0), 0);

  // Probe external link reachability — sample 8 links to keep latency sane.
  const sampleLinks = Array.from(externalLinks).slice(0, 8);
  const linkStatuses = await Promise.all(sampleLinks.map(async (url) => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 1500);
      const r = await fetch(url, { method: "HEAD", signal: ctrl.signal, redirect: "follow" });
      clearTimeout(t);
      return r.status;
    } catch { return 0; }
  }));
  const brokenLinks = linkStatuses.filter((s) => s === 0 || s >= 400).length;

  const visibleMainSections = sections.filter((s) => s.is_visible && s.section_type !== "navbar" && s.section_type !== "footer").length;

  const checks: PerfCheck[] = [
    check(
      "image-weight",
      "Obrázky pod 500 KB",
      heavyImages === 0,
      12,
      heavyImages === 0
        ? `Všechny změřené obrázky (${probed.filter((b) => b !== null).length}) jsou pod 500 KB.`
        : `${heavyImages} obrázků váží přes 500 KB. Použij WebP/AVIF nebo zmenši rozměry.`,
      () => heavyImages <= 2
    ),
    check(
      "total-payload",
      "Celková velikost obrázků",
      totalKnownBytes < 2_500_000,
      10,
      totalKnownBytes < 1_500_000
        ? `Změřená velikost ${(totalKnownBytes / 1024).toFixed(0)} KB — velmi rychlé.`
        : totalKnownBytes < 2_500_000
          ? `Změřená velikost ${(totalKnownBytes / 1024).toFixed(0)} KB — solidní.`
          : `Změřená velikost ${(totalKnownBytes / 1024 / 1024).toFixed(1)} MB. Zvaž komprimaci.`,
      () => totalKnownBytes < 4_000_000
    ),
    check(
      "alt-coverage",
      "Alt texty u obrázků",
      imagesMissingAlt === 0,
      8,
      imagesMissingAlt === 0 ? "Všechny obrázky mají alt." : `${imagesMissingAlt} polí bez alt textu — zhoršuje accessibility i SEO.`,
      () => imagesMissingAlt > 0 && totalImagesField > 0 && imagesMissingAlt / totalImagesField < 0.3
    ),
    check(
      "lazy-load",
      "Lazy loading obrázků",
      usesLazyLoading || totalImagesField <= 3,
      4,
      usesLazyLoading || totalImagesField <= 3
        ? "Lazy loading je aktivní nebo není potřeba (málo obrázků)."
        : "Doporučujeme přidat loading=\"lazy\" k obrázkům pod foldem.",
    ),
    check(
      "broken-links",
      "Externí odkazy fungují",
      brokenLinks === 0,
      8,
      brokenLinks === 0
        ? `Všech ${linkStatuses.length} změřených odkazů odpovídá.`
        : `${brokenLinks} odkazů vrátilo chybu/timeout — zkontroluj cíle.`,
      () => brokenLinks <= 1
    ),
    check(
      "responsive",
      "Responzivní nastavení (mobile/tablet)",
      hasResponsiveBreakpoints || visibleMainSections <= 4,
      6,
      hasResponsiveBreakpoints
        ? "Stránka má sekce s nastavenou viditelností per breakpoint."
        : `Doporučujeme pro některé sekce zapnout „Skrýt na mobilu" v Editoru — méně dat na mobilu = rychleji.`,
    ),
    check(
      "hero-presence",
      "Hero sekce je první",
      hasHero,
      4,
      hasHero ? "Hero sekce je přítomna." : "Bez hero sekce nemá uživatel co spustit na první obrazovce."
    ),
    check(
      "text-density",
      "Délka obsahu (1500–10000 znaků)",
      totalCharCount >= 1500 && totalCharCount <= 10000,
      4,
      totalCharCount < 1500
        ? `Stránka má ${totalCharCount} znaků — krátký obsah hůř konvertuje a slabě boduje v SEO.`
        : totalCharCount > 10000
          ? `Stránka má ${totalCharCount} znaků — moc textu zpomalí parsování a snižuje engagement.`
          : `Délka obsahu OK (${totalCharCount} znaků).`,
      () => (totalCharCount >= 800 && totalCharCount < 1500) || (totalCharCount > 10000 && totalCharCount < 14000)
    ),
  ];

  const weightTotal = checks.reduce((acc, c) => acc + c.weight, 0);
  const earned = checks.reduce((acc, c) => acc + (c.status === "pass" ? c.weight : c.status === "warn" ? c.weight * 0.5 : 0), 0);
  const score = weightTotal === 0 ? 100 : Math.round((earned / weightTotal) * 100);

  return Response.json({
    page: { id: page.id, slug: page.slug, title: page.title, isHomepage: page.is_homepage },
    score,
    checks,
    stats: {
      sections: visibleMainSections,
      images: totalImagesField,
      imagesProbed: probed.filter((b) => b !== null).length,
      heavyImages,
      totalImageBytes: totalKnownBytes,
      brokenLinks,
      externalLinks: linkStatuses.length,
      totalChars: totalCharCount,
    },
  });
}
