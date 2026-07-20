import sanitizeHtml from "sanitize-html";

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "b", "em", "i", "u", "s", "blockquote", "code", "pre",
    "ul", "ol", "li", "h2", "h3", "h4", "a", "span", "div", "table", "thead",
    "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "title"],
    "*": ["class"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { a: ["http", "https", "mailto", "tel"] },
  allowProtocolRelative: false,
  transformTags: {
    a: (_tagName, attribs) => ({
      tagName: "a",
      attribs: {
        ...attribs,
        ...(attribs.target === "_blank" ? { rel: "noopener noreferrer" } : {}),
      },
    }),
  },
};

export function sanitizeRichHtml(value: string): string {
  return sanitizeHtml(value, OPTIONS);
}

export function stripHtml(value: string): string {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} });
}

export function sanitizeRichContent<T>(value: T): T {
  if (typeof value === "string") {
    return (/<\/?[a-z][\s\S]*>/i.test(value) ? sanitizeRichHtml(value) : value) as T;
  }
  if (Array.isArray(value)) return value.map((item) => sanitizeRichContent(item)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, sanitizeRichContent(item)]),
    ) as T;
  }
  return value;
}
