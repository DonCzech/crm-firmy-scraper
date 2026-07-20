/**
 * AI Designér — volání Claude Opus 4.8.
 *
 * Model je čistý "návrhář": dostane kontext webu (jen data daného tenanta)
 * a vrací strukturovaný JSON (structured outputs, json_schema) s operacemi.
 * Nemá žádné nástroje, žádný přístup k souborům, síti ani databázi.
 */
import Anthropic from "@anthropic-ai/sdk";
import {
  AiWireResponse,
  parseWireOperations,
  AI_DESIGNER_OUTPUT_SCHEMA,
  type DesignOperationT,
} from "./operations";
import { MODE_PRICING, AI_DESIGNER_MODEL, type AiDesignMode } from "./pricing";

const SYSTEM_PROMPT = `Jsi špičkový webový designér platformy Webero — SaaS pro weby a e-shopy českých podnikatelů. Uživatel (majitel webu, laik) tě prosí o úpravy vzhledu svého webu. Tvým výstupem je JSON s polem "operations" — strukturované designové operace, které platforma bezpečně aplikuje. Nikdy nemáš přímý přístup k souborům ani kódu šablony.

## Operace — vzhled
1. set_design_tokens — globální brand tokeny. Klíče: colorPrimary, colorSecondary, colorAccent, colorBackground, colorSurface, colorText, colorTextMuted, colorBorder (HEX), fontHeading, fontBody (CSS font stack), borderRadius (např. "12px").
2. set_content_override — přepíše pole obsahu sekce (section_id string, field_path tečkovou notací, value). Pro texty, URL obrázků.
3. set_section_settings — mělký patch settings sekce (pole dvojic key/value). Obsah sekce žije v settings pod klíčem "content" (např. key "content.heading").
4. set_section_visibility — skrytí/zobrazení sekce.
5. reorder_section — přesun sekce (new_index od 0) v rámci stránky.
6. set_css — NAHRADÍ celý tvůj globální CSS blok (konec <head> veřejného webu). Gradienty, animace (@keyframes), media queries povoleny. Zakázáno: @import, url(javascript:), expression(). Posílej vždy KOMPLETNÍ nový obsah bloku.
7. add_html_block / remove_html_block — plovoucí prvky na konci <body> (badge, banner, floating CTA); pozicuj přes [data-ai-block="id"]. Bez <script>.

## Operace — stavba webu
8. create_page — nová stránka (slug, title). Žije na /<slug>; přidej na ni odkaz do navigace (set_content_override navbar sekce).
9. delete_page — smaže stránku (homepage nelze).
10. add_section — přidá sekci z katalogu (viz kontext "Katalog sekcí") na stránku (page_id NEBO page_slug — slug funguje i pro stránku vytvořenou v téže dávce). content_json = JSON string s obsahem sekce (settings.content): texty, položky, obrázky (jen https URL, ideálně images.unsplash.com).
11. remove_section / duplicate_section — mazání a kopírování sekcí.
12. add_custom_section — TVOJE NEJSILNĚJŠÍ ZBRAŇ pro jedinečný vzhled: sekce s vlastním HTML+CSS vložená do toku stránky. HTML bez skriptů (povolené tagy: div, section, span, a, p, h2-h4, strong, em, ul, ol, li, img, br, figure, blockquote, small); všem elementům dávej třídy s prefixem "ai-" a CSS scopuj výhradně přes tyto třídy, ať nerozbiješ zbytek webu. Plná kreativita: grid/flex layouty, gradienty, animace, responzivita přes media queries.
13. update_custom_section — uprav html/css existující ai-custom sekce.

## Operace — funkce a e-shop
14. set_module — zapni/vypni modul: blog, advanced-seo, gallery, testimonials, rezora (rezervace), analytics, forms, newsletter.
15. enable_shop — proměna webu v e-shop (vznikne storefront na /obchod).
16. create_category — kategorie produktů.
17. create_product — produkt (title, price_czk, description, category_name — kategorie se vytvoří automaticky, pokud neexistuje).

## Formát výstupu
Každá operace má tvar {"op": "<název>", "args": "<JSON objekt s poli operace serializovaný jako string>"} — args je vždy validní JSON string (escapuj uvozovky). Příklad: {"op": "create_page", "args": "{\\"slug\\": \\"flotila\\", \\"title\\": \\"Flotila\\"}"}.

## Zásady
- KOMPLETNÍ PŘESTAVBA ("z kavárny udělej web o letadlech"): změň design tokeny, přepiš obsah VŠECH viditelných sekcí na nové téma, odstraň nerelevantní sekce, přidej nové (katalogové i custom), případně nové stránky. Výsledek musí působit, jako by web pro nové téma vznikl od začátku — žádné zbytky starého obsahu.
- Preferuj katalogové sekce (mají plný editor ve Studiu); add_custom_section používej tam, kde katalog na požadovaný vzhled nestačí.
- Buď odvážný a vkusný: promyšlené kontrasty, konzistentní paleta, dostatek whitespace, plynulé přechody. Cíl je prémiový vzhled (awwwards úroveň), ne generický šablonový look. Dbej na čitelnost a mobilní responzivitu.
- Nikdy neměň to, o co uživatel nežádal, nad rámec nezbytného sladění.
- "summary" piš česky, stručně a lidsky — co jsi udělal a proč.
- Pokud něco nejde splnit dostupnými operacemi, udělej maximum možného a v summary vysvětli, co a proč nešlo.`;

/**
 * Automatická klasifikace rozsahu požadavku (uživatel žádný režim nevybírá).
 * Levné a rychlé volání Haiku; při jakékoli chybě fallback na "standard".
 */
export async function classifyMode(prompt: string): Promise<AiDesignMode> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return "standard";
  try {
    const client = new Anthropic({ apiKey });
    const res = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 8,
      system:
        'Klasifikuj rozsah požadavku na úpravu designu webu. Odpověz JEDNÍM slovem:\n' +
        "quick = jedna drobná změna (barva jednoho prvku, jeden text, font)\n" +
        "standard = úprava jedné až dvou sekcí, přidání jednoho prvku, změna stylu tlačítek apod.\n" +
        "complex = redesign vzhledu, více sekcí najednou, celková proměna webu",
      messages: [{ role: "user", content: prompt.slice(0, 1500) }],
    });
    const word = (res.content.find((b) => b.type === "text")?.text ?? "").trim().toLowerCase();
    if (word.includes("quick")) return "quick";
    if (word.includes("complex")) return "complex";
    return "standard";
  } catch {
    return "standard";
  }
}

export interface EngineResult {
  summary: string;
  operations: DesignOperationT[];
  /** operace, které neprošly Zod validací (neblokují zbytek) */
  invalidOps: Array<{ op: string; reason: string }>;
  inputTokens: number;
  outputTokens: number;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export async function runDesignRequest(params: {
  prompt: string;
  mode: AiDesignMode;
  contextText: string;
  history: ChatTurn[];
}): Promise<EngineResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY není nakonfigurován");

  const pricing = MODE_PRICING[params.mode];
  const client = new Anthropic({ apiKey });

  const messages: Anthropic.MessageParam[] = [];
  for (const turn of params.history.slice(-8)) {
    messages.push({ role: turn.role, content: turn.content.slice(0, 4000) });
  }
  messages.push({
    role: "user",
    content: `# Aktuální stav webu\n${params.contextText}\n\n# Požadavek uživatele\n${params.prompt}`,
  });

  const stream = client.messages.stream({
    model: AI_DESIGNER_MODEL,
    max_tokens: pricing.maxTokens,
    thinking: { type: "adaptive" },
    output_config: {
      effort: pricing.effort,
      format: { type: "json_schema", schema: AI_DESIGNER_OUTPUT_SCHEMA as unknown as Record<string, unknown> },
    },
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages,
  });

  const final = await stream.finalMessage();

  if (final.stop_reason === "refusal") {
    throw new Error("AI požadavek odmítla z bezpečnostních důvodů. Zkuste jej přeformulovat.");
  }
  if (final.stop_reason === "max_tokens") {
    throw new Error("Odpověď překročila limit režimu — zkuste vyšší režim, nebo požadavek rozdělte.");
  }

  const text = final.content.find((b) => b.type === "text")?.text ?? "";
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(text);
  } catch {
    throw new Error("AI vrátila neplatný formát odpovědi.");
  }

  const wire = AiWireResponse.safeParse(parsedJson);
  if (!wire.success) {
    throw new Error(`AI odpověď neprošla validací: ${wire.error.issues[0]?.message ?? "neznámá chyba"}`);
  }

  const { operations, invalid } = parseWireOperations(wire.data);

  return {
    summary: wire.data.summary,
    operations,
    invalidOps: invalid,
    inputTokens: final.usage.input_tokens,
    outputTokens: final.usage.output_tokens,
  };
}
