import type { BlogBlock } from "@/lib/blog/content";

/** Editor-side block: content block + stable uid for dnd-kit sorting. */
export interface EditorBlock extends BlogBlock {
  uid: string;
}

let counter = 0;
export function newUid(): string {
  counter += 1;
  return `b${Date.now().toString(36)}-${counter}`;
}

export function toEditorBlocks(blocks: BlogBlock[] | undefined): EditorBlock[] {
  const list = Array.isArray(blocks) ? blocks : [];
  return list.map((b) => ({ ...(typeof b === "string" ? { type: "text", text: b } : b), uid: newUid() }));
}

export function toContentBlocks(blocks: EditorBlock[]): BlogBlock[] {
  return blocks.map(({ uid: _uid, ...rest }) => rest);
}

export const BLOCK_LABELS: Record<string, string> = {
  text: "Odstavec",
  heading: "Nadpis",
  image: "Obrázek",
  gallery: "Galerie",
  quote: "Citát",
  list: "Seznam",
  cta: "CTA tlačítko",
  divider: "Oddělovač",
  video: "Video",
  code: "Kód",
};

export function defaultBlock(type: string): EditorBlock {
  const base: EditorBlock = { type, uid: newUid() };
  switch (type) {
    case "heading":
      base.level = 2;
      break;
    case "list":
      base.items = [""];
      base.ordered = false;
      break;
    case "gallery":
      base.images = [];
      break;
    case "cta":
      base.ctaText = "Kontaktujte nás";
      base.ctaHref = "";
      break;
  }
  return base;
}
