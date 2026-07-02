"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, GripVertical } from "@/components/studio/icons";
import { useStudio } from "../StudioContext";
import { MediaPickerModal } from "../MediaPickerModal";
import { readFocus } from "@/lib/studio-focus";
import type { Section } from "@/lib/db";
import type { StudioState } from "../TenantStudioView";

interface GalleryImg { url: string; alt: string; isString: boolean; }

function normalizeGallery(raw: unknown): GalleryImg[] {
  if (!Array.isArray(raw)) return [];
  return (raw as unknown[])
    .map((item) =>
      typeof item === "string"
        ? { url: item, alt: "", isString: true }
        : {
            url: String((item as Record<string, unknown>).url ?? ""),
            alt: String((item as Record<string, unknown>).alt ?? ""),
            isString: false,
          }
    )
    .filter((img) => img.url);
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function GalleryInspectorPanel({
  section,
  state,
}: {
  section: Section;
  state: StudioState;
}) {
  const studio = useStudio();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const content = (section.settings?.content ?? {}) as Record<string, unknown>;
  const rawImages = (content.images as unknown[]) ?? [];
  const images = normalizeGallery(rawImages);

  function fieldFor(idx: number, img: GalleryImg) {
    return img.isString ? `images.${idx}` : `images.${idx}.url`;
  }

  function handleDelete(idx: number) {
    const next = rawImages.filter((_, i) => i !== idx);
    void state.patchSectionContent(section.id, "images", next);
    // Close floating panel if it was showing this image
    if (studio.imagePanel?.sectionId === section.id) {
      studio.setImagePanel(null);
    }
  }

  function handleAdd(url: string, alt: string) {
    const next = [...rawImages, { url, alt }];
    void state.patchSectionContent(section.id, "images", next);
  }

  function openFloatingPanel(idx: number, img: GalleryImg) {
    const field = fieldFor(idx, img);
    const savedFocus = readFocus(content, field) ?? { x: 50, y: 50 };

    // Find the actual DOM image in the canvas to position the panel next to it.
    // Fall back to near the right panel if the image isn't in the viewport.
    const PANEL_W = 300;
    const PANEL_MIN_H = 300;
    const RIGHT_PANEL_W = 268; // gallery inspector panel width
    let px = Math.max(8, window.innerWidth - RIGHT_PANEL_W - PANEL_W - 12);
    let py = Math.max(48, window.innerHeight / 2 - PANEL_MIN_H / 2);

    const sectionEl = document.querySelector(`[data-section-id="${section.id}"]`);
    if (sectionEl) {
      const allImgs = sectionEl.querySelectorAll("img");
      const domImg = Array.from(allImgs).find((el) => {
        const src = (el as HTMLImageElement).currentSrc || (el as HTMLImageElement).src;
        return src.includes(img.url) || img.url.includes(src.split("?")[0].split("/").pop() ?? "");
      }) as HTMLImageElement | null;
      if (domImg) {
        const rect = domImg.getBoundingClientRect();
        // Only use the DOM position if the image is currently visible in the viewport
        if (rect.width > 0 && rect.top > 0 && rect.bottom < window.innerHeight) {
          py = Math.max(48, Math.min(rect.top, window.innerHeight - PANEL_MIN_H - 8));
          const effectiveRight = window.innerWidth - RIGHT_PANEL_W;
          const spaceRight = effectiveRight - rect.right;
          px = spaceRight >= PANEL_W + 16
            ? rect.right + 8
            : Math.max(8, Math.min(rect.left - PANEL_W - 8, effectiveRight - PANEL_W - 8));
        }
      }
    }

    studio.setImagePanel({
      src: img.url,
      alt: img.alt,
      sectionId: section.id,
      panelPos: { x: px, y: py },
      focus: savedFocus,
      onReplace: (url: string, newAlt: string) => {
        if (img.isString) {
          void state.patchSectionContent(section.id, field, url);
        } else {
          void state.patchSectionContent(section.id, `images.${idx}`, { url, alt: newAlt });
        }
      },
      onFocusChange: (focus) => {
        const sectionEl = document.querySelector(`[data-section-id="${section.id}"]`);
        if (!sectionEl) return;
        const allImgs = sectionEl.querySelectorAll("img");
        const domImg = Array.from(allImgs).find(
          (el) => (el as HTMLImageElement).src.includes(img.url) || (el as HTMLImageElement).currentSrc.includes(img.url)
        ) as HTMLImageElement | null;
        if (domImg) domImg.style.objectPosition = `${focus.x}% ${focus.y}%`;
      },
      onFocusSave: (focus) => {
        if (!img.isString) {
          void state.patchSectionContent(section.id, `${field}Focus`, focus);
        }
      },
      onDelete: () => {
        handleDelete(idx);
      },
    });
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-[var(--vs-border)] px-3 py-2.5 flex items-baseline gap-2">
        <span className="text-[13px] font-semibold text-[var(--vs-text)]">Galerie</span>
        <span className="text-[11px] text-[var(--vs-text-muted)]">{images.length} {images.length === 1 ? "foto" : "fotek"}</span>
      </div>

      {/* Thumbnail grid */}
      <div className="flex-1 overflow-y-auto vs-scroll p-3">
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--vs-surface-2)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 text-[var(--vs-text-dim)]">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
                <path d="m3 15 5-5 4 4 3-3 5 5" />
              </svg>
            </div>
            <p className="text-[12.5px] text-[var(--vs-text-soft)]">Galerie je prázdná</p>
            <p className="text-[11px] text-[var(--vs-text-muted)] mt-0.5">Přidejte první fotku</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--vs-border)] bg-[var(--vs-surface-2)]"
              >
                <img
                  src={img.url}
                  alt={img.alt || `Foto ${idx + 1}`}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-colors duration-200" />
                {/* Action buttons */}
                <div className="absolute inset-0 flex items-center justify-center gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <button
                    type="button"
                    title="Upravit obrázek"
                    onClick={() => openFloatingPanel(idx, img)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-gray-800 shadow-lg hover:bg-white transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    title="Smazat foto"
                    onClick={() => handleDelete(idx)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/90 text-white shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
                {/* Index badge */}
                <span className="absolute bottom-1 left-1.5 text-[9px] font-semibold text-white/60 pointer-events-none select-none opacity-0 group-hover:opacity-100 transition-opacity">
                  {idx + 1}
                </span>
                {/* Drag handle hint */}
                <GripVertical className="absolute top-1 right-1 h-3.5 w-3.5 text-white/40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.75} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer — add button */}
      <div className="shrink-0 border-t border-[var(--vs-border)] p-3">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--vs-accent)] py-2.5 text-[13px] font-semibold text-white hover:bg-[var(--vs-accent-hi)] transition-colors active:scale-[.98]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Přidat obrázek
        </button>
      </div>

      {mounted && pickerOpen && (
        <MediaPickerModal
          tenantSlug={state.tenant.slug}
          onPick={handleAdd}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
