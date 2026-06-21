/**
 * F3 — Image slot registry.
 *
 * Předdefinované rozměry per use-case (gallery tile, hero, navbar logo, …).
 * Frontend uploadery předávají `slot="gallery-tile"` místo manuálního targetWidth/Height.
 * uploadMedia() pak automaticky resize na přesný pixel rozměr + WebP konverzi.
 *
 * Cíl: žádný 2800×1800 PNG nikdy neopustí uploader. Vždy konvertováno na WebP
 * + resize na slot dimensions → optimální server cost + LCP score.
 */

export interface ImageSlot {
  key: string;
  width: number;
  height: number;
  fit: "cover" | "contain";
  responsive?: boolean;
  /** Responsive widths (px) for srcset. Default: [320, 640, 960, 1280, 1920]. */
  widths?: number[];
  label: string;
  description?: string;
}

export const IMAGE_SLOTS: Record<string, ImageSlot> = {
  // ── Hero ────────────────────────────────────────────────────────────────────
  "hero-fullscreen":   { key: "hero-fullscreen",   width: 1920, height: 1080, fit: "cover", responsive: true, label: "Hero fullscreen 16:9" },
  "hero-banner":       { key: "hero-banner",       width: 1920, height: 720,  fit: "cover", responsive: true, label: "Hero banner ultra-wide" },
  "hero-slide":        { key: "hero-slide",        width: 1920, height: 900,  fit: "cover", responsive: true, label: "Hero slider slide" },

  // ── Gallery ─────────────────────────────────────────────────────────────────
  "gallery-tile-square": { key: "gallery-tile-square", width: 500,  height: 500, fit: "cover", responsive: true, widths: [250, 500, 1000], label: "Galerie 1:1" },
  "gallery-tile-3x2":    { key: "gallery-tile-3x2",    width: 600,  height: 400, fit: "cover", responsive: true, widths: [300, 600, 1200], label: "Galerie 3:2" },
  "gallery-tile-4x3":    { key: "gallery-tile-4x3",    width: 800,  height: 600, fit: "cover", responsive: true, widths: [400, 800, 1600], label: "Galerie 4:3" },
  "gallery-portrait":    { key: "gallery-portrait",    width: 600,  height: 900, fit: "cover", responsive: true, widths: [300, 600, 1200], label: "Galerie portrét 2:3" },
  "gallery-lightbox":    { key: "gallery-lightbox",    width: 1600, height: 1200, fit: "contain", responsive: true, label: "Lightbox full-size" },

  // ── Services / Cards ────────────────────────────────────────────────────────
  "service-card":      { key: "service-card",      width: 600,  height: 400, fit: "cover", responsive: true, widths: [300, 600, 1200], label: "Service karta 3:2" },
  "service-icon":      { key: "service-icon",      width: 200,  height: 200, fit: "contain", label: "Service ikona" },
  "feature-thumb":     { key: "feature-thumb",     width: 400,  height: 300, fit: "cover", label: "Feature thumb 4:3" },

  // ── Team / People ───────────────────────────────────────────────────────────
  "team-portrait":     { key: "team-portrait",     width: 400,  height: 500, fit: "cover", responsive: true, widths: [200, 400, 800], label: "Tým portrét 4:5" },
  "team-thumb":        { key: "team-thumb",        width: 200,  height: 200, fit: "cover", label: "Tým thumb 1:1" },

  // ── Branding ────────────────────────────────────────────────────────────────
  "logo-horizontal":   { key: "logo-horizontal",   width: 400,  height: 120, fit: "contain", label: "Logo horizontální" },
  "logo-square":       { key: "logo-square",       width: 240,  height: 240, fit: "contain", label: "Logo čtvercové" },
  "favicon":           { key: "favicon",           width: 512,  height: 512, fit: "cover", label: "Favicon 512×512" },

  // ── Blog ────────────────────────────────────────────────────────────────────
  "blog-featured":     { key: "blog-featured",     width: 1200, height: 630, fit: "cover", responsive: true, label: "Blog featured (OG)" },
  "blog-card":         { key: "blog-card",         width: 600,  height: 400, fit: "cover", responsive: true, widths: [300, 600, 1200], label: "Blog karta" },

  // ── Social / Open Graph ─────────────────────────────────────────────────────
  "og-image":          { key: "og-image",          width: 1200, height: 630, fit: "cover", label: "Open Graph 1.91:1" },

  // ── Backgrounds ─────────────────────────────────────────────────────────────
  "section-bg":        { key: "section-bg",        width: 1920, height: 1080, fit: "cover", responsive: true, label: "Pozadí sekce" },
  "cta-bg":            { key: "cta-bg",            width: 1920, height: 600,  fit: "cover", responsive: true, label: "CTA pozadí" },

  // ── Misc ────────────────────────────────────────────────────────────────────
  "testimonial-avatar": { key: "testimonial-avatar", width: 120, height: 120, fit: "cover", label: "Avatar reference" },
  "partner-logo":       { key: "partner-logo",       width: 240, height: 120, fit: "contain", label: "Partner logo" },
};

export function getImageSlot(key: string): ImageSlot | undefined {
  return IMAGE_SLOTS[key];
}

export function isValidImageSlot(key: string): boolean {
  return key in IMAGE_SLOTS;
}

/** Map slot key → uploadMedia options shape for direct passthrough. */
export function slotToUploadOptions(slotKey: string) {
  const slot = IMAGE_SLOTS[slotKey];
  if (!slot) throw new Error(`Unknown image slot: ${slotKey}`);
  return {
    targetWidth: slot.width,
    targetHeight: slot.height,
    fit: slot.fit,
    responsive: slot.responsive ?? false,
    widths: slot.widths,
  };
}
