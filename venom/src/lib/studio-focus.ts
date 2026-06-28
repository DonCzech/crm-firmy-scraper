/**
 * Navigate a dotted path into a nested object/array and return the value.
 * "cards.0.bgImage" → obj.cards[0].bgImage
 */
function getNestedValue(obj: unknown, path: string): unknown {
  let cur: unknown = obj;
  for (const part of path.split(".")) {
    if (cur === null || cur === undefined) return undefined;
    if (Array.isArray(cur)) {
      cur = cur[parseInt(part, 10)];
    } else if (typeof cur === "object") {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return cur;
}

/**
 * Immutably set a value at a dotted path in a nested object/array structure.
 * "cards.0.bgImage" → { ...obj, cards: [ { ...cards[0], bgImage: value }, ... ] }
 */
export function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const parts = path.split(".");
  const [head, ...rest] = parts;
  if (rest.length === 0) return { ...obj, [head]: value };

  const child = obj[head];
  if (Array.isArray(child) && !isNaN(Number(rest[0]))) {
    const idx = Number(rest[0]);
    const arr = [...child];
    if (rest.length === 1) {
      arr[idx] = value;
    } else {
      arr[idx] = setNestedValue(
        (typeof arr[idx] === "object" && arr[idx] !== null && !Array.isArray(arr[idx])
          ? arr[idx]
          : {}) as Record<string, unknown>,
        rest.slice(1).join("."),
        value
      );
    }
    return { ...obj, [head]: arr };
  }

  const childObj =
    typeof child === "object" && child !== null && !Array.isArray(child)
      ? (child as Record<string, unknown>)
      : {};
  return { ...obj, [head]: setNestedValue(childObj, rest.join("."), value) };
}

/**
 * Normalise an image src so it can be compared against stored content values.
 * /_next/image?url=%2Fpath%2Ffoo.jpg → /path/foo.jpg
 * http://host/path/foo.jpg           → /path/foo.jpg
 */
function normalizeSrc(rawSrc: string): string {
  try {
    const u = new URL(rawSrc, "http://x");
    if (u.pathname === "/_next/image") {
      const p = u.searchParams.get("url");
      if (p) return decodeURIComponent(p).split("?")[0];
    }
    return u.pathname;
  } catch {
    return rawSrc.split("?")[0];
  }
}

/**
 * Recursively search section content for a string field whose value matches
 * the given image src.  Returns the dotted path ("image", "cards.0.bgImage")
 * or null if no match found.
 */
export function findFieldBySrc(
  content: Record<string, unknown>,
  imgSrc: string,
  prefix = ""
): string | null {
  const needle = normalizeSrc(imgSrc);
  for (const [key, value] of Object.entries(content)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      const normalizedValue = value.startsWith("http") ? normalizeSrc(value) : value.split("?")[0];
      if (normalizedValue && needle && (normalizedValue === needle || needle.endsWith(normalizedValue) || normalizedValue.endsWith(needle))) {
        return path;
      }
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (typeof item === "object" && item !== null && !Array.isArray(item)) {
          const found = findFieldBySrc(item as Record<string, unknown>, imgSrc, `${path}.${i}`);
          if (found) return found;
        }
      }
    } else if (typeof value === "object" && value !== null) {
      const found = findFieldBySrc(value as Record<string, unknown>, imgSrc, path);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Reads a saved image focus point from section content.
 * field "image" → reads content.imageFocus
 * field "cards.0.bgImage" → reads content.cards[0].bgImageFocus
 */
export function readFocus(
  content: Record<string, unknown>,
  field: string
): { x: number; y: number } | null {
  // Build the focus path: last segment gets "Focus" appended
  const parts = field.split(".");
  const focusPath = [...parts.slice(0, -1), parts[parts.length - 1] + "Focus"].join(".");
  const raw = getNestedValue(content, focusPath);
  if (raw && typeof raw === "object" && "x" in raw && "y" in raw) {
    const f = raw as { x: unknown; y: unknown };
    if (typeof f.x === "number" && typeof f.y === "number") return { x: f.x, y: f.y };
  }
  return null;
}
