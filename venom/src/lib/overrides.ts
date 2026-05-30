export interface Override {
  target_type: string;
  target_id: string | null;
  field_path: string;
  value: unknown;
}

/**
 * Apply tenant overrides onto section content.
 * Pattern: finalValue = tenantOverride ?? templateDefault
 */
export function applyOverrides(
  content: Record<string, unknown>,
  overrides: Override[],
  sectionId: number
): Record<string, unknown> {
  if (!overrides.length) return content;

  const applicable = overrides.filter(
    (o) => o.target_type === "section" && (o.target_id === null || o.target_id === String(sectionId))
  );
  if (!applicable.length) return content;

  const result = { ...content };
  for (const override of applicable) {
    const parts = override.field_path.split(".");
    if (parts.length === 1) {
      result[parts[0]] = override.value;
    } else {
      let obj = result as Record<string, unknown>;
      for (let i = 0; i < parts.length - 1; i++) {
        obj[parts[i]] = { ...(obj[parts[i]] as Record<string, unknown> ?? {}) };
        obj = obj[parts[i]] as Record<string, unknown>;
      }
      obj[parts[parts.length - 1]] = override.value;
    }
  }
  return result;
}
