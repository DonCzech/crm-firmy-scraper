import { NextRequest } from "next/server";
import { query, queryOne } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";

/**
 * GET /api/demo/<slug>/seo-score?pageId=<id>
 *
 * Lightweight SEO/health audit for a single page. Runs cheap deterministic
 * checks against the page row + its sections — no external network calls.
 * Each check returns { id, label, status: "pass"|"warn"|"fail", weight, hint }.
 * Overall score = weighted pass% (0-100).
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

interface CheckResult {
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
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  noindex: boolean | null;
  status: string;
  is_homepage: boolean;
}

function check(id: string, label: string, ok: boolean, weight: number, hint: string, warnIfWeak?: () => boolean): CheckResult {
  if (ok) return { id, label, status: "pass", weight, hint };
  if (warnIfWeak && warnIfWeak()) return { id, label, status: "warn", weight, hint };
  return { id, label, status: "fail", weight, hint };
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
        "SELECT id, slug, title, seo_title, seo_description, og_image, noindex, status, is_homepage FROM pages WHERE id = $1 AND tenant_id = $2",
        [pageId, tenant.id]
      )
    : await queryOne<PageRow>(
        "SELECT id, slug, title, seo_title, seo_description, og_image, noindex, status, is_homepage FROM pages WHERE tenant_id = $1 AND is_homepage = true LIMIT 1",
        [tenant.id]
      );
  if (!page) return Response.json({ error: "Page not found" }, { status: 404 });

  const sections = await query<SectionRow>(
    `SELECT id, section_type, is_visible, settings, content_overrides
       FROM sections
      WHERE tenant_id = $1 AND page_id = $2
      ORDER BY order_index`,
    [tenant.id, page.id]
  );

  // Collect text-bearing content from settings.content + content_overrides for
  // alt/heading inspection. Keep it shallow — we just need quick checks.
  function* walkStrings(node: unknown): Generator<{ key: string; value: string }> {
    if (typeof node === "string") return;
    if (Array.isArray(node)) {
      for (const it of node) yield* walkStrings(it);
      return;
    }
    if (node && typeof node === "object") {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        if (typeof v === "string") yield { key: k, value: v };
        else if (v && typeof v === "object") yield* walkStrings(v);
      }
    }
  }

  // Aggregate content per section type
  let totalImages = 0;
  let imagesMissingAlt = 0;
  let totalHeroes = 0;
  let heroesWithCta = 0;
  let totalContact = 0;
  let contactFormCount = 0;
  for (const s of sections) {
    if (!s.is_visible) continue;
    const content = {
      ...(s.settings?.content ?? {}),
      ...(s.content_overrides ?? {}),
    };
    for (const { key, value } of walkStrings(content)) {
      if (/image|photo|picture|src|url|thumb/i.test(key) && /\.(jpe?g|png|webp|gif|avif)/i.test(value)) {
        totalImages += 1;
      }
      if (/^alt/i.test(key) && value.trim().length === 0) imagesMissingAlt += 1;
    }
    if (s.section_type === "hero") {
      totalHeroes += 1;
      const c = JSON.stringify(content);
      if (/cta|button|primary/i.test(c)) heroesWithCta += 1;
    }
    if (s.section_type === "contact") {
      totalContact += 1;
      const c = JSON.stringify(content);
      if (/form|email|message/i.test(c)) contactFormCount += 1;
    }
  }

  const visibleMain = sections.filter((s) =>
    s.is_visible && s.section_type !== "navbar" && s.section_type !== "footer"
  );

  const titleLen = (page.seo_title ?? page.title ?? "").length;
  const descLen = (page.seo_description ?? "").length;

  const checks: CheckResult[] = [
    check(
      "seo-title",
      "SEO titulek vyplněn (50–60 znaků)",
      titleLen >= 30 && titleLen <= 60,
      10,
      titleLen === 0
        ? "Doplň SEO titulek v sekci SEO administrace."
        : titleLen < 30
        ? `Titulek je krátký (${titleLen} z 60 znaků) — doplň více kontextu.`
        : `Titulek je dlouhý (${titleLen} z 60). Google ho zkrátí.`,
      () => titleLen >= 20 && titleLen < 30
    ),
    check(
      "meta-description",
      "Meta description (120–160 znaků)",
      descLen >= 100 && descLen <= 160,
      10,
      descLen === 0
        ? "Chybí meta description — sníží CTR ve vyhledávači."
        : descLen < 100
        ? `Popisek je krátký (${descLen} znaků).`
        : `Popisek je dlouhý (${descLen}). Google ho ořízne.`,
      () => descLen >= 60 && descLen < 100
    ),
    check(
      "og-image",
      "Sdílecí obrázek (OG image)",
      !!page.og_image,
      6,
      "Doplň OG image pro lepší náhled na Facebooku, LinkedIn a v Messengeru."
    ),
    check(
      "noindex",
      "Stránka je indexovatelná",
      !page.noindex,
      page.is_homepage ? 8 : 4,
      "Stránka má nastavený noindex — vyhledávače ji ignorují."
    ),
    check(
      "hero-cta",
      "Hero sekce má CTA tlačítko",
      totalHeroes === 0 || heroesWithCta === totalHeroes,
      6,
      "Hero bez CTA snižuje konverzi — přidej výrazné tlačítko k akci."
    ),
    check(
      "section-count",
      "Stránka má alespoň 3 sekce",
      visibleMain.length >= 3,
      6,
      `Aktuálně ${visibleMain.length} viditelných sekcí — krátká stránka může působit nehotově.`,
      () => visibleMain.length === 2
    ),
    check(
      "contact-form",
      "Kontaktní cesta na stránce",
      page.is_homepage ? totalContact > 0 : true,
      page.is_homepage ? 6 : 0,
      "Úvodní stránka by měla obsahovat kontaktní sekci nebo formulář."
    ),
    check(
      "alt-text",
      "Obrázky mají alt text",
      imagesMissingAlt === 0,
      4,
      imagesMissingAlt === 0
        ? "Všechny obrázky mají alt."
        : `${imagesMissingAlt} obrázků bez alt textu — zhoršuje SEO i přístupnost.`,
      () => imagesMissingAlt > 0 && totalImages > 0 && imagesMissingAlt < totalImages * 0.3
    ),
    check(
      "page-published",
      "Stránka je publikovaná",
      page.status === "published",
      page.is_homepage ? 4 : 8,
      "Stránka je koncept — návštěvníci ji neuvidí, dokud ji nepublikuješ."
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
      sections: visibleMain.length,
      images: totalImages,
      imagesMissingAlt,
      titleLen,
      descLen,
    },
  });
}
