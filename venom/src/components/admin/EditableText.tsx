"use client";
import { useRef, useLayoutEffect, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useContent } from "@/context/ContentContext";
import { SiteContent } from "@/lib/content-types";

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

function htmlToText(html: string): string {
  if (typeof window === "undefined") {
    return html
      .replace(/<br\s*\/?>/gi, "")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, "\"")
      .replace(/&#39;/g, "'");
  }
  const el = document.createElement("div");
  el.innerHTML = html;
  return el.textContent || "";
}

const FONTS = ["Poppins", "Playfair Display", "Arial", "Georgia", "Verdana", "Times New Roman"];
const SIZES = ["11","12","13","14","15","16","18","20","22","24","28","32","38","48","56","64"];

function isHighlighted(paths: string[], section: keyof SiteContent, field: string) {
  const fullPath = `${String(section)}.${field}`;
  return paths.some(path => path === String(section) || path === fullPath || fullPath.startsWith(`${path}.`));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function applyTextHighlights(root: HTMLElement, snippets: string[]) {
  const cleanSnippets = snippets.map(s => s.trim()).filter(Boolean);
  if (cleanSnippets.length === 0) return;
  const pattern = new RegExp(`(^|[^\\p{L}\\p{N}_])(${cleanSnippets.map(escapeRegExp).join("|")})(?=$|[^\\p{L}\\p{N}_])`, "giu");
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

  textNodes.forEach(node => {
    const text = node.nodeValue ?? "";
    if (!pattern.test(text)) return;
    pattern.lastIndex = 0;
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    text.replace(pattern, (match, prefix, word, offset) => {
      const wordOffset = offset + prefix.length;
      fragment.append(document.createTextNode(text.slice(lastIndex, wordOffset)));
      const mark = document.createElement("mark");
      mark.textContent = word;
      mark.style.background = "rgba(250, 204, 21, 0.55)";
      mark.style.boxShadow = "0 0 0 3px rgba(250, 204, 21, 0.28)";
      mark.style.borderRadius = "3px";
      mark.style.padding = "0 2px";
      fragment.append(mark);
      lastIndex = wordOffset + word.length;
      return match;
    });

    fragment.append(document.createTextNode(text.slice(lastIndex)));
    node.parentNode?.replaceChild(fragment, node);
  });
}

interface Props {
  section: keyof SiteContent;
  field: string;
  tag?: string;
  style?: React.CSSProperties;
  className?: string;
  richText?: boolean;
  fallback?: string;
}

export default function EditableText({
  section, field, tag = "span", style, className, richText, fallback = "",
}: Props) {
  const { content, admin, updateSection, highlightedPaths, highlightedChanges } = useContent();
  const ref = useRef<HTMLElement>(null);
  const editing = useRef(false);   // true while user is actively typing
  const sessionHasHistory = useRef(false);
  const latestSection = useRef(content[section]);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [tbPos, setTbPos] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const rawValue = getPath(content[section], field);
  const value = rawValue || fallback;
  const isAdmin = admin.isAdmin;
  const highlighted = isAdmin && isHighlighted(highlightedPaths, section, field);
  const highlightChange = highlightedChanges.find(change => change.path === `${String(section)}.${field}` || change.path === String(section));

  useEffect(() => {
    latestSection.current = content[section];
  }, [content, section]);

  // ── Sync innerHTML to DOM (admin mode only) ────────────────────────────────
  // useLayoutEffect: runs synchronously after DOM update → no flash of empty content.
  // Fires when: value changes (external edit from panel) OR isAdmin becomes true.
  // Skips update while user is actively typing (editing.current = true).
  useLayoutEffect(() => {
    if (isAdmin && !editing.current && ref.current) {
      if (richText) ref.current.innerHTML = value;
      else ref.current.textContent = htmlToText(value);
      if (highlighted && highlightChange?.snippets.length) {
        applyTextHighlights(ref.current, highlightChange.snippets);
      }
    }
  }, [value, isAdmin, richText, highlighted, highlightChange]);

  // ── Toolbar position ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!focused || !ref.current) { setTbPos(null); return; }
    const update = () => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const top = r.top < 62 ? r.bottom + 6 : r.top - 50;
      const left = Math.max(8, Math.min(r.left, window.innerWidth - 390));
      setTbPos({ top, left });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [focused]);

  // ── Formatting helpers ──────────────────────────────────────────────────────
  // If user has no selection → select all text in the element first
  const ensureSelection = useCallback(() => {
    if (!ref.current) return;
    ref.current.focus();
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, []);

  const applyCommand = useCallback((fn: () => void) => {
    ensureSelection();
    fn();
    setFocused(true);
  }, [ensureSelection]);

  const applySize = useCallback((px: string) => {
    if (!ref.current) return;
    ensureSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    span.style.fontSize = px + "px";
    try { range.surroundContents(span); }
    catch { document.execCommand("insertHTML", false, `<span style="font-size:${px}px">${sel}</span>`); }
  }, [ensureSelection]);

  const El = (tag || "span") as any;

  // ── Non-admin: always render with content ──────────────────────────────────
  if (!isAdmin) {
    if (richText) {
      return <El style={style} className={className} dangerouslySetInnerHTML={{ __html: value }} />;
    }
    return <El style={style} className={className}>{htmlToText(value)}</El>;
  }

  // ── Admin: floating toolbar ────────────────────────────────────────────────
  const toolbar = mounted && focused && tbPos
    ? createPortal(
        <div
          onMouseDown={e => e.preventDefault()}
          style={{
            position: "fixed",
            top: tbPos.top,
            left: tbPos.left,
            zIndex: 999999,
            background: "#111827",
            borderRadius: 10,
            padding: "5px 10px",
            display: "flex",
            gap: 4,
            alignItems: "center",
            boxShadow: "0 8px 30px rgba(0,0,0,0.55)",
            fontFamily: "sans-serif",
            userSelect: "none",
          }}
        >
          {/* B / I / U */}
          {(["B","I","U"] as const).map((l) => {
            const cmd = l === "B" ? "bold" : l === "I" ? "italic" : "underline";
            return (
              <button key={l} type="button" title={cmd}
                onClick={() => applyCommand(() => document.execCommand(cmd, false))}
                style={{ fontWeight: l === "B" ? 700 : 400, fontStyle: l === "I" ? "italic" : "normal",
                  textDecoration: l === "U" ? "underline" : "none", padding: "3px 8px",
                  background: "rgba(255,255,255,0.1)", border: "none", color: "#fff",
                  cursor: "pointer", fontSize: 13, borderRadius: 5, minWidth: 28 }}
              >{l}</button>
            );
          })}

          <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.2)", margin: "0 2px" }} />

          {/* Font size */}
          <select defaultValue=""
            onChange={e => { applyCommand(() => applySize(e.target.value)); e.target.value = ""; }}
            style={{ fontSize: 11, background: "#1f2937", color: "#fff", border: "1px solid #374151", borderRadius: 5, padding: "3px 4px", maxWidth: 72 }}
          >
            <option value="" disabled>Vel.</option>
            {SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
          </select>

          {/* Font family */}
          <select defaultValue=""
            onChange={e => { applyCommand(() => document.execCommand("fontName", false, e.target.value)); e.target.value = ""; }}
            style={{ fontSize: 11, background: "#1f2937", color: "#fff", border: "1px solid #374151", borderRadius: 5, padding: "3px 4px", maxWidth: 110 }}
          >
            <option value="" disabled>Font</option>
            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          {/* Text color */}
          <label title="Barva textu"
            style={{ display: "flex", alignItems: "center", gap: 3, color: "#fff", fontSize: 12, cursor: "pointer", padding: "3px 6px", background: "rgba(255,255,255,0.1)", borderRadius: 5 }}
          >
            A
            <input type="color" defaultValue="#ffffff"
              onChange={e => applyCommand(() => document.execCommand("foreColor", false, e.target.value))}
              style={{ width: 18, height: 18, border: "none", background: "none", padding: 0, cursor: "pointer" }}
            />
          </label>

          <span style={{ fontSize: 10, color: "#6b7280", marginLeft: 2 }}>vyber text → formátuj</span>
        </div>,
        document.body
      )
    : null;

  // ── Admin: contentEditable element ─────────────────────────────────────────
  // NO dangerouslySetInnerHTML here — innerHTML is managed via useLayoutEffect above.
  // This ensures the element always shows content AND React never overwrites user edits.
  return (
    <>
      {toolbar}
      <El
        ref={ref}
        style={{
          ...style,
          outline: focused
            ? "2px solid #7c3bb2"
            : highlighted && !highlightChange?.snippets.length
              ? "3px solid rgba(245, 158, 11, 0.95)"
              : hovered
                ? "1px dashed rgba(124,59,178,0.55)"
                : "none",
          outlineOffset: 3,
          boxShadow: highlighted && !highlightChange?.snippets.length ? "0 0 0 7px rgba(245, 158, 11, 0.18)" : undefined,
          borderRadius: 3,
          cursor: "text",
          minWidth: "4px",
          transition: "outline-color 0.2s ease, box-shadow 0.25s ease",
        }}
        className={className}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => {
          editing.current = true;
          sessionHasHistory.current = false;
          if (ref.current) {
            if (richText) ref.current.innerHTML = value;
            else ref.current.textContent = htmlToText(value);
          }
          setFocused(true);
        }}
        onPaste={(e: React.ClipboardEvent<HTMLElement>) => {
          if (!richText) {
            e.preventDefault();
            const plain = e.clipboardData.getData("text/plain");
            document.execCommand("insertText", false, plain);
          }
        }}
        onInput={(e: React.FormEvent<HTMLElement>) => {
          const nextValue = richText ? e.currentTarget.innerHTML : e.currentTarget.textContent || "";
          const nextSection = setPath(latestSection.current, field, nextValue);
          latestSection.current = nextSection;
          updateSection(section, nextSection, field, { recordHistory: !sessionHasHistory.current });
          sessionHasHistory.current = true;
        }}
        onBlur={(e: React.FocusEvent<HTMLElement>) => {
          const nextValue = richText ? e.currentTarget.innerHTML : e.currentTarget.textContent || "";
          editing.current = false;
          setFocused(false);
          if (nextValue !== getPath(latestSection.current, field)) {
            const nextSection = setPath(latestSection.current, field, nextValue);
            latestSection.current = nextSection;
            updateSection(section, nextSection, field, { recordHistory: !sessionHasHistory.current });
            sessionHasHistory.current = true;
          }
          sessionHasHistory.current = false;
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
    </>
  );
}
