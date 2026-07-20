/**
 * AI Designér — povolené designové operace.
 *
 * TOHLE JE BEZPEČNOSTNÍ HRANICE CELÉ FUNKCE. Claude Opus nemá žádný přístup
 * k souborovému systému, kódu šablon ani jiným tenantům — jeho výstupem je
 * výhradně JSON pole operací, které:
 *   1. musí projít striktní Zod validací (neznámá operace = odmítnuto),
 *   2. server je aplikuje parametrizovanými dotazy VŽDY s tenant_id
 *      z autentizované session (nikdy z výstupu modelu),
 *   3. CSS/HTML prochází stejnými filtry jako ruční "vlastní kód" tenanta
 *      + sanitize-html whitelistem.
 *
 * Šablony (soubory) zůstávají nedotčené — všechno jsou per-tenant DB vrstvy,
 * které se při aktualizaci šablony zachovávají (pattern templateDefault ??
 * tenantOverride).
 */
import { z } from "zod";

// ── Pomocné validátory ────────────────────────────────────────────────────────

const FORBIDDEN_PATH_SEGMENTS = new Set(["__proto__", "constructor", "prototype"]);

const FieldPath = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-zA-Z0-9_][a-zA-Z0-9_.\-]*$/, "Neplatná cesta pole")
  .refine(
    (p) => p.split(".").every((seg) => !FORBIDDEN_PATH_SEGMENTS.has(seg)),
    "Zakázaný segment cesty"
  );

const ScalarValue = z.union([z.string().max(4000), z.number(), z.boolean(), z.null()]);

const TokenKey = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-zA-Z][a-zA-Z0-9_.\-]*$/)
  .refine((k) => !FORBIDDEN_PATH_SEGMENTS.has(k));

const BlockId = z.string().min(1).max(60).regex(/^[a-z0-9\-]+$/);

// ── Operace ───────────────────────────────────────────────────────────────────

const TokenPair = z.object({
  key: TokenKey,
  value: z.union([z.string().max(400), z.number(), z.boolean()]),
})

export const SetDesignTokensOp = z.object({
  op: z.literal("set_design_tokens"),
  /** patch globálních design tokenů (colorPrimary, fontHeading, borderRadius, …) */
  pairs: z.array(TokenPair).min(1).max(40),
})

export const SetContentOverrideOp = z.object({
  op: z.literal("set_content_override"),
  /** id sekce jako string, nebo null = platí pro všechny sekce */
  section_id: z.union([z.string().regex(/^\d+$/), z.number().int().positive(), z.null()]),
  field_path: FieldPath,
  value: ScalarValue,
})

export const SetSectionSettingsOp = z.object({
  op: z.literal("set_section_settings"),
  section_id: z.coerce.number().int().positive(),
  /** mělký patch settings sekce (bez designTokens — na ty je set_design_tokens) */
  pairs: z.array(z.object({ key: FieldPath, value: ScalarValue })).min(1).max(40),
})

export const SetSectionVisibilityOp = z.object({
  op: z.literal("set_section_visibility"),
  section_id: z.coerce.number().int().positive(),
  visible: z.boolean(),
})

export const ReorderSectionOp = z.object({
  op: z.literal("reorder_section"),
  section_id: z.coerce.number().int().positive(),
  new_index: z.number().int().min(0).max(200),
})

export const SetCssOp = z.object({
  op: z.literal("set_css"),
  /**
   * Kompletní obsah AI-spravovaného CSS bloku (nahrazuje předchozí).
   * Vkládá se POUZE do veřejných stránek tenanta, nikdy do admin/studio.
   */
  css: z.string().max(48_000),
})

export const AddHtmlBlockOp = z.object({
  op: z.literal("add_html_block"),
  /** stabilní id bloku (kebab-case) — umožňuje pozdější update/smazání */
  block_id: BlockId,
  /** HTML prvku (banner, badge, floating CTA…) — projde sanitizací */
  html: z.string().max(16_000),
})

export const RemoveHtmlBlockOp = z.object({
  op: z.literal("remove_html_block"),
  block_id: BlockId,
});

// ── Stavba webu (v2 — "z kavárny letadlo") ───────────────────────────────────

const PageSlug = z.string().min(1).max(80).regex(/^[a-z0-9][a-z0-9\-]*$/, "Slug: jen a-z, 0-9, pomlčky");
const SectionType = z.string().min(1).max(50).regex(/^[a-z0-9\-]+$/);

export const CreatePageOp = z.object({
  op: z.literal("create_page"),
  slug: PageSlug,
  title: z.string().min(1).max(200),
})

export const DeletePageOp = z.object({
  op: z.literal("delete_page"),
  page_id: z.coerce.number().int().positive(),
})

export const AddSectionOp = z.object({
  op: z.literal("add_section"),
  /** id existující stránky, NEBO page_slug (i stránky vytvořené v této dávce) */
  page_id: z.union([z.coerce.number().int().positive(), z.null()]).default(null),
  page_slug: z.union([PageSlug, z.null()]).default(null),
  section_type: SectionType,
  section_variant: z.string().min(1).max(60).regex(/^[a-z0-9\-]+$/).default("default"),
  /** pozice v rámci stránky (0 = nahoře); větší číslo než počet sekcí = na konec */
  position: z.number().int().min(0).max(200),
  /** JSON string s obsahem sekce (settings.content) — projde sanitizací */
  content_json: z.string().max(24_000).default("{}"),
})

export const RemoveSectionOp = z.object({
  op: z.literal("remove_section"),
  section_id: z.coerce.number().int().positive(),
})

export const DuplicateSectionOp = z.object({
  op: z.literal("duplicate_section"),
  section_id: z.coerce.number().int().positive(),
  position: z.number().int().min(0).max(200),
})

export const AddCustomSectionOp = z.object({
  op: z.literal("add_custom_section"),
  page_id: z.union([z.coerce.number().int().positive(), z.null()]).default(null),
  page_slug: z.union([PageSlug, z.null()]).default(null),
  position: z.number().int().min(0).max(200),
  /** krátký název pro Studio (např. "Letecká flotila") */
  name: z.string().min(1).max(120),
  /** HTML sekce — projde sanitizací (žádné skripty) */
  html: z.string().min(1).max(32_000),
  /** CSS sekce — selektory scopuj pod [data-ai-sec] */
  css: z.string().max(24_000).default(""),
})

export const UpdateCustomSectionOp = z.object({
  op: z.literal("update_custom_section"),
  section_id: z.coerce.number().int().positive(),
  html: z.union([z.string().min(1).max(32_000), z.null()]).default(null),
  css: z.union([z.string().max(24_000), z.null()]).default(null),
})

export const SetModuleOp = z.object({
  op: z.literal("set_module"),
  module_key: z.enum(["blog", "advanced-seo", "gallery", "testimonials", "rezora", "analytics", "forms", "newsletter"]),
  enabled: z.boolean(),
})

export const EnableShopOp = z.object({
  op: z.literal("enable_shop"),
  shop_name: z.string().min(1).max(120),
})

export const CreateCategoryOp = z.object({
  op: z.literal("create_category"),
  name: z.string().min(1).max(120),
})

export const CreateProductOp = z.object({
  op: z.literal("create_product"),
  title: z.string().min(1).max(200),
  price_czk: z.number().min(0).max(10_000_000),
  description: z.union([z.string().max(4000), z.null()]).default(null),
  category_name: z.union([z.string().min(1).max(120), z.null()]).default(null),
})

export const DesignOperation = z.discriminatedUnion("op", [
  SetDesignTokensOp,
  SetContentOverrideOp,
  SetSectionSettingsOp,
  SetSectionVisibilityOp,
  ReorderSectionOp,
  SetCssOp,
  AddHtmlBlockOp,
  RemoveHtmlBlockOp,
  CreatePageOp,
  DeletePageOp,
  AddSectionOp,
  RemoveSectionOp,
  DuplicateSectionOp,
  AddCustomSectionOp,
  UpdateCustomSectionOp,
  SetModuleOp,
  EnableShopOp,
  CreateCategoryOp,
  CreateProductOp,
]);

export type DesignOperationT = z.infer<typeof DesignOperation>;

export const AiDesignerResponse = z.object({
  /** Krátké česky psané shrnutí změn pro uživatele. */
  summary: z.string().min(1).max(2000),
  operations: z.array(DesignOperation).min(0).max(60),
});

export type AiDesignerResponseT = z.infer<typeof AiDesignerResponse>;

// ── JSON schema pro structured output (output_config.format) ─────────────────
// Minimální obálka {op, args:string} — bohatší tvary překračovaly limit
// kompilované gramatiky structured outputs ("Schema is too complex").
// Skutečná (bezpečnostní) validace operací je Zod výše — engine args
// rozparsuje a validuje přes AiDesignerResponse.

export const AI_DESIGNER_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    summary: {
      type: "string",
      description: "Krátké shrnutí provedených změn v češtině, pro uživatele.",
    },
    operations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          op: {
            enum: [
              "set_design_tokens", "set_content_override", "set_section_settings",
              "set_section_visibility", "reorder_section", "set_css",
              "add_html_block", "remove_html_block",
              "create_page", "delete_page", "add_section", "remove_section",
              "duplicate_section", "add_custom_section", "update_custom_section",
              "set_module", "enable_shop", "create_category", "create_product",
            ],
          },
          args: {
            type: "string",
            description:
              "JSON objekt s poli operace, serializovaný jako string. Pole podle op: " +
              "set_design_tokens={pairs:[{key,value}]}; " +
              "set_content_override={section_id:string|null,field_path,value}; " +
              "set_section_settings={section_id:int,pairs:[{key,value}]}; " +
              "set_section_visibility={section_id:int,visible:bool}; " +
              "reorder_section={section_id:int,new_index:int}; " +
              "set_css={css}; add_html_block={block_id,html}; remove_html_block={block_id}; " +
              "create_page={slug,title}; delete_page={page_id:int}; " +
              "add_section={page_id:int|null,page_slug:string|null,section_type,section_variant,position:int,content_json:string}; " +
              "remove_section={section_id:int}; duplicate_section={section_id:int,position:int}; " +
              "add_custom_section={page_id:int|null,page_slug:string|null,position:int,name,html,css}; " +
              "update_custom_section={section_id:int,html:string|null,css:string|null}; " +
              "set_module={module_key,enabled:bool}; enable_shop={shop_name}; " +
              "create_category={name}; create_product={title,price_czk:number,description:string|null,category_name:string|null}.",
          },
        },
        required: ["op", "args"],
        additionalProperties: false,
      },
    },
  },
  required: ["summary", "operations"],
  additionalProperties: false,
} as const;

// ── Wire formát → validované operace ─────────────────────────────────────────

export const AiWireResponse = z.object({
  summary: z.string().min(1).max(2000),
  operations: z.array(z.object({ op: z.string().max(60), args: z.string().max(64_000) })).max(200),
});

/**
 * Převede wire tvar {op, args-json-string} na validované DesignOperation[].
 * Neplatné operace se nevyhazují jako celek — vrací se seznam chyb, aby
 * jedna rozbitá operace neshodila celý (zaplacený) požadavek.
 */
export function parseWireOperations(wire: z.infer<typeof AiWireResponse>): {
  operations: DesignOperationT[];
  invalid: Array<{ op: string; reason: string }>;
} {
  const operations: DesignOperationT[] = [];
  const invalid: Array<{ op: string; reason: string }> = [];
  // tvrdý strop 150 aplikovaných operací na požadavek (ochrana serveru)
  for (const item of wire.operations.slice(0, 150)) {
    let args: unknown = {};
    try {
      args = item.args.trim() ? JSON.parse(item.args) : {};
    } catch {
      invalid.push({ op: item.op, reason: "args není platný JSON" });
      continue;
    }
    if (args === null || typeof args !== "object" || Array.isArray(args)) {
      invalid.push({ op: item.op, reason: "args musí být objekt" });
      continue;
    }
    const candidate = { op: item.op, ...(args as Record<string, unknown>) };
    const parsed = DesignOperation.safeParse(candidate);
    if (!parsed.success) {
      invalid.push({ op: item.op, reason: parsed.error.issues[0]?.message ?? "validace selhala" });
      continue;
    }
    operations.push(parsed.data);
  }
  return { operations, invalid };
}
