"use client";
import { useRef, useState, useEffect } from "react";
import { useContent } from "@/astera/context/ContentContext";
import { SiteContent } from "@/astera/lib/content-types";
import OptimizedImage from "@/astera/components/OptimizedImage";
import { asteraUpload } from "@/astera/lib/host";

type EditableObject = Record<string, unknown> | unknown[];

function readKey(obj: unknown, key: string) {
  if (Array.isArray(obj)) return obj[Number(key)];
  if (obj && typeof obj === "object") return (obj as Record<string, unknown>)[key];
  return undefined;
}

function getPath(obj: unknown, path: string): string {
  return String(path.split(".").reduce<unknown>((value, key) => readKey(value, key), obj) ?? "");
}

function setPath<T>(obj: T, path: string, val: string): T {
  const parts = path.split(".");
  const source = obj as EditableObject;
  const root: EditableObject = Array.isArray(source) ? [...source] : { ...source };
  let current: EditableObject = root;

  parts.forEach((part, index) => {
    const key = Array.isArray(current) ? Number(part) : part;
    if (index === parts.length - 1) {
      if (Array.isArray(current)) current[key as number] = val;
      else current[key as string] = val;
      return;
    }

    const next = Array.isArray(current) ? current[key as number] : current[key as string];
    const clonedNext: EditableObject = Array.isArray(next)
      ? [...next]
      : next && typeof next === "object"
        ? { ...(next as Record<string, unknown>) }
        : {};
    if (Array.isArray(current)) current[key as number] = clonedNext;
    else current[key as string] = clonedNext;
    current = clonedNext;
  });

  return root as T;
}

interface Props {
  section: keyof SiteContent;
  field: string;
  mobileField?: string;
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
  sizes?: string;
}

export default function EditableImg({ section, field, mobileField, alt, style, className, sizes }: Props) {
  const { content, admin, updateSection, saveSection, getLatestSection } = useContent();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  const desktopSrc = getPath(content[section], field);
  const mobileSrc = mobileField ? getPath(content[section], mobileField) || desktopSrc : undefined;
  const src = localPreview ?? desktopSrc;

  // Pre-fetch natural dimensions only for admins (used by hover overlay).
  // Non-admins should never trigger this fetch — for non-optimized raw images
  // it would re-download multi-MB PNGs and starve the LCP element on slow connections.
  useEffect(() => {
    if (!admin.isAdmin || !src) { setDims(null); return; }
    const img = new window.Image();
    img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => setDims(null);
    img.src = src;
  }, [src, admin.isAdmin]);

  // Compress image client-side before upload.
  // HEIC/HEIF always goes through canvas — Vercel's sharp build lacks the HEVC codec.
  // Large images (> 3.5 MB) also get compressed to stay under Vercel's 4.5 MB body limit.
  async function compressForUpload(file: File): Promise<{ blob: Blob; name: string }> {
    const MAX_BYTES = 3.5 * 1024 * 1024;
    const MAX_PX = 1800;
    const lowerName = file.name.toLowerCase();
    const isVector = file.type === "image/svg+xml";
    const isGif = file.type === "image/gif";
    const isHeic = file.type.includes("heic") || file.type.includes("heif")
      || lowerName.endsWith(".heic") || lowerName.endsWith(".heif");

    if (isVector || isGif) return { blob: file, name: file.name };
    // Skip canvas for small non-HEIC images
    if (!isHeic && file.size <= MAX_BYTES) return { blob: file, name: file.name };

    // PNG and WebP may have alpha channel — use WebP output to preserve transparency.
    // JPEG output destroys alpha (fills with black). HEIC/others → JPEG is fine.
    const mightHaveAlpha = file.type === "image/png" || file.type === "image/webp";
    const outMime = mightHaveAlpha ? "image/webp" : "image/jpeg";

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Soubor se nepodařilo přečíst. Zkus ho exportovat jako JPEG v Fotkách."));
      reader.onload = ev => {
        const dataUrl = ev.target?.result as string;
        const img = new Image();
        img.onerror = () => reject(new Error("Obrázek se nepodařilo otevřít. Ulož ho nejdřív jako JPEG a zkus znovu."));
        img.onload = () => {
          const scale = Math.min(1, MAX_PX / Math.max(img.naturalWidth, img.naturalHeight));
          const w = Math.round(img.naturalWidth * scale);
          const h = Math.round(img.naturalHeight * scale);
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
          canvas.toBlob(
            blob => {
              if (!blob) { reject(new Error("Komprese selhala. Zkus jiný soubor.")); return; }
              // blob.type may differ if browser fell back (e.g. WebP → PNG on old Safari)
              const actualMime = blob.type || outMime;
              const ext = actualMime === "image/png" ? ".png" : actualMime === "image/webp" ? ".webp" : ".jpg";
              const out = new File([blob], file.name.replace(/\.[^.]+$/, "") + ext, { type: actualMime });
              resolve({ blob: out, name: out.name });
            },
            outMime,
            0.88
          );
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Immediate local preview
    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) setLocalPreview(ev.target.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const { blob, name } = await compressForUpload(file);
      const fd = new FormData();
      fd.append("file", new File([blob], name, { type: blob.type || file.type }));
      const res = await asteraUpload(fd);
      const data = await res.json();
      if (data.url) {
        // Use getLatestSection (reads from ref) instead of content[section] (stale React closure)
        // to avoid overwriting concurrent edits made during the async upload.
        const newSection = setPath(getLatestSection(section), field, data.url);
        updateSection(section, newSection);
        setLocalPreview(null);
        await saveSection(section);
      } else {
        console.error("[EditableImg] upload error:", data);
        setUploadError(data.error || "Upload selhal");
        setLocalPreview(null);
      }
    } catch (err) {
      console.error("[EditableImg]", err);
      setUploadError("Chyba při uploadu");
      setLocalPreview(null);
    } finally {
      setUploading(false);
    }
    e.target.value = "";
  }

  // Non-admin: render plain img
  if (!admin.isAdmin) {
    return <OptimizedImage src={src} mobileSrc={mobileSrc} alt={alt} style={style} className={className} sizes={sizes} />;
  }

  // Admin mode: wrap with hover overlay
  // Preserve all layout-affecting styles on the wrapper
  const wrapStyle: React.CSSProperties = {
    ...style,
    position: style?.position === "absolute" || style?.position === "fixed"
      ? style.position
      : "relative",
    cursor: "pointer",
  };

  return (
    <div
      style={wrapStyle}
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => fileRef.current?.click()}
    >
      <OptimizedImage
        src={src}
        mobileSrc={mobileSrc}
        alt={alt}
        sizes={sizes}
        style={{
          display: "block",
          width: "100%",
          height: style?.height || "auto",
          aspectRatio: style?.aspectRatio,
          borderRadius: style?.borderRadius,
          objectFit: style?.objectFit,
          objectPosition: style?.objectPosition,
        }}
      />

      {/* Upload progress overlay — fullscreen, blocks all interaction */}
      {uploading && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.75)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: 16, zIndex: 99999,
          backdropFilter: "blur(3px)",
        }}>
          <div style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 20,
            padding: "40px 56px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 18,
            boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
          }}>
            <svg viewBox="0 0 44 44" style={{ width: 56, height: 56, animation: "ei-spin 1s linear infinite" }}>
              <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
              <circle cx="22" cy="22" r="18" fill="none" stroke="#fff" strokeWidth="4"
                strokeLinecap="round" strokeDasharray="28 85" />
            </svg>
            <div style={{ color: "#fff", fontSize: 18, fontFamily: "'Poppins', sans-serif", fontWeight: 700, letterSpacing: "-0.3px" }}>
              Nahrávám obrázek…
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "'Poppins', sans-serif", textAlign: "center", lineHeight: 1.5 }}>
              Prosím počkejte.<br />Neklikejte na refresh stránky.
            </div>
          </div>
          <style>{`@keyframes ei-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Hover overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: !uploading && hovered ? "rgba(0,0,0,0.52)" : "transparent",
          borderRadius: style?.borderRadius,
          transition: "background 0.2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {!uploading && hovered && (
          <>
            <div style={{ fontSize: 32 }}>📷</div>
            <div style={{ color: "#fff", fontSize: 13, fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>Změnit obrázek</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "'Poppins', sans-serif" }}>klikni pro výběr souboru</div>
            {dims && (
              <div style={{ color: "#fff", fontSize: 11, fontFamily: "monospace", fontWeight: 700, background: "rgba(0,0,0,0.45)", borderRadius: 4, padding: "2px 8px", marginTop: 4 }}>
                {dims.w} × {dims.h} px
              </div>
            )}
            {uploadError && (
              <div style={{ color: "#f87171", fontSize: 11, fontFamily: "'Poppins', sans-serif", background: "rgba(0,0,0,0.6)", borderRadius: 4, padding: "2px 8px", marginTop: 4 }}>
                {uploadError}
              </div>
            )}
          </>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*,.heic,.heif"
        style={{ display: "none" }}
        onChange={handleFile}
      />
    </div>
  );
}
