import { NextRequest } from "next/server";
import { z } from "zod";
import { query, queryOne, auditLog, type Section } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";
import { resolveSectionContent, computeOverridesForSubmit, invalidateTemplateCache } from "@/lib/section-resolver";

/**
 * POST /api/demo/<slug>/ai/build-site
 *
 * Flagship AI builder. Takes a business brief and returns structured Czech
 * content for every main section on the homepage. Frontend previews the plan
 * and calls action=apply to commit.
 *
 * Body:
 *   { business, industry, tagline?, audience?, tone, services?[], action? }
 *   action: "preview" (default) — just returns the plan
 *   action: "apply"             — also patches each main section's content
 *
 * Persistence: for each main section we read the resolved content (template
 * defaults + slots + overrides), patch only the fields we have plans for
 * (hero.title, services.items[].title, etc.), then save back through the
 * existing sparse-diff path so we don't blow away anything we didn't touch.
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

const BodySchema = z.object({
  business: z.string().min(1).max(120),
  industry: z.string().min(1).max(60),
  tagline: z.string().max(160).optional(),
  audience: z.string().max(200).optional(),
  tone: z.enum(["luxury", "friendly", "professional", "playful", "minimal"]).default("professional"),
  services: z.array(z.string().min(1).max(80)).max(8).optional(),
  action: z.enum(["preview", "apply"]).default("preview"),
});

interface BuildPlan {
  hero?: { eyebrow?: string; title: string; subtitle: string; ctaPrimary: string; ctaSecondary?: string };
  about?: { title: string; paragraph: string; bullets?: string[] };
  services?: { title: string; subtitle?: string; items: Array<{ title: string; description: string }> };
  pricing?: { title: string; tiers: Array<{ name: string; price: string; period?: string; features: string[]; cta?: string }> };
  testimonials?: { title: string; items: Array<{ quote: string; author: string; role?: string }> };
  faq?: { title: string; items: Array<{ question: string; answer: string }> };
  cta?: { title: string; subtitle?: string; button: string };
  contact?: { title: string; subtitle?: string };
  "opening-hours"?: { title: string };
  gallery?: { title: string; subtitle?: string };
  team?: { title: string; members: Array<{ name: string; role: string; bio: string }> };
  stats?: { title?: string; items: Array<{ value: string; label: string }> };
  promo?: { title: string; subtitle?: string; button?: string };
  map?: { title: string };
  "blog-preview"?: { title: string; subtitle?: string };
}

const TONE_PROMPT: Record<string, string> = {
  luxury:       "Luxusní, elegantní, prémiový. Krátké věty, žádné výkřičníky.",
  friendly:     "Přátelský, lidský, neformální. Osobní zájmena.",
  professional: "Profesionální, věcný, důvěryhodný. Konkrétní fakta.",
  playful:      "Hravý, vtipný, mladý. Lehký humor.",
  minimal:      "Minimalistický, krátký, holý. Bez přídavků.",
};

const SYSTEM_PROMPT = `Jsi český copywriter. Tvořením webových textů pro malé firmy se živíš 10 let.
Pravidla:
- Vždy česky, gramaticky správně.
- Žádné výplňové fráze ("kvalitní služby", "spokojení zákazníci" prostě NE).
- Konkrétní benefity, ne floskule.
- Tikání/vykání: vykání pro profesionální/luxury, tykání pro friendly/playful, vykání pro minimal.
- Žádné emoji.
- Tvoříš strukturovaný JSON přesně podle požadovaného schématu.`;

function userPromptFor(brief: z.infer<typeof BodySchema>, sectionTypes: string[]): string {
  const services = brief.services && brief.services.length > 0 ? `\nSlužby/produkty: ${brief.services.join(", ")}` : "";
  return [
    `Vytvoř obsah pro webovou stránku této firmy:`,
    `Název: ${brief.business}`,
    `Obor: ${brief.industry}`,
    brief.tagline ? `Motto: ${brief.tagline}` : "",
    brief.audience ? `Cílovka: ${brief.audience}` : "",
    `Tón: ${TONE_PROMPT[brief.tone]}`,
    services,
    "",
    `Vrať pouze JSON, žádný text okolo, přesně podle tohoto schématu:`,
    `{`,
    sectionTypes.includes("hero") ? `  "hero": { "eyebrow": "krátký kontext nad titulkem (max 4 slova)", "title": "headline max 8 slov", "subtitle": "podtitulek max 22 slov", "ctaPrimary": "tlačítko 1-3 slova", "ctaSecondary": "alternativní tlačítko 1-3 slova" },` : "",
    sectionTypes.includes("about") ? `  "about": { "title": "nadpis max 5 slov", "paragraph": "1-2 věty, max 60 slov", "bullets": ["benefit 1", "benefit 2", "benefit 3"] },` : "",
    sectionTypes.includes("services") ? `  "services": { "title": "nadpis", "subtitle": "krátký doprovod (max 14 slov)", "items": [ { "title": "název služby", "description": "1 věta max 22 slov" } ] },` : "",
    sectionTypes.includes("pricing") ? `  "pricing": { "title": "Ceník", "tiers": [ { "name": "balíček", "price": "990 Kč", "period": "měsíčně", "features": ["fíčura 1", "fíčura 2"], "cta": "Vybrat" } ] },` : "",
    sectionTypes.includes("testimonials") ? `  "testimonials": { "title": "Co říkají klienti", "items": [ { "quote": "1-2 věty", "author": "Jméno Příjmení", "role": "kontext" } ] },` : "",
    sectionTypes.includes("faq") ? `  "faq": { "title": "Časté dotazy", "items": [ { "question": "otázka?", "answer": "odpověď 1-2 věty" } ] },` : "",
    sectionTypes.includes("cta") ? `  "cta": { "title": "krátký výzva", "subtitle": "doplňková věta", "button": "akce 1-3 slova" },` : "",
    sectionTypes.includes("contact") ? `  "contact": { "title": "Kontakt", "subtitle": "krátký pre-text" },` : "",
    sectionTypes.includes("opening-hours") ? `  "opening-hours": { "title": "Otevírací doba" },` : "",
    sectionTypes.includes("gallery") ? `  "gallery": { "title": "Galerie", "subtitle": "krátký kontext" },` : "",
    sectionTypes.includes("team") ? `  "team": { "title": "Náš tým", "members": [ { "name": "Jméno", "role": "Pozice", "bio": "1 věta" } ] },` : "",
    sectionTypes.includes("stats") ? `  "stats": { "items": [ { "value": "12", "label": "popisek" } ] },` : "",
    sectionTypes.includes("promo") ? `  "promo": { "title": "akce", "subtitle": "podmínky", "button": "akce" },` : "",
    sectionTypes.includes("map") ? `  "map": { "title": "Najdete nás" },` : "",
    sectionTypes.includes("blog-preview") ? `  "blog-preview": { "title": "Z blogu", "subtitle": "krátký doprovod" }` : "",
    `}`,
    "",
    `Generuj jen sekce, které jsou ve schématu. Pro pole "items" / "members" / "tiers" / "bullets" generuj přesně 3 položky (pokud schéma neříká jinak). Žádné placeholdery jako "Lorem ipsum".`,
  ].filter(Boolean).join("\n");
}

// Map plan content into a section's content shape. We keep this generic by
// merging the plan into common fields used across most variants
// (title/subtitle/items/...).
function applyPlanToContent(
  sectionType: string,
  resolvedContent: Record<string, unknown>,
  plan: unknown
): Record<string, unknown> {
  if (!plan || typeof plan !== "object") return resolvedContent;
  const p = plan as Record<string, unknown>;
  const out: Record<string, unknown> = { ...resolvedContent };
  const fields = ["eyebrow", "title", "subtitle", "paragraph", "ctaPrimary", "ctaSecondary", "button", "items", "bullets", "tiers", "members"];
  for (const f of fields) {
    if (p[f] !== undefined) out[f] = p[f];
  }
  return out;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY není nastavený" }, { status: 503 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  // What main sections does the homepage actually have? We only generate
  // content for types that exist (no point writing FAQ if there's no FAQ).
  const homepage = await queryOne<{ id: number }>(
    "SELECT id FROM pages WHERE tenant_id = $1 AND is_homepage = true LIMIT 1",
    [tenant.id]
  );
  if (!homepage) return Response.json({ error: "Tenant has no homepage" }, { status: 404 });

  const sections = await query<Section & { content_source: string | null; content_overrides: Record<string, unknown> }>(
    "SELECT * FROM sections WHERE tenant_id = $1 AND page_id = $2 AND section_type NOT IN ('navbar','footer') ORDER BY order_index",
    [tenant.id, homepage.id]
  );
  const sectionTypes = Array.from(new Set(sections.map((s) => s.section_type)));
  if (sectionTypes.length === 0) {
    return Response.json({ error: "Stránka nemá žádné sekce, kterým bych mohl vyplnit obsah." }, { status: 400 });
  }

  // Call Claude
  let plan: BuildPlan;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 3000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPromptFor(parsed.data, sectionTypes) }],
      }),
    });
    if (!r.ok) {
      const txt = await r.text();
      return Response.json({ error: `Claude API ${r.status}`, detail: txt.slice(0, 200) }, { status: 502 });
    }
    const json = await r.json() as { content?: Array<{ type: string; text?: string }> };
    const raw = (json.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("").trim();
    // Strip code fences if Claude wrapped JSON in ```json … ```
    const stripped = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    plan = JSON.parse(stripped) as BuildPlan;
  } catch (e) {
    return Response.json({ error: `AI selhalo: ${(e as Error).message}` }, { status: 500 });
  }

  if (parsed.data.action === "preview") {
    return Response.json({ plan, sectionTypes });
  }

  // Apply — patch each section's content_overrides via the resolver so
  // sparse diff keeps everything else intact.
  let appliedCount = 0;
  for (const s of sections) {
    const planForType = (plan as Record<string, unknown>)[s.section_type];
    if (!planForType) continue;
    const sectionV2 = { ...s, content_source: (s.content_source ?? "legacy") as "v2" | "legacy" };
    const resolved = await resolveSectionContent(sectionV2, tenant);
    const merged = applyPlanToContent(s.section_type, resolved.content, planForType);

    if (sectionV2.content_source === "v2") {
      const overrides = await computeOverridesForSubmit(sectionV2, tenant, merged);
      await query(
        "UPDATE sections SET content_overrides = $1::jsonb, updated_at = now() WHERE id = $2 AND tenant_id = $3",
        [JSON.stringify(overrides), s.id, tenant.id]
      );
    } else {
      const settings = (s.settings ?? {}) as Record<string, unknown>;
      await query(
        "UPDATE sections SET settings = $1::jsonb, updated_at = now() WHERE id = $2 AND tenant_id = $3",
        [JSON.stringify({ ...settings, content: merged }), s.id, tenant.id]
      );
    }
    appliedCount += 1;
  }

  invalidateTemplateCache();
  await auditLog("ai_site_built", {
    tenantId: tenant.id,
    targetType: "tenant",
    targetId: String(tenant.id),
    extra: { sectionsApplied: appliedCount, kindsRequested: sectionTypes },
  });

  return Response.json({ ok: true, appliedCount, plan });
}
