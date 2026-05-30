"use client";
import { useRef, useEffect, useCallback } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
}

const FONTS = ["Poppins", "Playfair Display", "Arial", "Georgia", "Verdana", "Times New Roman"];
const SIZES = ["12", "13", "14", "15", "16", "18", "20", "22", "24", "28", "32", "38"];

export default function RichTextEditor({ value, onChange, minHeight = 80 }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  // Track if we're initializing to avoid onChange loop
  const isInit = useRef(true);

  useEffect(() => {
    if (editorRef.current && isInit.current) {
      editorRef.current.innerHTML = value;
      isInit.current = false;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const exec = useCallback((cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const applyFontSize = useCallback((px: string) => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      // No selection — just set execCommand for next typed text
      document.execCommand("fontSize", false, "3");
      return;
    }
    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    span.style.fontSize = px + "px";
    try {
      range.surroundContents(span);
    } catch {
      // Selection spans multiple elements — wrap with insertHTML
      document.execCommand(
        "insertHTML",
        false,
        `<span style="font-size:${px}px">${sel.toString()}</span>`
      );
    }
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const applyColor = useCallback((color: string) => {
    exec("foreColor", color);
  }, [exec]);

  const applyFont = useCallback((font: string) => {
    exec("fontName", font);
  }, [exec]);

  const btn = (label: string, action: () => void, title?: string) => (
    <button
      key={label}
      type="button"
      title={title || label}
      onMouseDown={e => { e.preventDefault(); action(); }}
      style={{
        padding: "3px 7px",
        fontSize: 12,
        background: "#f0f4f8",
        border: "1px solid #dde5f0",
        borderRadius: 4,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  );

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6, alignItems: "center" }}>
        {btn("B", () => exec("bold"), "Bold")}
        {btn("I", () => exec("italic"), "Italic")}
        {btn("U", () => exec("underline"), "Underline")}
        {btn("─", () => exec("strikeThrough"), "Strikethrough")}

        <div style={{ width: 1, height: 20, background: "#dde5f0", margin: "0 2px" }} />

        {/* Font family */}
        <select
          title="Font family"
          onChange={e => applyFont(e.target.value)}
          defaultValue=""
          style={{ fontSize: 11, padding: "2px 4px", border: "1px solid #dde5f0", borderRadius: 4, background: "#f0f4f8", cursor: "pointer" }}
        >
          <option value="" disabled>Font</option>
          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        {/* Font size */}
        <select
          title="Font size (px)"
          onChange={e => applyFontSize(e.target.value)}
          defaultValue=""
          style={{ fontSize: 11, padding: "2px 4px", border: "1px solid #dde5f0", borderRadius: 4, background: "#f0f4f8", cursor: "pointer" }}
        >
          <option value="" disabled>Size</option>
          {SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
        </select>

        {/* Color picker */}
        <label title="Text color" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontSize: 11, padding: "2px 6px", background: "#f0f4f8", border: "1px solid #dde5f0", borderRadius: 4 }}>
          A
          <input
            type="color"
            defaultValue="#1f1f1f"
            onChange={e => applyColor(e.target.value)}
            style={{ width: 18, height: 18, border: "none", padding: 0, cursor: "pointer", background: "none" }}
          />
        </label>

        <div style={{ width: 1, height: 20, background: "#dde5f0", margin: "0 2px" }} />

        {btn("¶", () => exec("insertParagraph"), "Insert paragraph")}
        {btn("• List", () => exec("insertUnorderedList"), "Bullet list")}
        {btn("1. List", () => exec("insertOrderedList"), "Numbered list")}
        {btn("↺", () => exec("undo"), "Undo")}
        {btn("↻", () => exec("redo"), "Redo")}
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => {
          if (editorRef.current) onChange(editorRef.current.innerHTML);
        }}
        style={{
          border: "1px solid #dde5f0",
          borderRadius: 6,
          padding: "10px 12px",
          minHeight,
          outline: "none",
          fontSize: 14,
          lineHeight: 1.6,
          color: "#1f1f1f",
          background: "#fff",
          overflowY: "auto",
          maxHeight: 260,
        }}
      />
    </div>
  );
}
