/**
 * Blog content model — a post body is an ordered array of JSON blocks.
 * Strings inside blocks may contain a safe HTML subset (sanitized on write
 * via sanitizeRichContent and re-sanitized on render).
 */

export interface BlogBlock {
  type: string;
  /** text | heading | quote | code */
  text?: string;
  /** heading level: 2 | 3 */
  level?: number;
  /** image / video */
  url?: string;
  alt?: string;
  caption?: string;
  /** gallery */
  images?: { url: string; alt?: string }[];
  /** list */
  items?: string[];
  ordered?: boolean;
  /** cta */
  ctaText?: string;
  ctaHref?: string;
  /** quote attribution */
  cite?: string;
}

export const BLOCK_TYPES = [
  "text",
  "heading",
  "image",
  "gallery",
  "quote",
  "list",
  "cta",
  "divider",
  "video",
  "code",
] as const;

function blockPlainText(block: BlogBlock): string {
  const parts: string[] = [];
  if (block.text) parts.push(block.text);
  if (block.items) parts.push(...block.items);
  if (block.caption) parts.push(block.caption);
  return parts.join(" ").replace(/<[^>]*>/g, " ");
}

export function wordCount(blocks: BlogBlock[]): number {
  return blocks
    .map(blockPlainText)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/** ~200 words per minute, minimum 1 minute. */
export function readingTimeMinutes(blocks: BlogBlock[]): number {
  return Math.max(1, Math.round(wordCount(blocks) / 200));
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function headingId(text: string, index: number): string {
  const slug = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || `sekce-${index}`;
}

export function extractToc(blocks: BlogBlock[]): TocItem[] {
  const toc: TocItem[] = [];
  blocks.forEach((b, i) => {
    if (b.type === "heading" && b.text) {
      toc.push({
        id: headingId(b.text, i),
        text: b.text.replace(/<[^>]*>/g, ""),
        level: b.level === 3 ? 3 : 2,
      });
    }
  });
  return toc;
}

/** Extract an embeddable URL from a YouTube/Vimeo link; null when unsupported. */
export function videoEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v") ?? (u.pathname.startsWith("/shorts/") ? u.pathname.split("/")[2] : null);
      if (id && /^[\w-]{5,20}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      if (/^[\w-]{5,20}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id && /^\d{5,15}$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
    return null;
  } catch {
    return null;
  }
}
