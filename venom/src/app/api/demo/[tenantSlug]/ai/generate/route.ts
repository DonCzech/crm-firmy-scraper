import { NextRequest } from "next/server";
import { z } from "zod";
import { auditLog } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";

/**
 * POST /api/demo/<slug>/ai/generate
 *
 * Lightweight Claude wrapper for copy generation inside the editor. Takes a
 * structured prompt (kind + business + tone + optional hint) and returns a
 * short list of Czech text variants the user can paste into a section.
 *
 * Server reads ANTHROPIC_API_KEY from env. If absent the endpoint returns
 * 503 with a hint so the UI can surface a helpful message.
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

const BodySchema = z.object({
  kind: z.enum(["hero-headline", "hero-subhead", "cta", "about", "service", "testimonial", "faq", "freeform"]),
  business: z.string().min(1).max(120),
  tone: z.enum(["luxury", "friendly", "professional", "playful", "minimal"]).default("professional"),
  hint: z.string().max(400).optional(),
  count: z.number().int().min(1).max(5).default(3),
});

const KIND_PROMPT: Record<string, { task: string; format: string }> = {
  "hero-headline":  { task: "krátký výrazný headline (max 8 slov) do hero sekce", format: "list 3 variants" },
  "hero-subhead":   { task: "podheadline (max 20 slov) navazující na headline", format: "list 3 variants" },
  "cta":            { task: "krátké tlačítko k akci (1-3 slova)", format: "list 3 variants" },
  "about":          { task: "krátký odstavec o nás (2-3 věty)", format: "list 3 variants" },
  "service":        { task: "popis služby (1-2 věty) — co konkrétně dělá", format: "list 3 variants" },
  "testimonial":    { task: "věrohodný citát klienta (1-2 věty) v 1. osobě", format: "list 3 variants" },
  "faq":            { task: "FAQ položka — otázka a krátká odpověď", format: "list 3 Q&A pairs as 'Q: ... | A: ...'" },
  "freeform":       { task: "text dle požadavku uživatele (pole 'hint')", format: "list 3 variants" },
};

const TONE_HINT: Record<string, string> = {
  luxury:       "Luxusní, elegantní, prémiový. Krátké věty, žádné výkřičníky, latinské slovosledy.",
  friendly:     "Přátelský, lidský, neformální. Osobní zájmena, vykání jen formálně.",
  professional: "Profesionální, věcný, důvěryhodný. Konkrétní čísla a fakta.",
  playful:      "Hravý, vtipný, mladý. Slovní hříčky, ale ne ironie.",
  minimal:      "Minimalistický, krátký, holý. Bez přídavků, žádná superlativa.",
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error: "AI is not configured. Set ANTHROPIC_API_KEY in your environment.",
        hint: "V .env.local nastav ANTHROPIC_API_KEY a restartuj server.",
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const { kind, business, tone, hint, count } = parsed.data;
  const meta = KIND_PROMPT[kind];

  const userPrompt = [
    `Generuj ${count} variant: ${meta.task}.`,
    `Pro firmu: "${business}".`,
    `Tón: ${TONE_HINT[tone]}.`,
    hint ? `Doplňující kontext: ${hint}` : "",
    "",
    "PRAVIDLA:",
    "- Pouze česky.",
    "- Žádné uvozovky kolem variant.",
    "- Žádné číslování ani odrážky.",
    "- Každá varianta na samostatném řádku.",
    `- ${count} řádků, nic víc.`,
  ].filter(Boolean).join("\n");

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    if (!r.ok) {
      const txt = await r.text();
      return Response.json({ error: `Claude API ${r.status}`, detail: txt.slice(0, 200) }, { status: 502 });
    }
    const json = await r.json() as { content?: Array<{ type: string; text?: string }> };
    const text = (json.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("\n").trim();
    const variants = text
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*[-•\d.]+\s*/, "").trim())
      .filter((line) => line.length > 0)
      .slice(0, count);

    await auditLog("ai_text_generated", {
      tenantId: tenant.id,
      targetType: "tenant",
      targetId: String(tenant.id),
      extra: { kind, tone, count: variants.length },
    });

    return Response.json({ variants });
  } catch (e) {
    return Response.json({ error: `AI volání selhalo: ${(e as Error).message}` }, { status: 500 });
  }
}
