"use client";
import { useRef, useLayoutEffect, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useContent } from "@/astera/context/ContentContext";
import { SiteContent } from "@/astera/lib/content-types";
import { Lang, LANGUAGES, localizeHtmlHrefs } from "@/astera/lib/i18n";
import { applyInlineStyle, restoreSelection, sanitizeEditorPaste, selectionInside } from "@/astera/lib/editor-html";

type EditableObject = Record<string, unknown> | unknown[];

function readKey(obj: unknown, key: string) {
  if (Array.isArray(obj)) return obj[Number(key)];
  if (obj && typeof obj === "object") return (obj as Record<string, unknown>)[key];
  return undefined;
}

function getPath(obj: unknown, path: string): string {
  return String(path.split(".").reduce<unknown>((o, k) => readKey(o, k), obj) ?? "");
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

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'",
  hellip: "…", mdash: "—", ndash: "–",
  lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”",
};

/**
 * Must stay pure — this runs during render on both sides. It used to parse via
 * `document.createElement` in the browser and via regex on the server, so the
 * two produced different text and every non-rich EditableText tripped React's
 * hydration check.
 */
function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => NAMED_ENTITIES[name.toLowerCase()] ?? match);
}

const FONTS = ["Poppins", "Playfair Display", "Arial", "Georgia", "Verdana", "Times New Roman"];
const SIZES = ["11","12","13","14","15","16","18","20","22","24","28","32","38","48","56","64"];

interface Props {
  section: keyof SiteContent;
  field: string;
  tag?: string;
  style?: React.CSSProperties;
  className?: string;
  richText?: boolean;
}

export default function EditableText({
  section, field, tag = "span", style, className, richText,
}: Props) {
  const { admin, updateSection, allLangContent, currentLang, getLatestSection } = useContent();
  const ref = useRef<HTMLElement>(null);
  const savedRange = useRef<Range | null>(null);
  const toolbarInteracting = useRef(false);
  const editing = useRef(false);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [tbPos, setTbPos] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  // Active language tab in admin mode (defaults to currentLang)
  const [editLang, setEditLang] = useState<Lang>(currentLang);

  useEffect(() => { setMounted(true); }, []);
  // Sync editLang when currentLang changes (page navigation)
  useEffect(() => { setEditLang(currentLang); }, [currentLang]);

  const getLangValue = useCallback((lang: Lang) => {
    return getPath(allLangContent[lang][section], field);
  }, [allLangContent, section, field]);

  const value = getLangValue(editLang);
  const isAdmin = admin.isAdmin;

  // ── Sync innerHTML to DOM ────────────────────────────────────────────────
  // Only update when the element does NOT have focus — if it does, the user is
  // actively editing and we must not clobber the cursor / typed content.
  useLayoutEffect(() => {
    if (!isAdmin || !ref.current) return;
    if (ref.current.contains(document.activeElement)) return;
    const displayVal = getLangValue(editLang);
    if (richText) {
      if (ref.current.innerHTML !== displayVal) ref.current.innerHTML = displayVal;
    } else {
      const txt = htmlToText(displayVal);
      if (ref.current.textContent !== txt) ref.current.textContent = txt;
    }
  }, [value, isAdmin, richText, editLang, getLangValue]);

  // ── Toolbar position ────────────────────────────────────────────────────
  useEffect(() => {
    if (!focused || !ref.current) { setTbPos(null); return; }
    const update = () => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const top = r.top < 62 ? r.bottom + 6 : r.top - 94; // extra height for lang tabs
      const left = Math.max(8, Math.min(r.left, window.innerWidth - 430));
      setTbPos({ top, left });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [focused]);

  // ── Paste handler — strip foreign HTML and keep local editor typography ─
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLElement>) => {
    e.preventDefault();
    const insert = sanitizeEditorPaste(e.clipboardData, Boolean(richText));
    restoreSelection(savedRange.current);
    document.execCommand("insertHTML", false, insert);
    if (ref.current) savedRange.current = selectionInside(ref.current);
  }, [richText]);

  // ── Formatting helpers ──────────────────────────────────────────────────
  const ensureSelection = useCallback(() => {
    if (!ref.current) return;
    ref.current.focus();
    if (!selectionInside(ref.current)) restoreSelection(savedRange.current);
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
    if (ref.current) savedRange.current = selectionInside(ref.current);
    setFocused(true);
  }, [ensureSelection]);

  const applySize = useCallback((px: string) => {
    if (!ref.current) return;
    savedRange.current = applyInlineStyle(ref.current, savedRange.current, { fontSize: `${px}px` });
  }, []);

  const applyFont = useCallback((font: string) => {
    if (!ref.current) return;
    savedRange.current = applyInlineStyle(ref.current, savedRange.current, { fontFamily: font });
  }, []);

  // Switch edit language: save current edits first, then switch
  const switchEditLang = useCallback((lang: Lang) => {
    if (!ref.current) { setEditLang(lang); return; }
    const nextValue = richText ? ref.current.innerHTML : ref.current.textContent || "";
    updateSection(section, setPath(getLatestSection(section, editLang), field, nextValue), editLang);
    const newVal = getPath(getLatestSection(section, lang), field) as string;
    if (richText) ref.current.innerHTML = newVal;
    else ref.current.textContent = htmlToText(newVal);
    setEditLang(lang);
    editing.current = false;
  }, [ref, richText, updateSection, section, field, getLatestSection, editLang]);

  // Uložený rich text často obsahuje blokové značky (vložený odjinud, typicky
  // celý <p>). Zanořit blok do <p> nebo <span> je neplatné HTML — prohlížeč ho
  // při parsování vytáhne ven, DOM se rozejde se serverovým a spadne hydratace.
  // V takovém případě renderujeme obal jako <div>; styly zůstávají stejné.
  const INLINE_TAGS = ["p", "span", "em", "strong", "a", "label"];
  const hasBlockHtml = Boolean(richText) && /<(p|div|h[1-6]|ul|ol|li|blockquote|table|section)\b/i.test(value);
  const effectiveTag = hasBlockHtml && INLINE_TAGS.includes(tag || "span") ? "div" : (tag || "span");
  const El = effectiveTag as React.ElementType;

  // ── Non-admin ─────────────────────────────────────────────────────────────
  if (!isAdmin) {
    if (richText) {
      return <El style={style} className={className} dangerouslySetInnerHTML={{ __html: localizeHtmlHrefs(value, currentLang) }} />;
    }
    return <El style={style} className={className}>{htmlToText(value)}</El>;
  }

  // ── Admin: floating toolbar with lang tabs ────────────────────────────────
  const toolbar = mounted && focused && tbPos
	    ? createPortal(
	        <div
	          onMouseDown={e => {
	            toolbarInteracting.current = true;
	            const target = e.target as HTMLElement;
	            if (!target.closest("select,input")) e.preventDefault();
	          }}
	          onMouseUp={() => {
	            window.setTimeout(() => { toolbarInteracting.current = false; }, 0);
	          }}
	          style={{
            position: "fixed",
            top: tbPos.top,
            left: tbPos.left,
            zIndex: 999999,
            background: "#111827",
            borderRadius: 10,
            padding: "4px 10px 5px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            boxShadow: "0 8px 30px rgba(0,0,0,0.55)",
            fontFamily: "sans-serif",
            userSelect: "none",
            minWidth: 320,
          }}
        >
          {/* Lang tabs row */}
          <div style={{ display: "flex", gap: 4, paddingTop: 3, paddingBottom: 2, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                type="button"
                onMouseDown={e => { e.preventDefault(); switchEditLang(l.code); }}
                style={{
                  padding: "2px 8px",
                  borderRadius: 5,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: editLang === l.code ? 700 : 400,
                  background: editLang === l.code ? "#7c3bb2" : "rgba(255,255,255,0.1)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <span style={{ fontSize: 13 }}>{l.flag}</span>
                {l.code.toUpperCase()}
              </button>
            ))}
            <span style={{ fontSize: 10, color: "#6b7280", marginLeft: "auto", alignSelf: "center" }}>
              edituje: <strong style={{ color: "#fff" }}>{editLang.toUpperCase()}</strong>
            </span>
          </div>

          {/* Formatting row */}
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {(["B","I","U"] as const).map((l) => {
              const cmd = l === "B" ? "bold" : l === "I" ? "italic" : "underline";
              return (
                <button key={l} type="button" title={cmd}
                  onMouseDown={e => { e.preventDefault(); applyCommand(() => document.execCommand(cmd, false)); }}
                  style={{ fontWeight: l === "B" ? 700 : 400, fontStyle: l === "I" ? "italic" : "normal",
                    textDecoration: l === "U" ? "underline" : "none", padding: "3px 8px",
                    background: "rgba(255,255,255,0.1)", border: "none", color: "#fff",
                    cursor: "pointer", fontSize: 13, borderRadius: 5, minWidth: 28 }}
                >{l}</button>
              );
            })}

            <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.2)", margin: "0 2px" }} />

            <select defaultValue=""
              onMouseDown={() => { if (ref.current) savedRange.current = selectionInside(ref.current); }}
              onChange={e => { applyCommand(() => applySize(e.target.value)); e.target.value = ""; }}
              style={{ fontSize: 11, background: "#1f2937", color: "#fff", border: "1px solid #374151", borderRadius: 5, padding: "3px 4px", maxWidth: 72 }}
            >
              <option value="" disabled>Vel.</option>
              {SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
            </select>

            <select defaultValue=""
              onMouseDown={() => { if (ref.current) savedRange.current = selectionInside(ref.current); }}
              onChange={e => { applyCommand(() => applyFont(e.target.value)); e.target.value = ""; }}
              style={{ fontSize: 11, background: "#1f2937", color: "#fff", border: "1px solid #374151", borderRadius: 5, padding: "3px 4px", maxWidth: 110 }}
            >
              <option value="" disabled>Font</option>
              {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>

            <label title="Barva textu"
              style={{ display: "flex", alignItems: "center", gap: 3, color: "#fff", fontSize: 12, cursor: "pointer", padding: "3px 6px", background: "rgba(255,255,255,0.1)", borderRadius: 5 }}
            >
              A
              <input type="color" defaultValue="#ffffff"
                onChange={e => applyCommand(() => document.execCommand("foreColor", false, e.target.value))}
                onMouseDown={() => { if (ref.current) savedRange.current = selectionInside(ref.current); }}
                style={{ width: 18, height: 18, border: "none", background: "none", padding: 0, cursor: "pointer" }}
              />
            </label>

            <span style={{ fontSize: 10, color: "#6b7280", marginLeft: 2 }}>vyber text → formátuj</span>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {toolbar}
      <El
        ref={ref}
        style={{
          ...style,
          outline: focused ? "2px solid #7c3bb2" : hovered ? "1px dashed rgba(124,59,178,0.55)" : "none",
          outlineOffset: 3,
          borderRadius: 3,
          cursor: "text",
          minWidth: "4px",
          WebkitUserSelect: "text",
          userSelect: "text",
          touchAction: "auto",
          WebkitTapHighlightColor: "transparent",
        }}
        className={className}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => { editing.current = true; setFocused(true); }}
	        onBlur={(e: React.FocusEvent<HTMLElement>) => {
	          const nextValue = richText ? e.currentTarget.innerHTML : e.currentTarget.textContent || "";
	          editing.current = false;
	          if (toolbarInteracting.current) {
	            window.setTimeout(() => setFocused(true), 0);
	          } else {
	            setFocused(false);
	          }
          // getLatestSection reads from allLangContentRef (always fresh) — prevents overwriting
          // concurrent edits that happened while this element was focused.
          updateSection(section, setPath(getLatestSection(section, editLang), field, nextValue), editLang);
        }}
        onPaste={handlePaste}
        onInput={() => { if (ref.current) savedRange.current = selectionInside(ref.current); }}
        onMouseUp={() => { if (ref.current) savedRange.current = selectionInside(ref.current); }}
        onKeyUp={() => { if (ref.current) savedRange.current = selectionInside(ref.current); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
    </>
  );
}
