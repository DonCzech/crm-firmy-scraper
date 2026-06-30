import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * POST /api/demo/<slug>/ai/rewrite
 *
 * Rewrites or transforms a given text using Claude.
 * Used by the AI Asistent floating panel in the Studio editor.
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

const BodySchema = z.object({
  text: z.string().min(1).max(2000),
  mode: z.enum(["professional", "shorten", "cta", "translate-en", "friendlier", "expand"]),
});

const MODE_INSTRUCTIONS: Record<string, string> = {
  professional: "Přepiš tento text profesionálněji a přesvědčivěji. Zachovej stejný jazyk (čeština nebo angličtina).",
  shorten:      "Zkrať tento text na maximálně polovinu délky, zachovej klíčové informace. Zachovej jazyk originálu.",
  cta:          "Navrhni 3 varianty přesvědčivé výzvy k akci (CTA) inspirované tímto textem. Odděluj je novým řádkem. Zachovej jazyk originálu.",
  "translate-en": "Přelož tento text do angličtiny. Zachovej styl a tón originálu.",
  friendlier:   "Přepiš tento text přátelštěji a méně formálně. Zachovej jazyk originálu.",
  expand:       "Rozveď a rozšiř tento text o 1-2 věty. Zachovej styl a jazyk originálu.",
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY není nastaven." }, { status: 503 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Neplatná data", details: parsed.error.flatten() }, { status: 422 });
  }

  const { text, mode } = parsed.data;
  const instruction = MODE_INSTRUCTIONS[mode];

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content: `${instruction}\n\nText:\n${text}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: "Claude API chyba", detail: err }, { status: 502 });
    }

    const data = await response.json() as {
      content: Array<{ type: string; text?: string }>;
    };
    const result = data.content.find(c => c.type === "text")?.text ?? "";
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json({ error: "Síťová chyba", detail: String(err) }, { status: 502 });
  }
}
