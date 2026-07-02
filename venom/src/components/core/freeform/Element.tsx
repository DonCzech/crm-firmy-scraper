"use client";

import { useRef } from "react";
import type { FreeformEl, ImageEl } from "./types";

interface Props {
  el: FreeformEl;
  onTextChange?: (next: string) => void;
  mobile?: boolean;
  /** Admin-only: patch the image src (URL input) */
  onSrcChange?: (src: string) => void;
  /** Admin-only: upload a file and set src */
  onUpload?: (file: File) => void;
}

export function RenderElement({ el, onTextChange, mobile, onSrcChange, onUpload }: Props) {
  const editable = !!onTextChange;
  const commonStyle: React.CSSProperties = {
    width: "100%", height: "100%",
    color: el.style?.color,
    background: el.style?.background,
    fontSize: el.style?.fontSize,
    fontWeight: el.style?.fontWeight,
    textAlign: el.style?.textAlign,
    borderRadius: el.style?.borderRadius,
    border: el.style?.border,
    display: "flex",
    alignItems: el.type === "button" ? "center" : "flex-start",
    justifyContent:
      el.style?.textAlign === "center" ? "center" :
      el.style?.textAlign === "right"  ? "flex-end" :
      "flex-start",
    padding: el.type === "button" ? "0 16px" : 0,
    boxSizing: "border-box",
    overflow: "hidden",
    lineHeight: el.type === "heading" ? 1.15 : 1.5,
    wordBreak: "break-word",
  };

  if (mobile) {
    commonStyle.height = "auto";
    commonStyle.minHeight = el.type === "image" ? 200 : "auto";
  }

  switch (el.type) {
    case "heading": {
      const Tag = (`h${el.level ?? 1}`) as keyof React.JSX.IntrinsicElements;
      return (
        <Tag
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={(e) => onTextChange?.((e.target as HTMLElement).textContent ?? "")}
          style={commonStyle}
        >
          {el.text}
        </Tag>
      );
    }
    case "text":
      return (
        <p
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={(e) => onTextChange?.((e.target as HTMLElement).textContent ?? "")}
          style={commonStyle}
        >
          {el.text}
        </p>
      );
    case "button":
      return (
        <a
          href={el.href || "#"}
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={(e) => onTextChange?.((e.target as HTMLElement).textContent ?? "")}
          onClick={editable ? (e) => e.preventDefault() : undefined}
          style={{ ...commonStyle, textDecoration: "none" }}
        >
          {el.text}
        </a>
      );
    case "image":
      if (!(el as ImageEl).src) {
        return <ImagePlaceholder onSrcChange={onSrcChange} onUpload={onUpload} commonStyle={commonStyle} />;
      }
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={(el as ImageEl).src}
          alt={(el as ImageEl).alt ?? ""}
          style={{ ...commonStyle, objectFit: (el as ImageEl).objectFit ?? "cover", display: "block" }}
        />
      );
    case "divider":
      return <hr style={{ ...commonStyle, border: "none", margin: 0, background: el.style?.background ?? "#e2e8f0" }} />;
    case "shape":
      return <div style={commonStyle} />;
  }
}

function ImagePlaceholder({ onSrcChange, onUpload, commonStyle }: {
  onSrcChange?: (src: string) => void;
  onUpload?: (file: File) => void;
  commonStyle: React.CSSProperties;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const isInteractive = !!(onSrcChange || onUpload);

  return (
    <div
      style={{
        ...commonStyle,
        flexDirection: "column",
        gap: 8,
        alignItems: "center",
        justifyContent: "center",
        background: "#f1f5f9",
        border: "1px dashed #94a3b8",
        color: "#64748b",
        fontSize: 12,
        textAlign: "center",
        padding: "12px 16px",
        boxSizing: "border-box",
      }}
      onPointerDown={(e) => isInteractive && e.stopPropagation()}
    >
      {onUpload && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { onUpload(f); e.target.value = ""; }
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 6,
              background: "#6366f1", color: "#fff",
              border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
            }}
          >
            <span>📤</span> Nahrát obrázek
          </button>
        </>
      )}
      {onSrcChange && (
        <>
          <span style={{ color: "#94a3b8", fontSize: 11 }}>nebo zadej URL</span>
          <input
            type="url"
            placeholder="https://…"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onBlur={(e) => onSrcChange((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => { if (e.key === "Enter") onSrcChange((e.target as HTMLInputElement).value); }}
            style={{
              width: "90%", padding: "5px 8px", borderRadius: 4,
              border: "1px solid #cbd5e1", fontSize: 11, color: "#1e293b",
              outline: "none", boxSizing: "border-box",
            }}
          />
        </>
      )}
      {!isInteractive && (
        <>
          <span style={{ fontSize: 22 }}>🖼</span>
          <span>Obrázek</span>
        </>
      )}
    </div>
  );
}
