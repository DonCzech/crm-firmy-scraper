"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useGenericInlineEditor } from "./GenericInlineEditorContext";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function applyTextHighlights(root: HTMLElement, snippets: string[]) {
  const cleanSnippets = snippets.map(s => s.trim()).filter(Boolean);
  if (!cleanSnippets.length) return;

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
  sectionId: number;
  field: string;
  value: string;
  tag?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function GenericEditableText({
  sectionId,
  field,
  value,
  tag = "span",
  className,
  style,
  children,
}: Props) {
  const { isAdmin, highlighted, updateField, updateStyle, getStyle } = useGenericInlineEditor();
  const ref = useRef<HTMLElement>(null);
  const editing = useRef(false);
  const sessionHasHistory = useRef(false);
  const latestValue = useRef(value);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);
  const change = highlighted.find(item => item.sectionId === sectionId && item.field === field);
  const highlightedBlock = Boolean(change && change.snippets.length === 0);
  const fieldStyle = getStyle(sectionId, field);
  const alignStyle: React.CSSProperties = fieldStyle.textAlign
    ? { display: "block", width: "100%" }
    : {};
  const El = tag as any;

  useEffect(() => {
    latestValue.current = value;
  }, [value]);

  useLayoutEffect(() => {
    if (!isAdmin || editing.current || !ref.current) return;
    ref.current.textContent = value;
    if (change?.snippets.length) applyTextHighlights(ref.current, change.snippets);
  }, [value, isAdmin, change]);

  useEffect(() => {
    if (!focused || !ref.current) {
      setToolbarPos(null);
      return;
    }
    const update = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setToolbarPos({
        top: Math.max(8, rect.top - 54),
        left: Math.max(8, Math.min(rect.left, window.innerWidth - 360)),
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [focused]);

  if (!isAdmin) {
    return <El className={className} style={{ ...style, ...fieldStyle, ...alignStyle }}>{children ?? value}</El>;
  }

  const toolbar = focused && toolbarPos
    ? createPortal(
        <div
          onMouseDown={(event) => event.preventDefault()}
          style={{
            position: "fixed",
            top: toolbarPos.top,
            left: toolbarPos.left,
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "6px 8px",
            borderRadius: 10,
            background: "#111827",
            boxShadow: "0 10px 30px rgba(0,0,0,0.32)",
            color: "#fff",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {[
            { label: "B", title: "Tučně", next: { fontWeight: fieldStyle.fontWeight === "700" ? undefined : "700" } },
            { label: "I", title: "Kurzíva", next: { fontStyle: fieldStyle.fontStyle === "italic" ? undefined : "italic" } },
            { label: "U", title: "Podtržení", next: { textDecoration: fieldStyle.textDecoration === "underline" ? undefined : "underline" } },
          ].map(item => (
            <button
              key={item.label}
              type="button"
              title={item.title}
              onClick={() => updateStyle(sectionId, field, { ...fieldStyle, ...item.next })}
              style={{
                minWidth: 28,
                height: 28,
                border: "none",
                borderRadius: 6,
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                cursor: "pointer",
                fontWeight: item.label === "B" ? 800 : 500,
                fontStyle: item.label === "I" ? "italic" : "normal",
                textDecoration: item.label === "U" ? "underline" : "none",
              }}
            >
              {item.label}
            </button>
          ))}
          <select
            title="Velikost písma"
            value={fieldStyle.fontSize ?? ""}
            onChange={(event) => updateStyle(sectionId, field, { ...fieldStyle, fontSize: event.target.value || undefined })}
            style={{ height: 28, borderRadius: 6, border: "1px solid #374151", background: "#1f2937", color: "#fff", fontSize: 12 }}
          >
            <option value="">Vel.</option>
            {["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "40px", "48px", "56px"].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <input
            type="color"
            title="Barva textu"
            value={fieldStyle.color ?? "#111827"}
            onChange={(event) => updateStyle(sectionId, field, { ...fieldStyle, color: event.target.value })}
            style={{ width: 30, height: 28, border: "none", borderRadius: 6, background: "transparent", cursor: "pointer" }}
          />
          {[
            { label: "←", value: "left" as const, title: "Zarovnat vlevo" },
            { label: "↔", value: "center" as const, title: "Zarovnat na střed" },
            { label: "→", value: "right" as const, title: "Zarovnat vpravo" },
          ].map(item => (
            <button
              key={item.value}
              type="button"
              title={item.title}
              onClick={() => updateStyle(sectionId, field, { ...fieldStyle, textAlign: fieldStyle.textAlign === item.value ? undefined : item.value })}
              style={{
                minWidth: 28,
                height: 28,
                border: "none",
                borderRadius: 6,
                background: fieldStyle.textAlign === item.value ? "#7c3bb2" : "rgba(255,255,255,0.12)",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {toolbar}
      <El
        ref={ref}
        className={className}
        style={{
          ...style,
          ...fieldStyle,
          ...alignStyle,
          outline: focused
            ? "2px solid #7c3bb2"
            : highlightedBlock
              ? "3px solid rgba(245, 158, 11, 0.95)"
              : hovered
                ? "1px dashed rgba(124,59,178,0.55)"
                : "none",
          outlineOffset: 3,
          boxShadow: highlightedBlock ? "0 0 0 7px rgba(245, 158, 11, 0.18)" : undefined,
          borderRadius: 3,
          cursor: "text",
          minWidth: "4px",
          transition: "outline-color 0.2s ease, box-shadow 0.25s ease",
        }}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => {
          editing.current = true;
          sessionHasHistory.current = false;
          if (ref.current) ref.current.textContent = latestValue.current;
          setFocused(true);
        }}
        onInput={(event: React.FormEvent<HTMLElement>) => {
          const nextValue = event.currentTarget.textContent ?? "";
          latestValue.current = nextValue;
          updateField(sectionId, field, nextValue, { recordHistory: !sessionHasHistory.current });
          sessionHasHistory.current = true;
        }}
        onBlur={(event: React.FocusEvent<HTMLElement>) => {
          const nextValue = event.currentTarget.textContent ?? "";
          editing.current = false;
          setFocused(false);
          if (nextValue !== latestValue.current) {
            latestValue.current = nextValue;
            updateField(sectionId, field, nextValue, { recordHistory: !sessionHasHistory.current });
          }
          sessionHasHistory.current = false;
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
    </>
  );
}
