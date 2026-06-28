"use client";

import { useRef, useState, type ReactNode } from "react";
import { useGenericInlineEditor } from "./GenericInlineEditorContext";

interface Props {
  sectionId: number;
  /** Content field path that holds the URL (passed to updateField on upload). */
  field: string;
  /** Current URL — used only to size the upload target. The visible background
   *  is set by the child element itself, not by this wrapper. */
  value?: string;
  /** Wrapper className (forwarded). */
  className?: string;
  /** Wrapper inline style (forwarded). */
  style?: React.CSSProperties;
  children: ReactNode;
}

function currentTenantSlug() {
  if (typeof window === "undefined") return "";
  return window.location.pathname.split("/")[2] ?? "";
}

/**
 * Editor wrapper for elements that show their image via CSS `background-image`
 * (hero overlays, parallax sections, full-bleed sections that are not <img>).
 *
 * The wrapper itself is `display: contents` in non-admin so layout stays
 * identical to before. In admin mode it becomes a positioned container that
 * renders a hover overlay with an upload button. The upload re-uses the same
 * `/api/upload` endpoint used by `GenericEditableImage`; the resulting URL is
 * persisted via `updateField(sectionId, field, url)` — letting the template
 * re-derive its `backgroundImage: url(<value>)` style on next render.
 */
export function GenericEditableBackground({ sectionId, field, value, className, style, children }: Props) {
  const { isAdmin, isStudio, updateField } = useGenericInlineEditor();
  const fileRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!isAdmin || isStudio) {
    // Outside admin mode, render children as-is with no wrapper interference.
    return <>{children}</>;
  }

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    setUploading(true);
    try {
      const tenantSlug = currentTenantSlug();
      const formData = new FormData();
      formData.append("file", file);
      // Best-effort size hint from wrapper geometry.
      const el = wrapperRef.current;
      if (el) {
        formData.append("targetWidth", String(Math.max(640, el.clientWidth || 1920)));
        formData.append("targetHeight", String(Math.max(360, el.clientHeight || 1080)));
        formData.append("fit", "cover");
      }
      if (tenantSlug) formData.append("tenantSlug", tenantSlug);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      if (data.url) updateField(sectionId, field, data.url);
    } catch (err) {
      // Keep simple — error visible in network tab; UI just resets.
      // Could surface via toast later.
      console.error("[GenericEditableBackground] upload failed", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{ ...style, position: style?.position ?? "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-bg-edit
      data-bg-edit-section={sectionId}
      data-bg-edit-field={field}
    >
      {children}
      {/* Overlay control — only visible on hover so it doesn't obscure design.
          z-index high enough to sit above any decorative overlays inside child. */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(15, 23, 42, 0.9)",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
            pointerEvents: "none",
            letterSpacing: "0.02em",
          }}
        >
          {uploading ? "Nahrávám…" : "Klikni pro změnu pozadí"}
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        aria-label="Změnit pozadí"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          cursor: "pointer",
          zIndex: 999,
        }}
        onChange={handleFile}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
