"use client";
import { useRef, useState, useEffect } from "react";
import { useContent } from "@/context/ContentContext";
import { SiteContent } from "@/lib/content-types";
import { OptimizedPicture } from "@/components/OptimizedPicture";

function currentTenantSlug() {
  if (typeof window === "undefined") return "";
  return window.location.pathname.split("/")[2] ?? "";
}

function getPath(obj: any, path: string): string {
  return String(path.split(".").reduce((o: any, k: string) => o?.[k], obj) ?? "");
}

function setPath(obj: any, path: string, val: string): any {
  const parts = path.split(".");
  const root = Array.isArray(obj) ? [...obj] : { ...(obj ?? {}) };
  let current: any = root;

  parts.forEach((part, index) => {
    const key = Array.isArray(current) ? Number(part) : part;
    if (index === parts.length - 1) {
      current[key] = val;
      return;
    }

    const next = current[key];
    const nextPart = parts[index + 1];
    current[key] = Array.isArray(next)
      ? [...next]
      : next && typeof next === "object"
        ? { ...next }
        : /^\d+$/.test(nextPart)
          ? []
          : {};
    current = current[key];
  });

  return root;
}

function isHighlighted(paths: string[], section: keyof SiteContent, field: string) {
  const fullPath = `${String(section)}.${field}`;
  return paths.some(path => path === String(section) || path === fullPath || fullPath.startsWith(`${path}.`));
}

interface Props {
  section: keyof SiteContent;
  field: string;
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function EditableImg({ section, field, alt, style, className }: Props) {
  const { content, admin, updateSection, highlightedPaths } = useContent();
  const fileRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [slotDims, setSlotDims] = useState<{ w: number; h: number } | null>(null);

  const src = localPreview ?? getPath(content[section], field);
  const highlighted = admin.isAdmin && isHighlighted(highlightedPaths, section, field);

  useEffect(() => {
    if (!src) { setDims(null); return; }
    const img = new window.Image();
    img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => setDims(null);
    img.src = src;
  }, [src]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediate local preview
    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) setLocalPreview(ev.target.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const target = targetFromElement(wrapperRef.current);
    if (target) {
      fd.append("targetWidth", String(target.width));
      fd.append("targetHeight", String(target.height));
      fd.append("fit", imageFitFromStyle(style));
    }
    const tenantSlug = currentTenantSlug();
    if (tenantSlug) fd.append("tenantSlug", tenantSlug);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      if (data.url) {
        updateSection(section, setPath(content[section], field, data.url), field);
        setLocalPreview(null); // clear local preview, use real URL
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Obrázek se nepodařilo nahrát.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  // Non-admin: render plain img
  if (!admin.isAdmin) {
    return <OptimizedPicture src={src} alt={alt} style={style} className={className} />;
  }

  // Admin mode: wrap with hover overlay
  // Preserve all layout-affecting styles on the wrapper
  const wrapStyle: React.CSSProperties = {
    ...style,
    position: style?.position === "absolute" || style?.position === "fixed"
      ? style.position
      : "relative",
    cursor: "pointer",
    outline: highlighted ? "3px solid rgba(245, 158, 11, 0.95)" : undefined,
    outlineOffset: 3,
    boxShadow: highlighted ? "0 0 0 7px rgba(245, 158, 11, 0.18)" : undefined,
    transition: "outline-color 0.2s ease, box-shadow 0.25s ease",
  };

  return (
    <div
      ref={wrapperRef}
      style={wrapStyle}
      className={className}
      onMouseEnter={() => {
        setHovered(true);
        const target = targetFromElement(wrapperRef.current);
        setSlotDims(target ? { w: target.width, h: target.height } : null);
      }}
      onMouseLeave={() => setHovered(false)}
    >
      <OptimizedPicture
        src={src}
        alt={alt}
        imgStyle={{
          display: "block",
          width: "100%",
          height: style?.height || "auto",
          borderRadius: style?.borderRadius,
          objectFit: (style as any)?.objectFit,
          objectPosition: (style as any)?.objectPosition,
        }}
      />

      {/* Hover overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: hovered ? "rgba(0,0,0,0.52)" : "transparent",
          borderRadius: style?.borderRadius,
          transition: "background 0.2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {hovered && (
          <>
            {uploading ? (
              <div style={{ color: "#fff", fontSize: 13, fontFamily: "'Poppins', sans-serif", background: "rgba(0,0,0,0.5)", padding: "8px 14px", borderRadius: 8 }}>
                Nahrávám…
              </div>
            ) : (
              <>
                <div style={{ fontSize: 32 }}>📷</div>
                <div style={{ color: "#fff", fontSize: 13, fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>Změnit obrázek</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "'Poppins', sans-serif" }}>klikni pro výběr souboru</div>
                {dims && (
                  <div style={{ color: "#fff", fontSize: 11, fontFamily: "monospace", fontWeight: 700, background: "rgba(0,0,0,0.45)", borderRadius: 4, padding: "2px 8px", marginTop: 4 }}>
                    soubor {dims.w} x {dims.h} px
                  </div>
                )}
                {slotDims && (
                  <div style={{ color: "#fff", fontSize: 11, fontFamily: "monospace", fontWeight: 700, background: "rgba(0,0,0,0.45)", borderRadius: 4, padding: "2px 8px" }}>
                    pole {slotDims.w} x {slotDims.h} px
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        aria-label="Změnit obrázek"
        style={fileInputStyle}
        onClick={(event) => event.stopPropagation()}
        onChange={handleFile}
      />
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
