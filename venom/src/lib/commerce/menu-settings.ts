import type { Shop } from "./types";

/**
 * Webero Commerce — nastavení megamenu storefront navigace.
 * Ukládá se do shops.settings.megamenu (merge přes updateShop), čte se při
 * hydrataci navbar sekcí (section-data.ts) a v admin MenuTabu.
 *
 * Kategorie samotné (strom, pořadí, viditelnost, obrázky) se spravují
 * v záložce Kategorie — tady jsou jen věci navíc: odznaky, promo bannery,
 * vlastní odkazy a chování panelu.
 */

export type MenuBadgeTone = "accent" | "danger" | "success" | "neutral";

export interface MenuBadge {
  /** ID top-level kategorie, ke které odznak patří. */
  category_id: number;
  text: string;
  tone: MenuBadgeTone;
}

export interface MenuPromo {
  id: string;
  /** Slug top-level kategorie; null = výchozí promo pro všechny panely. */
  category_slug: string | null;
  image_url: string;
  title: string;
  subtitle: string;
  href: string;
}

export interface MenuCustomLink {
  label: string;
  href: string;
  tone: MenuBadgeTone;
}

export interface MegaMenuSettings {
  /** Kategorie skryté jen v menu (v katalogu zůstávají). */
  hidden_category_ids: number[];
  badges: MenuBadge[];
  promos: MenuPromo[];
  custom_links: MenuCustomLink[];
  /** Počty produktů u kategorií v panelu. */
  show_counts: boolean;
  /** Obrázky kategorií v panelu. */
  show_images: boolean;
  /** Max. hloubka stromu v panelu (2–3). */
  max_depth: number;
}

export const DEFAULT_MEGAMENU_SETTINGS: MegaMenuSettings = {
  hidden_category_ids: [],
  badges: [],
  promos: [],
  custom_links: [],
  show_counts: true,
  show_images: true,
  max_depth: 3,
};

const TONES: MenuBadgeTone[] = ["accent", "danger", "success", "neutral"];

function toIds(v: unknown, max: number): number[] {
  return Array.isArray(v)
    ? v.map((x) => Number(x)).filter((x) => Number.isInteger(x) && x > 0).slice(0, max)
    : [];
}

function toTone(v: unknown): MenuBadgeTone {
  return TONES.includes(v as MenuBadgeTone) ? (v as MenuBadgeTone) : "accent";
}

function cleanStr(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function normalizeMegaMenuSettings(raw: unknown): MegaMenuSettings {
  const s = (raw ?? {}) as Record<string, unknown>;
  const badges = Array.isArray(s.badges)
    ? s.badges
        .map((b) => {
          const rec = (b ?? {}) as Record<string, unknown>;
          return {
            category_id: Number(rec.category_id),
            text: cleanStr(rec.text, 24),
            tone: toTone(rec.tone),
          };
        })
        .filter((b) => Number.isInteger(b.category_id) && b.category_id > 0 && b.text.length > 0)
        .slice(0, 40)
    : [];
  const promos = Array.isArray(s.promos)
    ? s.promos
        .map((p) => {
          const rec = (p ?? {}) as Record<string, unknown>;
          const slug = cleanStr(rec.category_slug, 80);
          return {
            id: cleanStr(rec.id, 40) || Math.random().toString(36).slice(2, 10),
            category_slug: slug ? slug : null,
            image_url: cleanStr(rec.image_url, 500),
            title: cleanStr(rec.title, 80),
            subtitle: cleanStr(rec.subtitle, 140),
            href: cleanStr(rec.href, 500),
          };
        })
        .filter((p) => p.image_url.length > 0 || p.title.length > 0)
        .slice(0, 30)
    : [];
  const custom_links = Array.isArray(s.custom_links)
    ? s.custom_links
        .map((l) => {
          const rec = (l ?? {}) as Record<string, unknown>;
          return { label: cleanStr(rec.label, 40), href: cleanStr(rec.href, 500), tone: toTone(rec.tone) };
        })
        .filter((l) => l.label.length > 0 && l.href.length > 0)
        .slice(0, 12)
    : [];
  const depth = Number(s.max_depth);
  return {
    hidden_category_ids: toIds(s.hidden_category_ids, 200),
    badges,
    promos,
    custom_links,
    show_counts: s.show_counts !== false,
    show_images: s.show_images !== false,
    max_depth: Number.isInteger(depth) ? Math.min(3, Math.max(2, depth)) : DEFAULT_MEGAMENU_SETTINGS.max_depth,
  };
}

export function readMegaMenuSettings(shop: Shop): MegaMenuSettings {
  return normalizeMegaMenuSettings((shop.settings as { megamenu?: unknown })?.megamenu);
}
