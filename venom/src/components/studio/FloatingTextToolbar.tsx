"use client";

import { useEffect, useState } from "react";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import clsx from "clsx";
import { useGenericInlineEditor, type GenericTextStyle } from "@/components/tenant/GenericInlineEditorContext";
import { useStudio } from "./StudioContext";

export function FloatingTextToolbar() {
  const studio = useStudio();
  const editor = useGenericInlineEditor();
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    function update() {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) { setRect(null); return; }
      const r = sel.getRangeAt(0).getBoundingClientRect();
      if (r.width === 0 && r.height === 0) { setRect(null); return; }
      setRect(r);
    }
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, []);

  if (!rect || studio.selectedSectionId == null || !studio.selectedField) return null;

  const style = editor.getStyle(studio.selectedSectionId, studio.selectedField);
  function apply(patch: Partial<GenericTextStyle>) {
    if (studio.selectedSectionId == null || !studio.selectedField) return;
    editor.updateStyle(studio.selectedSectionId, studio.selectedField, { ...style, ...patch });
  }

  const top = Math.max(8, rect.top - 44);
  const left = Math.max(8, rect.left + rect.width / 2 - 130);

  const isBold = style.fontWeight && Number(style.fontWeight) >= 600;
  const isItalic = style.fontStyle === "italic";
  const isUnderline = style.textDecoration === "underline";

  return (
    <div
      className="pointer-events-auto fixed z-[80] flex items-center gap-0.5 rounded-md border border-[#27272a] bg-[#141416]/95 p-1 shadow-2xl backdrop-blur"
      style={{ top, left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <TBtn active={!!isBold} label="Bold" onClick={() => apply({ fontWeight: isBold ? "400" : "700" })}><Bold className="h-3.5 w-3.5" strokeWidth={1.75} /></TBtn>
      <TBtn active={!!isItalic} label="Italic" onClick={() => apply({ fontStyle: isItalic ? "normal" : "italic" })}><Italic className="h-3.5 w-3.5" strokeWidth={1.75} /></TBtn>
      <TBtn active={!!isUnderline} label="Underline" onClick={() => apply({ textDecoration: isUnderline ? "none" : "underline" })}><Underline className="h-3.5 w-3.5" strokeWidth={1.75} /></TBtn>
      <div className="mx-0.5 h-4 w-px bg-[#27272a]" />
      <label className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded hover:bg-[#27272a]" title="Barva">
        <span className="block h-3.5 w-3.5 rounded-sm border border-white/20" style={{ backgroundColor: style.color ?? "#111827" }} />
        <input
          type="color"
          value={style.color ?? "#111827"}
          onChange={(e) => apply({ color: e.target.value })}
          className="absolute h-0 w-0 opacity-0"
        />
      </label>
      <div className="mx-0.5 h-4 w-px bg-[#27272a]" />
      <TBtn active={style.textAlign === "left"} label="Left" onClick={() => apply({ textAlign: "left" })}><AlignLeft className="h-3.5 w-3.5" strokeWidth={1.75} /></TBtn>
      <TBtn active={style.textAlign === "center"} label="Center" onClick={() => apply({ textAlign: "center" })}><AlignCenter className="h-3.5 w-3.5" strokeWidth={1.75} /></TBtn>
      <TBtn active={style.textAlign === "right"} label="Right" onClick={() => apply({ textAlign: "right" })}><AlignRight className="h-3.5 w-3.5" strokeWidth={1.75} /></TBtn>
    </div>
  );
}

function TBtn({ children, active, label, onClick }: { children: React.ReactNode; active?: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={clsx(
        "inline-flex h-6 w-6 items-center justify-center rounded transition-colors duration-150",
        active ? "bg-blue-500/15 text-blue-300" : "text-[#a1a1aa] hover:bg-[#27272a] hover:text-white"
      )}
    >
      {children}
    </button>
  );
}
