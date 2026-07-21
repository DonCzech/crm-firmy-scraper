"use client";

import { Children, cloneElement, isValidElement, useEffect, useRef, useState, type ReactElement } from "react";
import { createPortal } from "react-dom";
import { useGenericInlineEditor } from "./GenericInlineEditorContext";
import { useSectionContent } from "./SectionContentContext";
import { readFocus } from "@/lib/studio-focus";
import { CropEditor } from "@/components/studio/CropEditor";
import { getDimensionPreset, type ImageDimensionKey } from "@/lib/image-dimensions";

function currentTenantSlug() {
  if (typeof window === "undefined") return "";
  return window.location.pathname.split("/")[2] ?? "";
}

interface Props {
  sectionId: number;
  field: string;
  fullField?: string;
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  dimensions?: ImageDimensionKey | string;
  priority?: boolean;
  /** Saved focus point — applied as objectPosition to the child img in studio/public render */
  focus?: { x: number; y: number } | null;
}

function applyPriority(children: React.ReactNode): React.ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const element = child as ReactElement<Record<string, unknown>>;
    if (element.type === "img") {
      const merged = { ...element.props, loading: "eager", fetchPriority: "high" };
      return cloneElement(element, merged);
    }
    return element;
  });
}

function applyFocusToChildren(children: React.ReactNode, objectPosition: string): React.ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const el = child as ReactElement<Record<string, unknown>>;
    // Apply to plain <img> and Next.js Image (which accepts style prop)
    if (el.type === "img" || typeof el.type !== "string") {
      const prevStyle = (el.props.style as React.CSSProperties | undefined) ?? {};
      return cloneElement(el, { style: { ...prevStyle, objectPosition } });
    }
    return child;
  });
}

export function GenericEditableImage({ sectionId, field, fullField, src: _src, className, style, children, dimensions, priority, focus: focusProp }: Props) {
  const renderedChildren = priority ? applyPriority(children) : children;
  const { isAdmin, isStudio, updateField } = useGenericInlineEditor();
  // Auto-read focus from SectionContentContext if not explicitly provided
  const sectionContent = useSectionContent();
  const focus = focusProp ?? (sectionContent ? readFocus(sectionContent, field) : null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [slotDims, setSlotDims] = useState<{ w: number; h: number } | null>(null);
  const [cropPending, setCropPending] = useState<File | null>(null);

  useEffect(() => {
    if (!_src) {
      setDims(null);
      return;
    }
    const img = new window.Image();
    img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => setDims(null);
    img.src = _src;
  }, [_src]);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    if (dimensions && file.type !== "image/svg+xml") {
      setCropPending(file);
      return;
    }
    await uploadFile(file);
  }

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (dimensions) formData.append("dimensions", String(dimensions));
      const target = targetFromElement(wrapperRef.current);
      if (target) {
        formData.append("targetWidth", String(target.width));
        formData.append("targetHeight", String(target.height));
        formData.append("fit", imageFitFromStyle(style));
      }
      const tenantSlug = currentTenantSlug();
      if (tenantSlug) formData.append("tenantSlug", tenantSlug);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      if (fullField) {
        const fullFormData = new FormData();
        fullFormData.append("file", file);
        fullFormData.append("targetWidth", "1920");
        fullFormData.append("targetHeight", "1080");
        fullFormData.append("fit", "cover");
        if (tenantSlug) fullFormData.append("tenantSlug", tenantSlug);
        const fullRes = await fetch("/api/upload", { method: "POST", body: fullFormData });
        const fullData = await fullRes.json();
        if (!fullRes.ok) throw new Error(fullData.error ?? "Upload failed");
        if (fullData.url) updateField(sectionId, fullField, fullData.url, { recordHistory: false });
      }

      if (data.url) updateField(sectionId, field, data.url);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Obrázek se nepodařilo nahrát.");
    } finally {
      setUploading(false);
    }
  }

  if (!isAdmin || isStudio) {
    const objPos = focus ? `${focus.x}% ${focus.y}%` : undefined;
    const finalChildren = objPos ? applyFocusToChildren(renderedChildren, objPos) : renderedChildren;
    return (
      <div
        className={className}
        style={{ ...style, position: style?.position ?? "relative" }}
        data-studio-field={field}
        data-studio-section={sectionId}
      >
        {finalChildren}
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{ ...style, position: style?.position ?? "relative", cursor: "pointer" }}
      onMouseEnter={() => {
        setHovered(true);
        const target = targetFromElement(wrapperRef.current);
        setSlotDims(target ? { w: target.width, h: target.height } : null);
      }}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: 12,
          background: hovered ? "rgba(0,0,0,0.48)" : "transparent",
          color: "#fff",
          fontSize: 13,
          fontWeight: 700,
          transition: "background 0.2s ease",
          pointerEvents: "none",
        }}
      >
        {hovered && (
          <span
            style={{
              display: "grid",
              gap: 4,
              borderRadius: 10,
              background: "rgba(17, 24, 39, 0.88)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
              padding: "8px 10px",
              lineHeight: 1.1,
              textAlign: "right",
            }}
          >
            <span>{uploading ? "Nahrávám..." : "Změnit obrázek"}</span>
            {dims && (
              <span style={{ color: "rgba(255,255,255,0.72)", fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}>
                soubor {dims.w} x {dims.h} px
              </span>
            )}
            {slotDims && (
              <span style={{ color: "rgba(255,255,255,0.72)", fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}>
                pole {slotDims.w} x {slotDims.h} px
              </span>
            )}
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        aria-label="Změnit obrázek"
        style={fileInputStyle}
        onClick={(event) => event.stopPropagation()}
        onChange={handleFile}
      />
      {cropPending && typeof document !== "undefined" && createPortal(
        <CropEditor
          file={cropPending}
          aspect={getDimensionPreset(dimensions)?.aspect ?? null}
          onConfirm={(croppedFile) => { setCropPending(null); uploadFile(croppedFile); }}
          onCancel={() => setCropPending(null)}
        />,
        document.body
      )}
    </div>
  );
}

function targetFromElement(element: HTMLElement | null): { width: number; height: number } | null {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  const width = Math.round(rect.width);
  const height = Math.round(rect.height);
  if (width < 1 || height < 1) return null;
  return { width, height };
}

function imageFitFromStyle(style?: React.CSSProperties): "cover" | "contain" {
  return style?.objectFit === "contain" ? "contain" : "cover";
}

const fileInputStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  opacity: 0,
  cursor: "pointer",
  zIndex: 20,
};
