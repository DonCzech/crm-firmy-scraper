"use client";
import { useRef, useEffect, useCallback } from "react";
import { applyInlineStyle, restoreSelection, sanitizeEditorPaste, selectionInside } from "@/astera/lib/editor-html";

interface Props {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
}

const FONTS = ["Poppins", "Playfair Display", "Arial", "Georgia", "Verdana", "Times New Roman"];
const SIZES = ["12", "13", "14", "15", "16", "18", "20", "22", "24", "28", "32", "38"];
const TOOLBAR_BUTTONS = [
  { label: "B", command: "bold", title: "Bold" },
  { label: "I", command: "italic", title: "Italic" },
  { label: "U", command: "underline", title: "Underline" },
  { label: "─", command: "strikeThrough", title: "Strikethrough" },
];
const INSERT_BUTTONS = [
  { label: "¶", command: "insertParagraph", title: "Insert paragraph" },
  { label: "• List", command: "insertUnorderedList", title: "Bullet list" },
  { label: "1. List", command: "insertOrderedList", title: "Numbered list" },
  { label: "↺", command: "undo", title: "Undo" },
  { label: "↻", command: "redo", title: "Redo" },
];
const buttonStyle: React.CSSProperties = {
  padding: "3px 7px",
  fontSize: 12,
  background: "#f0f4f8",
  border: "1px solid #dde5f0",
  borderRadius: 4,
  cursor: "pointer",
  fontFamily: "inherit",
};

export default function RichTextEditor({ value, onChange, minHeight = 80 }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  // Track if we're initializing to avoid onChange loop
  const isInit = useRef(true);

  useEffect(() => {
    if (editorRef.current && isInit.current) {
      document.execCommand("defaultParagraphSeparator", false, "p");
      editorRef.current.innerHTML = value;
      isInit.current = false;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const exec = useCallback((cmd: string, val?: string) => {
    editorRef.current?.focus();
    restoreSelection(savedRange.current);
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      savedRange.current = selectionInside(editorRef.current);
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const applyFontSize = useCallback((px: string) => {
    if (!editorRef.current) return;
    savedRange.current = applyInlineStyle(editorRef.current, savedRange.current, { fontSize: `${px}px` });
    onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const applyColor = useCallback((color: string) => {
    exec("foreColor", color);
  }, [exec]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const insert = sanitizeEditorPaste(e.clipboardData, true);
    restoreSelection(savedRange.current);
    document.execCommand("insertHTML", false, insert);
    if (editorRef.current) {
      savedRange.current = selectionInside(editorRef.current);
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const applyFont = useCallback((font: string) => {
    if (!editorRef.current) return;
    savedRange.current = applyInlineStyle(editorRef.current, savedRange.current, { fontFamily: font });
    onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const handleCommandMouseDown = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const command = e.currentTarget.dataset.command;
    if (command) exec(command);
  }, [exec]);

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6, alignItems: "center" }}>
        {TOOLBAR_BUTTONS.map(item => (
          <button key={item.command} type="button" title={item.title} data-command={item.command} onMouseDown={handleCommandMouseDown} style={buttonStyle}>
            {item.label}
          </button>
        ))}

        <div style={{ width: 1, height: 20, background: "#dde5f0", margin: "0 2px" }} />

        {/* Font family */}
        <select
          title="Font family"
          onChange={e => applyFont(e.target.value)}
          onMouseDown={() => { if (editorRef.current) savedRange.current = selectionInside(editorRef.current); }}
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
          onMouseDown={() => { if (editorRef.current) savedRange.current = selectionInside(editorRef.current); }}
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
            onMouseDown={() => { if (editorRef.current) savedRange.current = selectionInside(editorRef.current); }}
            style={{ width: 18, height: 18, border: "none", padding: 0, cursor: "pointer", background: "none" }}
          />
        </label>

        <div style={{ width: 1, height: 20, background: "#dde5f0", margin: "0 2px" }} />

        {INSERT_BUTTONS.map(item => (
          <button key={item.command} type="button" title={item.title} data-command={item.command} onMouseDown={handleCommandMouseDown} style={buttonStyle}>
            {item.label}
          </button>
        ))}
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => { if (editorRef.current) onChange(editorRef.current.innerHTML); }}
        onPaste={handlePaste}
        onMouseUp={() => { if (editorRef.current) savedRange.current = selectionInside(editorRef.current); }}
        onKeyUp={() => { if (editorRef.current) savedRange.current = selectionInside(editorRef.current); }}
        onBlur={() => { if (editorRef.current) savedRange.current = selectionInside(editorRef.current); }}
        onKeyDown={e => {
          if (e.key === "Enter") {
            e.stopPropagation();
            e.preventDefault();
            if (e.shiftKey) {
              // Shift+Enter = měkké zalomení řádku
              document.execCommand("insertHTML", false, "<br>");
            } else {
              // Enter = nový odstavec
              document.execCommand("insertParagraph", false);
            }
            if (editorRef.current) onChange(editorRef.current.innerHTML);
          }
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
          whiteSpace: "pre-wrap",
        }}
      />
    </div>
  );
}
