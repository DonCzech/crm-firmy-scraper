/**
 * Vlastní kód tenanta (Shoptet-style "HTML kód / CSS styly / JavaScript").
 *
 * Uživatelé nemají přístup ke zdrojáku šablon — veškeré kódové úpravy dělají
 * přes tuto kolonku v administraci. Kód se vkládá POUZE do veřejných stránek
 * tenanta (web, podstránky, storefront /obchod, blog). Nikdy do admin, studio
 * ani login — tenantův JS tak nemůže manipulovat s administrací.
 *
 * Bezpečnostní model: autor kódu je majitel webu, kód běží na jeho vlastních
 * stránkách (stejně jako u Shoptetu). Chráníme platformu a návštěvníky:
 *   - tvrdé délkové limity (DoS/HTML bomby),
 *   - zákaz sekvencí, kterými by kód utekl ze svého <script>/<style> tagu,
 *   - zákaz vzorů cílících na platformní autentizaci a admin API,
 *   - externí skripty jen přes https,
 *   - CSS bez expression()/behavior/javascript: url,
 *   - audit log každé změny.
 */
import { query, queryOne } from "./db";

export interface TenantCustomCode {
  enabled: boolean;
  head_html: string;
  body_end_html: string;
  custom_css: string;
  custom_js: string;
  updated_at?: string;
}

export const EMPTY_CUSTOM_CODE: TenantCustomCode = {
  enabled: true,
  head_html: "",
  body_end_html: "",
  custom_css: "",
  custom_js: "",
};

export const CUSTOM_CODE_FIELD_LIMIT = 64 * 1024; // 64 KB na pole

// ── Validace ──────────────────────────────────────────────────────────────────

export interface CustomCodeValidationError {
  field: keyof TenantCustomCode | "general";
  message: string;
}

/** Vzory zakázané ve VŠECH polích — cílení na platformní autentizaci/admin. */
const PLATFORM_ATTACK_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /webero_access/i, label: "přístup k autentizačním cookies platformy (webero_access)" },
  { re: /\/api\/admin\b/i, label: "volání interního admin API (/api/admin)" },
  { re: /\/admin\/settings\/access\b/i, label: "manipulace s uživatelskými přístupy" },
];

/** Vzory zakázané v HTML polích. */
const HTML_FORBIDDEN: Array<{ re: RegExp; label: string }> = [
  { re: /<base\b/i, label: "tag <base> (přesměroval by všechny odkazy webu)" },
  { re: /javascript\s*:/i, label: "javascript: URL" },
  { re: /<script\b[^>]*\bsrc\s*=(?!\s*["']?https:\/\/)/i, label: "externí skript bez https:// (povolené jsou jen https zdroje)" },
  { re: /<meta\b[^>]*http-equiv\s*=\s*["']?refresh/i, label: "meta refresh přesměrování" },
];

/** Vzory zakázané v CSS. */
const CSS_FORBIDDEN: Array<{ re: RegExp; label: string }> = [
  { re: /<\/style/i, label: "sekvence </style (útěk ze style tagu)" },
  { re: /expression\s*\(/i, label: "CSS expression()" },
  { re: /behavior\s*:/i, label: "CSS behavior:" },
  { re: /-moz-binding/i, label: "-moz-binding" },
  { re: /javascript\s*:/i, label: "javascript: URL v CSS" },
  { re: /<script/i, label: "script tag v CSS" },
];

/** Vzory zakázané v JS poli. */
const JS_FORBIDDEN: Array<{ re: RegExp; label: string }> = [
  { re: /<\/script/i, label: "sekvence </script (útěk ze script tagu)" },
];

function checkPatterns(
  value: string,
  patterns: Array<{ re: RegExp; label: string }>,
  field: CustomCodeValidationError["field"],
  errors: CustomCodeValidationError[]
) {
  for (const p of patterns) {
    if (p.re.test(value)) errors.push({ field, message: `Zakázaný obsah: ${p.label}.` });
  }
}

export function validateCustomCode(input: TenantCustomCode): CustomCodeValidationError[] {
  const errors: CustomCodeValidationError[] = [];
  const fields: Array<[keyof TenantCustomCode, string]> = [
    ["head_html", input.head_html],
    ["body_end_html", input.body_end_html],
    ["custom_css", input.custom_css],
    ["custom_js", input.custom_js],
  ];

  for (const [field, value] of fields) {
    if (typeof value !== "string") {
      errors.push({ field, message: "Pole musí být text." });
      continue;
    }
    if (value.length > CUSTOM_CODE_FIELD_LIMIT) {
      errors.push({ field, message: `Maximální velikost pole je ${CUSTOM_CODE_FIELD_LIMIT / 1024} KB.` });
    }
    checkPatterns(value, PLATFORM_ATTACK_PATTERNS, field, errors);
  }

  checkPatterns(input.head_html, HTML_FORBIDDEN, "head_html", errors);
  checkPatterns(input.body_end_html, HTML_FORBIDDEN, "body_end_html", errors);
  checkPatterns(input.custom_css, CSS_FORBIDDEN, "custom_css", errors);
  checkPatterns(input.custom_js, JS_FORBIDDEN, "custom_js", errors);

  return errors;
}

// ── Read cache (60 s TTL, invalidace při zápisu) ──────────────────────────────

const CACHE_TTL_MS = 60 * 1000;
const cache = new Map<number, { data: TenantCustomCode | null; expires: number }>();

export async function getTenantCustomCode(tenantId: number): Promise<TenantCustomCode | null> {
  const now = Date.now();
  const hit = cache.get(tenantId);
  if (hit && hit.expires > now) return hit.data;

  const row = await queryOne<TenantCustomCode>(
    "SELECT enabled, head_html, body_end_html, custom_css, custom_js, updated_at FROM tenant_custom_code WHERE tenant_id = $1",
    [tenantId]
  ).catch(() => null);
  cache.set(tenantId, { data: row, expires: now + CACHE_TTL_MS });
  return row;
}

export function invalidateCustomCodeCache(tenantId?: number): void {
  if (typeof tenantId === "number") cache.delete(tenantId);
  else cache.clear();
}

export async function saveTenantCustomCode(
  tenantId: number,
  input: TenantCustomCode
): Promise<CustomCodeValidationError[]> {
  const errors = validateCustomCode(input);
  if (errors.length) return errors;

  await query(
    `INSERT INTO tenant_custom_code (tenant_id, enabled, head_html, body_end_html, custom_css, custom_js, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, now())
     ON CONFLICT (tenant_id) DO UPDATE SET
       enabled = EXCLUDED.enabled,
       head_html = EXCLUDED.head_html,
       body_end_html = EXCLUDED.body_end_html,
       custom_css = EXCLUDED.custom_css,
       custom_js = EXCLUDED.custom_js,
       updated_at = now()`,
    [tenantId, input.enabled !== false, input.head_html ?? "", input.body_end_html ?? "", input.custom_css ?? "", input.custom_js ?? ""]
  );
  invalidateCustomCodeCache(tenantId);
  return [];
}
